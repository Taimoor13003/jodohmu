import { NextRequest, NextResponse } from "next/server";
import { FieldValue, type DocumentData } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import {
  CONTACT_SOURCES, CONTACT_STATUSES, IMPORTED_SOURCES, LOG_ACTIONS,
  DEFAULT_TZ, TEAM_INVITES, addDays, inviteMemberId, isDay, isTime, isTimeZone, jakartaDay, weekdayOf,
  type CallDeskMember, type ContactStatus,
} from "@/lib/calldesk";
import {
  ACTIVITY, AVAILABILITY, CONTACTS, cleanAvailability, importLeads, requireCallDesk, toActivity, toContact,
  type CallDeskCaller,
} from "@/lib/calldesk-server";

const clean = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const STATUS_VALUES = CONTACT_STATUSES.map((s) => s.value) as string[];
const ACTION_VALUES = LOG_ACTIONS.map((a) => a.value) as string[];
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
  if (member.pending) return { ok: false as const, error: "That person hasn't signed in yet, so calls can't be assigned to them." };
  return { ok: true as const, value: { assignedTo: member.uid, assignedName: member.name } };
}

/* GET /api/admin/calldesk?from=YYYY-MM-DD&to=YYYY-MM-DD — contacts, activity in range, team
   GET /api/admin/calldesk?contactId=… — full timeline for one contact */
export async function GET(req: NextRequest) {
  const caller = await requireCallDesk(req);
  if (!caller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const db = adminDb();
  const params = req.nextUrl.searchParams;

  try {
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
      const type = clean(body.type, 30);
      if (!ACTION_VALUES.includes(type)) return NextResponse.json({ error: "Invalid action." }, { status: 400 });
      const requested = clean(body.status, 30);
      const statusTo = (STATUS_VALUES.includes(requested) ? requested : contact.status) as ContactStatus;
      // Any first real touch moves a new lead forward, unless a status was picked explicitly
      const finalStatus = statusTo === "new" && type !== "note" ? "contacted" : statusTo;
      const note = clean(body.note, 1000);
      const followUp = followUpFields(body);
      const assignee = await resolveAssignee(body, caller, contact);
      if (!assignee.ok) return NextResponse.json({ error: assignee.error }, { status: 403 });
      const followUpChanged = followUp.followUpDate !== (contact.followUpDate ?? null)
        || followUp.followUpTime !== (contact.followUpTime ?? null)
        || followUp.followUpNote !== (contact.followUpNote ?? null);
      const assigneeChanged = assignee.value.assignedTo !== (contact.assignedTo ?? null);
      if (type === "note" && !note && finalStatus === contact.status && !followUpChanged && !assigneeChanged) {
        return NextResponse.json({ error: "Write a note, change the status, or set a follow-up." }, { status: 400 });
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
