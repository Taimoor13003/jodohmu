import { NextRequest, NextResponse } from "next/server";
import { FieldValue, type DocumentData, type Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { isDay, jakartaDay } from "@/lib/calldesk";
import { requireMitra } from "@/lib/calldesk-server";
import {
  MITRA_CHANNELS, MITRA_FACILITATOR, MITRA_FAITHS, MITRA_PROSPECTS, MITRA_SOURCES, MITRA_STAGES, MITRA_TYPES,
  type MitraLogEntry, type MitraProspect,
} from "@/lib/mitra";

const clean = (value: unknown, max: number) => (typeof value === "string" ? value.trim().slice(0, max) : "");
const pick = (list: readonly { value: string }[], value: unknown) =>
  typeof value === "string" && list.some((item) => item.value === value) ? value : null;
const iso = (value: unknown) => (value as Timestamp | undefined)?.toDate?.()?.toISOString() ?? null;
const str = (value: unknown) => (typeof value === "string" ? value : "");
const count = (value: unknown) => (typeof value === "number" && Number.isInteger(value) && value >= 0 ? value : null);
const score = (value: unknown) => (typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 4 ? value : null);
// The log lives on the prospect doc; keep the newest entries so the doc never grows without bound
const MAX_LOG = 100;

const toProspect = (id: string, d: DocumentData): MitraProspect => ({
  id,
  name: str(d.name),
  organization: str(d.organization),
  type: d.type ?? "other",
  city: str(d.city),
  phone: str(d.phone),
  instagram: str(d.instagram),
  email: str(d.email),
  website: str(d.website),
  source: d.source ?? "other",
  stage: d.stage ?? "prospect",
  score: d.score ?? null,
  referrals: typeof d.referrals === "number" ? d.referrals : 0,
  faith: d.faith ?? "general",
  reason: str(d.reason),
  sourceDetail: str(d.sourceDetail),
  nextAction: str(d.nextAction),
  bestTime: str(d.bestTime),
  facilitator: d.facilitator ?? "unknown",
  facilitatorRate: str(d.facilitatorRate),
  meetingsFacilitated: typeof d.meetingsFacilitated === "number" ? d.meetingsFacilitated : 0,
  notes: str(d.notes),
  followUpDate: d.followUpDate ?? null,
  lastContactedAt: d.lastContactedAt ?? null,
  createdAt: iso(d.createdAt),
  createdBy: str(d.createdBy),
  log: Array.isArray(d.log) ? d.log : [],
});

// Fields shared by create and edit
function profileFields(body: Record<string, unknown>) {
  return {
    name: clean(body.name, 120),
    organization: clean(body.organization, 160),
    type: pick(MITRA_TYPES, body.type) ?? "other",
    city: clean(body.city, 80),
    phone: clean(body.phone, 30),
    instagram: clean(body.instagram, 60).replace(/^@/, ""),
    email: clean(body.email, 120),
    website: clean(body.website, 200),
    source: pick(MITRA_SOURCES, body.source) ?? "other",
    faith: pick(MITRA_FAITHS, body.faith) ?? "general",
    reason: clean(body.reason, 1000),
    sourceDetail: clean(body.sourceDetail, 300),
    nextAction: clean(body.nextAction, 300),
    bestTime: clean(body.bestTime, 200),
    facilitatorRate: clean(body.facilitatorRate, 60),
    notes: clean(body.notes, 2000),
  };
}

// Copies website partner applications into the list. Ids come from the application id, so repeats never duplicate.
async function importApplications() {
  const db = adminDb();
  const snap = await db.collection("partner_applications").orderBy("createdAt", "desc").limit(300).get();
  if (snap.empty) return;
  const refs = snap.docs.map((doc) => db.collection(MITRA_PROSPECTS).doc(`web_${doc.id}`));
  const existing = await db.getAll(...refs);
  const batch = db.batch();
  let writes = 0;
  existing.forEach((snapshot, index) => {
    if (snapshot.exists) return;
    const d = snap.docs[index].data();
    const details = [
      Array.isArray(d.roles) && d.roles.length ? `Wants to help with: ${d.roles.join(", ")}` : "",
      d.network ? `Network: ${d.network}` : "",
    ].filter(Boolean).join("\n");
    batch.create(refs[index], {
      name: str(d.name), organization: str(d.organization), type: pick(MITRA_TYPES, d.partnerType) ?? "other",
      city: str(d.city), phone: str(d.phone), instagram: "", email: "", website: "",
      source: "website", stage: "interested", score: null, referrals: 0, notes: details,
      faith: "general", reason: "Applied through the Mitra form on the website", sourceDetail: "jodohmu.com/mitra",
      nextAction: "Call or WhatsApp them back — they asked to be contacted", bestTime: "",
      facilitator: "unknown", facilitatorRate: "", meetingsFacilitated: 0,
      // They asked to be contacted, so they are due straight away
      followUpDate: jakartaDay(), lastContactedAt: null,
      createdAt: d.createdAt ?? FieldValue.serverTimestamp(), createdBy: "Website", log: [],
    });
    writes++;
  });
  if (writes) await batch.commit();
}

/* GET /api/admin/mitra — every Mitra prospect, newest first. Admins, and workers given Mitra access. */
export async function GET(req: NextRequest) {
  const caller = await requireMitra(req);
  if (!caller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  try {
    try {
      await importApplications();
    } catch (err) {
      // A failed import should never block the list from loading
      console.error("Mitra application import failed", err);
    }
    const snap = await adminDb().collection(MITRA_PROSPECTS).orderBy("createdAt", "desc").limit(2000).get();
    return NextResponse.json({ today: jakartaDay(), prospects: snap.docs.map((doc) => toProspect(doc.id, doc.data())) });
  } catch (err) {
    console.error("GET mitra error", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

/* POST /api/admin/mitra — { action: "create" | "edit" | "log", … } */
export async function POST(req: NextRequest) {
  const caller = await requireMitra(req);
  if (!caller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const db = adminDb();

  try {
    const body = (await req.json()) as Record<string, unknown>;
    const now = new Date().toISOString();

    if (body.action === "create") {
      const fields = profileFields(body);
      if (!fields.name) return NextResponse.json({ error: "A name is required." }, { status: 400 });
      if (!fields.phone && !fields.instagram && !fields.email && !fields.website) {
        return NextResponse.json({ error: "Add at least one way to reach them: phone, Instagram, email or website." }, { status: 400 });
      }
      const ref = db.collection(MITRA_PROSPECTS).doc();
      await ref.set({
        ...fields,
        stage: pick(MITRA_STAGES, body.stage) ?? "prospect",
        score: null, referrals: 0, facilitator: "unknown", meetingsFacilitated: 0,
        followUpDate: isDay(body.followUpDate) ? body.followUpDate : null,
        lastContactedAt: null,
        createdAt: FieldValue.serverTimestamp(), createdBy: caller.name,
        log: [],
      });
      return NextResponse.json({ success: true, id: ref.id });
    }

    const id = clean(body.id, 120);
    const ref = id ? db.collection(MITRA_PROSPECTS).doc(id) : null;
    const snap = ref ? await ref.get() : null;
    if (!ref || !snap?.exists) return NextResponse.json({ error: "Mitra not found." }, { status: 404 });
    const current = snap.data()!;

    if (body.action === "edit") {
      const fields = profileFields(body);
      if (!fields.name) return NextResponse.json({ error: "A name is required." }, { status: 400 });
      await ref.update({ ...fields, updatedAt: FieldValue.serverTimestamp(), updatedBy: caller.name });
      return NextResponse.json({ success: true });
    }

    // One touch: what happened, and optionally a new stage, score, referral count and next follow-up
    if (body.action === "log") {
      const channel = pick(MITRA_CHANNELS, body.channel) ?? "note";
      const note = clean(body.note, 1000);
      const stage = pick(MITRA_STAGES, body.stage) ?? current.stage ?? "prospect";
      const nextScore = "score" in body ? score(body.score) : current.score ?? null;
      const referrals = typeof body.referrals === "number" && Number.isInteger(body.referrals) && body.referrals >= 0
        ? body.referrals
        : current.referrals ?? 0;
      const followUpDate = isDay(body.followUpDate) ? body.followUpDate : null;
      const facilitator = pick(MITRA_FACILITATOR, body.facilitator) ?? current.facilitator ?? "unknown";
      const meetingsFacilitated = count(body.meetingsFacilitated) ?? current.meetingsFacilitated ?? 0;
      const nextAction = "nextAction" in body ? clean(body.nextAction, 300) : current.nextAction ?? "";
      const stageChanged = stage !== (current.stage ?? "prospect");
      if (!note && !stageChanged && nextScore === (current.score ?? null) && referrals === (current.referrals ?? 0)
        && followUpDate === (current.followUpDate ?? null) && facilitator === (current.facilitator ?? "unknown")
        && meetingsFacilitated === (current.meetingsFacilitated ?? 0) && nextAction === (current.nextAction ?? "")) {
        return NextResponse.json({ error: "Nothing changed — write what happened, or change the stage, score or follow-up." }, { status: 400 });
      }
      const entry: MitraLogEntry = {
        at: now, by: caller.name, channel: channel as MitraLogEntry["channel"], note,
        stageFrom: stageChanged ? current.stage ?? null : null,
        stageTo: stageChanged ? stage as MitraLogEntry["stageTo"] : null,
      };
      // Reaching out by any channel counts as contact; a "prospect" who has been reached is at least "contacted"
      const reached = channel !== "note";
      const finalStage = reached && stage === "prospect" ? "contacted" : stage;
      if (finalStage !== stage) { entry.stageFrom = current.stage ?? null; entry.stageTo = "contacted"; }
      await ref.update({
        stage: finalStage, score: nextScore, referrals, followUpDate, facilitator, meetingsFacilitated, nextAction,
        ...(reached ? { lastContactedAt: now } : {}),
        log: [entry, ...(Array.isArray(current.log) ? current.log : [])].slice(0, MAX_LOG),
        updatedAt: FieldValue.serverTimestamp(), updatedBy: caller.name,
      });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (err) {
    console.error("POST mitra error", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
