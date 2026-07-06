import { NextRequest, NextResponse } from "next/server";
import { adminAuth, adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { generateUsername } from "@/lib/username";

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

    return NextResponse.json({ role: "candidate", needsOnboarding: true, isNewUser: true });
  } catch (error) {
    console.error("auth bootstrap error", error);
    const message = error instanceof Error ? error.message : "Unexpected error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
