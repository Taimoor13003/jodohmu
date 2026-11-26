import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { randomBytes } from "crypto";
import { adminDb } from "@/lib/firebase-admin";
import { authenticateTeam, canManageSuggestionFor } from "@/lib/team-access";
import { SUGGESTIONS_COLLECTION, isOrigin, isStatus } from "@/lib/match-suggestions";

export const dynamic = "force-dynamic";

async function load(req: NextRequest, sid: string) {
  const actor = await authenticateTeam(req.headers.get("authorization"));
  if (!actor || (actor.role !== "admin" && actor.role !== "worker")) return { error: 403 as const };
  const ref = adminDb().collection(SUGGESTIONS_COLLECTION).doc(sid);
  const snap = await ref.get();
  if (!snap.exists) return { error: 404 as const };
  if (!(await canManageSuggestionFor(actor, snap.data()!.clientUid))) return { error: 403 as const };
  return { actor, ref, data: snap.data()! };
}

/** Change status, edit the reason, or add a note (e.g. the client's feedback). */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ sid: string }> }) {
  const { sid } = await params;
  const found = await load(req, sid);
  if ("error" in found) return NextResponse.json({ error: "Not allowed" }, { status: found.error });
  const { actor, ref, data } = found;

  const body = await req.json().catch(() => null) as { status?: string; origin?: string; reason?: string; note?: string; removeNoteId?: string } | null;
  if (!body) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const now = new Date().toISOString();
  const update: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() };

  if (body.status !== undefined) {
    if (!isStatus(body.status)) return NextResponse.json({ error: "Unknown status" }, { status: 400 });
    if (body.status !== data.status) {
      update.status = body.status;
      update.history = FieldValue.arrayUnion({ status: body.status, byName: actor.name, at: now });
      if (body.status === "sent" && !data.sentAt) update.sentAt = FieldValue.serverTimestamp();
    }
  }
  if (body.origin !== undefined) {
    if (!isOrigin(body.origin)) return NextResponse.json({ error: "Unknown origin" }, { status: 400 });
    update.origin = body.origin;
  }
  if (typeof body.reason === "string") update.reason = body.reason.trim().slice(0, 2000);

  const notes = [...(data.notes ?? [])] as { id: string }[];
  let notesChanged = false;
  if (typeof body.note === "string" && body.note.trim()) {
    notes.push({ id: randomBytes(6).toString("hex"), text: body.note.trim().slice(0, 4000), byUid: actor.uid, byName: actor.name, at: now } as { id: string });
    notesChanged = true;
  }
  if (body.removeNoteId) {
    const i = notes.findIndex(n => n.id === body.removeNoteId);
    if (i >= 0) { notes.splice(i, 1); notesChanged = true; }
  }
  if (notesChanged) update.notes = notes;

  try {
    await ref.update(update);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[suggestions] PATCH failed", err);
    return NextResponse.json({ error: "Failed to save" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ sid: string }> }) {
  const { sid } = await params;
  const found = await load(req, sid);
  if ("error" in found) return NextResponse.json({ error: "Not allowed" }, { status: found.error });
  await found.ref.delete();
  return NextResponse.json({ success: true });
}
