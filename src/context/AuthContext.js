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
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from "firebase/firestore";

const ADMIN_EMAILS = [
  "kelightsub@gmail.com",
  "kelight9@gmail.com"
];

const VIP_PRO_EMAILS = [
  "kelightsub@gmail.com",
  "kelight9@gmail.com"
];

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPro, setIsPro] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [proPassInfo, setProPassInfo] = useState(null);
  const [trialClaimed, setTrialClaimed] = useState(false);

  // Global Modals State
  const [authModalState, setAuthModalState] = useState({ isOpen: false, subtitle: "", defaultMode: "signin" });
  const [proModalState, setProModalState] = useState({ isOpen: false, featureName: "" });

  const handleUserSession = async (currentUser) => {
    if (!currentUser) {
      setUser(null);
      setIsPro(false);
      setIsAdmin(false);
      setProPassInfo(null);
      setTrialClaimed(false);
      setLoading(false);
      return;
    }

    setUser(currentUser);
    setLoading(false);

    const emailLower = (currentUser.email || "").toLowerCase().trim();
    const isVip = VIP_PRO_EMAILS.includes(emailLower);
    const userIsAdmin = ADMIN_EMAILS.includes(emailLower);

    setIsAdmin(userIsAdmin);

    if (isVip || userIsAdmin) {
      setIsPro(true);
    }

    try {
      // 1. Check if user has an active time-limited or permanent pass in pro_passes
      let passValid = false;
      const passId = emailLower.replace(/[^a-z0-9_.-]/g, "_");
      const passRef = doc(db, "pro_passes", passId);
      const passSnap = await getDoc(passRef).catch(() => null);

      if (passSnap && passSnap.exists()) {
        const pData = passSnap.data();
        if (pData.active !== false) {
          if (!pData.expiresAt) {
            // Permanent pass
            passValid = true;
            setProPassInfo({ ...pData, valid: true, permanent: true });
          } else {
            const expTime = new Date(pData.expiresAt).getTime();
            if (expTime > Date.now()) {
              passValid = true;
              setProPassInfo({ ...pData, valid: true, remainingMs: expTime - Date.now() });
            } else {
              setProPassInfo({ ...pData, valid: false, expired: true });
            }
          }
        } else {
          setProPassInfo({ ...pData, valid: false, revoked: true });
        }
      }

      // 2. Check user's own document
      const userRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(userRef).catch(() => null);
      if (docSnap && docSnap.exists()) {
        const data = docSnap.data();
        if (data.trialClaimed) {
          setTrialClaimed(true);
        }
        const hasPro = isVip || userIsAdmin || passValid || data.plan === "pro";
        setIsPro(hasPro);
        if ((isVip || userIsAdmin || passValid) && data.plan !== "pro") {
          await setDoc(userRef, { plan: "pro" }, { merge: true }).catch(() => {});
        }
      } else {
        // BRAND NEW ATHLETE SIGNUP: Automatically grant full 7-Day PRO Free Trial!
        const trialExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
        const trialPass = {
          id: passId,
          email: emailLower,
          duration: "7days",
          durationLabel: "7-Day Free Trial",
          expiresAt: trialExpires,
          grantedAt: new Date().toISOString(),
          grantedBy: "system_new_signup",
          note: "Automatic 7-Day Free Trial for New Athlete",
          active: true
        };

        await setDoc(passRef, trialPass).catch(() => {});
        await setDoc(userRef, {
          email: currentUser.email,
          createdAt: new Date().toISOString(),
          plan: "pro",
          trialClaimed: true,
          trialClaimedAt: new Date().toISOString()
        }, { merge: true }).catch(() => {});

        setTrialClaimed(true);
        setIsPro(true);
        setProPassInfo({ ...trialPass, valid: true, remainingMs: 7 * 24 * 60 * 60 * 1000 });
      }
    } catch (e) {
      if (isVip || userIsAdmin) setIsPro(true);
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
    setTrialClaimed(false);
    setProPassInfo(null);
    return signOut(auth);
  };

  // Self-service 7-Day Free Trial for new athletes
  const claimFreeTrial = async () => {
    if (!user) {
      openAuthModal("Sign up to activate your 7-day free trial!", "signup");
      return;
    }
    if (trialClaimed) {
      throw new Error("You have already claimed your 7-Day Free Trial.");
    }
    const cleanEmail = (user.email || "").toLowerCase().trim();
    if (!cleanEmail) {
      throw new Error("No email associated with this account.");
    }

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const durationLabel = "7-Day Free Trial";
    const passId = cleanEmail.replace(/[^a-z0-9_.-]/g, "_");
    const passRef = doc(db, "pro_passes", passId);

    const passDoc = {
      id: passId,
      email: cleanEmail,
      duration: "7days",
      durationLabel,
      expiresAt,
      grantedAt: new Date().toISOString(),
      grantedBy: "system_trial",
      note: "Automatic 7-Day Free Trial",
      active: true
    };

    await setDoc(passRef, passDoc);
    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
      plan: "pro",
      trialClaimed: true,
      trialClaimedAt: new Date().toISOString()
    }, { merge: true });

    setTrialClaimed(true);
    setIsPro(true);
    setProPassInfo({ ...passDoc, valid: true, remainingMs: 7 * 24 * 60 * 60 * 1000 });
    return passDoc;
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

  // Grant a time-limited or permanent PRO pass by email (Admin only)
  const grantProPass = async (recipientEmail, duration = "1week", note = "") => {
    if (!isAdmin && !VIP_PRO_EMAILS.includes((user?.email || "").toLowerCase())) {
      throw new Error("Unauthorized: Only creator/admin can grant PRO passes.");
    }
    const cleanEmail = recipientEmail.toLowerCase().trim();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      throw new Error("Please enter a valid email address.");
    }

    let expiresAt = null;
    let durationLabel = "Permanent VIP";

    if (duration === "1day") {
      expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      durationLabel = "1 Day (24 Hours)";
    } else if (duration === "1week") {
      expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      durationLabel = "1 Week (7 Days)";
    } else if (duration === "1month") {
      expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      durationLabel = "1 Month (30 Days)";
    }

    const passId = cleanEmail.replace(/[^a-z0-9_.-]/g, "_");
    const passRef = doc(db, "pro_passes", passId);

    const passDoc = {
      id: passId,
      email: cleanEmail,
      duration,
      durationLabel,
      expiresAt,
      grantedAt: new Date().toISOString(),
      grantedBy: user?.email || "Admin",
      note: note.trim(),
      active: true
    };

    await setDoc(passRef, passDoc);
    return passDoc;
  };

  // Revoke an active PRO pass (Admin only)
  const revokeProPass = async (passId) => {
    if (!isAdmin && !VIP_PRO_EMAILS.includes((user?.email || "").toLowerCase())) {
      throw new Error("Unauthorized: Only creator/admin can revoke PRO passes.");
    }
    const passRef = doc(db, "pro_passes", passId);
    await updateDoc(passRef, { active: false, revokedAt: new Date().toISOString() });
  };

  // Fetch all granted passes for the Admin Dashboard
  const fetchProPasses = async () => {
    if (!isAdmin && !VIP_PRO_EMAILS.includes((user?.email || "").toLowerCase())) {
      return [];
    }
    try {
      const passesCol = collection(db, "pro_passes");
      const snap = await getDocs(passesCol);
      const list = [];
      snap.forEach((d) => {
        list.push({ id: d.id, ...d.data() });
      });
      return list.sort((a, b) => new Date(b.grantedAt || 0) - new Date(a.grantedAt || 0));
    } catch (e) {
      console.warn("fetchProPasses error:", e);
      return [];
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isPro,
        isAdmin,
        proPassInfo,
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
        closeProModal,
        grantProPass,
        revokeProPass,
        fetchProPasses,
        trialClaimed,
        claimFreeTrial
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
