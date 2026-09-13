"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const VIP_PRO_EMAILS = [
  "kelightsub@gmail.com"
];

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  // Global Modals State
  const [authModalState, setAuthModalState] = useState({ isOpen: false, subtitle: "", defaultMode: "signin" });
  const [proModalState, setProModalState] = useState({ isOpen: false, featureName: "" });

  const handleUserSession = async (currentUser) => {
    if (!currentUser) {
      setUser(null);
      setIsPro(false);
      setLoading(false);
      return;
    }

    setUser(currentUser);
    const emailLower = (currentUser.email || "").toLowerCase();
    const isVip = VIP_PRO_EMAILS.includes(emailLower);

    if (isVip) {
      setIsPro(true);
    }

    try {
      const userRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(userRef).catch(() => null);
      if (docSnap && docSnap.exists()) {
        const data = docSnap.data();
        setIsPro(isVip || data.plan === "pro");
        if (isVip && data.plan !== "pro") {
          await setDoc(userRef, { plan: "pro" }, { merge: true }).catch(() => {});
        }
      } else {
        await setDoc(userRef, {
          email: currentUser.email,
          createdAt: new Date().toISOString(),
          plan: isVip ? "pro" : "free"
        }, { merge: true }).catch(() => {});
      }
    } catch (e) {
      if (isVip) setIsPro(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Process redirect sign-in results from mobile Google login
    getRedirectResult(auth)
      .then((result) => {
        if (!isMounted) return;
        if (result?.user) {
          console.log("Mobile Google redirect sign-in successful:", result.user.email);
          handleUserSession(result.user);
        }
      })
      .catch((err) => {
        console.error("Redirect sign-in error:", err);
      });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!isMounted) return;
      handleUserSession(currentUser);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });

    const isMobile = typeof window !== "undefined" && (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth <= 768
    );

    // On mobile browsers, popups get blocked or closed during tab switches; use redirect
    if (isMobile) {
      return signInWithRedirect(auth, provider);
    }

    // On desktop, try popup first; if blocked or closed, fallback to redirect
    try {
      return await signInWithPopup(auth, provider);
    } catch (popupError) {
      if (
        popupError.code === "auth/popup-blocked" ||
        popupError.code === "auth/popup-closed-by-user" ||
        popupError.code === "auth/cancelled-popup-request"
      ) {
        return signInWithRedirect(auth, provider);
      }
      throw popupError;
    }
  };

  const logout = () => {
    setIsPro(false);
    return signOut(auth);
  };

  const setProPlan = async (status = true) => {
    setIsPro(status);
    if (user) {
      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, { plan: status ? "pro" : "free" }, { merge: true }).catch(() => {});
    }
  };

  const openAuthModal = (subtitle = "", defaultMode = "signin") => {
    setAuthModalState({ isOpen: true, subtitle, defaultMode });
  };

  const closeAuthModal = () => {
    setAuthModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const openProModal = (featureName = "") => {
    setProModalState({ isOpen: true, featureName });
  };

  const closeProModal = () => {
    setProModalState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isPro,
        setProPlan,
        login,
        signup,
        loginWithGoogle,
        logout,
        authModalState,
        openAuthModal,
        closeAuthModal,
        proModalState,
        openProModal,
        closeProModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
