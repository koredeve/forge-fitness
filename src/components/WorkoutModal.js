"use client";
import React, { useState } from "react";
import { CATS, EXDB } from "@/data/db";
import { useFitness } from "@/context/FitnessContext";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "./AuthModal";

export default function WorkoutModal({ workout, onClose }) {
  const { startWorkout } = useFitness();
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  if (!workout) return null;

  const handleStart = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    startWorkout(workout.id);
    onClose();
  };

  return (
    <>
      <div className="ov show" onClick={(e) => e.target === e.currentTarget && onClose()}>
        <div className="sheet">
          <button className="xbtn" onClick={onClose}>✕</button>

          <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "4px" }}>
            <span className="pill">
              <span className="d" style={{ background: CATS[workout.cat]?.c }}></span>
              {CATS[workout.cat]?.n}
            </span>
            <span className={`pill lv${workout.lv}`}>{"●".repeat(workout.lv)} L{workout.lv}</span>
          </div>

          <h3 style={{ fontSize: "24px" }}>{workout.n}</h3>
          <p className="mut sm" style={{ margin: "4px 0 16px" }}>
            {workout.tag} · ~{workout.mins} min duration
          </p>

          <ul className="rl">
            {workout.ex.map((e, i) => {
              const exObj = EXDB.find((item) => item.id === e.x) || { n: e.x };
              return (
                <li key={i}>
                  <b>{exObj.n}</b>
                  <span className="mut sm">
                    {e.s} sets × {e.sec != null ? `${e.sec}s` : `${e.r} reps`} · {e.rest}s rest
                  </span>
                </li>
              );
            })}
          </ul>

          <div style={{ marginTop: "20px", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button className="btn gh" onClick={onClose}>
              Cancel
            </button>
            <button className="btn" onClick={handleStart}>
              {user ? "▶ START GUIDED SESSION" : "🔐 Sign In to Start Session"}
            </button>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        subtitle="Sign in or create a free account to launch the guided workout player and track your streaks."
      />
    </>
  );
}
