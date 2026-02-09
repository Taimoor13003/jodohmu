import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

type Role = "admin" | "worker" | "candidate";

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return badRequest("Missing authorization token", 401);
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = await adminAuth().verifyIdToken(token);
    const requesterUid = decoded.uid;

    // Check requester role
    const requesterRoleSnap = await adminDb().collection("user_roles").doc(requesterUid).get();
    const requesterRole = requesterRoleSnap.exists ? (requesterRoleSnap.data()?.role as Role | undefined) : undefined;
    if (requesterRole !== "admin") {
      return badRequest("Forbidden", 403);
    }

    const body = await req.json();
    const { role, email, password, name, details } = body ?? {};

    if (!role || !["admin", "worker", "candidate"].includes(role)) {
      return badRequest("Invalid role");
    }
    if (!email || !password || !name) {
      return badRequest("Missing required fields: name, email, password");
    }

    const emailLower = String(email).toLowerCase();

    const userRecord = await adminAuth().createUser({
      email: emailLower,
      password: String(password),
      displayName: String(name),
      emailVerified: false,
      disabled: false,
    });

    await adminDb().collection("user_roles").doc(userRecord.uid).set({
      role,
      email: emailLower,
      name,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: requesterUid,
    });

    if (role === "candidate") {
      await adminDb().collection("candidate_intake").doc(userRecord.uid).set({
        ...details,
        email: emailLower,
        name,
        createdAt: FieldValue.serverTimestamp(),
        createdBy: requesterUid,
      });
    }

    return NextResponse.json({ success: true, uid: userRecord.uid });
  } catch (error) {
    console.error("Error creating user via admin API", error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
