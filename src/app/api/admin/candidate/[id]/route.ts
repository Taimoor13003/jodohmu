import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

async function resolveRole(uid: string): Promise<string | null> {
  const snap = await adminDb().collection("user_roles").doc(uid).get();
  return snap.exists ? (snap.data()?.role ?? null) : null;
}

async function canAccess(requesterUid: string, candidateId: string): Promise<{ ok: boolean; canEdit: boolean }> {
  const role = await resolveRole(requesterUid);
  if (role === "admin") return { ok: true, canEdit: true };
  if (role === "worker") {
    const doc = await adminDb().collection("candidate_intake").doc(candidateId).get();
    const assigned: string[] = doc.data()?.assignedWorkers ?? [];
    const isAssigned = assigned.includes(requesterUid);
    // Workers can only view/edit clients assigned to them, with full admin-level edit access
    return { ok: isAssigned, canEdit: isAssigned };
  }
  // Candidate can view their own profile
  if (role === "candidate" && requesterUid === candidateId) {
    return { ok: true, canEdit: false };
  }
  return { ok: false, canEdit: false };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await adminAuth().verifyIdToken(token);
    const access = await canAccess(decoded.uid, id);
    if (!access.ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const [intakeSnap, roleSnap] = await Promise.all([
      adminDb().collection("candidate_intake").doc(id).get(),
      adminDb().collection("user_roles").doc(id).get(),
    ]);

    return NextResponse.json({
      data: intakeSnap.data() ?? {},
      meta: roleSnap.data() ?? {},
      canEdit: access.canEdit,
    });
  } catch (err) {
    console.error("GET candidate error", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const token = req.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const decoded = await adminAuth().verifyIdToken(token);
    const access = await canAccess(decoded.uid, id);
    if (!access.ok || !access.canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { _sectionKey, ...fields } = body as Record<string, unknown>;

    const payload: Record<string, unknown> = {
      ...fields,
      updatedAt: FieldValue.serverTimestamp(),
      updatedBy: decoded.uid,
    };

    if (_sectionKey && typeof _sectionKey === "string") {
      payload[`_sectionMeta.${_sectionKey}`] = {
        updatedAt: FieldValue.serverTimestamp(),
        updatedBy: decoded.uid,
        updatedByName: decoded.name ?? decoded.email ?? decoded.uid,
      };
    }

    await adminDb().collection("candidate_intake").doc(id).set(payload, { merge: true });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("PATCH candidate error", err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "Error" }, { status: 500 });
  }
}
