"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);

  // Global Modals State
  const [authModalState, setAuthModalState] = useState({ isOpen: false, subtitle: "", defaultMode: "signin" });
  const [proModalState, setProModalState] = useState({ isOpen: false, featureName: "" });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(userRef).catch(() => null);
          if (docSnap && docSnap.exists()) {
            const data = docSnap.data();
            setIsPro(data.plan === "pro");
          } else {
            await setDoc(userRef, {
              email: currentUser.email,
              createdAt: new Date().toISOString(),
              plan: "free"
            }, { merge: true }).catch(() => {});
          }
        } catch (e) {
          // Graceful offline fallback
        }
      } else {
        setIsPro(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signup = (email, password) => {
    return createUserWithEmailAndPassword(auth, email, password);
  };

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
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
