"use client";
import React, { useState, useEffect, useRef } from "react";
import { useFitness } from "@/context/FitnessContext";
import AuthGate from "@/components/AuthGate";

export default function Timer() {
  const { playBeep } = useFitness();

  const [workSec, setWorkSec] = useState(30);
  const [restSec, setRestSec] = useState(15);
  const [rounds, setRounds] = useState(8);

  const [curPhase, setCurPhase] = useState("IDLE"); // IDLE, WORK, REST, DONE
  const [curRound, setCurRound] = useState(1);
  const [timeLeft, setTimeLeft] = useState(30);
  const [totalElapsed, setTotalElapsed] = useState(0);

  const intervalRef = useRef(null);

  const totalDuration = rounds * (workSec + restSec);
  const progressPct = totalDuration ? Math.min(1, totalElapsed / totalDuration) : 0;
  const strokeDashoffset = 628 * (1 - (timeLeft / (curPhase === "WORK" ? workSec : restSec || 1)));

  const startTimer = () => {
    setCurPhase("WORK");
    setCurRound(1);
    setTimeLeft(workSec);
    setTotalElapsed(0);
    playBeep(880, 0.2);
  };

  const stopTimer = () => {
    setCurPhase("IDLE");
    clearInterval(intervalRef.current);
  };

  const applyPreset = (w, r, rnd) => {
    stopTimer();
    setWorkSec(w);
    setRestSec(r);
    setRounds(rnd);
    setTimeLeft(w);
  };

  useEffect(() => {
    if (curPhase === "WORK" || curPhase === "REST") {
      intervalRef.current = setInterval(() => {
        setTotalElapsed((prev) => prev + 1);
        setTimeLeft((prev) => {
          if (prev <= 4 && prev > 1) {
            playBeep(660, 0.08);
          }
          if (prev <= 1) {
            if (curPhase === "WORK") {
              if (curRound >= rounds) {
                setCurPhase("DONE");
                playBeep(1200, 0.4);
                clearInterval(intervalRef.current);
                return 0;
              } else {
                setCurPhase("REST");
                playBeep(440, 0.25);
                return restSec;
              }
            } else {
              setCurRound((r) => r + 1);
              setCurPhase("WORK");
              playBeep(880, 0.25);
              return workSec;
            }
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [curPhase, curRound, rounds, workSec, restSec]);

  return (
    <AuthGate
      title="Interval Timer"
      subtitle="Sign in to use customizable Tabata, EMOM, and HIIT interval audio timers."
      icon="⏱"
    >
      <div className="vw active" id="v-timer">
        <h1 className="pg">Interval Timer</h1>
        <p className="sub">
          Tabata, EMOM, or custom interval rounds with audio cadences. Set work, set rest, hit start.
        </p>

        <div className="tgrid">
          {/* Controls column */}
          <div className="card">
            <h3 style={{ fontSize: "18px", marginBottom: "14px" }}>Settings</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div className="tf">
                Work (seconds)
                <input
                  type="number"
                  value={workSec}
                  onChange={(e) => setWorkSec(Math.max(5, parseInt(e.target.value, 10) || 5))}
                  disabled={curPhase !== "IDLE"}
                />
              </div>
              <div className="tf">
                Rest (seconds)
                <input
                  type="number"
                  value={restSec}
                  onChange={(e) => setRestSec(Math.max(0, parseInt(e.target.value, 10) || 0))}
                  disabled={curPhase !== "IDLE"}
                />
              </div>
              <div className="tf">
                Total Rounds
                <input
                  type="number"
                  value={rounds}
                  onChange={(e) => setRounds(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  disabled={curPhase !== "IDLE"}
                />
              </div>
            </div>

            <div style={{ marginTop: "18px", display: "flex", gap: "8px" }}>
              {curPhase === "IDLE" || curPhase === "DONE" ? (
                <button className="btn" style={{ flex: 1, justifyContent: "center" }} onClick={startTimer}>
                  ▶ Start Timer
                </button>
              ) : (
                <button className="btn gh" style={{ flex: 1, justifyContent: "center" }} onClick={stopTimer}>
                  ⏹ Reset
                </button>
              )}
            </div>

            <div style={{ marginTop: "20px" }}>
              <span className="mut sm">Presets:</span>
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "8px" }}>
                <button className="pill" onClick={() => applyPreset(20, 10, 8)}>
                  Tabata 20/10 ×8
                </button>
                <button className="pill" onClick={() => applyPreset(40, 20, 10)}>
                  HIIT 40/20 ×10
                </button>
                <button className="pill" onClick={() => applyPreset(45, 15, 6)}>
                  Core 45/15 ×6
                </button>
              </div>
            </div>
          </div>

          {/* Clock circle column */}
          <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "320px" }}>
            <div className="ring">
              <svg width="240" height="240" viewBox="0 0 240 240">
                <circle cx="120" cy="120" r="100" stroke="var(--ln)" strokeWidth="12" fill="none" />
                <circle
                  cx="120"
                  cy="120"
                  r="100"
                  stroke={curPhase === "REST" ? "var(--ok)" : "var(--acc)"}
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray="628"
                  strokeDashoffset={isNaN(strokeDashoffset) ? 0 : strokeDashoffset}
                  strokeLinecap="round"
                  style={{ transition: "stroke-dashoffset 0.25s linear" }}
                />
              </svg>

              <div className="cin">
                <span className={`ph ${curPhase === "WORK" ? "WORK" : curPhase === "REST" ? "REST" : ""}`} style={{ fontSize: "14px" }}>
                  {curPhase === "IDLE" ? "READY" : curPhase}
                </span>
                <b>{curPhase === "IDLE" ? workSec : timeLeft}</b>
                <span className="mut sm">
                  {curPhase === "IDLE" ? "Tap Start" : `Round ${curRound} / ${rounds}`}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
