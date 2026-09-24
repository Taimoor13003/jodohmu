import type { NextRequest } from "next/server";
import type { DocumentData, Timestamp } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import {
  DEFAULT_TZ, EMPTY_AVAILABILITY, WEEKDAYS, isDay, isTime,
  type Availability, type CallDeskActivity, type CallDeskContact, type ContactSource, type TeamPermission,
} from "@/lib/calldesk";

export type CallDeskCaller = { uid: string; name: string; isAdmin: boolean; canSeeTeam: boolean; canPlan: boolean };

export const CONTACTS = "calldesk_contacts";
export const ACTIVITY = "calldesk_activity";
export const AVAILABILITY = "team_availability";
// Call transcripts live apart from activity so the desk stays quick to load; an activity links to one by id
export const TRANSCRIPTS = "calldesk_transcripts";

// Admins always have access; workers need the "calldesk" permission set on their user_roles doc
export async function requireCallDesk(req: NextRequest): Promise<CallDeskCaller | null> {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try {
    const decoded = await adminAuth().verifyIdToken(token);
    const data = (await adminDb().collection("user_roles").doc(decoded.uid).get()).data();
    const permissions: TeamPermission[] = Array.isArray(data?.permissions) ? data.permissions : [];
    const name = (data?.name as string | undefined) ?? decoded.name ?? decoded.email ?? "—";
    if (data?.role === "admin") return { uid: decoded.uid, name, isAdmin: true, canSeeTeam: true, canPlan: true };
    if (data?.role === "worker" && permissions.includes("calldesk")) {
      return {
        uid: decoded.uid, name, isAdmin: false,
        canSeeTeam: permissions.includes("calldesk_team"),
        canPlan: permissions.includes("team_schedule"),
      };
    }
    return null;
  } catch {
    return null;
  }
}

const iso = (value: unknown) => (value as Timestamp | undefined)?.toDate?.()?.toISOString() ?? null;
const str = (value: unknown) => (typeof value === "string" ? value : "");

export const toContact = (id: string, data: DocumentData): CallDeskContact => ({
  id,
  name: str(data.name),
  phone: str(data.phone),
  city: str(data.city),
  source: data.source,
  status: data.status,
  bestTime: str(data.bestTime),
  timezone: str(data.timezone) || DEFAULT_TZ,
  details: str(data.details),
  candidateUid: data.candidateUid ?? null,
  followUpDate: data.followUpDate ?? null,
  followUpTime: data.followUpTime ?? null,
  followUpNote: data.followUpNote ?? null,
  assignedTo: data.assignedTo ?? null,
  assignedName: data.assignedName ?? null,
  lastAction: data.lastAction ?? null,
  lastActivityAt: iso(data.lastActivityAt),
  lastActivityBy: data.lastActivityBy ?? null,
  createdAt: iso(data.createdAt),
  createdByName: data.createdByName ?? null,
  quality: data.quality ?? null,
  lostReason: data.lostReason ?? null,
  lostNote: data.lostNote ?? null,
  paidPackage: data.paidPackage ?? null,
  paidAmount: typeof data.paidAmount === "number" ? data.paidAmount : null,
  paidDate: data.paidDate ?? null,
  paymentChannel: data.paymentChannel ?? null,
  paidOriginal: data.paidOriginal ?? null,
  adId: data.adId ?? null,
  profile: data.profile && typeof data.profile === "object" ? data.profile : {},
  hasChatArchive: data.hasChatArchive === true,
  stage: data.stage ?? null,
  waitingOn: data.waitingOn ?? null,
  excluded: data.excluded === true,
});

export const toActivity = (id: string, data: DocumentData): CallDeskActivity => ({
  id,
  contactId: str(data.contactId),
  contactName: str(data.contactName),
  type: data.type,
  note: str(data.note),
  statusFrom: data.statusFrom ?? null,
  statusTo: data.statusTo ?? null,
  followUpDate: data.followUpDate ?? null,
  followUpTime: data.followUpTime ?? null,
  followUpNote: data.followUpNote ?? null,
  assignedTo: data.assignedTo ?? null,
  assignedName: data.assignedName ?? null,
  byUid: str(data.byUid),
  byName: str(data.byName),
  day: str(data.day),
  createdAt: iso(data.createdAt),
  recordingUrl: data.recordingUrl ?? null,
  transcriptId: data.transcriptId ?? null,
});

// Keeps only well-formed hours (start before end) and valid days off
export function cleanAvailability(input: unknown): Availability {
  const raw = (input ?? {}) as { weekly?: Record<string, unknown>; daysOff?: unknown; dayOverrides?: unknown };
  const cleanHours = (value: unknown) => {
    const hours = value as { start?: unknown; end?: unknown } | null | undefined;
    return hours && isTime(hours.start) && isTime(hours.end) && hours.start < hours.end
      ? { start: hours.start, end: hours.end }
      : null;
  };
  const weekly = { ...EMPTY_AVAILABILITY.weekly };
  for (const day of WEEKDAYS) weekly[day] = cleanHours(raw.weekly?.[day]);
  const seen = new Set<string>();
  const dayOverrides = (Array.isArray(raw.dayOverrides) ? raw.dayOverrides : [])
    .filter((d): d is { date: string; hours?: unknown } => isDay((d as { date?: unknown })?.date))
    .filter((d) => !seen.has(d.date) && Boolean(seen.add(d.date)))
    .map((d) => ({ date: d.date, hours: cleanHours(d.hours) }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-200);
  const daysOff = (Array.isArray(raw.daysOff) ? raw.daysOff : [])
    .filter((d): d is { date: string; note?: unknown } => isDay((d as { date?: unknown })?.date))
    .map((d) => ({ date: d.date, note: typeof d.note === "string" ? d.note.trim().slice(0, 120) : "" }))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-100);
  return { weekly, daysOff, dayOverrides };
}

type ImportSource = {
  collection: string;
  source: ContactSource;
  filter?: (data: DocumentData) => boolean;
  map: (data: DocumentData) => { name: string; phone: string; city: string; bestTime?: string; details: string; candidateUid?: string };
};

const joinDetails = (parts: [string, unknown][]) =>
  parts
    .filter(([, value]) => value !== null && value !== undefined && value !== "" && !(Array.isArray(value) && !value.length))
    .map(([label, value]) => `${label}: ${Array.isArray(value) ? value.join(", ") : value}`)
    .join("\n");

const IMPORTS: ImportSource[] = [
  {
    collection: "contact_form_entries",
    source: "contact_form",
    map: (d) => ({ name: str(d.name), phone: str(d.phone), city: str(d.city), details: joinDetails([["Gender", d.gender], ["Age", d.age], ["Email", d.email]]) }),
  },
  {
    collection: "chat_leads",
    source: "chatbot",
    map: (d) => ({ name: str(d.name), phone: str(d.phone), city: str(d.city), bestTime: str(d.preferredCallTime), details: joinDetails([["Interest", d.interest], ["Timeline", d.timeline]]) }),
  },
  {
    collection: "partner_applications",
    source: "partner",
    map: (d) => ({ name: str(d.name), phone: str(d.phone), city: str(d.city), details: joinDetails([["Partner type", d.partnerType], ["Wants to help with", d.roles], ["Organization", d.organization], ["Network", d.network]]) }),
  },
  {
    collection: "admin_notifications",
    source: "registration",
    filter: (d) => d.type === "discovery_call_pending",
    map: (d) => ({ name: str(d.name), phone: str(d.phone), city: str(d.city), candidateUid: str(d.uid), details: joinDetails([["Gender", d.gender], ["Age", d.age], ["Email", d.email]]) }),
  },
];

// Copies new website leads into the Call Desk. Contact ids are derived from the source doc id,
// so running this repeatedly never creates duplicates.
export async function importLeads() {
  const db = adminDb();
  for (const item of IMPORTS) {
    const snap = await db.collection(item.collection).orderBy("createdAt", "desc").limit(300).get();
    const docs = snap.docs.filter((doc) => !item.filter || item.filter(doc.data()));
    if (!docs.length) continue;

    const refs = docs.map((doc) => db.collection(CONTACTS).doc(`${item.source}_${doc.id}`));
    const existing = await db.getAll(...refs);
    const batch = db.batch();
    let writes = 0;
    existing.forEach((snapshot, index) => {
      if (snapshot.exists) return;
      const data = docs[index].data();
      const mapped = item.map(data);
      batch.create(refs[index], {
        ...mapped,
        bestTime: mapped.bestTime ?? "",
        timezone: DEFAULT_TZ,
        candidateUid: mapped.candidateUid || null,
        source: item.source,
        status: "new",
        followUpDate: null,
        followUpTime: null,
        followUpNote: null,
        assignedTo: null,
        assignedName: null,
        lastAction: null,
        lastActivityAt: null,
        lastActivityBy: null,
        createdAt: data.createdAt ?? new Date(),
        createdByName: null,
      });
      writes += 1;
    });
    if (writes) await batch.commit();
  }
}
