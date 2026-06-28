import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

async function getRole(uid: string) {
  const snap = await adminDb().collection("user_roles").doc(uid).get();
  return snap.data()?.role ?? null;
}

async function requireAdmin(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try {
    const decoded = await adminAuth().verifyIdToken(token);
    const role = await getRole(decoded.uid);
    if (role !== "admin") return null;
    return decoded;
  } catch {
    return null;
  }
}

/* GET /api/admin/crm/[id] — list entries + candidate meta */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caller = await requireAdmin(req);
  if (!caller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const [intakeSnap, logSnap] = await Promise.all([
      adminDb().collection("candidate_intake").doc(id).get(),
      adminDb().collection("candidate_intake").doc(id).collection("crm_log")
        .orderBy("createdAt", "desc").limit(200).get(),
    ]);

    const entries = logSnap.docs.map(d => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString() ?? null,
    }));

    return NextResponse.json({ data: intakeSnap.data() ?? {}, entries });
  } catch (err) {
    console.error("GET crm error", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

/* POST /api/admin/crm/[id] — add new entry */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caller = await requireAdmin(req);
  if (!caller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json() as Record<string, unknown>;
    const ref = adminDb().collection("candidate_intake").doc(id).collection("crm_log").doc();
    await ref.set({
      ...body,
      createdBy: caller.uid,
      createdByName: caller.name ?? caller.email ?? caller.uid,
      createdAt: FieldValue.serverTimestamp(),
    });
    return NextResponse.json({ id: ref.id });
  } catch (err) {
    console.error("POST crm error", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

/* PATCH /api/admin/crm/[id] — update candidate CRM meta fields */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caller = await requireAdmin(req);
  if (!caller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json() as Record<string, unknown>;
    await adminDb().collection("candidate_intake").doc(id).set(
      { ...body, updatedAt: FieldValue.serverTimestamp(), updatedBy: caller.uid },
      { merge: true }
    );
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH crm meta error", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

/* DELETE /api/admin/crm/[id]?entry=<entryId> — delete a log entry */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const caller = await requireAdmin(req);
  if (!caller) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const entryId = new URL(req.url).searchParams.get("entry");
  if (!entryId) return NextResponse.json({ error: "Missing entry id" }, { status: 400 });

  try {
    await adminDb().collection("candidate_intake").doc(id).collection("crm_log").doc(entryId).delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE crm entry error", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
