import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { generateUsername } from "@/lib/username";
import { pushToAdmin } from "@/lib/push-server";
import { SHARES_COLLECTION, shareCode } from "@/lib/shares";
import { needsOnboarding } from "@/lib/onboarding";
import { TEAM_INVITES, inviteMemberId } from "@/lib/calldesk";

/**
 * Called right after any self-serve sign-in (Google or email/password).
 * First time a uid shows up, provisions it as a "candidate" lead: a
 * user_roles doc + a candidate_intake stub with personStatus "new_lead" so
 * it appears in the admin waiting list even if the user never finishes
 * onboarding. Idempotent — a no-op for accounts that already have a role.
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = await adminAuth().verifyIdToken(token);
    const uid = decoded.uid;

    const body = await req.json().catch(() => ({} as Record<string, unknown>));
    const clientName = typeof body?.name === "string" ? body.name.trim() : "";
    const shareToken = typeof body?.shareToken === "string" ? body.shareToken : "";

    const roleRef = adminDb().collection("user_roles").doc(uid);
    const roleSnap = await roleRef.get();

    if (roleSnap.exists) {
      const role = (roleSnap.data()?.role as string | undefined) ?? "candidate";
      let onboarding = false;
      if (role === "candidate") {
        const intakeSnap = await adminDb().collection("candidate_intake").doc(uid).get();
        onboarding = needsOnboarding(intakeSnap.data());
      }
      return NextResponse.json({ role, needsOnboarding: onboarding, isNewUser: false });
    }

    const email = (decoded.email ?? "").toLowerCase();
    const name = decoded.name || clientName || email.split("@")[0] || "New User";
    const authProvider = decoded.firebase?.sign_in_provider ?? "password";
    const username = generateUsername();

    // Team members invited by an admin become workers on their first sign-in.
    // Only a verified email (e.g. Google) can claim an invite.
    const inviteRef = email ? adminDb().collection(TEAM_INVITES).doc(email) : null;
    const invite = inviteRef && decoded.email_verified ? await inviteRef.get() : null;
    if (inviteRef && invite?.exists && !invite.data()?.claimedUid) {
      const data = invite.data()!;
      await roleRef.set({
        role: "worker",
        email,
        name: data.name || name,
        username,
        position: data.position ?? null,
        permissions: Array.isArray(data.permissions) ? data.permissions : [],
        createdAt: FieldValue.serverTimestamp(),
        createdBy: data.createdBy ?? null,
        source: "team_invite",
        authProvider,
      });
      await adminDb().collection("usernames").doc(username).set({ uid, email });
      await inviteRef.update({ claimedUid: uid, claimedAt: FieldValue.serverTimestamp() });
      // A schedule planned before the first sign-in moves over to the real account
      const plannedRef = adminDb().collection("team_availability").doc(inviteMemberId(email));
      const planned = await plannedRef.get();
      if (planned.exists) {
        await adminDb().collection("team_availability").doc(uid).set(planned.data()!);
        await plannedRef.delete();
      }
      return NextResponse.json({ role: "worker", needsOnboarding: false, isNewUser: true });
    }

    await roleRef.set({
      role: "candidate",
      email,
      name,
      username,
      createdAt: FieldValue.serverTimestamp(),
      source: "self_signup",
      authProvider,
    });

    await adminDb().collection("usernames").doc(username).set({ uid, email });

    // Accounts created from a profile link are attributed to that link.
    const sourceShare = /^[A-Za-z0-9_-]{16,64}$/.test(shareToken)
      ? await adminDb().collection(SHARES_COLLECTION).doc(shareToken).get()
      : null;

    await adminDb().collection("candidate_intake").doc(uid).set({
      email,
      name,
      personStatus: "new_lead",
      leadSource: sourceShare?.exists ? "share_link" : authProvider,
      ...(sourceShare?.exists ? { sourceShareId: shareToken, sourceShareCode: shareCode(shareToken) } : {}),
      createdAt: FieldValue.serverTimestamp(),
    });

    const welcomeText = `Assalamualaikum ${name}! 👋\n\nSelamat datang di Jodohmu. Kami sangat senang kamu bergabung dalam perjalanan ta'aruf ini.\n\nTim kami akan segera menghubungi kamu untuk langkah selanjutnya. Jangan ragu untuk bertanya apa saja di sini — kami siap membantu! 🌸`;

    const msgRef = await adminDb().collection("chats").doc(uid).collection("messages").add({
      text: welcomeText,
      from: "admin",
      senderName: "Tim Jodohmu",
      createdAt: FieldValue.serverTimestamp(),
    });

    await adminDb().collection("chats").doc(uid).set({
      displayName: name,
      email,
      lastMessage: welcomeText,
      lastAt: FieldValue.serverTimestamp(),
      lastMessageFrom: "admin",
      lastMessageRead: false,
      unreadCandidate: 1,
      unreadAdmin: 0,
    });

    // suppress unused var lint
    void msgRef;

    pushToAdmin("Pendaftaran baru 🎉", `${name} baru saja mendaftar di Jodohmu`).catch(() => {});

    return NextResponse.json({ role: "candidate", needsOnboarding: true, isNewUser: true });
  } catch (error) {
    console.error("auth bootstrap error", error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
