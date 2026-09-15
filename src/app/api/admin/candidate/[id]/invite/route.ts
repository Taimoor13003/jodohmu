import { NextRequest, NextResponse } from "next/server";
import { FieldValue, Timestamp } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { authenticateTeam, canManageCandidate } from "@/lib/team-access";
import {
  INVITES_COLLECTION,
  INVITE_TTL_DAYS,
  inviteState,
  newInviteToken,
  tsToIso,
  type CandidateAccessStatus,
  type InviteRecord,
} from "@/lib/account-invites";

async function loadStatus(uid: string): Promise<CandidateAccessStatus> {
  const [authUser, invitesSnap] = await Promise.all([
    adminAuth().getUser(uid).catch(() => null),
    // Single-field filter only, sorted in memory — no composite index needed
    adminDb().collection(INVITES_COLLECTION).where("uid", "==", uid).get(),
  ]);

  const latest = invitesSnap.docs
    .map(d => ({ token: d.id, inv: d.data() as InviteRecord }))
    .sort((a, b) => (b.inv.createdAt?.toMillis() ?? 0) - (a.inv.createdAt?.toMillis() ?? 0))[0];

  return {
    account: authUser
      ? {
          email: authUser.email ?? "",
          lastSignInAt: authUser.metadata.lastSignInTime ? new Date(authUser.metadata.lastSignInTime).toISOString() : null,
          providers: authUser.providerData.map(p => p.providerId),
        }
      : null,
    invite: latest
      ? {
          token: latest.token,
          state: inviteState(latest.inv),
          createdAt: tsToIso(latest.inv.createdAt),
          expiresAt: tsToIso(latest.inv.expiresAt),
          acceptedAt: tsToIso(latest.inv.acceptedAt),
          createdByName: latest.inv.createdByName ?? "",
          opens: latest.inv.opens ?? 0,
        }
      : null,
  };
}

async function guard(req: NextRequest, id: string) {
  const actor = await authenticateTeam(req.headers.get("authorization"));
  if (!actor) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  if (!(await canManageCandidate(actor, id))) return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  return { actor };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = await guard(req, id);
  if (g.error) return g.error;
  try {
    return NextResponse.json(await loadStatus(id));
  } catch (err) {
    console.error("invite status error", err);
    return NextResponse.json({ error: "Failed to load account status" }, { status: 500 });
  }
}

/** Creates a fresh invite link; any older unused link for this candidate stops working. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const g = await guard(req, id);
  if (g.error) return g.error;

  try {
    const roleSnap = await adminDb().collection("user_roles").doc(id).get();
    const roleData = roleSnap.data();
    if (roleData?.role !== "candidate") {
      return NextResponse.json({ error: "Invites are only for candidates" }, { status: 400 });
    }
    const authUser = await adminAuth().getUser(id).catch(() => null);
    const email = (authUser?.email ?? roleData.email ?? "").toLowerCase();
    if (!email) return NextResponse.json({ error: "This candidate has no email address" }, { status: 400 });

    const db = adminDb();
    const previous = await db.collection(INVITES_COLLECTION).where("uid", "==", id).get();
    const batch = db.batch();
    for (const d of previous.docs) {
      const inv = d.data() as InviteRecord;
      if (!inv.revokedAt && !inv.acceptedAt) batch.update(d.ref, { revokedAt: FieldValue.serverTimestamp() });
    }
    batch.set(db.collection(INVITES_COLLECTION).doc(newInviteToken()), {
      uid: id,
      email,
      name: roleData.name ?? "",
      createdBy: g.actor.uid,
      createdByName: g.actor.name,
      createdAt: FieldValue.serverTimestamp(),
      expiresAt: Timestamp.fromMillis(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000),
      acceptedAt: null,
      revokedAt: null,
      opens: 0,
    });
    await batch.commit();

    return NextResponse.json(await loadStatus(id));
  } catch (err) {
    console.error("create invite error", err);
    return NextResponse.json({ error: "Failed to create invite link" }, { status: 500 });
  }
}
