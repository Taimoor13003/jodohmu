import { NextRequest, NextResponse } from "next/server";
import { FieldValue, type DocumentData, type Timestamp } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { withLiveAge } from "@/lib/age";
import { authenticateTeam, canManageCandidate, canManageSuggestionFor, hasPermission, type TeamActor } from "@/lib/team-access";
import {
  FACT_FIELDS,
  SUGGESTIONS_COLLECTION,
  type Suggestion,
  type SuggestionNote,
  type SuggestionPerson,
  isStatus,
} from "@/lib/match-suggestions";

export const dynamic = "force-dynamic";

const iso = (v: unknown) => (v as Timestamp | undefined)?.toDate?.()?.toISOString() ?? null;
const str = (v: unknown) => (typeof v === "string" && v.trim() && v !== "—" ? v.trim() : null);

function person(uid: string, d: DocumentData | undefined, withFacts = true): SuggestionPerson {
  const data = d ? withLiveAge(d as Record<string, unknown>) : {};
  const photos = Array.isArray(data.photoUrls) ? (data.photoUrls as string[]) : [];
  const facts: Record<string, unknown> = {};
  if (withFacts) {
    for (const f of FACT_FIELDS) {
      const v = data[f];
      if (v !== undefined && v !== null && v !== "" && v !== "—" && !(Array.isArray(v) && v.length === 0)) facts[f] = v;
    }
  }
  return {
    uid,
    name: str(data.fullName) ?? str(data.name) ?? "—",
    gender: str(data.gender),
    age: str(data.age),
    city: str(data.location),
    photo: photos[0] ?? null,
    ...(withFacts ? { facts, linkActive: !!data.profileLinkActive } : {}),
  };
}

/** Turns stored docs into API rows, reading names/photos live so renamed profiles stay correct. */
async function hydrate(docs: { id: string; data: DocumentData }[]): Promise<Suggestion[]> {
  const uids = Array.from(new Set(docs.flatMap(d => [d.data.clientUid, d.data.candidateUid]).filter(Boolean)));
  const snaps = uids.length
    ? await adminDb().getAll(...uids.map(u => adminDb().collection("candidate_intake").doc(u)))
    : [];
  const byUid = new Map(snaps.map(s => [s.id, s.data()]));
  return docs.map(({ id, data }) => ({
    id,
    clientUid: data.clientUid,
    candidateUid: data.candidateUid,
    client: person(data.clientUid, byUid.get(data.clientUid)),
    candidate: person(data.candidateUid, byUid.get(data.candidateUid)),
    status: isStatus(data.status) ? data.status : "backlog",
    reason: data.reason ?? "",
    notes: ((data.notes ?? []) as (Omit<SuggestionNote, "at"> & { at: unknown })[])
      .map(n => ({ ...n, at: typeof n.at === "string" ? n.at : iso(n.at) ?? "" })),
    createdByName: data.createdByName ?? "",
    createdAt: iso(data.createdAt),
    updatedAt: iso(data.updatedAt),
    sentAt: iso(data.sentAt),
  }));
}

async function team(req: NextRequest): Promise<TeamActor | null> {
  const actor = await authenticateTeam(req.headers.get("authorization"));
  return actor && (actor.role === "admin" || actor.role === "worker") ? actor : null;
}

/**
 * GET ?uid=X     → suggestions where X is the client, and where X was suggested to others
 * GET ?people=1  → every candidate (name, age, city, photo) for the picker
 * GET            → the whole backlog (workers: only clients assigned to them)
 */
export async function GET(req: NextRequest) {
  const actor = await team(req);
  if (!actor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const db = adminDb();
  const params = req.nextUrl.searchParams;

  try {
    if (params.get("people")) {
      const snap = await db.collection("candidate_intake").get();
      const people = snap.docs
        .filter(d => !d.id.startsWith("test_"))
        .map(d => person(d.id, d.data()))
        .filter(p => p.name !== "—")
        .sort((a, b) => a.name.localeCompare(b.name));
      return NextResponse.json({ people });
    }

    const uid = params.get("uid");
    if (uid) {
      if (!(await canManageSuggestionFor(actor, uid))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      const [asClient, asCandidate] = await Promise.all([
        db.collection(SUGGESTIONS_COLLECTION).where("clientUid", "==", uid).get(),
        db.collection(SUGGESTIONS_COLLECTION).where("candidateUid", "==", uid).get(),
      ]);
      const [forClient, suggestedTo] = await Promise.all([
        hydrate(asClient.docs.map(d => ({ id: d.id, data: d.data() }))),
        hydrate(asCandidate.docs.map(d => ({ id: d.id, data: d.data() }))),
      ]);
      return NextResponse.json({ forClient, suggestedTo });
    }

    const snap = await db.collection(SUGGESTIONS_COLLECTION).get();
    let docs = snap.docs.map(d => ({ id: d.id, data: d.data() }));
    if (!(await hasPermission(actor, "matches"))) {
      const allowed = await Promise.all(docs.map(d => canManageCandidate(actor, d.data.clientUid)));
      docs = docs.filter((_, i) => allowed[i]);
    }
    return NextResponse.json({ suggestions: await hydrate(docs) });
  } catch (err) {
    console.error("[suggestions] GET failed", err);
    return NextResponse.json({ error: "Failed to load suggestions" }, { status: 500 });
  }
}

/** Add "candidate would suit client" to the backlog. */
export async function POST(req: NextRequest) {
  const actor = await team(req);
  if (!actor) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => null) as { clientUid?: string; candidateUid?: string; reason?: string } | null;
  const clientUid = body?.clientUid?.trim();
  const candidateUid = body?.candidateUid?.trim();
  if (!clientUid || !candidateUid) return NextResponse.json({ error: "Pick both people" }, { status: 400 });
  if (clientUid === candidateUid) return NextResponse.json({ error: "Can't suggest someone to themselves" }, { status: 400 });
  if (!(await canManageSuggestionFor(actor, clientUid))) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const db = adminDb();
  try {
    const [client, candidate, dup] = await Promise.all([
      db.collection("candidate_intake").doc(clientUid).get(),
      db.collection("candidate_intake").doc(candidateUid).get(),
      db.collection(SUGGESTIONS_COLLECTION).where("clientUid", "==", clientUid).where("candidateUid", "==", candidateUid).limit(1).get(),
    ]);
    if (!client.exists || !candidate.exists) return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    if (!dup.empty) return NextResponse.json({ error: "Already suggested", id: dup.docs[0].id }, { status: 409 });

    const reason = (body?.reason ?? "").trim().slice(0, 2000);
    const ref = db.collection(SUGGESTIONS_COLLECTION).doc();
    await ref.set({
      clientUid,
      candidateUid,
      status: "backlog",
      reason,
      notes: [],
      history: [{ status: "backlog", byName: actor.name, at: new Date().toISOString() }],
      createdBy: actor.uid,
      createdByName: actor.name,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
      sentAt: null,
    });
    const [row] = await hydrate([{ id: ref.id, data: (await ref.get()).data()! }]);
    return NextResponse.json({ suggestion: row });
  } catch (err) {
    console.error("[suggestions] POST failed", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}
