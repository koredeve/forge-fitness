"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { SKILLS, WORKOUTS, EXDB } from "@/data/db";

const USERS_COLLECTION = "him_users";

const FitnessContext = createContext({});

export const useFitness = () => useContext(FitnessContext);

export function FitnessProvider({ children }) {
  const { user } = useAuth();

  const [logs, setLogs] = useState([]);
  const [prs, setPrs] = useState({});
  const [skills, setSkills] = useState({});
  const [customRoutines, setCustomRoutines] = useState([]);
  const [sound, setSound] = useState(true);
  const [activeSession, setActiveSession] = useState(null);
  const [toastMsg, setToastMsg] = useState("");

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  const playBeep = (freq = 880, dur = 0.25) => {
    if (!sound) return;
    try {
      if (typeof window !== "undefined") {
        window.AC = window.AC || new (window.AudioContext || window.webkitAudioContext)();
        const o = window.AC.createOscillator();
        const g = window.AC.createGain();
        o.frequency.value = freq;
        o.type = "sine";
        g.gain.value = 0.15;
        o.connect(g);
        g.connect(window.AC.destination);
        const t = window.AC.currentTime;
        o.start(t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.stop(t + dur);
      }
    } catch (e) {
      // Audio autoplay restriction suppression
    }
  };

  // 1. Initial load sound preference from local storage
  useEffect(() => {
    try {
      const localSound = JSON.parse(localStorage.getItem("forge.sound") || "true");
      setSound(localSound);
    } catch (e) {
      console.warn("Storage access notice:", e);
    }
  }, []);

  // 2. Fetch from Firestore and user-scoped storage safely
  useEffect(() => {
    if (!user) {
      // Logged out / guest preview mode: reset logs, prs, skills, but allow local guest routines
      setLogs([]);
      setPrs({});
      setSkills({});
      setActiveSession(null);
      try {
        const guestRoutines = JSON.parse(localStorage.getItem("forge.custom_routines_guest") || "[]");
        setCustomRoutines(guestRoutines);
      } catch (e) {}
      // Clean legacy un-scoped test logs from localStorage to prevent guest preview leakage
      try {
        localStorage.removeItem("forge.log");
        localStorage.removeItem("forge.pr");
        localStorage.removeItem("forge.skills");
      } catch (e) {}
      return;
    }

    const uid = user.uid;
    // Load local cache for this specific user
    try {
      const localLogs = JSON.parse(localStorage.getItem(`forge.log_${uid}`) || "[]");
      const localPrs = JSON.parse(localStorage.getItem(`forge.pr_${uid}`) || "{}");
      const localSkills = JSON.parse(localStorage.getItem(`forge.skills_${uid}`) || "{}");
      const localRoutines = JSON.parse(localStorage.getItem(`forge.custom_routines_${uid}`) || "[]");
      setLogs(localLogs);
      setPrs(localPrs);
      setSkills(localSkills);
      setCustomRoutines(localRoutines);
    } catch (e) {}

    const fetchFirestoreData = async () => {
      try {
        const userRef = doc(db, USERS_COLLECTION, uid);
        const snap = await getDoc(userRef).catch(() => null);

        if (snap && snap.exists()) {
          const data = snap.data();
          const remoteLogs = data.logs || [];
          const remotePrs = data.prs || {};
          const remoteSkills = data.skills || {};
          const remoteRoutines = data.customRoutines || [];

          setLogs(remoteLogs);
          setPrs(remotePrs);
          setSkills(remoteSkills);
          if (remoteRoutines.length > 0) {
            setCustomRoutines(remoteRoutines);
          }

          localStorage.setItem(`forge.log_${uid}`, JSON.stringify(remoteLogs));
          localStorage.setItem(`forge.pr_${uid}`, JSON.stringify(remotePrs));
          localStorage.setItem(`forge.skills_${uid}`, JSON.stringify(remoteSkills));
          if (remoteRoutines.length > 0) {
            localStorage.setItem(`forge.custom_routines_${uid}`, JSON.stringify(remoteRoutines));
          }
        }
      } catch (e) {
        // Fall back gracefully to local storage
      }
    };

    fetchFirestoreData();
  }, [user]);

  // 3. Persist to user-scoped local storage & Firestore
  const persistData = async (newLogs, newPrs, newSkills) => {
    if (!user) return;
    const uid = user.uid;
    try {
      localStorage.setItem(`forge.log_${uid}`, JSON.stringify(newLogs));
      localStorage.setItem(`forge.pr_${uid}`, JSON.stringify(newPrs));
      localStorage.setItem(`forge.skills_${uid}`, JSON.stringify(newSkills));

      const userRef = doc(db, USERS_COLLECTION, uid);
      await setDoc(
        userRef,
        {
          logs: newLogs,
          prs: newPrs,
          skills: newSkills,
          updatedAt: new Date().toISOString()
        },
        { merge: true }
      ).catch((err) => {
        console.warn("Cloud sync deferred:", err);
      });
    } catch (e) {
      // Storage fallback
    }
  };

  const clearAllLogs = async () => {
    setLogs([]);
    setPrs({});
    setSkills({});
    if (user) {
      const uid = user.uid;
      try {
        localStorage.removeItem(`forge.log_${uid}`);
        localStorage.removeItem(`forge.pr_${uid}`);
        localStorage.removeItem(`forge.skills_${uid}`);
        const userRef = doc(db, USERS_COLLECTION, uid);
        await setDoc(
          userRef,
          { logs: [], prs: {}, skills: {}, updatedAt: new Date().toISOString() },
          { merge: true }
        ).catch(() => {});
      } catch (e) {}
    }
    showToast("Training logs & history reset ✔");
  };

  const addLog = async (entry) => {
    if (!user) return;
    const logItem = {
      id: entry.id || `${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      d: entry.d || new Date().toISOString().slice(0, 10),
      n: entry.n || "Training Session",
      cat: entry.cat || "calis",
      min: entry.min || 1,
      exercises: entry.exercises || [],
      createdAt: new Date().toISOString()
    };

    setLogs((prevLogs) => {
      const updated = [logItem, ...prevLogs];
      persistData(updated, prs, skills);
      return updated;
    });
    showToast("Workout saved & synced! 💪");
  };

  const deleteLog = async (index) => {
    const updated = logs.filter((_, i) => i !== index);
    setLogs(updated);
    await persistData(updated, prs, skills);
    showToast("Session deleted.");
  };

  const addPR = async (testId, val) => {
    const today = new Date().toISOString().slice(0, 10);
    const existing = prs[testId] || [];
    const updatedPRs = {
      ...prs,
      [testId]: [...existing, { d: today, v: val }].sort((a, b) => (a.d < b.d ? -1 : 1))
    };
    setPrs(updatedPRs);
    await persistData(logs, updatedPRs, skills);
    showToast("PR saved 🎯");
  };

  // Strictly Progressive Calisthenics Logic (Lv1 -> Lv2 -> Lv3...)
  const setProgressiveSkill = async (skillId, levelIdx) => {
    const sObj = SKILLS.find((item) => item.id === skillId);
    const total = sObj?.lv?.length || 8;
    const current = skills[skillId] || [];

    let nextArr;
    // If user clicks a level that is already mastered:
    // Tapping it toggles this level and higher off, stepping back to this level index.
    if (current[levelIdx]) {
      nextArr = Array.from({ length: total }, (_, i) => i < levelIdx);
      showToast(levelIdx === 0 ? `Reset ${sObj?.n || "skill"} progression` : `Progression set to Level ${levelIdx} ✔`);
    } else {
      // User tapped an unmastered level: mark all prerequisites up to this level as mastered
      nextArr = Array.from({ length: total }, (_, i) => i <= levelIdx);
      showToast(`🎯 Level ${levelIdx + 1} Mastered! 🚀`);
    }

    const updatedSkills = { ...skills, [skillId]: nextArr };
    setSkills(updatedSkills);
    await persistData(logs, prs, updatedSkills);
    return nextArr;
  };

  const advanceSkill = async (skillId) => {
    const sObj = SKILLS.find((item) => item.id === skillId);
    if (!sObj) return;
    const total = sObj.lv.length;
    const current = skills[skillId] || [];
    const currentMastered = current.filter(Boolean).length;
    if (currentMastered >= total) {
      showToast(`🏆 ${sObj.n} already 100% mastered!`);
      return currentMastered;
    }
    const nextArr = Array.from({ length: total }, (_, i) => i <= currentMastered);
    const updatedSkills = { ...skills, [skillId]: nextArr };
    setSkills(updatedSkills);
    await persistData(logs, prs, updatedSkills);
    showToast(`⭐ ${sObj.n} advanced to Level ${currentMastered + 1}! 🚀`);
    return currentMastered + 1;
  };

  const toggleSkill = (skillId, levelIdx) => setProgressiveSkill(skillId, levelIdx);

  const getStreak = () => {
    const dates = new Set(logs.map((s) => s.d));
    let n = 0;
    let d = new Date();
    const todayStr = d.toISOString().slice(0, 10);
    if (!dates.has(todayStr)) d.setDate(d.getDate() - 1);
    while (dates.has(d.toISOString().slice(0, 10))) {
      n++;
      d.setDate(d.getDate() - 1);
    }
    return n;
  };

  const getSkillsPct = () => {
    let done = 0;
    let total = 0;
    SKILLS.forEach((s) => {
      total += s.lv.length;
      (skills[s.id] || []).forEach((v) => {
        if (v) done++;
      });
    });
    return total ? Math.round((done / total) * 100) : 0;
  };

  const saveCustomRoutine = async (routine) => {
    const routineItem = {
      id: routine.id || `custom_${Date.now()}`,
      n: routine.n || "My Custom Routine",
      cat: routine.cat || "calis",
      lv: routine.lv || 2,
      mins: routine.mins || Math.max(10, (routine.ex || []).length * 6),
      tag: routine.tag || `Custom · ${(routine.ex || []).length} Exercises`,
      isCustom: true,
      ex: routine.ex || [],
      createdAt: routine.createdAt || new Date().toISOString()
    };

    const updated = [routineItem, ...customRoutines.filter((r) => r.id !== routineItem.id)];
    setCustomRoutines(updated);

    if (user) {
      const uid = user.uid;
      try {
        localStorage.setItem(`forge.custom_routines_${uid}`, JSON.stringify(updated));
        const userRef = doc(db, USERS_COLLECTION, uid);
        await setDoc(userRef, { customRoutines: updated }, { merge: true }).catch(() => {});
      } catch (e) {}
    } else {
      try {
        localStorage.setItem("forge.custom_routines_guest", JSON.stringify(updated));
      } catch (e) {}
    }

    showToast(`Routine "${routineItem.n}" saved! ⚡`);
    return routineItem;
  };

  const deleteCustomRoutine = async (routineId) => {
    const updated = customRoutines.filter((r) => r.id !== routineId);
    setCustomRoutines(updated);

    if (user) {
      const uid = user.uid;
      try {
        localStorage.setItem(`forge.custom_routines_${uid}`, JSON.stringify(updated));
        const userRef = doc(db, USERS_COLLECTION, uid);
        await setDoc(userRef, { customRoutines: updated }, { merge: true }).catch(() => {});
      } catch (e) {}
    } else {
      try {
        localStorage.setItem("forge.custom_routines_guest", JSON.stringify(updated));
      } catch (e) {}
    }

    showToast("Custom routine deleted.");
  };

  const startWorkout = (workoutOrId) => {
    let w = null;
    if (typeof workoutOrId === "object" && workoutOrId !== null) {
      w = workoutOrId;
    } else {
      w = WORKOUTS.find((item) => item.id === workoutOrId) ||
          customRoutines.find((item) => item.id === workoutOrId);
    }
    if (!w) return;
    setActiveSession(w);
  };

  return (
    <FitnessContext.Provider
      value={{
        logs,
        prs,
        skills,
        customRoutines,
        saveCustomRoutine,
        deleteCustomRoutine,
        sound,
        setSound: (val) => {
          setSound(val);
          localStorage.setItem("forge.sound", JSON.stringify(val));
        },
        toastMsg,
        showToast,
        playBeep,
        addLog,
        deleteLog,
        addPR,
        toggleSkill,
        setProgressiveSkill,
        advanceSkill,
        getStreak,
        getSkillsPct,
        activeSession,
        setActiveSession,
        startWorkout,
        clearAllLogs
      }}
    >
      {children}
      {toastMsg && <div className="toast show">{toastMsg}</div>}
    </FitnessContext.Provider>
  );
}
