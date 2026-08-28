"use client";
import React, { useState } from "react";
import { SKILLS, WORKOUTS, EXDB } from "@/data/db";
import { useFitness } from "@/context/FitnessContext";
import { useAuth } from "@/context/AuthContext";
import SkillTreeVisual from "@/components/SkillTreeVisual";
import WorkoutModal from "@/components/WorkoutModal";
import ExerciseModal from "@/components/ExerciseModal";
import ProModal from "@/components/ProModal";

// Free tier access list (Pull-Up & Dip up to Lv2)
const FREE_SKILLS = ["pullup", "dip"];

export default function Calis() {
  const { skills, toggleSkill, getSkillsPct, startWorkout } = useFitness();
  const { isPro } = useAuth();

  const [openSkills, setOpenSkills] = useState({
    pullup: true
  });
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [selectedEx, setSelectedEx] = useState(null);
  const [proModalOpen, setProModalOpen] = useState(false);
  const [lockedFeatureName, setLockedFeatureName] = useState("");

  const toggleOpen = (id) => {
    setOpenSkills((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const masteryPct = getSkillsPct();

  const openFormPreview = (levelTitle, skillId) => {
    const match = EXDB.find(
      (e) =>
        e.id === skillId ||
        levelTitle.toLowerCase().includes(e.n.toLowerCase()) ||
        e.n.toLowerCase().includes(levelTitle.split("·")[0].trim().toLowerCase())
    ) || EXDB.find((e) => e.cat === "calis");
    setSelectedEx(match);
  };

  const handleLevelClick = (skillId, levelIdx, skillName) => {
    const isLevelLocked = !isPro && (!FREE_SKILLS.includes(skillId) || levelIdx >= 2);
    if (isLevelLocked) {
      setLockedFeatureName(`${skillName} (Level ${levelIdx + 1})`);
      setProModalOpen(true);
      return;
    }
    toggleSkill(skillId, levelIdx);
  };

  return (
    <div className="vw active" id="v-calis">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px" }}>
        <div>
          <h1 className="pg">
            Calisthenics <em>Hub</em>
          </h1>
          <p className="sub">
            Your body is the barbell. Master bodyweight physics, climb the skill trees, and unlock elite relative strength.
          </p>
        </div>

        {!isPro && (
          <button
            className="btn"
            style={{
              background: "linear-gradient(135deg, #ff6b2c 0%, #ff944d 100%)",
              boxShadow: "0 6px 20px rgba(255, 107, 44, 0.35)",
              padding: "10px 18px",
              fontSize: "13px"
            }}
            onClick={() => {
              setLockedFeatureName("All Calisthenics Master Trees");
              setProModalOpen(true);
            }}
          >
            👑 Unlock All Skills with PRO
          </button>
        )}
      </div>

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
          const isSkillLocked = !isPro && !FREE_SKILLS.includes(s.id);

          return (
            <div
              key={s.id}
              className={`card skill ${isOpen ? "open" : ""}`}
              id={`sk-${s.id}`}
              style={{
                borderColor: isSkillLocked ? "var(--ln)" : undefined,
                background: isSkillLocked ? "rgba(18, 22, 27, 0.6)" : "var(--p)"
              }}
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
                    <h4 style={{ margin: 0, fontSize: "16px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <span>
                        {s.icon} {s.n}
                      </span>
                      {isSkillLocked && (
                        <span className="pill" style={{ borderColor: "var(--acc)", color: "var(--acc)", padding: "2px 6px", fontSize: "9px" }}>
                          🔒 PRO
                        </span>
                      )}
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
                {s.lv.map((l, i) => {
                  const isLockedLevel = !isPro && (!FREE_SKILLS.includes(s.id) || i >= 2);
                  return (
                    <div
                      key={i}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "8px 0",
                        borderBottom: "1px dashed var(--ln)",
                        opacity: isLockedLevel ? 0.75 : 1
                      }}
                    >
                      <label
                        style={{ display: "flex", gap: "10px", alignItems: "center", cursor: "pointer", flex: 1 }}
                        onClick={(e) => {
                          e.preventDefault();
                          handleLevelClick(s.id, i, s.n);
                        }}
                      >
                        {isLockedLevel ? (
                          <span style={{ fontSize: "14px", color: "var(--acc)" }}>🔒</span>
                        ) : (
                          <input
                            type="checkbox"
                            checked={!!userLevels[i]}
                            onChange={() => {}}
                          />
                        )}
                        <span>
                          <b style={{ color: userLevels[i] ? "var(--ok)" : isLockedLevel ? "var(--mut)" : "var(--tx)" }}>
                            Lv{i + 1} · {l[0]} {isLockedLevel && <span style={{ fontSize: "10px", color: "var(--acc)" }}>(PRO)</span>}
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
                  );
                })}
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

      {/* PRO Paywall Modal */}
      <ProModal
        isOpen={proModalOpen}
        onClose={() => setProModalOpen(false)}
        featureName={lockedFeatureName}
      />
    </div>
  );
}
