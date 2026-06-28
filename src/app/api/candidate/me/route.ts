import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const decoded = await adminAuth().verifyIdToken(token);
    const snap = await adminDb().collection("candidate_intake").doc(decoded.uid).get();
    return NextResponse.json({ uid: decoded.uid, data: snap.exists ? snap.data() : null });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

/* PATCH — candidate updates their own allowed fields */
const CANDIDATE_WRITABLE = new Set(["profileLinkActive", "publicPhotosVisible"]);

export async function PATCH(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const decoded = await adminAuth().verifyIdToken(token);
    const body = await req.json() as Record<string, unknown>;

    const safe: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(body)) {
      if (CANDIDATE_WRITABLE.has(k)) safe[k] = v;
    }
    if (!Object.keys(safe).length) return NextResponse.json({ error: "No writable fields" }, { status: 400 });

    await adminDb().collection("candidate_intake").doc(decoded.uid).set(
      { ...safe, updatedAt: FieldValue.serverTimestamp() },
      { merge: true }
    );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
