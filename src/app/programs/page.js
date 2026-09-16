"use client";
import React, { useState } from "react";
import { PROGRAMS, WORKOUTS, CATS } from "@/data/db";
import { useFitness } from "@/context/FitnessContext";
import { useAuth } from "@/context/AuthContext";
import WorkoutModal from "@/components/WorkoutModal";
import CustomRoutineBuilderModal from "@/components/CustomRoutineBuilderModal";
import AuthGate from "@/components/AuthGate";

const PROGRAM_BANNERS = {
  p1: "/banners/foundation.jpg",
  p2: "/banners/strength.jpg",
  p3: "/banners/hybrid.jpg"
};

// Foundation 30 is Free for signed-in users, p2 & p3 require PRO
const FREE_PROGRAMS = ["p1"];

export default function Programs() {
  const { startWorkout, customRoutines = [], deleteCustomRoutine } = useFitness();
  const { isPro, openProModal } = useAuth();
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState(null);

  const handleProgramAction = (pId, pName, wId) => {
    const isLocked = !isPro && !FREE_PROGRAMS.includes(pId);
    if (isLocked) {
      openProModal(pName);
      return;
    }
    const w = WORKOUTS.find((item) => item.id === wId);
    setSelectedWorkout(w);
  };

  const handleDirectStart = (pId, pName, wId) => {
    const isLocked = !isPro && !FREE_PROGRAMS.includes(pId);
    if (isLocked) {
      openProModal(pName);
      return;
    }
    startWorkout(wId);
  };

  return (
    <AuthGate
      title="Workout Programs"
      subtitle="Sign in to follow structured multi-week training roadmaps, track daily routines, and launch guided workouts."
      icon="📋"
    >
      <div className="vw active" id="v-programs">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h1 className="pg">Programs</h1>
            <p className="sub">
              Pick a structured training roadmap, follow the week grid, and start each day with one tap.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <button
              className="btn gh"
              style={{
                borderColor: "var(--acc)",
                color: "var(--acc)",
                display: "flex",
                alignItems: "center",
                gap: "6px",
                padding: "10px 16px",
                fontSize: "13px"
              }}
              onClick={() => {
                setEditingRoutine(null);
                setBuilderOpen(true);
              }}
            >
              <span>🛠️</span>
              <span>+ Build Custom Routine</span>
            </button>

            {!isPro && (
              <button
                className="btn"
                style={{
                  background: "linear-gradient(135deg, #ff6b2c 0%, #ff944d 100%)",
                  boxShadow: "0 6px 20px rgba(255, 107, 44, 0.35)",
                  padding: "10px 18px",
                  fontSize: "13px"
                }}
                onClick={() => openProModal("All Advanced Workout Programs")}
              >
                👑 Unlock All Programs with PRO
              </button>
            )}
          </div>
        </div>

        <div className="grid g2">
          {PROGRAMS.map((p) => {
            const bannerImg = PROGRAM_BANNERS[p.id] || "/banners/foundation.jpg";
            const isLocked = !isPro && !FREE_PROGRAMS.includes(p.id);

            return (
              <div key={p.id} className="card" style={{ padding: 0, overflow: "hidden" }}>
                {/* Program Cinematic Banner */}
                <div style={{ position: "relative", height: "160px", width: "100%", overflow: "hidden", background: "#000" }}>
                  <img
                    src={bannerImg}
                    alt={p.n}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      opacity: isLocked ? 0.4 : 0.65,
                      filter: "contrast(115%)"
                    }}
                  />
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: "linear-gradient(180deg, rgba(18, 22, 27, 0.2) 0%, rgba(18, 22, 27, 0.95) 100%)",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                      padding: "16px"
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "6px" }}>
                      <div>
                        {p.cat === "calis" ? (
                          <span className="cali-acc">🤸 CALISTHENICS</span>
                        ) : (
                          <span className="pill">
                            <span className="d" style={{ background: CATS[p.cat]?.c }}></span>
                            {CATS[p.cat]?.n}
                          </span>
                        )}
                        <b style={{ display: "block", fontSize: "20px", marginTop: "2px" }}>
                          {p.n} {isLocked && <span style={{ fontSize: "12px", color: "var(--acc)" }}>🔒 (PRO)</span>}
                        </b>
                      </div>
                      <span className={`pill lv${p.lv}`}>{"●".repeat(p.lv)} L{p.lv}</span>
                    </div>
                  </div>
                </div>

                {/* Program Schedule & Content */}
                <div style={{ padding: "18px" }}>
                  <p className="mut sm">{p.focus} · {p.wks}</p>

                  <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))",
                    gap: "8px",
                    marginTop: "14px"
                  }}
                >
                    {p.days.map(([d, wId], idx) => {
                      const w = WORKOUTS.find((item) => item.id === wId);
                      return wId === "rest" ? (
                        <div key={idx} className="card" style={{ padding: "10px", borderStyle: "dashed" }}>
                          <b className="sm">{d}</b>
                          <div className="mut sm" style={{ fontSize: "11px" }}>Rest / recover</div>
                        </div>
                      ) : (
                        <div
                          key={idx}
                          className="card cl"
                          style={{ padding: "10px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleProgramAction(p.id, p.n, wId);
                          }}
                        >
                          <b className="sm">{d}</b>
                          <div className="sm" style={{ fontWeight: "600", fontSize: "12px", marginTop: "2px" }}>{w?.n}</div>
                          <button
                            className="btn sm"
                            style={{ marginTop: "8px", width: "100%", justifyContent: "center", padding: "5px" }}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDirectStart(p.id, p.n, wId);
                            }}
                          >
                            {isLocked ? "🔒 Unlock" : "Start →"}
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  <p className="mut sm" style={{ marginTop: "14px" }}>
                    💡 {p.tip}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Custom Athlete Routines Section */}
        <div style={{ marginTop: "40px", marginBottom: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "16px" }}>
            <div>
              <h2 style={{ fontSize: "22px", margin: 0, fontWeight: "900" }}>Custom Athlete Routines</h2>
              <span className="mut sm">Personalized splits configured by you · Run with guided video & haptics</span>
            </div>
            <button
              className="btn sm"
              style={{ background: "linear-gradient(135deg, #ff6b2c 0%, #ff944d 100%)", color: "#000", fontWeight: "900", fontSize: "12.5px" }}
              onClick={() => {
                setEditingRoutine(null);
                setBuilderOpen(true);
              }}
            >
              + Create Routine
            </button>
          </div>

          {customRoutines.length === 0 ? (
            <div
              className="card"
              style={{
                textAlign: "center",
                padding: "36px 20px",
                border: "2px dashed var(--ln)",
                background: "rgba(255, 255, 255, 0.02)"
              }}
            >
              <div style={{ fontSize: "38px", marginBottom: "10px" }}>🛠️</div>
              <h3 style={{ fontSize: "19px", margin: "0 0 6px" }}>Build Your Signature Workout</h3>
              <p className="mut sm" style={{ maxWidth: "440px", margin: "0 auto 18px", fontSize: "13px" }}>
                Combine any of the 42 exercises in the FORGE library, dial in your sets, reps, or hold seconds, and launch in the real-time guided player.
              </p>
              <button
                className="btn sm"
                style={{ background: "linear-gradient(135deg, #ff6b2c 0%, #ff944d 100%)", color: "#000", fontWeight: "900" }}
                onClick={() => {
                  setEditingRoutine(null);
                  setBuilderOpen(true);
                }}
              >
                ⚡ Build My First Routine
              </button>
            </div>
          ) : (
            <div className="grid g3">
              {customRoutines.map((routine) => (
                <div
                  key={routine.id}
                  className="card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    padding: "18px",
                    border: "1px solid var(--ln)",
                    background: "rgba(18, 22, 27, 0.9)"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <span className="pill" style={{ borderColor: "var(--acc)", color: "var(--acc)", fontSize: "10px" }}>
                        CUSTOM · {routine.ex?.length || 0} EXERCISES
                      </span>
                      <span className={`pill lv${routine.lv || 2}`}>L{routine.lv || 2}</span>
                    </div>
                    <b style={{ fontSize: "18px", display: "block", marginBottom: "4px" }}>{routine.n}</b>
                    <span className="mut sm" style={{ fontSize: "12px" }}>~{routine.mins} min duration</span>

                    {/* Preview of first 3 exercises */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", margin: "14px 0" }}>
                      {(routine.ex || []).slice(0, 3).map((e, idx) => (
                        <span key={idx} className="chip" style={{ fontSize: "11px", padding: "3px 8px" }}>
                          {e.x} ×{e.s}
                        </span>
                      ))}
                      {(routine.ex || []).length > 3 && (
                        <span className="chip" style={{ fontSize: "11px", padding: "3px 8px", background: "transparent", border: "1px dashed var(--ln)" }}>
                          +{routine.ex.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--ln)" }}>
                    <button
                      className="btn sm"
                      style={{ flex: 1, justifyContent: "center", background: "linear-gradient(135deg, #ff6b2c 0%, #ff944d 100%)", color: "#000", fontWeight: "900" }}
                      onClick={() => startWorkout(routine)}
                    >
                      ▶ Start Session
                    </button>
                    <button
                      className="btn gh sm"
                      style={{ padding: "6px 10px" }}
                      onClick={() => {
                        setEditingRoutine(routine);
                        setBuilderOpen(true);
                      }}
                      title="Edit Routine"
                    >
                      ✏️
                    </button>
                    <button
                      className="btn gh sm"
                      style={{ padding: "6px 10px", color: "#ff4d4d" }}
                      onClick={() => {
                        if (confirm(`Delete routine "${routine.n}"?`)) {
                          deleteCustomRoutine(routine.id);
                        }
                      }}
                      title="Delete Routine"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <WorkoutModal
          workout={selectedWorkout}
          onClose={() => setSelectedWorkout(null)}
        />

        <CustomRoutineBuilderModal
          isOpen={builderOpen}
          onClose={() => {
            setBuilderOpen(false);
            setEditingRoutine(null);
          }}
          initialRoutine={editingRoutine}
        />
      </div>
    </AuthGate>
  );
}
