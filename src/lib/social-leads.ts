import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import {
  CONTACT_SOURCES, DEFAULT_TZ, IMPORTED_SOURCES, cleanOrigins, jakartaDay, leadOrigins, phoneDigits,
  type ContactSource, type LeadOrigin, type LeadProfile,
} from "@/lib/calldesk";
import { ACTIVITY, CONTACTS, createContact, leadFacts, leadReach, mergeLeadFacts, toContact } from "@/lib/calldesk-server";
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
      id: d.id, kind: "client", origins: entry?.origins ?? [], contactId: entry?.id ?? null, link: entry?.link ?? "", leadStatus: null,
      personStatus: (x.personStatus as string) ?? null, isTest: x.isTestProfile === true, profile: fields,
    };
  });
  // Left out: test entries and duplicates, partner applicants (not looking for a match themselves),
  // and leads who registered, since they are already listed as a client
  const leads: CardPerson[] = contacts
    .filter((c) => !c.excluded && c.source !== "partner" && !(c.candidateUid && clientIds.has(c.candidateUid)))
    .map((c) => ({
      id: `${LEAD_PREFIX}${c.id}`, kind: "lead", origins: c.origins, contactId: c.id, link: c.link, leadStatus: c.status ?? null,
      personStatus: null, isTest: false, profile: leadCardProfile(c),
    }));
  return [...clients, ...leads];
}

// A correction made on Subpages, written to the lead's Call Desk history the way the Call Desk's own edits are
function logEdit(batch: FirebaseFirestore.WriteBatch, contactId: string, contact: FirebaseFirestore.DocumentData, name: string, note: string, actor: Actor) {
  batch.set(adminDb().collection(ACTIVITY).doc(), {
    byUid: actor.uid, byName: actor.name, day: jakartaDay(), createdAt: FieldValue.serverTimestamp(),
    contactId, contactName: name, type: "edited", note,
    statusFrom: null, statusTo: null, followUpDate: null, followUpTime: null, followUpNote: null,
    assignedTo: contact.assignedTo ?? null, assignedName: contact.assignedName ?? null,
  });
}

// Adds or removes one page's tag on a lead; a lead can belong to several pages. Returns the tags it ends up with.
export async function tagLead(id: string, pageKey: LeadOrigin, on: boolean, actor: Actor) {
  const ref = leadRef(id);
  const snap = await ref?.get();
  if (!ref || !snap?.exists) throw new LeadError("Lead not found.", 404);
  const contact = snap.data()!;
  const before = leadOrigins(contact);
  const after = cleanOrigins(on ? [...before, pageKey] : before.filter((o) => o !== pageKey));
  if (before.join() === after.join()) return after;
  const batch = adminDb().batch();
  // `origin` is the single tag older leads were saved with; `origins` replaces it
  batch.update(ref, { origins: after, origin: FieldValue.delete() });
  logEdit(batch, ref.id, contact, contact.name ?? "", `origins: "${before.join(", ")}" → "${after.join(", ")}"`, actor);
  await batch.commit();
  return after;
}

/* Adds a lead from a subpage. It lands in the Call Desk like any other lead, tagged with that page (and any
   other page picked on the form). Only the name is required: a number, an email and a link to the chat are each optional.
   Someone already saved under the same number, email or chat link is not added twice: their entry gets the
   tags as well, and whichever of the three it was missing.
   Returns the id Subpages knows the lead by ("lead:…"), and the saved name when it was already there. */
export async function addLead(pageKey: SocialPageKey, body: Record<string, unknown>, actor: Actor): Promise<{ id: string; existing: string | null }> {
  const name = clean(body.name, 120);
  if (!name) throw new LeadError("Name is required.", 400);
  const { phone, email, link, error } = leadReach(body);
  if (error) throw new LeadError(error, 400);
  const source = clean(body.source, 30);
  const origins = cleanOrigins([pageKey, ...(Array.isArray(body.origins) ? body.origins : [])]);

  // One entry per person: a second entry for the same person would split their history
  const digits = phoneDigits(phone);
  if (digits.length >= 6 || email || link) {
    const saved = await adminDb().collection(CONTACTS).select("name", "phone", "email", "link").get();
    const twin = saved.docs.find((d) => {
      const x = d.data();
      return (digits.length >= 6 && phoneDigits(String(x.phone ?? "")) === digits) || (email && x.email === email) || (link && x.link === link);
    });
    if (twin) {
      const id = `${LEAD_PREFIX}${twin.id}`;
      for (const origin of origins) await tagLead(id, origin, true, actor);
      const x = twin.data();
      const missing = Object.fromEntries(Object.entries({ phone, email, link }).filter(([key, value]) => value && !x[key]));
      if (Object.keys(missing).length) await twin.ref.update(missing);
      return { id, existing: String(x.name || "") };
    }
  }

  const profile = Object.fromEntries(Object.entries(leadFacts(body)).filter(([, value]) => value !== null)) as LeadProfile;
  const id = await createContact({
    name, phone, email, link, origins,
    source: (MANUAL_SOURCES.includes(source) ? source : "instagram") as ContactSource,
    city: clean(body.city, 80), bestTime: "", timezone: DEFAULT_TZ, note: clean(body.note, 1000),
    followUp: { followUpDate: null, followUpTime: null, followUpNote: null },
    assignee: { assignedTo: null, assignedName: null },
    profile,
  }, actor);
  return { id: `${LEAD_PREFIX}${id}`, existing: null };
}

// Corrects a lead's name, city, chat link and card facts from Subpages; the change is written to the lead's Call Desk history
export async function editLead(id: string, body: Record<string, unknown>, actor: Actor) {
  const ref = leadRef(id);
  const snap = await ref?.get();
  if (!ref || !snap?.exists) throw new LeadError("Lead not found.", 404);
  const contact = snap.data()!;
  const name = clean(body.name, 120);
  if (!name) throw new LeadError("Name is required.", 400);
  const city = clean(body.city, 80);
  // The chat link is left as it is unless the form sent one
  const reach = leadReach({ link: "link" in body ? body.link : contact.link });
  if (reach.error) throw new LeadError(reach.error, 400);
  const link = reach.link;

  const facts = mergeLeadFacts(contact.profile, body);
  const { profile } = facts;
  const changed: string[] = [];
  if ((contact.name ?? "") !== name) changed.push(`name: "${contact.name ?? ""}" → "${name}"`);
  if ((contact.city ?? "") !== city) changed.push(`city: "${contact.city ?? ""}" → "${city}"`);
  if ((contact.link ?? "") !== link) changed.push(`link: "${contact.link ?? ""}" → "${link}"`);
  changed.push(...facts.changed);
  if (!changed.length) return;

  const db = adminDb();
  const batch = db.batch();
  batch.update(ref, { name, city, link, profile });
  logEdit(batch, ref.id, contact, name, changed.join("\n"), actor);
  await batch.commit();
}
