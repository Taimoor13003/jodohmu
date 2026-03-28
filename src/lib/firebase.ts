import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

function getFirebaseConfig(): FirebaseOptions {
  // const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  const raw = '{"apiKey":"AIzaSyCyrZ6cY1R0sp-5a6Aoz9Mg5XTDBqXQQ5w","authDomain":"jodohmu-production.firebaseapp.com","projectId":"jodohmu-production","storageBucket":"jodohmu-production.appspot.com","messagingSenderId":"460634545907","appId":"1:460634545907:web:fac58c25cb1b352448e186","measurementId":"G-8XHZM9P9F3"}';
  if (!raw) {
    throw new Error("Missing FIREBASE_SERVICE_ACCOUNT_JSON env var.");
  }

  const normalized = raw.trim().replace(/^['"]|['"]$/g, "");

  let parsed: FirebaseOptions;
  try {
    parsed = JSON.parse(normalized) as FirebaseOptions;
  } catch {
    throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON is not valid JSON.");
  }

  if (!parsed.apiKey || !parsed.projectId || !parsed.appId) {
    throw new Error("Invalid Firebase config in FIREBASE_SERVICE_ACCOUNT_JSON for client app.");
  }

  return parsed;
}

const firebaseConfig = getFirebaseConfig();

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
 
export { app, auth, db };
