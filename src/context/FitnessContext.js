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

  // 1. Initial load from local storage
  useEffect(() => {
    try {
      const localLogs = JSON.parse(localStorage.getItem("forge.log") || "[]");
      const localPrs = JSON.parse(localStorage.getItem("forge.pr") || "{}");
      const localSkills = JSON.parse(localStorage.getItem("forge.skills") || "{}");
      const localSound = JSON.parse(localStorage.getItem("forge.sound") || "true");

      setLogs(localLogs);
      setPrs(localPrs);
      setSkills(localSkills);
      setSound(localSound);
    } catch (e) {
      console.warn("Storage access notice:", e);
    }
  }, []);

  // 2. Fetch from Firestore safely with offline fallback
  useEffect(() => {
    if (!user) return;

    const fetchFirestoreData = async () => {
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef).catch(() => null);
        if (snap && snap.exists()) {
          const data = snap.data();
          if (data.logs) setLogs(data.logs);
          if (data.prs) setPrs(data.prs);
          if (data.skills) setSkills(data.skills);
        }
      } catch (e) {
        // Silently fallback to local storage
      }
    };

    fetchFirestoreData();
  }, [user]);

  // 3. Persist to local storage & Firestore
  const persistData = async (newLogs, newPrs, newSkills) => {
    try {
      localStorage.setItem("forge.log", JSON.stringify(newLogs));
      localStorage.setItem("forge.pr", JSON.stringify(newPrs));
      localStorage.setItem("forge.skills", JSON.stringify(newSkills));

      if (user) {
        const userRef = doc(db, "users", user.uid);
        await setDoc(
          userRef,
          {
            logs: newLogs,
            prs: newPrs,
            skills: newSkills,
            updatedAt: new Date().toISOString()
          },
          { merge: true }
        ).catch(() => {});
      }
    } catch (e) {
      // Storage fallback
    }
  };

  const addLog = async (entry) => {
    const updated = [entry, ...logs];
    setLogs(updated);
    await persistData(updated, prs, skills);
    showToast("Workout logged! 💪");
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
        startWorkout
      }}
    >
      {children}
      {toastMsg && <div className="toast show">{toastMsg}</div>}
    </FitnessContext.Provider>
  );
}
