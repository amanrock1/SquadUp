// ============================================================
// Firebase Client SDK — Lazy Initialization
// Safely initializes Firebase only on the client side
// ============================================================

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Lazy singleton — only initializes when first accessed on client
function getFirebaseApp() {
  if (!firebaseConfig.apiKey) {
    console.warn('Firebase API key is missing. Features requiring Firebase will not work.');
    return null;
  }
  if (getApps().length > 0) return getApp();
  return initializeApp(firebaseConfig);
}

// Use getters to avoid initializing during SSR/build
let _auth: Auth | null = null;
let _db: Firestore | null = null;

export function getFirebaseAuth(): Auth | null {
  const app = getFirebaseApp();
  if (!app) return null;
  if (!_auth) {
    try {
      _auth = getAuth(app);
    } catch (err) {
      console.error('Failed to initialize Firebase Auth:', err);
      return null;
    }
  }
  return _auth;
}

export function getFirebaseDb(): Firestore | null {
  const app = getFirebaseApp();
  if (!app) return null;
  if (!_db) {
    try {
      _db = getFirestore(app);
    } catch (err) {
      console.error('Failed to initialize Firebase Firestore:', err);
      return null;
    }
  }
  return _db;
}

// Convenience exports (these trigger lazy init)
export const auth = typeof window !== 'undefined' ? getFirebaseAuth() : null;
export const db = typeof window !== 'undefined' ? getFirebaseDb() : null;
export const googleProvider = new GoogleAuthProvider();

export default getFirebaseApp;
