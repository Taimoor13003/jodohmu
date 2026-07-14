import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { generateUsername } from "@/lib/username";

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

    const body = await req.json();
    const { role, email, password, name, details, username: rawUsername } = body ?? {};

    // Admins can create any role; workers may only create candidates (their own clients)
    if (requesterRole !== "admin" && !(requesterRole === "worker" && role === "candidate")) {
      return badRequest("Forbidden", 403);
    }

    if (!role || !["admin", "worker", "candidate"].includes(role)) {
      return badRequest("Invalid role");
    }
    if (!email || !password || !name) {
      return badRequest("Missing required fields: name, email, password");
    }

    const emailLower = String(email).toLowerCase();

    let username: string;
    if (rawUsername && String(rawUsername).trim()) {
      username = String(rawUsername).trim().toLowerCase();
      if (!/^[a-z0-9_]{3,20}$/.test(username)) {
        return badRequest("Username must be 3–20 characters: lowercase letters, numbers, underscores only");
      }
      const existing = await adminDb().collection("usernames").doc(username).get();
      if (existing.exists) {
        return badRequest("Username already taken");
      }
    } else {
      username = generateUsername();
    }

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
      username,
      createdAt: FieldValue.serverTimestamp(),
      createdBy: requesterUid,
    });

    await adminDb().collection("usernames").doc(username).set({
      uid: userRecord.uid,
      email: emailLower,
    });

    if (role === "candidate") {
      await adminDb().collection("candidate_intake").doc(userRecord.uid).set({
        ...details,
        email: emailLower,
        name,
        // Workers get auto-assigned to clients they create so they can edit them right away
        ...(requesterRole === "worker" ? { assignedWorkers: [requesterUid] } : {}),
        createdAt: FieldValue.serverTimestamp(),
        createdBy: requesterUid,
      });
    }

    return NextResponse.json({ success: true, uid: userRecord.uid, username });
  } catch (error) {
    console.error("Error creating user via admin API", error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
