import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// TODO: It's recommended to move this configuration to environment variables
const firebaseConfig = {
  apiKey: "AIzaSyCyrZ6cY1R0sp-5a6Aoz9Mg5XTDBqXQQ5w",
  authDomain: "jodohmu-production.firebaseapp.com",
  projectId: "jodohmu-production",
  storageBucket: "jodohmu-production.appspot.com",
  messagingSenderId: "460634545907",
  appId: "1:460634545907:web:fac58c25cb1b352448e186",
  measurementId: "G-8XHZM9P9F3"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);
 
export { app, auth, db };
