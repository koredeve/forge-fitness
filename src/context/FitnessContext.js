"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { SKILLS, WORKOUTS, EXDB } from "@/data/db";

const FitnessContext = createContext({});

export const useFitness = () => useContext(FitnessContext);

export function FitnessProvider({ children }) {
  const { user } = useAuth();

  const [logs, setLogs] = useState([]);
  const [prs, setPrs] = useState({});
  const [skills, setSkills] = useState({});
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
      // Logged out / guest preview mode: reset all in-memory user data
      setLogs([]);
      setPrs({});
      setSkills({});
      setActiveSession(null);
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
      setLogs(localLogs);
      setPrs(localPrs);
      setSkills(localSkills);
    } catch (e) {}

    const fetchFirestoreData = async () => {
      try {
        const userRef = doc(db, "users", uid);
        const snap = await getDoc(userRef).catch(() => null);

        if (snap && snap.exists()) {
          const data = snap.data();
          const remoteLogs = data.logs || [];
          const remotePrs = data.prs || {};
          const remoteSkills = data.skills || {};

          setLogs(remoteLogs);
          setPrs(remotePrs);
          setSkills(remoteSkills);

          localStorage.setItem(`forge.log_${uid}`, JSON.stringify(remoteLogs));
          localStorage.setItem(`forge.pr_${uid}`, JSON.stringify(remotePrs));
          localStorage.setItem(`forge.skills_${uid}`, JSON.stringify(remoteSkills));
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

      const userRef = doc(db, "users", uid);
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
        const userRef = doc(db, "users", uid);
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

  const toggleSkill = async (skillId, levelIdx) => {
    const current = skills[skillId] || [];
    const copy = [...current];
    copy[levelIdx] = !copy[levelIdx];
    const updatedSkills = { ...skills, [skillId]: copy };
    setSkills(updatedSkills);
    await persistData(logs, prs, updatedSkills);
    showToast("Skill progress saved ✔");
  };

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

  const startWorkout = (workoutId) => {
    const w = WORKOUTS.find((item) => item.id === workoutId);
    if (!w) return;
    setActiveSession(w);
  };

  return (
    <FitnessContext.Provider
      value={{
        logs,
        prs,
        skills,
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
