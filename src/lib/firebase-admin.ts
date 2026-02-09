import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let adminApp: App | null = null;

function getServiceAccount() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_JSON env");
  }
  return JSON.parse(raw);
}

export function getAdminApp() {
  if (adminApp) return adminApp;
  const serviceAccount = getServiceAccount();
  adminApp = getApps().length ? getApps()[0] : initializeApp({ credential: cert(serviceAccount) });
  return adminApp;
}

export const adminAuth = () => getAuth(getAdminApp());
export const adminDb = () => getFirestore(getAdminApp());
