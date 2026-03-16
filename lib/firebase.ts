"use client";

import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? "",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? "",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? "",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? "",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? ""
};

const missingEnvVars = Object.entries(firebaseConfig)
  .filter(([, value]) => !value)
  .map(([key]) => key);

export const firebaseConfigError =
  missingEnvVars.length > 0
    ? `Missing Firebase environment variables: ${missingEnvVars.join(", ")}`
    : null;

let app: FirebaseApp | null = null;

if (!firebaseConfigError) {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
}

function requireFirebaseApp() {
  if (!app) {
    throw new Error(firebaseConfigError ?? "Firebase app is not configured.");
  }

  return app;
}

export function getFirebaseAuth() {
  return getAuth(requireFirebaseApp());
}

export function getFirebaseDb() {
  return getFirestore(requireFirebaseApp());
}

export function getFirebaseStorage() {
  return getStorage(requireFirebaseApp());
}
