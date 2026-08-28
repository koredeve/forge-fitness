"use client";
import React, { useState, useEffect, useRef } from "react";
import { useFitness } from "@/context/FitnessContext";

const CIRC = 2 * Math.PI * 104;

export default function IntervalTimer() {
  const { sound, setSound, playBeep } = useFitness();

  const [prep, setPrep] = useState(10);
  const [work, setWork] = useState(40);
  const [rest, setRest] = useState(20);
  const [rounds, setRounds] = useState(8);

  const [phase, setPhase] = useState("idle"); // idle, prep, work, rest, done
  const [rem, setRem] = useState(0);
  const [currentRound, setCurrentRound] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const intervalRef = useRef(null);

  const loadPreset = (name, w, r, n) => {
    setWork(w);
    setRest(r);
    setRounds(n);
  };

  const estMins = Math.max(0, Math.round((prep + (work + rest) * rounds) / 60));

  const startTimer = () => {
    if (isRunning) {
      setIsRunning(false);
      clearInterval(intervalRef.current);
      return;
    }

    if (phase === "idle" || phase === "done") {
      setPhase("prep");
      setCurrentRound(0);
      setRem(prep || 1);
    }

    setIsRunning(true);
  };

  const resetTimer = () => {
    setIsRunning(false);
    clearInterval(intervalRef.current);
    setPhase("idle");
    setCurrentRound(0);
    setRem(0);
  };

  useEffect(() => {
    if (!isRunning) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setRem((prev) => {
        if (prev <= 1) {
          // Transition
          if (phase === "prep") {
            setPhase("work");
            playBeep(880, 0.3);
            return work;
          } else if (phase === "work") {
            const nextRound = currentRound + 1;
            if (nextRound >= rounds) {
              setPhase("done");
              setIsRunning(false);
              playBeep(880, 0.15);
              setTimeout(() => playBeep(1200, 0.3), 200);
              return 0;
            }
            setCurrentRound(nextRound);
            setPhase("rest");
            playBeep(440, 0.3);
            return rest || 1;
          } else if (phase === "rest") {
            setPhase("work");
            playBeep(880, 0.3);
            return work;
          }
        } else if (prev <= 4) {
          playBeep(660, 0.08);
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [isRunning, phase, currentRound, work, rest, rounds, prep]);

  const maxTime = phase === "work" ? work : phase === "rest" ? rest || 1 : prep || 1;
  const strokeOffset = phase === "done" ? 0 : phase === "idle" ? 0 : CIRC - CIRC * (rem / (maxTime || 1));

  return (
    <div className="vw active" id="v-timer">
      <h1 className="pg">
        Interval <em>Timer</em>
      </h1>
      <p className="sub">For Tabata, circuits, sprints — anything that repeats.</p>

      <div className="tgrid">
        <div className="card">
          <div className="fr" style={{ flexDirection: "column", alignItems: "stretch", gap: "10px" }}>
            <div className="tf">
              <span>Prep (s)</span>
              <input
                type="number"
                value={prep}
                min="0"
                onChange={(e) => setPrep(Math.max(0, +e.target.value || 0))}
              />
            </div>
            <div className="tf">
              <span>Work (s)</span>
              <input
                type="number"
                value={work}
                min="0"
                onChange={(e) => setWork(Math.max(0, +e.target.value || 0))}
              />
            </div>
            <div className="tf">
              <span>Rest (s)</span>
              <input
                type="number"
                value={rest}
                min="0"
                onChange={(e) => setRest(Math.max(0, +e.target.value || 0))}
              />
            </div>
            <div className="tf">
              <span>Rounds</span>
              <input
                type="number"
                value={rounds}
                min="1"
                onChange={(e) => setRounds(Math.max(1, +e.target.value || 1))}
              />
            </div>
          </div>

          <div className="filters" style={{ marginTop: "12px" }}>
            <button className="fbtn" onClick={() => loadPreset("Tabata", 20, 10, 8)}>
              Tabata (20/10)
            </button>
            <button className="fbtn" onClick={() => loadPreset("HIIT", 40, 20, 6)}>
              HIIT (40/20)
            </button>
            <button className="fbtn" onClick={() => loadPreset("Strength", 60, 90, 5)}>
              Strength (60/90)
            </button>
            <button className="fbtn" onClick={() => setSound(!sound)}>
              {sound ? "🔊 Sound on" : "🔇 Sound off"}
            </button>
          </div>

          <div className="mut sm" style={{ marginTop: "10px" }}>
            ~{estMins} min total workout time
          </div>
        </div>

        <div className="card" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div className={`ph ${phase === "work" ? "WORK" : phase === "rest" ? "REST" : "prep"}`}>
            {phase === "idle" ? "READY" : phase === "done" ? "DONE" : phase.toUpperCase()}
          </div>

          <div className="ring">
            <svg width="240" height="240">
              <circle cx="120" cy="120" r="104" stroke="var(--ln)" stroke-width="10" fill="none" />
              <circle
                cx="120"
                cy="120"
                r="104"
                stroke="var(--acc)"
                stroke-width="10"
                fill="none"
                stroke-linecap="round"
                strokeDasharray={CIRC}
                strokeDashoffset={strokeOffset}
              />
            </svg>
            <div className="cin">
              <b>{phase === "done" ? "🔥" : phase === "idle" ? "—" : Math.max(0, rem)}</b>
              <span className="mut sm">
                {phase === "done" ? "Circuit complete" : phase !== "idle" ? `Round ${Math.min(currentRound + 1, rounds)} / ${rounds}` : ""}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "12px" }}>
            <button className="btn" onClick={startTimer}>
              {isRunning ? "⏸ PAUSE" : phase === "done" ? "▶ RESTART" : "▶ START"}
            </button>
            <button className="btn gh" onClick={resetTimer}>
              ↺ Reset
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
