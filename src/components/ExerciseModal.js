"use client";
import React, { useState } from "react";
import { CATS, EXDB } from "@/data/db";
import MotionCoach from "./MotionCoach";
import ExerciseVideoPlayer from "./ExerciseVideoPlayer";

const TOON_IMAGES = {
  pullup: "/illustrations/pullup.jpg",
  chinup: "/illustrations/pullup.jpg",
  negpull: "/illustrations/pullup.jpg",
  exppull: "/illustrations/pullup.jpg",
  muscleup: "/illustrations/muscleup.jpg",
  planche: "/illustrations/planche.jpg",
  hstand: "/illustrations/hstand.jpg",
  hspu: "/illustrations/hstand.jpg",
  pike: "/illustrations/hstand.jpg"
};

export default function ExerciseModal({ exercise, onClose, onSelectExercise }) {
  const [viewMode, setViewMode] = useState("video"); // "video", "motion", "toon"

  if (!exercise) return null;

  const regObj = EXDB.find((e) => e.n.toLowerCase() === exercise.reg?.toLowerCase());
  const progObj = EXDB.find((e) => e.n.toLowerCase() === exercise.prog?.toLowerCase());
  const toonImg = TOON_IMAGES[exercise.id] || (exercise.cat === "calis" ? "/illustrations/pullup.jpg" : null);

  return (
    <div className="ov show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet" style={{ maxWidth: "700px" }}>
        <button className="xbtn" onClick={onClose}>✕</button>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
          <span className="pill">
            <span className="d" style={{ background: CATS[exercise.cat]?.c }}></span>
            {CATS[exercise.cat]?.n}
          </span>
          <span className={`pill lv${exercise.lv}`}>{"●".repeat(exercise.lv)} L{exercise.lv}</span>
          <span className="pill">🧰 {exercise.eq}</span>
        </div>

        <h3 style={{ marginTop: "12px", fontSize: "24px" }}>{exercise.n}</h3>
        <div className="mut sm" style={{ marginBottom: "12px" }}>{exercise.ms}</div>
        <p>{exercise.d}</p>

        {/* Multi-Format Visual Mode Switcher */}
        <div style={{ display: "flex", gap: "8px", marginTop: "14px", flexWrap: "wrap" }}>
          <button
            className={`btn sm ${viewMode === "video" ? "" : "gh"}`}
            onClick={() => setViewMode("video")}
          >
            🎬 Real HD Video & Slow-Mo
          </button>
          <button
            className={`btn sm ${viewMode === "motion" ? "" : "gh"}`}
            onClick={() => setViewMode("motion")}
          >
            ⚡ Biomechanical Simulator
          </button>
          {toonImg && (
            <button
              className={`btn sm ${viewMode === "toon" ? "" : "gh"}`}
              onClick={() => setViewMode("toon")}
            >
              🎨 Heroic Comic Artwork
            </button>
          )}
        </div>

        {/* 1. Real HD Video Loop Player with Slow-Mo & Overlays */}
        {viewMode === "video" && (
          <ExerciseVideoPlayer
            exerciseId={exercise.id}
            exerciseName={exercise.n}
            category={exercise.cat}
          />
        )}

        {/* 2. Live Kinetic Biomechanics Simulator */}
        {viewMode === "motion" && (
          <MotionCoach exerciseId={exercise.id} exerciseName={exercise.n} />
        )}

        {/* 3. Visual Comic / Toon Artwork */}
        {viewMode === "toon" && toonImg && (
          <div style={{ marginTop: "14px", background: "var(--p)", border: "1px solid var(--ln)", borderRadius: "14px", padding: "14px", textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <b style={{ fontSize: "14px", color: "var(--acc)" }}>🎨 Heroic Form Illustration</b>
              <span className="pill">High-Res Anime Guide</span>
            </div>
            <div style={{ position: "relative", width: "100%", maxHeight: "360px", overflow: "hidden", borderRadius: "10px" }}>
              <img
                src={toonImg}
                alt={exercise.n}
                style={{ width: "100%", height: "auto", maxHeight: "360px", objectFit: "cover", display: "block" }}
              />
            </div>
          </div>
        )}

        <div className="sect" style={{ margin: "18px 0 4px" }}>
          <b style={{ fontSize: "13px" }}>✔ Execution Cues</b>
        </div>
        <ul className="rl">
          {exercise.cu?.map((c, i) => (
            <li key={i} className="blk">✔ {c}</li>
          ))}
        </ul>

        <div className="sect" style={{ margin: "12px 0 4px" }}>
          <b style={{ fontSize: "13px" }}>✖ Common Mistakes</b>
        </div>
        <ul className="rl">
          {exercise.bd?.map((c, i) => (
            <li key={i} className="blk">
              <span style={{ color: "#ff8f8f" }}>✖</span> {c}
            </li>
          ))}
        </ul>

        <div className="sect" style={{ margin: "12px 0 4px" }}>
          <b style={{ fontSize: "13px" }}>🪜 The Progression Ladder</b>
        </div>
        <ul className="rl">
          <li>
            <span>Regression (Easier)</span>
            <span
              className="mut"
              style={{ cursor: regObj && onSelectExercise ? "pointer" : "default", color: regObj ? "var(--acc2)" : "inherit" }}
              onClick={() => regObj && onSelectExercise && onSelectExercise(regObj)}
            >
              {exercise.reg} {regObj ? "→" : ""}
            </span>
          </li>
          <li>
            <span>Next Progression (Harder)</span>
            <span
              className="mut"
              style={{ cursor: progObj && onSelectExercise ? "pointer" : "default", color: progObj ? "var(--acc)" : "inherit", fontWeight: progObj ? "600" : "normal" }}
              onClick={() => progObj && onSelectExercise && onSelectExercise(progObj)}
            >
              {exercise.prog} {progObj ? "→" : ""}
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
