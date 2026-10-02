import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import {
  CONTACT_SOURCES, DEFAULT_TZ, IMPORTED_SOURCES, jakartaDay, leadOrigin, originLabel, phoneDigits,
  type ContactSource, type LeadProfile,
} from "@/lib/calldesk";
import { ACTIVITY, CONTACTS, createContact, toContact } from "@/lib/calldesk-server";
import { CARD_PROFILE_KEYS, LEAD_PREFIX, isLeadId, leadCardProfile, type CardPerson, type SocialPageKey } from "@/lib/social";

/* Call Desk leads on Subpages: listed next to registered clients so a card can be made for them,
   and added or corrected there by anyone who manages our social accounts. Server only. */

export class LeadError extends Error {
  constructor(message: string, public status: number) { super(message); }
}

type Actor = { uid: string; name: string };
const clean = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const MANUAL_SOURCES = CONTACT_SOURCES.map((s) => s.value).filter((s) => !IMPORTED_SOURCES.includes(s)) as string[];
const leadRef = (id: string) => {
  const contactId = isLeadId(id) ? id.slice(LEAD_PREFIX.length) : "";
  return contactId && !contactId.includes("/") ? adminDb().collection(CONTACTS).doc(contactId) : null;
};

// Who a card is being made for: a registered client, or a Call Desk lead when the id starts with "lead:"
export async function cardSubject(id: string): Promise<{ profile: Record<string, unknown>; name: string } | null> {
  if (isLeadId(id)) {
    const snap = await leadRef(id)?.get();
    if (!snap?.exists) return null;
    const lead = toContact(snap.id, snap.data()!);
    return { profile: leadCardProfile(lead), name: lead.name };
  }
  const snap = await adminDb().collection("candidate_intake").doc(id).get();
  if (!snap.exists) return null;
  const profile = snap.data()!;
  return { profile, name: String(profile.fullName || profile.name || "") };
}

// Everyone a card can be made for: registered clients, then Call Desk leads who haven't registered
export async function listCardPeople(): Promise<CardPerson[]> {
  const db = adminDb();
  const [candidateSnap, contactSnap] = await Promise.all([
    db.collection("candidate_intake").get(),
    db.collection(CONTACTS).orderBy("createdAt", "desc").limit(1000).get(),
  ]);
  const contacts = contactSnap.docs.map((d) => toContact(d.id, d.data()));
  const clientIds = new Set(candidateSnap.docs.map((d) => d.id));
  const entryOf = new Map(contacts.filter((c) => c.candidateUid).map((c) => [c.candidateUid!, c]));

  const clients: CardPerson[] = candidateSnap.docs.map((d) => {
    const x = d.data();
    const fields = Object.fromEntries(CARD_PROFILE_KEYS.filter((k) => x[k] !== undefined).map((k) => [k, x[k]]));
    const entry = entryOf.get(d.id);
    return {
      id: d.id, kind: "client", origin: entry?.origin ?? null, contactId: entry?.id ?? null, leadStatus: null,
      personStatus: (x.personStatus as string) ?? null, isTest: x.isTestProfile === true, profile: fields,
    };
  });
  // Left out: test entries and duplicates, partner applicants (not looking for a match themselves),
  // and leads who registered, since they are already listed as a client
  const leads: CardPerson[] = contacts
    .filter((c) => !c.excluded && c.source !== "partner" && !(c.candidateUid && clientIds.has(c.candidateUid)))
    .map((c) => ({
      id: `${LEAD_PREFIX}${c.id}`, kind: "lead", origin: c.origin, contactId: c.id, leadStatus: c.status ?? null,
      personStatus: null, isTest: false, profile: leadCardProfile(c),
    }));
  return [...clients, ...leads];
}

// The facts a card reads, as typed on Subpages; null means "not known", which removes the fact
function leadFacts(body: Record<string, unknown>): Record<string, string | number | null> {
  const pick = (list: string[], value: unknown) => (typeof value === "string" && list.includes(value) ? value : null);
  const age = Math.round(Number(body.age));
  const gender = pick(["male", "female"], body.gender);
  return {
    gender,
    age: age > 15 && age < 100 ? age : null,
    maritalStatus: pick(["never_married", "divorced", "widowed", "married"], body.maritalStatus),
    religion: clean(body.religion, 40) || null,
    nationality: clean(body.nationality, 60) || null,
    occupation: clean(body.occupation, 80) || null,
    education: clean(body.education, 60) || null,
    ethnicity: clean(body.ethnicity, 60) || null,
    hijab: gender === "female" ? pick(["yes", "no"], body.hijab) : null,
  };
}

/* Adds a lead from a subpage. It lands in the Call Desk like any other lead, tagged with that page.
   Returns the id Subpages knows it by ("lead:…"). */
export async function addLead(pageKey: SocialPageKey, body: Record<string, unknown>, actor: Actor): Promise<string> {
  const name = clean(body.name, 120);
  const phone = clean(body.phone, 30);
  if (!name || !phone) throw new LeadError("Name and WhatsApp number are required.", 400);
  const source = clean(body.source, 30);

  // One entry per person: the same number under a second page would split their history
  const digits = phoneDigits(phone);
  if (digits.length >= 6) {
    const saved = await adminDb().collection(CONTACTS).select("name", "phone", "origin").get();
    const twin = saved.docs.find((d) => phoneDigits(String(d.data().phone ?? "")) === digits);
    if (twin) {
      throw new LeadError(`This number is already saved as ${twin.data().name || "a lead"} (${originLabel(leadOrigin(twin.data().origin))}). Find them in the list instead.`, 409);
    }
  }

  const profile = Object.fromEntries(Object.entries(leadFacts(body)).filter(([, value]) => value !== null)) as LeadProfile;
  const id = await createContact({
    name, phone, origin: pageKey,
    source: (MANUAL_SOURCES.includes(source) ? source : "instagram") as ContactSource,
    city: clean(body.city, 80), bestTime: "", timezone: DEFAULT_TZ, note: clean(body.note, 1000),
    followUp: { followUpDate: null, followUpTime: null, followUpNote: null },
    assignee: { assignedTo: null, assignedName: null },
    profile,
  }, actor);
  return `${LEAD_PREFIX}${id}`;
}

// Corrects a lead's name, city and card facts from Subpages; the change is written to the lead's Call Desk history
export async function editLead(id: string, body: Record<string, unknown>, actor: Actor) {
  const ref = leadRef(id);
  const snap = await ref?.get();
  if (!ref || !snap?.exists) throw new LeadError("Lead not found.", 404);
  const contact = snap.data()!;
  const name = clean(body.name, 120);
  if (!name) throw new LeadError("Name is required.", 400);
  const city = clean(body.city, 80);

  const current = (contact.profile && typeof contact.profile === "object" ? contact.profile : {}) as Record<string, unknown>;
  const profile = { ...current };
  const changed: string[] = [];
  if ((contact.name ?? "") !== name) changed.push(`name: "${contact.name ?? ""}" → "${name}"`);
  if ((contact.city ?? "") !== city) changed.push(`city: "${contact.city ?? ""}" → "${city}"`);
  for (const [key, value] of Object.entries(leadFacts(body))) {
    const before = current[key] ?? null;
    if (before === value) continue;
    changed.push(`${key}: "${before ?? ""}" → "${value ?? ""}"`);
    if (value === null) delete profile[key];
    else profile[key] = value;
  }
  if (!changed.length) return;

  const db = adminDb();
  const batch = db.batch();
  batch.update(ref, { name, city, profile });
  batch.set(db.collection(ACTIVITY).doc(), {
    byUid: actor.uid, byName: actor.name, day: jakartaDay(), createdAt: FieldValue.serverTimestamp(),
    contactId: ref.id, contactName: name, type: "edited", note: changed.join("\n"),
    statusFrom: null, statusTo: null, followUpDate: null, followUpTime: null, followUpNote: null,
    assignedTo: contact.assignedTo ?? null, assignedName: contact.assignedName ?? null,
  });
  await batch.commit();
}
