import { getMessaging } from "firebase-admin/messaging";
import { adminDb, getAdminApp } from "@/lib/firebase-admin";

const adminMessaging = () => getMessaging(getAdminApp());

async function sendToToken(token: string, title: string, body: string, link = "/") {
  try {
    await adminMessaging().send({
      token,
      notification: { title, body },
      webpush: {
        fcmOptions: { link },
        notification: { icon: "/jodohmu-logo.png" },
      },
    });
  } catch (err: unknown) {
    const code = (err as { code?: string })?.code;
    if (
      code === "messaging/registration-token-not-registered" ||
      code === "messaging/invalid-registration-token"
    ) {
      // Stale token — silently ignore
    } else {
      console.warn("[push] sendToToken error:", err);
    }
  }
}

export async function pushToAdmin(title: string, body: string, link = "/admin/chat") {
  try {
    const rolesSnap = await adminDb()
      .collection("user_roles")
      .where("role", "==", "admin")
      .get();
    await Promise.all(
      rolesSnap.docs.map(async d => {
        const tokenSnap = await adminDb().collection("fcm_tokens").doc(d.id).get();
        const token = tokenSnap.data()?.token as string | undefined;
        if (token) await sendToToken(token, title, body, link);
      })
    );
  } catch (err) {
    console.warn("[push] pushToAdmin error:", err);
  }
}

export async function pushToUid(uid: string, title: string, body: string, link = "/dashboard") {
  try {
    const tokenSnap = await adminDb().collection("fcm_tokens").doc(uid).get();
    const token = tokenSnap.data()?.token as string | undefined;
    if (token) await sendToToken(token, title, body, link);
  } catch (err) {
    console.warn("[push] pushToUid error:", err);
  }
}
