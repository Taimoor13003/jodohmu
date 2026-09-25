// On-demand CRM sync: applies a reviewed plan (built from the WhatsApp inbox and the Drive call
// recordings) to the Call Desk. Ids are derived from each event's sync key, so applying the same
// plan twice never duplicates anything. Server-only.
import { createHash } from "node:crypto";
import { FieldValue, Timestamp, type DocumentData } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import {
  CONTACT_SOURCES, CONTACT_STATUSES, DEFAULT_TZ, LEAD_QUALITIES, LOG_ACTIONS, LOST_REASONS, JOURNEY_STAGES, PAID_PACKAGES, PAYMENT_CHANNELS, SYNC_NAME, SYNC_UID, WAITING_ON,
  isDay, isTime, jakartaDay, phoneDigits,
} from "@/lib/calldesk";
import { ACTIVITY, CONTACTS, TRANSCRIPTS } from "@/lib/calldesk-server";
import { EXPENSE_CATEGORIES, EXPENSE_STATUSES, FINANCE_EXPENSES, type FinanceExpense } from "@/lib/finance";
import { KNOWLEDGE_BASE, KNOWLEDGE_CATEGORIES, type KnowledgeEntry } from "@/lib/knowledge";

export const SYNC_STATE = "calldesk_sync/state";

export type SyncActivity = {
  syncKey: string;
  type: string;
  day: string;
  note?: string;
  recordingUrl?: string | null;
  transcript?: { fileName?: string; text: string } | null;
};

export type SyncContact = {
  phone: string;
  // Targets one record directly when several share a phone number (duplicates, test entries)
  contactId?: string;
  name?: string;
  city?: string;
  source?: string;
  status?: string;
  quality?: string | null;
  lostReason?: string | null;
  lostNote?: string | null;
  paidPackage?: string | null;
  paidAmount?: number | null;
  paidDate?: string | null;
  paymentChannel?: string | null;
  paidOriginal?: string | null;
  stage?: string | null;
  waitingOn?: string | null;
  excluded?: boolean;
  adId?: string | null;
  followUp?: { date: string; time?: string | null; note?: string | null } | null;
  // Merged into the stored profile; a key set to null is removed
  profile?: Record<string, string | number | boolean | null>;
  // The full chat text, archived with the transcripts; replaced each time it is synced
  chat?: { text: string; through: string } | null;
  activities?: SyncActivity[];
};

// Expenses are keyed by `key` so the same entry can be corrected by applying it again
export type SyncExpense = Omit<FinanceExpense, "id" | "contactId"> & { key: string; contactPhone?: string | null; remove?: boolean };

// Knowledge entries are keyed by `key`; applying the same key again rewrites the entry
export type SyncKnowledge = Pick<KnowledgeEntry, "key" | "category" | "title" | "body"> & { evidence?: string[]; priority?: number; remove?: boolean };

export type SyncPlan = { syncedThrough?: string; contacts: SyncContact[]; expenses?: SyncExpense[]; knowledge?: SyncKnowledge[] };

export async function knowledgeEntries(): Promise<KnowledgeEntry[]> {
  const snap = await adminDb().collection(KNOWLEDGE_BASE).get();
  return snap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id, key: d.key, category: d.category, title: d.title ?? "", body: d.body ?? "",
      evidence: Array.isArray(d.evidence) ? d.evidence : [], priority: typeof d.priority === "number" ? d.priority : 0,
      updatedAt: d.updatedAt?.toDate?.()?.toISOString() ?? null, updatedBy: d.updatedBy ?? null,
    };
  });
}

export async function financeExpenses(): Promise<FinanceExpense[]> {
  const snap = await adminDb().collection(FINANCE_EXPENSES).orderBy("date").get();
  return snap.docs.map((doc) => {
    const d = doc.data();
    return {
      id: doc.id, date: d.date, amount: d.amount, category: d.category, status: d.status,
      payee: d.payee ?? "", role: d.role ?? "", note: d.note ?? "", contactId: d.contactId ?? null,
    };
  });
}

const values = (list: readonly { value: string }[]) => list.map((item) => item.value as string);
const hash = (value: string) => createHash("sha1").update(value).digest("hex").slice(0, 24);
const OUTCOME_FIELDS = ["quality", "lostReason", "lostNote", "paidPackage", "paidAmount", "paidDate", "paymentChannel", "paidOriginal", "adId", "stage", "waitingOn", "excluded"] as const;
// Written per field; `profile` is merged separately
const CONTACT_FIELDS = ["name", "city", "status", ...OUTCOME_FIELDS] as const;

function validate(entry: SyncContact) {
  const problems: string[] = [];
  const check = (field: keyof SyncContact, list: string[]) => {
    const value = entry[field];
    if (value !== undefined && value !== null && !list.includes(value as string)) problems.push(`${field} "${value}" is not one of ${list.join(", ")}`);
  };
  if (phoneDigits(entry.phone ?? "").length < 8) problems.push(`phone "${entry.phone}" is not a phone number`);
  check("status", values(CONTACT_STATUSES));
  check("source", values(CONTACT_SOURCES));
  check("quality", values(LEAD_QUALITIES));
  check("lostReason", values(LOST_REASONS));
  check("paidPackage", values(PAID_PACKAGES));
  check("paymentChannel", values(PAYMENT_CHANNELS));
  check("stage", values(JOURNEY_STAGES));
  check("waitingOn", values(WAITING_ON));
  if (entry.paidAmount != null && !(Number.isFinite(entry.paidAmount) && entry.paidAmount >= 0)) problems.push("paidAmount must be a number");
  if (entry.paidDate != null && !isDay(entry.paidDate)) problems.push("paidDate must be YYYY-MM-DD");
  if (entry.followUp && (!isDay(entry.followUp.date) || (entry.followUp.time && !isTime(entry.followUp.time)))) {
    problems.push("followUp needs date YYYY-MM-DD and optional time HH:MM");
  }
  const profile = entry.profile ?? {};
  if (profile.age != null && !(typeof profile.age === "number" && profile.age > 15 && profile.age < 100)) problems.push("profile.age must be a number");
  if (profile.gender != null && !["male", "female"].includes(profile.gender as string)) problems.push("profile.gender must be male or female");
  if (profile.maritalStatus != null && !["never_married", "divorced", "widowed", "married"].includes(profile.maritalStatus as string)) {
    problems.push("profile.maritalStatus must be never_married, divorced, widowed or married");
  }
  if (entry.chat && (typeof entry.chat.text !== "string" || !entry.chat.text.trim())) problems.push("chat.text is empty");
  for (const a of entry.activities ?? []) {
    if (!a.syncKey) problems.push("an activity is missing syncKey");
    if (!values(LOG_ACTIONS).includes(a.type)) problems.push(`activity type "${a.type}" is not one of ${values(LOG_ACTIONS).join(", ")}`);
    if (!isDay(a.day)) problems.push(`activity "${a.syncKey}" needs day YYYY-MM-DD`);
    if (a.recordingUrl && !/^https:\/\/\S+$/.test(a.recordingUrl)) problems.push(`activity "${a.syncKey}" recordingUrl must be https`);
  }
  return problems;
}

export async function syncStatus() {
  const snap = await adminDb().doc(SYNC_STATE).get();
  const data = snap.data();
  return { syncedThrough: data?.syncedThrough ?? null, runs: data?.runs ?? 0, lastRunBy: data?.lastRunBy ?? null };
}

// Current contacts in a compact form, for matching chats and calls to people
export async function syncContacts() {
  const snap = await adminDb().collection(CONTACTS).get();
  return snap.docs.map((doc) => {
    const c = doc.data();
    return {
      id: doc.id, name: c.name ?? "", phone: phoneDigits(c.phone ?? ""), city: c.city ?? "", source: c.source, status: c.status,
      quality: c.quality ?? null, lostReason: c.lostReason ?? null, paidPackage: c.paidPackage ?? null, adId: c.adId ?? null,
      assignedName: c.assignedName ?? null, followUpDate: c.followUpDate ?? null, profile: c.profile ?? {},
    };
  });
}

// Without `write`, only reports what would change. The sync cursor moves only after a clean write.
export async function applySyncPlan(plan: SyncPlan, write: boolean, runBy: string) {
  const db = adminDb();
  const snap = await db.collection(CONTACTS).get();
  const byPhone = new Map<string, DocumentData & { id: string }>(snap.docs.map((doc) => [phoneDigits(doc.data().phone ?? ""), { id: doc.id, ...doc.data() }]));
  const byId = new Map<string, DocumentData & { id: string }>(snap.docs.map((doc) => [doc.id, { id: doc.id, ...doc.data() }]));
  const report: string[] = [];
  const problems: string[] = [];

  for (const entry of plan.contacts ?? []) {
    const issues = validate(entry);
    if (issues.length) {
      problems.push(`${entry.name ?? entry.phone}: ${issues.join("; ")}`);
      continue;
    }
    const digits = phoneDigits(entry.phone);
    const current = (entry.contactId ? byId.get(entry.contactId) : byPhone.get(digits)) ?? null;
    if (entry.contactId && !current) {
      problems.push(`${entry.name ?? entry.phone}: no contact with id ${entry.contactId}`);
      continue;
    }
    const ref = db.collection(CONTACTS).doc(current ? current.id : `wa_${digits}`);
    const name = entry.name || current?.name || digits;

    const updates: Record<string, unknown> = {};
    for (const field of CONTACT_FIELDS) {
      const value = entry[field];
      if (value === undefined) continue;
      if (!current || (current[field] ?? null) !== value) updates[field] = value;
    }
    if (entry.profile) {
      const merged: Record<string, unknown> = { ...(current?.profile ?? {}) };
      for (const [key, value] of Object.entries(entry.profile)) {
        if (value === null) delete merged[key];
        else merged[key] = value;
      }
      if (JSON.stringify(merged) !== JSON.stringify(current?.profile ?? {})) updates.profile = merged;
    }
    // followUp: null clears a stale follow-up; leaving it out keeps the current one
    if (entry.followUp === null && current?.followUpDate) {
      Object.assign(updates, { followUpDate: null, followUpTime: null, followUpNote: null });
    }
    if (entry.followUp) {
      const followUp = { followUpDate: entry.followUp.date, followUpTime: entry.followUp.time ?? null, followUpNote: entry.followUp.note ?? null };
      for (const [key, value] of Object.entries(followUp)) if (!current || (current[key] ?? null) !== value) updates[key] = value;
    }

    const activities = entry.activities ?? [];
    const activityRefs = activities.map((a) => db.collection(ACTIVITY).doc(`sync_${hash(a.syncKey)}`));
    const seen = activityRefs.length ? await db.getAll(...activityRefs) : [];
    const fresh = activities
      .map((a, i) => ({ a, ref: activityRefs[i] }))
      .filter((_, i) => !seen[i].exists)
      .sort((x, y) => x.a.day.localeCompare(y.a.day));

    const lines: string[] = [];
    if (!current) lines.push(`+ new contact (${entry.source ?? "whatsapp"})`);
    for (const [field, value] of Object.entries(updates)) lines.push(`${field}: ${JSON.stringify(current?.[field] ?? null)} → ${JSON.stringify(value)}`);
    for (const { a } of fresh) lines.push(`+ ${a.day} ${a.type}: ${a.note ?? ""}${a.transcript ? " [transcript]" : ""}${a.recordingUrl ? " [recording]" : ""}`);
    const chatRef = entry.chat ? db.collection(TRANSCRIPTS).doc(`chat_${digits}`) : null;
    const chatBefore = chatRef ? (await chatRef.get()).data() : undefined;
    const chatChanged = Boolean(entry.chat && chatBefore?.text !== entry.chat.text);
    if (chatChanged) lines.push(`chat archive: ${entry.chat!.text.length} characters through ${entry.chat!.through}`);
    if (activities.length - fresh.length) lines.push(`· ${activities.length - fresh.length} already synced`);
    if (!lines.length) continue;
    report.push(`${current ? "~" : "+"} ${name} (${digits})\n  ${lines.join("\n  ")}`);
    if (!write) continue;

    const batch = db.batch();
    const now = FieldValue.serverTimestamp();
    const today = jakartaDay();
    const assignee = { assignedTo: current?.assignedTo ?? null, assignedName: current?.assignedName ?? null };
    const noFollowUp = { followUpDate: null, followUpTime: null, followUpNote: null };
    const statusBefore: string | null = current?.status ?? null;
    let statusNow = statusBefore ?? "new";

    if (!current) {
      batch.set(ref, {
        name, phone: entry.phone, city: entry.city ?? "", source: entry.source ?? "whatsapp",
        status: "new", bestTime: "", timezone: DEFAULT_TZ, details: "", candidateUid: null,
        ...noFollowUp, ...assignee,
        quality: null, lostReason: null, lostNote: null, paidPackage: null, paidAmount: null, paidDate: null,
        paymentChannel: null, paidOriginal: null, adId: null, profile: {}, stage: null, waitingOn: null, excluded: false,
        lastAction: "created", lastActivityAt: now, lastActivityBy: SYNC_NAME,
        // Dated to the first thing that happened, so Insights counts the lead in the right period
        createdAt: fresh.length ? Timestamp.fromDate(new Date(`${fresh[0].a.day}T09:00:00+07:00`)) : now,
        createdByUid: SYNC_UID, createdByName: SYNC_NAME,
      });
      batch.set(db.collection(ACTIVITY).doc(`sync_${hash(`created:${digits}`)}`), {
        contactId: ref.id, contactName: name, type: "created", note: "Added from WhatsApp by CRM sync",
        statusFrom: null, statusTo: "new", ...noFollowUp, ...assignee,
        byUid: SYNC_UID, byName: SYNC_NAME, day: fresh[0]?.a.day ?? today,
        createdAt: fresh.length ? Timestamp.fromDate(new Date(`${fresh[0].a.day}T09:00:00+07:00`)) : now,
        recordingUrl: null, transcriptId: null,
      });
    }

    if (chatChanged && chatRef) {
      batch.set(chatRef, {
        kind: "chat", contactId: ref.id, fileName: "WhatsApp chat", recordingUrl: null,
        text: entry.chat!.text, through: entry.chat!.through, createdAt: chatBefore?.createdAt ?? now, updatedAt: now,
      });
    }

    // The status change rides on the latest new activity
    fresh.forEach(({ a, ref: activityRef }, index) => {
      const statusTo = index === fresh.length - 1 && typeof updates.status === "string" ? updates.status : statusNow;
      let transcriptId: string | null = null;
      if (a.transcript?.text) {
        transcriptId = `tr_${hash(a.syncKey)}`;
        batch.set(db.collection(TRANSCRIPTS).doc(transcriptId), {
          contactId: ref.id, activityId: activityRef.id, fileName: a.transcript.fileName ?? "",
          recordingUrl: a.recordingUrl ?? null, text: a.transcript.text, createdAt: now,
        });
      }
      batch.set(activityRef, {
        contactId: ref.id, contactName: name, type: a.type, note: a.note ?? "",
        statusFrom: statusNow, statusTo, ...noFollowUp, ...assignee,
        byUid: SYNC_UID, byName: SYNC_NAME, day: a.day,
        // Sorted by when it happened, not when it was synced
        createdAt: Timestamp.fromDate(new Date(`${a.day}T12:00:00+07:00`)),
        recordingUrl: a.recordingUrl ?? null, transcriptId, syncKey: a.syncKey,
      });
      statusNow = statusTo;
    });

    // A status or outcome change with no new activity still leaves a trace in the timeline
    const outcomeChanged = OUTCOME_FIELDS.some((field) => field in updates);
    if (!fresh.length && current && (updates.status || outcomeChanged)) {
      batch.set(db.collection(ACTIVITY).doc(`sync_${hash(`update:${digits}:${JSON.stringify(updates)}`)}`), {
        contactId: ref.id, contactName: name, type: outcomeChanged ? "outcome" : "updated",
        note: Object.entries(updates).map(([key, value]) => `${key}: ${value}`).join("\n"),
        statusFrom: statusBefore, statusTo: (updates.status as string | undefined) ?? statusBefore,
        ...noFollowUp, ...assignee,
        byUid: SYNC_UID, byName: SYNC_NAME, day: today, createdAt: now, recordingUrl: null, transcriptId: null,
      });
    }

    batch.set(ref, {
      ...updates,
      ...(chatChanged ? { hasChatArchive: true } : {}),
      lastAction: fresh.length ? fresh[fresh.length - 1].a.type : "updated",
      lastActivityAt: now,
      lastActivityBy: SYNC_NAME,
    }, { merge: true });
    await batch.commit();
  }

  for (const expense of plan.expenses ?? []) {
    const issues: string[] = [];
    if (!expense.key) issues.push("missing key");
    if (!expense.remove) {
      if (!isDay(expense.date)) issues.push("date must be YYYY-MM-DD");
      if (!(Number.isFinite(expense.amount) && expense.amount > 0)) issues.push("amount must be a positive number");
      if (!values(EXPENSE_CATEGORIES).includes(expense.category)) issues.push(`category "${expense.category}" is not one of ${values(EXPENSE_CATEGORIES).join(", ")}`);
      if (!values(EXPENSE_STATUSES).includes(expense.status)) issues.push(`status "${expense.status}" is not one of ${values(EXPENSE_STATUSES).join(", ")}`);
    }
    if (issues.length) {
      problems.push(`expense ${expense.key ?? "?"}: ${issues.join("; ")}`);
      continue;
    }
    const ref = db.collection(FINANCE_EXPENSES).doc(`exp_${hash(expense.key)}`);
    const before = (await ref.get()).data();
    if (expense.remove) {
      if (!before) continue;
      report.push(`- expense ${expense.key}: removed`);
      if (write) await ref.delete();
      continue;
    }
    const contact = expense.contactPhone ? byPhone.get(phoneDigits(expense.contactPhone)) : null;
    const data = {
      key: expense.key, date: expense.date, amount: Math.round(expense.amount), category: expense.category, status: expense.status,
      payee: expense.payee ?? "", role: expense.role ?? "", note: expense.note ?? "", contactId: contact?.id ?? null,
    };
    const changed = !before || Object.entries(data).some(([k, v]) => before[k] !== v);
    if (!changed) continue;
    report.push(`${before ? "~" : "+"} expense ${expense.date} ${data.category} Rp ${data.amount.toLocaleString("id-ID")} — ${data.payee} (${data.status})${data.note ? `: ${data.note}` : ""}`);
    if (write) await ref.set({ ...data, updatedAt: FieldValue.serverTimestamp(), updatedBy: runBy });
  }

  for (const item of plan.knowledge ?? []) {
    const issues: string[] = [];
    if (!item.key) issues.push("missing key");
    if (!item.remove) {
      if (!values(KNOWLEDGE_CATEGORIES).includes(item.category)) issues.push(`category "${item.category}" is not one of ${values(KNOWLEDGE_CATEGORIES).join(", ")}`);
      if (!item.title?.trim() || !item.body?.trim()) issues.push("title and body are required");
    }
    if (issues.length) {
      problems.push(`knowledge ${item.key ?? "?"}: ${issues.join("; ")}`);
      continue;
    }
    const ref = db.collection(KNOWLEDGE_BASE).doc(`kb_${hash(item.key)}`);
    const before = (await ref.get()).data();
    if (item.remove) {
      if (!before) continue;
      report.push(`- knowledge ${item.key}: removed`);
      if (write) await ref.delete();
      continue;
    }
    const data = {
      key: item.key, category: item.category, title: item.title.trim(), body: item.body.trim(),
      evidence: item.evidence ?? [], priority: item.priority ?? 0,
    };
    const changed = !before || JSON.stringify(Object.keys(data).map((k) => before[k])) !== JSON.stringify(Object.values(data));
    if (!changed) continue;
    report.push(`${before ? "~" : "+"} knowledge [${data.category}] ${data.title}`);
    if (write) await ref.set({ ...data, updatedAt: FieldValue.serverTimestamp(), updatedBy: runBy });
  }

  const clean = problems.length === 0;
  if (write && clean && plan.syncedThrough) {
    await db.doc(SYNC_STATE).set({
      syncedThrough: plan.syncedThrough, lastRunAt: FieldValue.serverTimestamp(), lastRunBy: runBy, runs: FieldValue.increment(1),
    }, { merge: true });
  }
  return { written: write, report, problems, cursorMoved: write && clean && Boolean(plan.syncedThrough) };
}
