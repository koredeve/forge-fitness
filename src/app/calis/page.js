"use client";
import React, { useState } from "react";
import { SKILLS, WORKOUTS, EXDB } from "@/data/db";
import { useFitness } from "@/context/FitnessContext";
import SkillTreeVisual from "@/components/SkillTreeVisual";
import WorkoutModal from "@/components/WorkoutModal";
import ExerciseModal from "@/components/ExerciseModal";

export default function Calis() {
  const { skills, toggleSkill, getSkillsPct, startWorkout } = useFitness();
  const [openSkills, setOpenSkills] = useState({
    pullup: true,
    muscleup: true
  });
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [selectedEx, setSelectedEx] = useState(null);

  const toggleOpen = (id) => {
    setOpenSkills((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const masteryPct = getSkillsPct();

  // Find exercise for preview
  const openFormPreview = (levelTitle, skillId) => {
    // Match against EXDB
    const match = EXDB.find(
      (e) =>
        e.id === skillId ||
        levelTitle.toLowerCase().includes(e.n.toLowerCase()) ||
        e.n.toLowerCase().includes(levelTitle.split("·")[0].trim().toLowerCase())
    ) || EXDB.find((e) => e.cat === "calis");
    setSelectedEx(match);
  };

  return (
    <div className="vw active" id="v-calis">
      <h1 className="pg">
        Calisthenics <em>Hub</em>
      </h1>
      <p className="sub">
        Your body is the barbell. Climb these ladders — check off levels as you earn them. Skill work first while fresh, strength after.
      </p>

      <div className="stats">
        <div className="stat">
          <b>{masteryPct}%</b>
          <span>Overall mastery</span>
        </div>
      </div>

      <div className="sect">
        <h2>Visual Skill Trees</h2>
        <span className="mut">7 mastery progressions</span>
      </div>

      <div className="grid g2" id="skGrid">
        {SKILLS.map((s) => {
          const userLevels = skills[s.id] || [];
          const doneCount = s.lv.filter((_, i) => userLevels[i]).length;
          const pct = Math.round((doneCount / s.lv.length) * 100);
          const isOpen = !!openSkills[s.id];

          return (
            <div
              key={s.id}
              className={`card skill ${isOpen ? "open" : ""}`}
              id={`sk-${s.id}`}
              style={{ transition: "0.2s border-color" }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  cursor: "pointer",
                  gap: "12px"
                }}
                onClick={() => toggleOpen(s.id)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <SkillTreeVisual skillId={s.id} />
                  <div>
                    <h4 style={{ margin: 0, fontSize: "16px" }}>
                      <span>
                        {s.icon} {s.n}
                      </span>
                    </h4>
                    <span className="mut sm" style={{ fontSize: "12px" }}>
                      {doneCount} of {s.lv.length} levels unlocked
                    </span>
                  </div>
                </div>
                <span className="pct" style={{ fontSize: "18px", fontWeight: "900" }}>
                  {pct}%
                </span>
              </div>

              <div className="pb" style={{ marginTop: "12px" }}>
                <i style={{ width: `${pct}%` }}></i>
              </div>

              <div className="lvls" style={{ display: isOpen ? "block" : "none", marginTop: "14px" }}>
                {s.lv.map((l, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 0",
                      borderBottom: "1px dashed var(--ln)"
                    }}
                  >
                    <label style={{ display: "flex", gap: "10px", alignItems: "center", cursor: "pointer", flex: 1 }}>
                      <input
                        type="checkbox"
                        checked={!!userLevels[i]}
                        onChange={() => toggleSkill(s.id, i)}
                      />
                      <span>
                        <b style={{ color: userLevels[i] ? "var(--ok)" : "var(--tx)" }}>
                          Lv{i + 1} · {l[0]}
                        </b>
                        <span className="crit" style={{ display: "block" }}>{l[1]}</span>
                      </span>
                    </label>

                    <button
                      className="btn gh sm"
                      style={{ padding: "4px 8px", fontSize: "11px", whiteSpace: "nowrap" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        openFormPreview(l[0], s.id);
                      }}
                    >
                      Motion Guide 🎬
                    </button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="sect">
        <h2>Calisthenics Workouts</h2>
        <span className="mut">Click to preview or launch</span>
      </div>

      <div className="grid g3">
        {WORKOUTS.filter((w) => w.cat === "calis").map((w) => (
          <div
            key={w.id}
            className="card cl"
            style={{ borderColor: "#3a2a1d" }}
            onClick={() => setSelectedWorkout(w)}
          >
            <div className="cali-acc">🤸 CALISTHENICS</div>
            <b style={{ display: "block", fontSize: "17px", marginTop: "6px" }}>{w.n}</b>
            <div className="mut sm">
              {w.tag} · ~{w.mins} min
            </div>
            <div
              style={{
                marginTop: "12px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center"
              }}
            >
              <span className={`pill lv${w.lv}`}>{"●".repeat(w.lv)} L{w.lv}</span>
              <button
                className="btn sm"
                onClick={(e) => {
                  e.stopPropagation();
                  startWorkout(w.id);
                }}
              >
                Start →
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="sect">
        <h2>The Laws of Progress</h2>
      </div>
      <div className="grid g3">
        <div className="card">
          <b>1 · Full Range or Fake Range</b>
          <p className="mut sm" style={{ marginTop: "6px" }}>
            A deep controlled rep beats three ego bounces.
          </p>
        </div>
        <div className="card">
          <b>2 · Grease the Groove</b>
          <p className="mut sm" style={{ marginTop: "6px" }}>
            Frequent submaximal sets (50–60% max) through the day build skills freakishly fast.
          </p>
        </div>
        <div className="card">
          <b>3 · Earn Every Progression</b>
          <p className="mut sm" style={{ marginTop: "6px" }}>
            Master each variation before jumping up. Injury is the ultimate time thief.
          </p>
        </div>
      </div>

      {/* Routine Detail Modal */}
      <WorkoutModal
        workout={selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
      />

      {/* Biomechanical Motion Form Modal */}
      <ExerciseModal
        exercise={selectedEx}
        onClose={() => setSelectedEx(null)}
        onSelectExercise={(ex) => setSelectedEx(ex)}
      />
    </div>
  );
}
