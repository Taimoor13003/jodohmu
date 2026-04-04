import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

function getFirebaseConfig(): FirebaseOptions {
  const firebaseConfigFromEnv = process.env.NEXT_PUBLIC_FIREBASE_CONFIG
    ? JSON.parse(process.env.NEXT_PUBLIC_FIREBASE_CONFIG)
    : null;

  const firebaseConfig = firebaseConfigFromEnv ?? {
    apiKey: "AIzaSyCyrZ6cY1R0sp-5a6Aoz9Mg5XTDBqXQQ5w",
    authDomain: "jodohmu-production.firebaseapp.com",
    projectId: "jodohmu-production",
    storageBucket: "jodohmu-production.appspot.com",
    messagingSenderId: "460634545907",
    appId: "1:460634545907:web:fac58c25cb1b352448e186",
    measurementId: "G-8XHZM9P9F3",
  };

  if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.appId) {
    throw new Error("Invalid Firebase config for client app.");
  }

  return firebaseConfig;
}

const firebaseConfig = getFirebaseConfig();

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
 
export { app, auth, db };
