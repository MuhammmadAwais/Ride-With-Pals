import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, OAuthProvider } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const projectId = import.meta.env.VITE_FIREBASE_PROJECT_ID || "ridewithpals-bca83";
const rawAuthDomain = import.meta.env.VITE_FIREBASE_AUTH_DOMAIN;
const authDomain =
  rawAuthDomain && !rawAuthDomain.startsWith("://")
    ? rawAuthDomain
    : `${projectId}.firebaseapp.com`;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCOLtkHPmqO5dGPjL8J_N7PelUHZ_Mj-mw",
  authDomain: authDomain || "ridewithpals-bca83.firebaseapp.com",
  projectId: projectId || "ridewithpals-bca83",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "ridewithpals-bca83.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "587013565364",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:587013565364:web:66018528eff00d612e60e1",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DT9DEKXW18",
};

// Initialize Firebase App (singleton)
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firebase Auth
export const auth = getAuth(app);

// Initialize Providers
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export const appleProvider = new OAuthProvider("apple.com");

// Initialize Analytics (safely guarded for SSR/browser compatibility)
export let analytics: any = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
      }
    })
    .catch((err) => {
      console.warn("Firebase Analytics could not be initialized:", err);
    });
}
