import { NextRequest, NextResponse } from "next/server";
import { FieldValue } from "firebase-admin/firestore";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import {
  INVITES_COLLECTION,
  INVITE_TOKEN_RE,
  firstName,
  inviteState,
  isGoogleEmail,
  maskEmail,
  type InvitePublicPayload,
  type InviteRecord,
} from "@/lib/account-invites";

async function load(token: string) {
  if (!INVITE_TOKEN_RE.test(token)) return null;
  const ref = adminDb().collection(INVITES_COLLECTION).doc(token);
  const snap = await ref.get();
  return snap.exists ? { ref, inv: snap.data() as InviteRecord } : null;
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  try {
    const found = await load(token);
    if (!found) return NextResponse.json({ state: "missing" } satisfies InvitePublicPayload);

    const state = inviteState(found.inv);
    if (state !== "valid" && state !== "accepted") {
      return NextResponse.json({ state } satisfies InvitePublicPayload);
    }

    found.ref.update({ opens: FieldValue.increment(1), lastOpenedAt: FieldValue.serverTimestamp() }).catch(() => {});
    return NextResponse.json({
      state,
      firstName: firstName(found.inv.name),
      emailHint: maskEmail(found.inv.email),
      googleEmail: isGoogleEmail(found.inv.email),
    } satisfies InvitePublicPayload);
  } catch (err) {
    console.error("invite lookup error", err);
    return NextResponse.json({ state: "missing" }, { status: 500 });
  }
}

/** The signed-in person claims the invite. Only the invited account itself can. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const bearer = req.headers.get("authorization");
  if (!bearer?.startsWith("Bearer ")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const decoded = await adminAuth().verifyIdToken(bearer.replace("Bearer ", ""));
    const found = await load(token);
    if (!found) return NextResponse.json({ error: "missing" }, { status: 410 });

    if (decoded.uid !== found.inv.uid) {
      // Team members opening the link are sent to the candidate's admin profile,
      // where the usual rules apply (admins and assigned workers can edit).
      const role = (await adminDb().collection("user_roles").doc(decoded.uid).get()).data()?.role;
      if (role === "admin" || role === "worker") {
        return NextResponse.json({ ok: true, team: true, candidateId: found.inv.uid });
      }
      return NextResponse.json({ error: "wrong_account", emailHint: maskEmail(found.inv.email) }, { status: 403 });
    }

    const state = inviteState(found.inv);
    if (state !== "valid" && state !== "accepted") {
      return NextResponse.json({ error: state }, { status: 410 });
    }

    if (state === "valid") {
      await Promise.all([
        found.ref.update({
          acceptedAt: FieldValue.serverTimestamp(),
          acceptedVia: decoded.firebase?.sign_in_provider ?? null,
        }),
        adminDb().collection("candidate_intake").doc(decoded.uid).set(
          { accountClaimedAt: FieldValue.serverTimestamp() },
          { merge: true },
        ),
      ]);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("invite accept error", err);
    return NextResponse.json({ error: "Error" }, { status: 500 });
  }
}
