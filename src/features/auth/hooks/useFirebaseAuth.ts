import { useState } from "react";
import { useFirebaseLoginMutation, useLoginMutation } from "@/features/auth/api/authApiSlice";
import {
  firebaseSignUp,
  firebaseSignIn,
  firebaseSignInWithGoogle,
  firebaseSignInWithApple,
  formatFirebaseError,
} from "@/features/auth/services/firebaseAuthService";

export const useFirebaseAuth = () => {
  const [firebaseLoginMutation, { isLoading: isBackendVerifying }] = useFirebaseLoginMutation();
  const [legacyLoginMutation] = useLoginMutation();

  const [isFirebaseLoading, setIsFirebaseLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  /**
   * Register with Email & Password via Firebase Auth then exchange token with backend
   */
  const registerWithEmail = async (email: string, pass: string) => {
    setIsFirebaseLoading(true);
    try {
      const { idToken } = await firebaseSignUp(email, pass);
      const backendRes = await firebaseLoginMutation({ idToken }).unwrap();
      return backendRes;
    } catch (err: any) {
      const message = formatFirebaseError(err);
      throw new Error(message);
    } finally {
      setIsFirebaseLoading(false);
    }
  };

  /**
   * Log in with Email & Password via Firebase Auth, with seamless fallback for legacy backend users
   */
  const loginWithEmail = async (email: string, pass: string) => {
    setIsFirebaseLoading(true);
    try {
      let idToken: string | null = null;
      try {
        const res = await firebaseSignIn(email, pass);
        idToken = res.idToken;
      } catch (fbErr: any) {
        // If user was created in backend before Firebase integration, try legacy backend login
        if (
          fbErr?.code === "auth/user-not-found" ||
          fbErr?.code === "auth/invalid-credential"
        ) {
          try {
            const legacyRes = await legacyLoginMutation({ email, password: pass }).unwrap();
            return legacyRes;
          } catch (legacyErr: any) {
            const legacyMsg = legacyErr?.data?.message || formatFirebaseError(fbErr);
            throw new Error(legacyMsg);
          }
        }
        throw fbErr;
      }

      if (idToken) {
        const backendRes = await firebaseLoginMutation({ idToken }).unwrap();
        return backendRes;
      }
    } catch (err: any) {
      const message = err?.message || formatFirebaseError(err);
      throw new Error(message);
    } finally {
      setIsFirebaseLoading(false);
    }
  };

  /**
   * Sign in / sign up with Google popup
   */
  const loginWithGoogle = async () => {
    setIsGoogleLoading(true);
    try {
      const { idToken } = await firebaseSignInWithGoogle();
      const backendRes = await firebaseLoginMutation({ idToken }).unwrap();
      return backendRes;
    } catch (err: any) {
      if (err?.code === "auth/popup-closed-by-user") {
        return null;
      }
      console.error("[useFirebaseAuth] Google login error:", err);
      const message = formatFirebaseError(err);
      throw new Error(message);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  /**
   * Sign in / sign up with Apple popup
   */
  const loginWithApple = async () => {
    setIsAppleLoading(true);
    try {
      const { idToken } = await firebaseSignInWithApple();
      const backendRes = await firebaseLoginMutation({ idToken }).unwrap();
      return backendRes;
    } catch (err: any) {
      if (err?.code === "auth/popup-closed-by-user") {
        return null;
      }
      console.error("[useFirebaseAuth] Apple login error:", err);
      const message = formatFirebaseError(err);
      throw new Error(message);
    } finally {
      setIsAppleLoading(false);
    }
  };

  return {
    registerWithEmail,
    loginWithEmail,
    loginWithGoogle,
    loginWithApple,
    isLoading: isFirebaseLoading || isBackendVerifying,
    isGoogleLoading,
    isAppleLoading,
  };
};
