import { FieldValue } from "firebase-admin/firestore";
import { adminDb } from "@/lib/firebase-admin";
import { pushToAdmin } from "@/lib/push-server";

/**
 * Someone liked a candidate's profile. Profiles never show contact details,
 * so the team has to arrange the meeting: every like lands in the admin bell
 * and as a push alert, with both people's details at hand.
 */
export async function alertInterest(input: {
  targetUid: string;
  likerUid: string;
  likerName?: string | null;
  likerEmail?: string | null;
  source: "profile_link" | "share_link";
  message?: string | null;
  shareToken?: string | null;
}) {
  try {
    const db = adminDb();
    const [targetSnap, likerSnap] = await Promise.all([
      db.collection("candidate_intake").doc(input.targetUid).get(),
      db.collection("candidate_intake").doc(input.likerUid).get(),
    ]);
    const target = targetSnap.data() ?? {};
    const liker = likerSnap.data() ?? {};

    const targetName = String(target.fullName ?? target.name ?? "a candidate");
    const likerName = String(liker.fullName ?? input.likerName ?? input.likerEmail ?? "Someone");
    const likerPhone = typeof liker.whatsappNumber === "string" && liker.whatsappNumber.trim() ? liker.whatsappNumber.trim() : null;
    const digits = likerPhone ? likerPhone.replace(/[^\d]/g, "") : "";

    await db.collection("admin_notifications").add({
      type: "profile_interest",
      uid: input.targetUid,
      name: targetName,
      likerUid: input.likerUid,
      likerName,
      likerEmail: input.likerEmail ?? null,
      likerIsCandidate: likerSnap.exists,
      phone: likerPhone,
      waLink: digits ? `https://wa.me/${digits}` : null,
      city: typeof liker.location === "string" && liker.location ? liker.location : null,
      source: input.source,
      message: input.message?.trim() || null,
      shareToken: input.shareToken ?? null,
      read: false,
      createdAt: FieldValue.serverTimestamp(),
    });

    const where = input.source === "share_link" ? "a shared link" : "the profile link";
    await pushToAdmin(
      `💛 ${likerName} likes ${targetName}`,
      `Liked from ${where}. Contact both to arrange the introduction.`,
      `/admin/candidates/${input.targetUid}`,
    );
  } catch (err) {
    // Never block the like itself, but leave a trace so a silent failure is visible in the logs.
    console.error("[interest-alert] failed", err);
  }
}
