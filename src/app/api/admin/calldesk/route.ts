import { NextRequest, NextResponse } from "next/server";
import { FieldValue, type DocumentData } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import {
  CONTACT_SOURCES, CONTACT_STATUSES, IMPORTED_SOURCES, LEAD_QUALITIES, LOG_ACTIONS, LOST_REASONS, JOURNEY_STAGES, PAID_PACKAGES, PAYMENT_CHANNELS, WAITING_ON, findLabel,
  DEFAULT_TZ, TEAM_INVITES, addDays, inviteMemberId, isDay, isPastSlot, isTime, isTimeZone, jakartaDay, jakartaTime, toJakarta, weekdayOf,
  type Bilingual, type CallDeskMember, type ContactStatus,
} from "@/lib/calldesk";
import {
  ACTIVITY, AVAILABILITY, CONTACTS, TRANSCRIPTS, cleanAvailability, importLeads, requireCallDesk, toActivity, toContact,
  type CallDeskCaller,
} from "@/lib/calldesk-server";
import { EXPENSE_CATEGORIES, EXPENSE_STATUSES, FINANCE_EXPENSES } from "@/lib/finance";
import { applySyncPlan, financeExpenses, syncContacts, syncStatus, type SyncPlan } from "@/lib/calldesk-sync";

const clean = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const STATUS_VALUES = CONTACT_STATUSES.map((s) => s.value) as string[];
const ACTION_VALUES = LOG_ACTIONS.map((a) => a.value) as string[];
const pick = (list: readonly { value: string }[], value: unknown) =>
  typeof value === "string" && list.some((item) => item.value === value) ? value : null;
const MANUAL_SOURCES = CONTACT_SOURCES.map((s) => s.value).filter((s) => !IMPORTED_SOURCES.includes(s)) as string[];

function followUpFields(body: Record<string, unknown>) {
  const followUpDate = isDay(body.followUpDate) ? body.followUpDate : null;
  return {
    followUpDate,
    followUpTime: followUpDate && isTime(body.followUpTime) ? body.followUpTime : null,
    followUpNote: followUpDate ? clean(body.followUpNote, 300) || null : null,
  };
}

// Everyone who can take calls: admins, workers with Call Desk access, and invited people who haven't signed in yet
async function loadTeam(): Promise<CallDeskMember[]> {
  const db = adminDb();
  const [roleSnap, availabilitySnap, inviteSnap] = await Promise.all([
    db.collection("user_roles").where("role", "in", ["admin", "worker"]).get(),
    db.collection(AVAILABILITY).get(),
    db.collection(TEAM_INVITES).where("claimedUid", "==", null).get(),
  ]);
  const availability = new Map(availabilitySnap.docs.map((doc) => [doc.id, cleanAvailability(doc.data())]));
  const members = roleSnap.docs.filter((doc) => doc.data().role === "admin" || (doc.data().permissions ?? []).includes("calldesk"));
  // Older accounts have no name on their role doc; fall back to their sign-in display name
  const unnamed = members.filter((doc) => !doc.data().name).map((doc) => ({ uid: doc.id }));
  const displayNames = new Map<string, string>();
  if (unnamed.length) {
    const { users } = await adminAuth().getUsers(unnamed);
    users.forEach((user) => user.displayName && displayNames.set(user.uid, user.displayName));
  }
  const invited: CallDeskMember[] = inviteSnap.docs
    .filter((doc) => (doc.data().permissions ?? []).includes("calldesk"))
    .map((doc) => ({
      uid: inviteMemberId(doc.id),
      name: doc.data().name ?? doc.id,
      position: doc.data().position ?? null,
      role: "worker",
      availability: availability.get(inviteMemberId(doc.id)) ?? null,
      pending: true,
    }));
  return [
    ...members.map((doc) => ({
      uid: doc.id,
      name: doc.data().name ?? displayNames.get(doc.id) ?? doc.data().email ?? "—",
      position: doc.data().position ?? null,
      role: doc.data().role,
      availability: availability.get(doc.id) ?? null,
    })),
    ...invited,
  ].sort((a, b) => a.name.localeCompare(b.name));
}

// Resolves the requested assignee. Planners may assign anyone; others may only take a call themselves or leave it as is.
async function resolveAssignee(body: Record<string, unknown>, caller: CallDeskCaller, current: DocumentData | null) {
  const keep = { assignedTo: current?.assignedTo ?? null, assignedName: current?.assignedName ?? null };
  if (!("assignedTo" in body)) return { ok: true as const, value: keep };
  const requested = typeof body.assignedTo === "string" && body.assignedTo ? body.assignedTo : null;
  if (requested === keep.assignedTo) return { ok: true as const, value: keep };
  if (!caller.canPlan && requested !== null && requested !== caller.uid) {
    return { ok: false as const, error: "Only schedule planners can assign calls to someone else." };
  }
  if (!caller.canPlan && requested === null && keep.assignedTo && keep.assignedTo !== caller.uid) {
    return { ok: false as const, error: "Only schedule planners can unassign someone else's call." };
  }
  if (!requested) return { ok: true as const, value: { assignedTo: null, assignedName: null } };
  const member = (await loadTeam()).find((m) => m.uid === requested);
  if (!member) return { ok: false as const, error: "That person can't take calls." };
  return { ok: true as const, value: { assignedTo: member.uid, assignedName: member.name } };
}

/* GET /api/admin/calldesk?from=YYYY-MM-DD&to=YYYY-MM-DD — contacts, activity in range, team
   GET /api/admin/calldesk?contactId=… — full timeline for one contact
   GET /api/admin/calldesk?transcriptId=… — one call transcript
   GET /api/admin/calldesk?sync=status|contacts — CRM sync cursor, or contacts for matching (admins)
   GET /api/admin/calldesk?finance=expenses — company expenses (admins) */
export async function GET(req: NextRequest) {
  const caller = await requireCallDesk(req);
  if (!caller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const db = adminDb();
  const params = req.nextUrl.searchParams;

  try {
    if (params.get("finance") === "expenses") {
      if (!caller.isAdmin) return NextResponse.json({ error: "Only admins can see finances." }, { status: 403 });
      return NextResponse.json({ expenses: await financeExpenses() });
    }

    const sync = params.get("sync");
    if (sync) {
      if (!caller.isAdmin) return NextResponse.json({ error: "Only admins can run the CRM sync." }, { status: 403 });
      if (sync === "status") return NextResponse.json(await syncStatus());
      if (sync === "contacts") return NextResponse.json({ contacts: await syncContacts() });
      return NextResponse.json({ error: "Unknown sync request." }, { status: 400 });
    }

    const transcriptId = params.get("transcriptId");
    if (transcriptId) {
      const snap = await db.collection(TRANSCRIPTS).doc(transcriptId).get();
      if (!snap.exists) return NextResponse.json({ error: "Transcript not found." }, { status: 404 });
      const data = snap.data()!;
      return NextResponse.json({ transcript: { id: snap.id, fileName: data.fileName ?? "", text: data.text ?? "", recordingUrl: data.recordingUrl ?? null } });
    }

    const contactId = params.get("contactId");
    if (contactId) {
      const snap = await db.collection(ACTIVITY).where("contactId", "==", contactId).get();
      const timeline = snap.docs
        .map((doc) => toActivity(doc.id, doc.data()))
        .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));
      return NextResponse.json({ timeline });
    }

    try {
      await importLeads();
    } catch (err) {
      // A failed import should never block the desk from loading
      console.error("Call Desk lead import failed", err);
    }

    const today = jakartaDay();
    const from = isDay(params.get("from")) ? params.get("from")! : addDays(today, -30);
    const to = isDay(params.get("to")) ? params.get("to")! : today;

    const [contactSnap, activitySnap, team] = await Promise.all([
      db.collection(CONTACTS).orderBy("createdAt", "desc").limit(1000).get(),
      db.collection(ACTIVITY).where("day", ">=", from).where("day", "<=", to).get(),
      loadTeam(),
    ]);

    const activity = activitySnap.docs
      .map((doc) => toActivity(doc.id, doc.data()))
      .filter((item) => caller.canSeeTeam || item.byUid === caller.uid)
      .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""));

    // A caller always has an entry, even an admin created before team roles existed
    const withMe = team.some((m) => m.uid === caller.uid)
      ? team
      : [...team, { uid: caller.uid, name: caller.name, position: null, role: caller.isAdmin ? "admin" : "worker", availability: null }];

    return NextResponse.json({
      today,
      contacts: contactSnap.docs.map((doc) => toContact(doc.id, doc.data())),
      activity,
      team: withMe,
      me: { uid: caller.uid, name: caller.name, isAdmin: caller.isAdmin, canSeeTeam: caller.canSeeTeam, canPlan: caller.canPlan },
    });
  } catch (err) {
    console.error("GET calldesk error", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

/* POST /api/admin/calldesk — { action: "create" | "log" | "edit" | "availability", … }
   Activity entries are append-only: nothing here edits or deletes past activity. */
export async function POST(req: NextRequest) {
  const caller = await requireCallDesk(req);
  if (!caller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const db = adminDb();

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const now = FieldValue.serverTimestamp();
    const day = jakartaDay();
    const by = { byUid: caller.uid, byName: caller.name, day, createdAt: now };

    // Company expenses, admins only: add one, or mark an owed one as paid
    if (body.action === "expense" || body.action === "expense_paid") {
      if (!caller.isAdmin) return NextResponse.json({ error: "Only admins can change finances." }, { status: 403 });
      const stamp = { updatedAt: now, updatedBy: caller.name };
      if (body.action === "expense_paid") {
        const ref = db.collection(FINANCE_EXPENSES).doc(clean(body.id, 120));
        if (!(await ref.get()).exists) return NextResponse.json({ error: "Expense not found." }, { status: 404 });
        await ref.update({ status: "paid", date: isDay(body.date) ? body.date : day, ...stamp });
        return NextResponse.json({ success: true });
      }
      const amount = typeof body.amount === "number" && Number.isFinite(body.amount) && body.amount > 0 ? Math.round(body.amount) : null;
      const category = pick(EXPENSE_CATEGORIES, body.category);
      const status = pick(EXPENSE_STATUSES, body.status);
      const payee = clean(body.payee, 80);
      if (!amount || !category || !status || !payee || !isDay(body.date)) {
        return NextResponse.json({ error: "Date, amount, category, status and who it was paid to are all required." }, { status: 400 });
      }
      const ref = db.collection(FINANCE_EXPENSES).doc();
      await ref.set({
        key: `manual:${ref.id}`, date: body.date, amount, category, status, payee,
        role: clean(body.role, 60), note: clean(body.note, 300), contactId: null, ...stamp,
      });
      return NextResponse.json({ success: true, id: ref.id });
    }

    // CRM sync from chats and call recordings: a dry run unless `write` is true
    if (body.action === "sync") {
      if (!caller.isAdmin) return NextResponse.json({ error: "Only admins can run the CRM sync." }, { status: 403 });
      const plan = body.plan as SyncPlan | undefined;
      if (!plan || !Array.isArray(plan.contacts ?? [])) return NextResponse.json({ error: "Missing plan." }, { status: 400 });
      return NextResponse.json(await applySyncPlan(plan, body.write === true, caller.name));
    }

    if (body.action === "availability" || body.action === "availability_day") {
      const uid = clean(body.uid, 128);
      if (!uid) return NextResponse.json({ error: "Missing person." }, { status: 400 });
      if (!caller.canPlan && uid !== caller.uid) {
        return NextResponse.json({ error: "You can only change your own availability." }, { status: 403 });
      }
      if (uid !== caller.uid && !(await loadTeam()).some((m) => m.uid === uid)) {
        return NextResponse.json({ error: "That person isn't on the call team." }, { status: 404 });
      }
      const ref = db.collection(AVAILABILITY).doc(uid);
      const stamp = { updatedAt: now, updatedByUid: caller.uid, updatedByName: caller.name };

      // One date: normal schedule, custom hours, not working, or off — optionally also the weekly default
      if (body.action === "availability_day") {
        const date = isDay(body.date) ? body.date : null;
        const mode = clean(body.mode, 20);
        const hours = isTime(body.start) && isTime(body.end) && body.start < body.end ? { start: body.start, end: body.end } : null;
        if (!date || !["default", "hours", "not_working", "off"].includes(mode)) {
          return NextResponse.json({ error: "Invalid day or option." }, { status: 400 });
        }
        if (mode === "hours" && !hours) return NextResponse.json({ error: "End time must be after start time." }, { status: 400 });

        const availability = await db.runTransaction(async (tx) => {
          const current = cleanAvailability((await tx.get(ref)).data());
          const next = {
            weekly: { ...current.weekly },
            daysOff: current.daysOff.filter((d) => d.date !== date),
            dayOverrides: current.dayOverrides.filter((d) => d.date !== date),
          };
          const dayHours = mode === "hours" ? hours : null;
          if (mode === "off") next.daysOff.push({ date, note: clean(body.note, 120) });
          if (body.applyWeekly === true && (mode === "hours" || mode === "not_working")) {
            next.weekly[weekdayOf(date)] = dayHours;
          } else if (mode === "hours" || mode === "not_working") {
            next.dayOverrides.push({ date, hours: dayHours });
          }
          const saved = cleanAvailability(next);
          tx.set(ref, { ...saved, ...stamp });
          return saved;
        });
        return NextResponse.json({ success: true, availability });
      }

      const availability = cleanAvailability(body.availability);
      await ref.set({ ...availability, ...stamp });
      return NextResponse.json({ success: true, availability });
    }

    if (body.action === "create") {
      const name = clean(body.name, 120);
      const phone = clean(body.phone, 30);
      const source = clean(body.source, 30);
      if (!name || !phone) return NextResponse.json({ error: "Name and phone are required." }, { status: 400 });
      if (!MANUAL_SOURCES.includes(source)) return NextResponse.json({ error: "Invalid source." }, { status: 400 });
      const assignee = await resolveAssignee(body, caller, null);
      if (!assignee.ok) return NextResponse.json({ error: assignee.error }, { status: 403 });

      const followUp = followUpFields(body);
      const note = clean(body.note, 1000);
      const ref = db.collection(CONTACTS).doc();
      const batch = db.batch();
      batch.set(ref, {
        name, phone, source,
        city: clean(body.city, 80),
        bestTime: clean(body.bestTime, 100),
        timezone: isTimeZone(body.timezone) ? body.timezone : DEFAULT_TZ,
        details: note,
        candidateUid: null,
        status: "new",
        ...followUp,
        ...assignee.value,
        lastAction: "created",
        lastActivityAt: now,
        lastActivityBy: caller.name,
        createdAt: now,
        createdByUid: caller.uid,
        createdByName: caller.name,
      });
      batch.set(db.collection(ACTIVITY).doc(), {
        ...by, ...followUp, ...assignee.value,
        contactId: ref.id, contactName: name, type: "created", note,
        statusFrom: null, statusTo: "new",
      });
      await batch.commit();
      return NextResponse.json({ success: true, id: ref.id });
    }

    const contactId = clean(body.contactId, 120);
    const contactRef = db.collection(CONTACTS).doc(contactId);
    const contactSnap = contactId ? await contactRef.get() : null;
    if (!contactSnap?.exists) return NextResponse.json({ error: "Contact not found." }, { status: 404 });
    const contact = contactSnap.data()!;

    if (body.action === "log") {
      // Picking what you did is optional: a plain change of status, assignee, follow-up or note is logged as "updated"
      const requestedType = clean(body.type, 30);
      const type = requestedType || "updated";
      if (!ACTION_VALUES.includes(type) && type !== "updated") return NextResponse.json({ error: "Invalid action." }, { status: 400 });
      const requested = clean(body.status, 30);
      const statusTo = (STATUS_VALUES.includes(requested) ? requested : contact.status) as ContactStatus;
      // Any first real touch moves a new lead forward, unless a status was picked explicitly
      const finalStatus = statusTo === "new" && type !== "note" && type !== "updated" ? "contacted" : statusTo;
      const note = clean(body.note, 1000);
      const followUp = followUpFields(body);
      const assignee = await resolveAssignee(body, caller, contact);
      if (!assignee.ok) return NextResponse.json({ error: assignee.error }, { status: 403 });
      const followUpChanged = followUp.followUpDate !== (contact.followUpDate ?? null)
        || followUp.followUpTime !== (contact.followUpTime ?? null)
        || followUp.followUpNote !== (contact.followUpNote ?? null);
      const assigneeChanged = assignee.value.assignedTo !== (contact.assignedTo ?? null);
      if ((type === "note" || type === "updated") && !note && finalStatus === contact.status && !followUpChanged && !assigneeChanged) {
        return NextResponse.json({ error: "Nothing changed — pick what you did, write a note, or change the status, follow-up or person." }, { status: 400 });
      }

      const batch = db.batch();
      batch.update(contactRef, {
        status: finalStatus,
        ...followUp,
        ...assignee.value,
        lastAction: type,
        lastActivityAt: now,
        lastActivityBy: caller.name,
      });
      batch.set(db.collection(ACTIVITY).doc(), {
        ...by, ...followUp, ...assignee.value,
        contactId, contactName: contact.name ?? "", type, note,
        statusFrom: contact.status ?? null,
        statusTo: finalStatus,
        recordingUrl: /^https:\/\/\S+$/.test(clean(body.recordingUrl, 500)) ? clean(body.recordingUrl, 500) : null,
      });
      await batch.commit();
      return NextResponse.json({ success: true });
    }

    // Lead quality, why it was lost, and what was paid; each change is written to the timeline
    if (body.action === "outcome") {
      const amount = typeof body.paidAmount === "number" && Number.isFinite(body.paidAmount) && body.paidAmount >= 0
        ? Math.round(body.paidAmount)
        : null;
      const updates = {
        quality: pick(LEAD_QUALITIES, body.quality),
        lostReason: pick(LOST_REASONS, body.lostReason),
        lostNote: clean(body.lostNote, 300) || null,
        paidPackage: pick(PAID_PACKAGES, body.paidPackage),
        paidAmount: amount,
        paidDate: isDay(body.paidDate) ? body.paidDate : null,
        paymentChannel: pick(PAYMENT_CHANNELS, body.paymentChannel),
        paidOriginal: clean(body.paidOriginal, 40) || null,
        stage: pick(JOURNEY_STAGES, body.stage),
        waitingOn: pick(WAITING_ON, body.waitingOn),
        excluded: body.excluded === true,
      };
      const labels: Record<string, readonly { value: string; label: Bilingual }[]> = {
        quality: LEAD_QUALITIES, lostReason: LOST_REASONS, paidPackage: PAID_PACKAGES, paymentChannel: PAYMENT_CHANNELS,
        stage: JOURNEY_STAGES, waitingOn: WAITING_ON,
      };
      const shown = (key: string, value: unknown) =>
        value === null || value === undefined ? "—" : labels[key] ? findLabel(labels[key], value as string)?.en ?? String(value) : String(value);
      const changed = (Object.keys(updates) as (keyof typeof updates)[])
        .filter((key) => (contact[key] ?? (key === "excluded" ? false : null)) !== updates[key])
        .map((key) => `${key}: ${shown(key, contact[key])} → ${shown(key, updates[key])}`);
      if (!changed.length) return NextResponse.json({ success: true });

      const batch = db.batch();
      batch.update(contactRef, { ...updates, lastActivityAt: now, lastActivityBy: caller.name });
      batch.set(db.collection(ACTIVITY).doc(), {
        ...by,
        contactId, contactName: contact.name ?? "", type: "outcome", note: changed.join("\n"),
        statusFrom: contact.status ?? null, statusTo: contact.status ?? null,
        followUpDate: null, followUpTime: null, followUpNote: null,
        assignedTo: contact.assignedTo ?? null, assignedName: contact.assignedName ?? null,
      });
      await batch.commit();
      return NextResponse.json({ success: true });
    }

    // Move a scheduled call: only while it is still in the future
    if (body.action === "reschedule") {
      const clockNow = jakartaTime();
      const asJakarta = (date: string | null, time: string | null) =>
        date && time && (contact.timezone ?? DEFAULT_TZ) !== DEFAULT_TZ
          ? toJakarta(date, time, contact.timezone)
          : { day: date, time };
      const current = asJakarta(contact.followUpDate ?? null, contact.followUpTime ?? null);
      if (isPastSlot(current.day, current.time, day, clockNow)) {
        return NextResponse.json({ error: "This call has already passed — log what happened instead." }, { status: 400 });
      }

      const followUp = followUpFields(body);
      if (!followUp.followUpDate) return NextResponse.json({ error: "Pick a date." }, { status: 400 });
      const next = asJakarta(followUp.followUpDate, followUp.followUpTime);
      if (isPastSlot(next.day, next.time, day, clockNow)) {
        return NextResponse.json({ error: "Pick a time in the future." }, { status: 400 });
      }
      const assignee = await resolveAssignee(body, caller, contact);
      if (!assignee.ok) return NextResponse.json({ error: assignee.error }, { status: 403 });

      const batch = db.batch();
      batch.update(contactRef, { ...followUp, ...assignee.value, lastActivityAt: now, lastActivityBy: caller.name });
      batch.set(db.collection(ACTIVITY).doc(), {
        ...by, ...followUp, ...assignee.value,
        contactId, contactName: contact.name ?? "", type: "rescheduled", note: clean(body.note, 300),
        statusFrom: contact.status ?? null, statusTo: contact.status ?? null,
      });
      await batch.commit();
      return NextResponse.json({ success: true });
    }

    if (body.action === "edit") {
      const name = clean(body.name, 120);
      const phone = clean(body.phone, 30);
      if (!name || !phone) return NextResponse.json({ error: "Name and phone are required." }, { status: 400 });
      const updates = {
        name, phone,
        city: clean(body.city, 80),
        bestTime: clean(body.bestTime, 100),
        timezone: isTimeZone(body.timezone) ? body.timezone : (contact.timezone ?? DEFAULT_TZ),
      };
      const changed = (Object.keys(updates) as (keyof typeof updates)[])
        .filter((key) => (contact[key] ?? "") !== updates[key])
        .map((key) => `${key}: "${contact[key] ?? ""}" → "${updates[key]}"`);
      if (!changed.length) return NextResponse.json({ success: true });

      const batch = db.batch();
      batch.update(contactRef, updates);
      batch.set(db.collection(ACTIVITY).doc(), {
        ...by,
        contactId, contactName: name, type: "edited", note: changed.join("\n"),
        statusFrom: null, statusTo: null, followUpDate: null, followUpTime: null, followUpNote: null,
        assignedTo: contact.assignedTo ?? null, assignedName: contact.assignedName ?? null,
      });
      await batch.commit();
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    console.error("POST calldesk error", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
