"use client";
import React, { useState } from "react";
import { PROGRAMS, WORKOUTS, CATS } from "@/data/db";
import { useFitness } from "@/context/FitnessContext";
import WorkoutModal from "@/components/WorkoutModal";

const PROGRAM_BANNERS = {
  p1: "/banners/foundation.jpg",
  p2: "/banners/strength.jpg",
  p3: "/banners/hybrid.jpg"
};

export default function Programs() {
  const { startWorkout } = useFitness();
  const [selectedWorkout, setSelectedWorkout] = useState(null);

  return (
    <div className="vw active" id="v-programs">
      <h1 className="pg">Programs</h1>
      <p className="sub">
        Pick a plan, follow the week grid, start each day with one tap. Progressive overload is the only magic.
      </p>

      <div className="grid g2">
        {PROGRAMS.map((p) => {
          const bannerImg = PROGRAM_BANNERS[p.id] || "/banners/foundation.jpg";
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
                    opacity: 0.55,
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
                      <b style={{ display: "block", fontSize: "20px", marginTop: "2px" }}>{p.n}</b>
                    </div>
                    <span className={`pill lv${p.lv}`}>{"●".repeat(p.lv)} L{p.lv}</span>
                  </div>
                </div>
              </div>

              {/* Program Schedule & Content */}
              <div style={{ padding: "18px" }}>
                <p className="mut sm">{p.focus} · {p.wks}</p>

                <div className="grid g3" style={{ marginTop: "14px" }}>
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
                        onClick={() => setSelectedWorkout(w)}
                      >
                        <b className="sm">{d}</b>
                        <div className="sm" style={{ fontWeight: "600", fontSize: "12px", marginTop: "2px" }}>{w?.n}</div>
                        <button
                          className="btn sm"
                          style={{ marginTop: "8px", width: "100%", justifyContent: "center", padding: "5px" }}
                          onClick={(e) => {
                            e.stopPropagation();
                            startWorkout(wId);
                          }}
                        >
                          Start →
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

      <WorkoutModal
        workout={selectedWorkout}
        onClose={() => setSelectedWorkout(null)}
      />
    </div>
  );
}
