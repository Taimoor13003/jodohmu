import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export async function POST(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const decoded = await adminAuth().verifyIdToken(token);
    const body = await req.json() as { targetUid: string; message?: string };

    if (!body.targetUid) return NextResponse.json({ error: "Missing targetUid" }, { status: 400 });
    if (body.targetUid === decoded.uid) return NextResponse.json({ error: "Cannot request yourself" }, { status: 400 });

    // Check target profile is public
    const targetSnap = await adminDb().collection("candidate_intake").doc(body.targetUid).get();
    if (!targetSnap.exists || !targetSnap.data()?.profileLinkActive) {
      return NextResponse.json({ error: "Profile not available" }, { status: 404 });
    }

    // Prevent duplicate pending requests
    const existing = await adminDb().collection("taaruf_requests")
      .where("requesterUid", "==", decoded.uid)
      .where("targetUid", "==", body.targetUid)
      .where("status", "==", "pending")
      .limit(1).get();
    if (!existing.empty) return NextResponse.json({ error: "Already requested" }, { status: 409 });

    const requesterSnap = await adminDb().collection("candidate_intake").doc(decoded.uid).get();
    const requesterData = requesterSnap.data() ?? {};

    const ref = adminDb().collection("taaruf_requests").doc();
    await ref.set({
      targetUid:      body.targetUid,
      targetName:     targetSnap.data()?.fullName ?? "",
      requesterUid:   decoded.uid,
      requesterName:  (requesterData.fullName as string | undefined) ?? decoded.name ?? decoded.email ?? decoded.uid,
      requesterEmail: decoded.email ?? "",
      message:        body.message ?? "",
      status:         "pending",
      createdAt:      FieldValue.serverTimestamp(),
    });

    return NextResponse.json({ id: ref.id });
  } catch (err) {
    console.error("[taaruf-request] error:", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
