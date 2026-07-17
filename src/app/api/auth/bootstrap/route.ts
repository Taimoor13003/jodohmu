import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { generateUsername } from "@/lib/username";
import { pushToAdmin } from "@/lib/push-server";

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

    const roleRef = adminDb().collection("user_roles").doc(uid);
    const roleSnap = await roleRef.get();

    if (roleSnap.exists) {
      const role = (roleSnap.data()?.role as string | undefined) ?? "candidate";
      let needsOnboarding = false;
      if (role === "candidate") {
        const intakeSnap = await adminDb().collection("candidate_intake").doc(uid).get();
        const data = intakeSnap.data();
        needsOnboarding = !data?.fullName || !data?.whatsappNumber || !data?.gender;
      }
      return NextResponse.json({ role, needsOnboarding, isNewUser: false });
    }

    const email = (decoded.email ?? "").toLowerCase();
    const name = decoded.name || clientName || email.split("@")[0] || "New User";
    const authProvider = decoded.firebase?.sign_in_provider ?? "password";
    const username = generateUsername();

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

    await adminDb().collection("candidate_intake").doc(uid).set({
      email,
      name,
      personStatus: "new_lead",
      leadSource: authProvider,
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
