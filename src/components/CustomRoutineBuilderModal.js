"use client";
import React, { useState } from "react";
import { EXDB, CATS } from "@/data/db";
import { useFitness } from "@/context/FitnessContext";
import { useAuth } from "@/context/AuthContext";
import { haptics } from "@/lib/haptics";

export default function CustomRoutineBuilderModal({ isOpen, onClose, initialRoutine = null }) {
  const { saveCustomRoutine, startWorkout, showToast } = useFitness();
  const { user, openAuthModal } = useAuth();

  const [routineName, setRoutineName] = useState(initialRoutine?.n || "");
  const [category, setCategory] = useState(initialRoutine?.cat || "calis");
  const [level, setLevel] = useState(initialRoutine?.lv || 2);
  const [exercises, setExercises] = useState(
    initialRoutine?.ex || [
      { x: "pushup", s: 3, r: "10", rest: 60 },
      { x: "plank", s: 3, sec: 30, rest: 30 }
    ]
  );
  const [searchQuery, setSearchQuery] = useState("");

  if (!isOpen) return null;

  // Filter available exercises for adding
  const filteredExercises = EXDB.filter((e) => {
    const q = searchQuery.toLowerCase();
    return e.n.toLowerCase().includes(q) || e.cat.toLowerCase().includes(q) || e.ms.toLowerCase().includes(q);
  });

  const handleAddExercise = (exId) => {
    const exObj = EXDB.find((e) => e.id === exId);
    if (!exObj) return;

    // Check if exercise is naturally a hold (plank, hollow, etc.)
    const isHold = ["plank", "sidep", "hollow", "wrist", "dloc", "dog"].includes(exObj.id);

    const newEx = isHold
      ? { x: exObj.id, s: 3, sec: 30, rest: 30 }
      : { x: exObj.id, s: 3, r: "10", rest: 60 };

    setExercises((prev) => [...prev, newEx]);
    setSearchQuery("");
    haptics.light();
    showToast(`Added ${exObj.n}`);
  };

  const handleRemoveExercise = (idx) => {
    setExercises((prev) => prev.filter((_, i) => i !== idx));
    haptics.light();
  };

  const handleMoveExercise = (idx, direction) => {
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= exercises.length) return;
    setExercises((prev) => {
      const copy = [...prev];
      const temp = copy[idx];
      copy[idx] = copy[targetIdx];
      copy[targetIdx] = temp;
      return copy;
    });
    haptics.light();
  };

  const handleUpdateExercise = (idx, field, value) => {
    setExercises((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleToggleMode = (idx) => {
    setExercises((prev) => {
      const copy = [...prev];
      const item = { ...copy[idx] };
      if (item.sec != null) {
        delete item.sec;
        item.r = "10";
      } else {
        delete item.r;
        item.sec = 30;
      }
      copy[idx] = item;
      return copy;
    });
    haptics.light();
  };

  // Estimate duration in minutes
  const totalSeconds = exercises.reduce((acc, e) => {
    const sets = e.s || 3;
    const workTime = e.sec != null ? Number(e.sec) || 30 : 35;
    const restTime = Number(e.rest) || 45;
    return acc + sets * (workTime + restTime);
  }, 0);
  const estimatedMins = Math.max(5, Math.round(totalSeconds / 60));

  const handleSave = async (andStart = false) => {
    if (!routineName.trim()) {
      showToast("Please give your routine a name.");
      return;
    }
    if (exercises.length === 0) {
      showToast("Please add at least 1 exercise.");
      return;
    }

    const routineData = {
      id: initialRoutine?.id || `custom_${Date.now()}`,
      n: routineName.trim(),
      cat: category,
      lv: level,
      mins: estimatedMins,
      tag: `Custom · ${exercises.length} Exercises`,
      ex: exercises
    };

    const saved = await saveCustomRoutine(routineData);
    haptics.success();

    if (andStart) {
      if (!user) {
        openAuthModal("Sign in to start this routine and log your progress!");
        onClose();
        return;
      }
      startWorkout(saved);
    }
    onClose();
  };

  return (
    <div className="ov show" onClick={(e) => e.target === e.currentTarget && onClose()} style={{ zIndex: 300 }}>
      <div
        className="sheet"
        style={{
          maxWidth: "580px",
          maxHeight: "90vh",
          display: "flex",
          flexDirection: "column",
          padding: "22px",
          background: "linear-gradient(180deg, #181d24 0%, #0f1216 100%)",
          border: "1px solid var(--ln)"
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <span className="cali-acc" style={{ fontSize: "10px", letterSpacing: "0.2em" }}>
              WORKOUT BUILDER
            </span>
            <h3 style={{ fontSize: "22px", margin: "4px 0 0" }}>
              {initialRoutine ? "Edit Routine" : "Build Custom Routine"}
            </h3>
          </div>
          <button className="xbtn" onClick={onClose}>✕</button>
        </div>

        {/* Scrollable Form Body */}
        <div style={{ overflowY: "auto", paddingRight: "4px", flex: 1, display: "flex", flexDirection: "column", gap: "16px" }}>
          {/* Routine Name */}
          <div>
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "var(--mut)", marginBottom: "6px" }}>
              ROUTINE NAME
            </label>
            <input
              type="text"
              className="inp"
              placeholder="e.g. Muscle-Up Power & Core Burner"
              value={routineName}
              onChange={(e) => setRoutineName(e.target.value)}
              style={{ width: "100%", padding: "10px 14px", fontSize: "14px" }}
            />
          </div>

          {/* Category & Level Selectors */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "var(--mut)", marginBottom: "6px" }}>
                CATEGORY
              </label>
              <select
                className="inp"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{ width: "100%", padding: "10px", fontSize: "13px" }}
              >
                {Object.entries(CATS).map(([catKey, catObj]) => (
                  <option key={catKey} value={catKey}>
                    {catObj.n}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "var(--mut)", marginBottom: "6px" }}>
                TARGET LEVEL
              </label>
              <select
                className="inp"
                value={level}
                onChange={(e) => setLevel(Number(e.target.value))}
                style={{ width: "100%", padding: "10px", fontSize: "13px" }}
              >
                <option value={1}>Level 1 (Beginner)</option>
                <option value={2}>Level 2 (Intermediate)</option>
                <option value={3}>Level 3 (Advanced / Beast)</option>
              </select>
            </div>
          </div>

          {/* Current Routine Exercise Sequence */}
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--mut)" }}>
                EXERCISES ({exercises.length}) · ~{estimatedMins} MINS
              </label>
            </div>

            {exercises.length === 0 ? (
              <div
                style={{
                  padding: "24px",
                  textAlign: "center",
                  border: "2px dashed var(--ln)",
                  borderRadius: "12px",
                  color: "var(--mut)",
                  fontSize: "13px"
                }}
              >
                No exercises added yet. Pick from the library below!
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {exercises.map((item, idx) => {
                  const exObj = EXDB.find((e) => e.id === item.x) || { n: item.x };
                  const isSec = item.sec != null;

                  return (
                    <div
                      key={idx}
                      style={{
                        background: "rgba(255, 255, 255, 0.03)",
                        border: "1px solid var(--ln)",
                        borderRadius: "10px",
                        padding: "10px 12px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "8px"
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              width: "22px",
                              height: "22px",
                              borderRadius: "50%",
                              background: "rgba(255, 107, 44, 0.2)",
                              color: "var(--acc)",
                              fontSize: "11px",
                              fontWeight: "bold",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center"
                            }}
                          >
                            {idx + 1}
                          </span>
                          <b style={{ fontSize: "14px" }}>{exObj.n}</b>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                          <button
                            type="button"
                            className="btn gh sm"
                            style={{ padding: "2px 6px", fontSize: "11px" }}
                            disabled={idx === 0}
                            onClick={() => handleMoveExercise(idx, -1)}
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            className="btn gh sm"
                            style={{ padding: "2px 6px", fontSize: "11px" }}
                            disabled={idx === exercises.length - 1}
                            onClick={() => handleMoveExercise(idx, 1)}
                          >
                            ▼
                          </button>
                          <button
                            type="button"
                            className="btn gh sm"
                            style={{ padding: "2px 6px", fontSize: "11px", color: "#ff4d4d" }}
                            onClick={() => handleRemoveExercise(idx)}
                          >
                            ✕
                          </button>
                        </div>
                      </div>

                      {/* Config Row */}
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr 1fr", gap: "8px", alignItems: "center" }}>
                        {/* Sets */}
                        <div>
                          <span className="mut" style={{ fontSize: "10px", display: "block", marginBottom: "2px" }}>SETS</span>
                          <select
                            className="inp"
                            value={item.s}
                            onChange={(e) => handleUpdateExercise(idx, "s", Number(e.target.value))}
                            style={{ width: "100%", padding: "5px 8px", fontSize: "12px" }}
                          >
                            {[1, 2, 3, 4, 5, 6, 8, 10].map((s) => (
                              <option key={s} value={s}>{s} sets</option>
                            ))}
                          </select>
                        </div>

                        {/* Reps or Hold */}
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                            <span className="mut" style={{ fontSize: "10px" }}>{isSec ? "HOLD" : "REPS"}</span>
                            <button
                              type="button"
                              onClick={() => handleToggleMode(idx)}
                              style={{ background: "none", border: "none", color: "var(--acc)", fontSize: "9px", cursor: "pointer", padding: 0 }}
                            >
                              ⇄ {isSec ? "Reps" : "Sec"}
                            </button>
                          </div>
                          {isSec ? (
                            <input
                              type="number"
                              className="inp"
                              min={5}
                              max={300}
                              step={5}
                              value={item.sec}
                              onChange={(e) => handleUpdateExercise(idx, "sec", Number(e.target.value))}
                              style={{ width: "100%", padding: "5px 8px", fontSize: "12px" }}
                              placeholder="Sec"
                            />
                          ) : (
                            <input
                              type="text"
                              className="inp"
                              value={item.r}
                              onChange={(e) => handleUpdateExercise(idx, "r", e.target.value)}
                              style={{ width: "100%", padding: "5px 8px", fontSize: "12px" }}
                              placeholder="e.g. 10"
                            />
                          )}
                        </div>

                        {/* Rest */}
                        <div>
                          <span className="mut" style={{ fontSize: "10px", display: "block", marginBottom: "2px" }}>REST</span>
                          <select
                            className="inp"
                            value={item.rest}
                            onChange={(e) => handleUpdateExercise(idx, "rest", Number(e.target.value))}
                            style={{ width: "100%", padding: "5px 8px", fontSize: "12px" }}
                          >
                            <option value={15}>15s</option>
                            <option value={30}>30s</option>
                            <option value={45}>45s</option>
                            <option value={60}>60s</option>
                            <option value={90}>90s</option>
                            <option value={120}>120s</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Add Exercise from Library Section */}
          <div
            style={{
              border: "1px solid var(--ln)",
              borderRadius: "12px",
              padding: "14px",
              background: "rgba(0, 0, 0, 0.25)"
            }}
          >
            <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "var(--tx)", marginBottom: "8px" }}>
              + ADD EXERCISE FROM LIBRARY (42 TOTAL)
            </label>

            <div style={{ display: "flex", gap: "8px", marginBottom: "10px" }}>
              <input
                type="text"
                className="inp"
                placeholder="Search exercise (e.g. pullup, plank, squat)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ flex: 1, padding: "8px 12px", fontSize: "12.5px" }}
              />
            </div>

            <div
              style={{
                maxHeight: "150px",
                overflowY: "auto",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
                gap: "6px"
              }}
            >
              {filteredExercises.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  className="btn gh sm"
                  style={{
                    padding: "6px 8px",
                    textAlign: "left",
                    justifyContent: "flex-start",
                    fontSize: "11.5px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap"
                  }}
                  onClick={() => handleAddExercise(e.id)}
                >
                  <span style={{ color: "var(--acc)", fontWeight: "bold", marginRight: "4px" }}>+</span>
                  {e.n}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "16px",
            paddingTop: "14px",
            borderTop: "1px solid var(--ln)",
            flexWrap: "wrap",
            gap: "10px"
          }}
        >
          <button className="btn gh" onClick={onClose}>
            Cancel
          </button>

          <div style={{ display: "flex", gap: "8px" }}>
            <button
              className="btn gh"
              style={{ borderColor: "var(--acc)", color: "var(--acc)" }}
              onClick={() => handleSave(false)}
            >
              💾 Save Routine
            </button>
            <button
              className="btn"
              style={{ background: "linear-gradient(135deg, #ff6b2c 0%, #ff944d 100%)", color: "#000", fontWeight: "900" }}
              onClick={() => handleSave(true)}
            >
              🚀 Save & Start
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
