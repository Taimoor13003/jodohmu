import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { TEAM_INVITES, TEAM_POSITIONS, normalizePermissions } from "@/lib/calldesk";

const POSITIONS = TEAM_POSITIONS.map((p) => p.value) as string[];
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function requireAdmin(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  try {
    const decoded = await adminAuth().verifyIdToken(token);
    const role = (await adminDb().collection("user_roles").doc(decoded.uid).get()).data()?.role;
    return role === "admin" ? decoded : null;
  } catch {
    return null;
  }
}

function access(body: Record<string, unknown>) {
  const position = POSITIONS.includes(body.position as string) ? (body.position as string) : null;
  const requested = Array.isArray(body.permissions) ? (body.permissions as string[]) : [];
  return { position, permissions: normalizePermissions(requested) };
}

/* POST /api/admin/team — admin invites a team member by email; they become a worker on first Google sign-in */
export async function POST(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
    const name = typeof body?.name === "string" ? body.name.trim().slice(0, 120) : "";
    if (!EMAIL.test(email) || !name) return NextResponse.json({ error: "Name and a valid email are required." }, { status: 400 });

    const existing = await adminDb().collection("user_roles").where("email", "==", email).limit(1).get();
    if (!existing.empty) {
      return NextResponse.json({ error: "This email already has an account. Change its role instead." }, { status: 409 });
    }

    await adminDb().collection(TEAM_INVITES).doc(email).set({
      email, name, role: "worker", ...access(body),
      createdAt: FieldValue.serverTimestamp(),
      createdBy: admin.uid,
      claimedUid: null,
    });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("POST team invite error", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

/* PATCH /api/admin/team — admin sets position and permissions for a worker ({ uid }) or a pending invite ({ inviteEmail }) */
export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const body = await req.json();
    const next = access(body);
    const stamp = { permissionsUpdatedAt: FieldValue.serverTimestamp(), permissionsUpdatedBy: admin.uid };

    if (typeof body?.inviteEmail === "string") {
      const ref = adminDb().collection(TEAM_INVITES).doc(body.inviteEmail.toLowerCase());
      const invite = await ref.get();
      if (!invite.exists || invite.data()?.claimedUid) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
      await ref.update({ ...next, ...stamp });
      return NextResponse.json({ success: true, ...next });
    }

    const uid = typeof body?.uid === "string" ? body.uid : "";
    const ref = adminDb().collection("user_roles").doc(uid);
    const target = uid ? await ref.get() : null;
    if (!target?.exists || target.data()?.role !== "worker") {
      return NextResponse.json({ error: "Worker not found" }, { status: 404 });
    }
    await ref.update({ ...next, ...stamp });
    return NextResponse.json({ success: true, ...next });
  } catch (err) {
    console.error("PATCH team error", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}

/* DELETE /api/admin/team?inviteEmail=… — admin cancels an invite that hasn't been used yet */
export async function DELETE(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  try {
    const email = (req.nextUrl.searchParams.get("inviteEmail") ?? "").toLowerCase();
    const ref = adminDb().collection(TEAM_INVITES).doc(email);
    const invite = email ? await ref.get() : null;
    if (!invite?.exists || invite.data()?.claimedUid) return NextResponse.json({ error: "Invite not found" }, { status: 404 });
    await ref.delete();
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("DELETE team invite error", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
