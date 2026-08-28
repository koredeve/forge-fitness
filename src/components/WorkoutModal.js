"use client";
import React from "react";
import { CATS, EXDB } from "@/data/db";
import { useFitness } from "@/context/FitnessContext";

export default function WorkoutModal({ workout, onClose }) {
  const { startWorkout } = useFitness();

  if (!workout) return null;

  return (
    <div className="ov show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet" style={{ maxWidth: "560px" }}>
        <button className="xbtn" onClick={onClose}>✕</button>

        {workout.cat === "calis" ? (
          <div className="cali-acc">🤸 CALISTHENICS</div>
        ) : (
          <span className="pill">
            <span className="d" style={{ background: CATS[workout.cat]?.c }}></span>
            {CATS[workout.cat]?.n}
          </span>
        )}

        <h3 style={{ marginTop: "6px" }}>{workout.n}</h3>
        <div className="mut sm" style={{ marginBottom: "16px" }}>
          {workout.tag} · ~{workout.mins} min · <span className={`pill lv${workout.lv}`}>{"●".repeat(workout.lv)} L{workout.lv}</span>
        </div>

        <b style={{ fontSize: "14px", color: "var(--tx)", display: "block", marginBottom: "8px" }}>
          Routine Breakdown ({workout.ex.length} Exercises)
        </b>

        <ul className="rl">
          {workout.ex.map((e, i) => {
            const exObj = EXDB.find((item) => item.id === e.x) || { n: e.x };
            return (
              <li key={i}>
                <div>
                  <b>{exObj.n}</b>
                  <div className="mut sm" style={{ fontSize: "12px" }}>
                    {e.s} Sets × {e.sec != null ? `${e.sec}s hold` : `${e.r} reps`}
                  </div>
                </div>
                <span className="mut sm">{e.rest ? `Rest ${e.rest}s` : "No rest"}</span>
              </li>
            );
          })}
        </ul>

        <button
          className="btn"
          style={{ width: "100%", justifyContent: "center", marginTop: "16px", padding: "14px" }}
          onClick={() => {
            onClose();
            startWorkout(workout.id);
          }}
        >
          ▶ START GUIDED SESSION
        </button>
      </div>
    </div>
  );
}
