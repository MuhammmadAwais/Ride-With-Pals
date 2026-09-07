import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import type { UserCredential } from "firebase/auth";
import { auth, googleProvider, appleProvider } from "@/lib/firebase";

export interface FirebaseAuthResult {
  user: UserCredential["user"];
  idToken: string;
}

/**
 * Maps Firebase error codes to clean, user-friendly messages.
 */
export const formatFirebaseError = (err: any): string => {
  const code = err?.code || "";
  switch (code) {
    case "auth/email-already-in-use":
      return "An account with this email address already exists.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password should be at least 6 characters.";
    case "auth/user-not-found":
      return "No account found with this email address.";
    case "auth/wrong-password":
      return "Incorrect password. Please try again.";
    case "auth/invalid-credential":
      return "Invalid email or password. Please verify your credentials.";
    case "auth/user-disabled":
      return "This account has been disabled. Please contact support.";
    case "auth/too-many-requests":
      return "Too many failed attempts. Please try again in a few minutes.";
    case "auth/popup-closed-by-user":
      return "Sign-in popup was closed before completing.";
    case "auth/popup-blocked":
      return "Sign-in popup was blocked by your browser. Please allow popups.";
    case "auth/operation-not-allowed":
      return "This sign-in method is not enabled in Firebase console.";
    case "auth/unauthorized-domain":
      return "This domain (e.g. Vercel) is not authorized in Firebase Console. Please add this domain under Firebase Console > Authentication > Settings > Authorized domains.";
    case "auth/network-request-failed":
      return "Network connection error. Please check your internet connection.";
    default:
      console.error("[FirebaseAuth] Unexpected error:", err);
      return err?.message || "An error occurred during authentication.";
  }
};

/**
 * Register a new user with Email and Password in Firebase.
 */
export const firebaseSignUp = async (
  email: string,
  pass: string
): Promise<FirebaseAuthResult> => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, pass);
  const idToken = await userCredential.user.getIdToken();
  return { user: userCredential.user, idToken };
};

/**
 * Sign in existing user with Email and Password in Firebase.
 */
export const firebaseSignIn = async (
  email: string,
  pass: string
): Promise<FirebaseAuthResult> => {
  const userCredential = await signInWithEmailAndPassword(auth, email, pass);
  const idToken = await userCredential.user.getIdToken();
  return { user: userCredential.user, idToken };
};

/**
 * Sign in or sign up with Google popup via Firebase.
 */
export const firebaseSignInWithGoogle = async (): Promise<FirebaseAuthResult> => {
  const userCredential = await signInWithPopup(auth, googleProvider);
  const idToken = await userCredential.user.getIdToken();
  return { user: userCredential.user, idToken };
};

/**
 * Sign in or sign up with Apple popup via Firebase.
 */
export const firebaseSignInWithApple = async (): Promise<FirebaseAuthResult> => {
  const userCredential = await signInWithPopup(auth, appleProvider);
  const idToken = await userCredential.user.getIdToken();
  return { user: userCredential.user, idToken };
};

/**
 * Sign out the current user from Firebase.
 */
export const firebaseSignOut = async (): Promise<void> => {
  await signOut(auth);
};
