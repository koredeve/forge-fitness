import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyC8Ca5-X-hxJr0Y-UB2iSumsM-UGKssMps",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "forge-fitness-a426e.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "forge-fitness-a426e",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "forge-fitness-a426e.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "483046976761",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:483046976761:web:2f77ddc48f7ae4a3fbc628",
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || "G-XQHGNWKDYG"
};

// Safe initialization
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
