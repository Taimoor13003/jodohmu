import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { app, db } from "@/lib/firebase";

export async function registerFcmToken(uid: string): Promise<void> {
  try {
    if (typeof window === "undefined") return;
    if (!(await isSupported())) return;

    const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;
    if (!vapidKey) return;

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return;

    const messaging = getMessaging(app);
    const token = await getToken(messaging, { vapidKey });
    if (!token) return;

    await setDoc(doc(db, "fcm_tokens", uid), {
      token,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  } catch (err) {
    console.warn("[FCM] Token registration failed:", err);
  }
}
