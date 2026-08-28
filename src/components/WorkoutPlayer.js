"use client";
import React, { useState, useEffect, useRef } from "react";
import { useFitness } from "@/context/FitnessContext";
import { EXDB } from "@/data/db";

// Image & video mapping for all exercises
const EXERCISE_MEDIA = {
  pushup: { img: "/illustrations/pullup.jpg", video: "/videos/pushup.mp4" },
  diamond: { img: "/illustrations/pullup.jpg", video: "/videos/pushup.mp4" },
  dip: { img: "/illustrations/pullup.jpg", video: "/videos/dip.mp4" },
  pullup: { img: "/illustrations/pullup.jpg", video: "/videos/pullup.mp4" },
  chinup: { img: "/illustrations/pullup.jpg", video: "/videos/pullup.mp4" },
  negpull: { img: "/illustrations/pullup.jpg", video: "/videos/pullup.mp4" },
  exppull: { img: "/illustrations/pullup.jpg", video: "/videos/pullup.mp4" },
  scap: { img: "/illustrations/pullup.jpg", video: "/videos/pullup.mp4" },
  muscleup: { img: "/illustrations/muscleup.jpg", video: "/videos/muscleup.mp4" },
  hstand: { img: "/illustrations/hstand.jpg", video: "/videos/hstand.mp4" },
  hspu: { img: "/illustrations/hstand.jpg", video: "/videos/hstand.mp4" },
  pike: { img: "/illustrations/hstand.jpg", video: "/videos/hstand.mp4" },
  planche: { img: "/illustrations/planche.jpg", video: "/videos/planche.mp4" },
  frontlev: { img: "/illustrations/flev.jpg", video: "/videos/flev.mp4" },
  flev: { img: "/illustrations/flev.jpg", video: "/videos/flev.mp4" },
  lsit: { img: "/illustrations/lsit.jpg", video: "/videos/lsit.mp4" },
  legraise: { img: "/illustrations/lsit.jpg", video: "/videos/lsit.mp4" },
  hollow: { img: "/illustrations/lsit.jpg", video: "/videos/lsit.mp4" },
  plank: { img: "/illustrations/pullup.jpg", video: "/videos/pushup.mp4" },
  squat: { img: "/illustrations/pistol.jpg", video: "/videos/squat.mp4" },
  squatbb: { img: "/illustrations/pistol.jpg", video: "/videos/squat.mp4" },
  bulg: { img: "/illustrations/pistol.jpg", video: "/videos/squat.mp4" },
  pistol: { img: "/illustrations/pistol.jpg", video: "/videos/squat.mp4" },
  default: { img: "/illustrations/pullup.jpg", video: "/videos/pushup.mp4" }
};

export default function WorkoutPlayer() {
  const { activeSession, setActiveSession, playBeep, addLog } = useFitness();

  const [stepIdx, setStepIdx] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [isDone, setIsDone] = useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const intervalRef = useRef(null);

  // Build steps from active session workout
  const steps = React.useMemo(() => {
    if (!activeSession) return [];
    const q = [{ p: "prep", t: 6, x: "Get Ready: " + activeSession.n, exId: activeSession.ex[0]?.x }];
    activeSession.ex.forEach((e, i) => {
      const exObj = EXDB.find((item) => item.id === e.x) || { n: e.x, id: e.x };
      for (let s = 1; s <= e.s; s++) {
        const last = i === activeSession.ex.length - 1 && s === e.s;
        q.push({
          p: "WORK",
          t: e.sec != null && typeof e.sec === "number" ? e.sec : 0,
          x: exObj.n,
          exId: e.x,
          rep: e.sec != null && typeof e.sec === "number" ? null : e.r,
          set: s,
          sets: e.s,
          ci: i,
          cues: exObj.cu || ["Maintain strict tempo", "Brace core tight"]
        });
        if (!last) {
          const nextEx = EXDB.find((item) => item.id === activeSession.ex[i + (s === e.s ? 1 : 0)]?.x) || { n: "", id: "" };
          q.push({
            p: "REST",
            t: e.rest || 45,
            x: s === e.s ? "Next Exercise: " + nextEx.n : "Rest & Recover",
            exId: s === e.s ? nextEx.id : e.x,
            nextName: nextEx.n,
            ci: i,
            rest: true
          });
        }
      }
    });
    q.push({ p: "DONE" });
    return q;
  }, [activeSession]);

  useEffect(() => {
    if (activeSession) {
      setStepIdx(0);
      setIsDone(false);
      setIsRunning(true);
      setShowQuitConfirm(false);
      setStartTime(Date.now());
      if (steps[0]) setTimer(steps[0].t || 0);
    }
  }, [activeSession, steps]);

  const currentStep = steps[stepIdx];
  const activeExId = currentStep?.exId || "pushup";
  const media = EXERCISE_MEDIA[activeExId] || EXERCISE_MEDIA.default;

  const advanceStep = () => {
    const nextIdx = stepIdx + 1;
    if (nextIdx >= steps.length || steps[nextIdx].p === "DONE") {
      finishWorkout();
    } else {
      setStepIdx(nextIdx);
      const st = steps[nextIdx];
      setTimer(st.t || 0);
      if (st.p === "WORK" && st.t > 0) playBeep(880, 0.25);
      if (st.p === "REST") playBeep(440, 0.25);
      if (st.p === "prep") playBeep(880, 0.2);
    }
  };

  const finishWorkout = () => {
    setIsDone(true);
    clearInterval(intervalRef.current);
    const mins = Math.max(1, Math.round((Date.now() - startTime) / 60000));
    addLog({
      d: new Date().toISOString().slice(0, 10),
      n: activeSession.n,
      cat: activeSession.cat,
      min: mins
    });
    playBeep(880, 0.12);
    setTimeout(() => playBeep(1200, 0.28), 200);
    setTimeout(() => {
      setActiveSession(null);
    }, 2500);
  };

  useEffect(() => {
    if (!activeSession || !isRunning || isDone || showQuitConfirm) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev > 0) {
          if (prev <= 4 && prev > 1) playBeep(660, 0.08);
          if (prev === 1) {
            advanceStep();
            return 0;
          }
          return prev - 1;
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(intervalRef.current);
  }, [activeSession, isRunning, stepIdx, isDone, showQuitConfirm]);

  if (!activeSession) return null;

  const manual = currentStep?.p === "WORK" && currentStep?.t === 0;

  return (
    <div id="sov" className="show">
      {/* Top Header */}
      <div className="shd">
        <div>
          <b className="bigt" style={{ fontSize: "17px" }}>{activeSession.n}</b>
          <div className="mut sm">{activeSession.tag}</div>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <button className="btn gh sm" onClick={() => setIsRunning(!isRunning)}>
            {isRunning ? "⏸ Pause" : "▶ Resume"}
          </button>
          <button className="btn gh sm" onClick={advanceStep}>
            ⏭ Skip
          </button>
          <button className="btn gh sm" onClick={() => setShowQuitConfirm(true)}>
            ✕
          </button>
        </div>
      </div>

      {/* Main Interactive Workout Arena with Real Artwork & Media Reference */}
      <div
        className="sbd"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(280px, 480px) 1fr",
          gap: "24px",
          alignItems: "center",
          maxWidth: "1000px",
          width: "100%",
          margin: "0 auto",
          padding: "16px 20px"
        }}
      >
        {/* Left Column: High-Res Artwork & Visual Reference Card */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "320px",
            background: "#000",
            borderRadius: "20px",
            overflow: "hidden",
            border: "2px solid var(--ln)",
            boxShadow: "0 14px 40px rgba(0, 0, 0, 0.7)"
          }}
        >
          <img
            src={media.img}
            alt={currentStep?.x}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
              filter: "contrast(115%) brightness(95%)"
            }}
          />

          {/* Dark gradient overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%)"
            }}
          />

          {/* Status Badge */}
          <div
            style={{
              position: "absolute",
              top: "14px",
              left: "14px",
              background: "rgba(11, 13, 16, 0.9)",
              backdropFilter: "blur(8px)",
              padding: "5px 12px",
              borderRadius: "8px",
              fontSize: "11px",
              color: currentStep?.p === "WORK" ? "var(--acc)" : "var(--ok)",
              fontWeight: "800",
              border: "1px solid var(--ln)",
              letterSpacing: "0.08em"
            }}
          >
            {currentStep?.p === "WORK" ? "⚡ ACTIVE EXERCISE" : "👀 NEXT MOVEMENT"}
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "14px",
              left: "14px",
              right: "14px",
              background: "rgba(11, 13, 16, 0.92)",
              backdropFilter: "blur(8px)",
              padding: "10px 14px",
              borderRadius: "12px",
              fontSize: "13px",
              border: "1px solid var(--ln)"
            }}
          >
            <b style={{ color: "#fff", display: "block", fontSize: "16px" }}>{currentStep?.x}</b>
            <span className="mut sm" style={{ fontSize: "12px" }}>
              {currentStep?.set ? `Set ${currentStep.set} of ${currentStep.sets}` : "Active rest phase"}
            </span>
          </div>
        </div>

        {/* Right Column: Dynamic Timer, Cues & Actions */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          {isDone ? (
            <>
              <div className="ph WORK" style={{ fontSize: "16px", color: "var(--ok)" }}>
                🔥 WORKOUT COMPLETED
              </div>
              <div className="clk" style={{ margin: "8px 0" }}>🏆</div>
              <div className="exn" style={{ fontSize: "24px" }}>{activeSession.n}</div>
              <div className="mut sm" style={{ marginTop: "6px" }}>Logged & Synced to Cloud ✔</div>
            </>
          ) : (
            <>
              <div className={`ph ${currentStep?.p === "WORK" ? "WORK" : currentStep?.p === "REST" ? "REST" : "prep"}`}>
                {currentStep?.p === "prep" ? "GET READY" : currentStep?.p}
              </div>

              {/* Large Clock / Rep Count */}
              <div className="clk" style={{ fontSize: manual ? "clamp(3rem, 10vw, 4.5rem)" : "clamp(4.5rem, 15vw, 6.5rem)", margin: "4px 0" }}>
                {manual ? `${currentStep?.rep} REPS` : timer}
              </div>

              <div className="exn" style={{ fontSize: "22px" }}>{currentStep?.x}</div>

              <div className="mut sm" style={{ marginTop: "4px" }}>
                {currentStep?.set
                  ? `Set ${currentStep.set} of ${currentStep.sets}`
                  : currentStep?.p === "REST"
                  ? "Breathe & recover for the next set"
                  : "Prepare your grip and position"}
              </div>

              {/* Form Cues Ticker */}
              {currentStep?.cues && (
                <div style={{ display: "flex", gap: "6px", marginTop: "14px", flexWrap: "wrap", justifyContent: "center" }}>
                  {currentStep.cues.slice(0, 2).map((c, i) => (
                    <span key={i} className="pill" style={{ borderColor: "var(--acc)", color: "var(--tx)", fontSize: "11.5px" }}>
                      ✔ {c}
                    </span>
                  ))}
                </div>
              )}

              {/* Complete Set Button for Rep-based sets */}
              {manual && (
                <div style={{ marginTop: "18px" }}>
                  <button
                    className="btn"
                    style={{ padding: "14px 28px", fontSize: "15px", boxShadow: "0 6px 20px rgba(255, 107, 44, 0.4)" }}
                    onClick={advanceStep}
                  >
                    ✔ COMPLETE SET
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Bottom Exercise Flow Bar */}
      <div className="chipsrow">
        {activeSession.ex.map((e, i) => {
          const exObj = EXDB.find((item) => item.id === e.x) || { n: e.x };
          const isCurrent = currentStep?.ci === i;
          const isCompleted = currentStep?.ci > i || isDone;
          return (
            <span
              key={i}
              className={`chip ${isCurrent ? "cur" : ""} ${isCompleted ? "done" : ""}`}
            >
              {exObj.n} ×{e.s}
            </span>
          );
        })}
      </div>

      {/* Custom Sleek In-App Quit Dialog (NO Native Browser Alerts!) */}
      {showQuitConfirm && (
        <div className="ov show" style={{ zIndex: 300 }} onClick={(e) => e.target === e.currentTarget && setShowQuitConfirm(false)}>
          <div className="sheet" style={{ maxWidth: "400px", textAlign: "center" }}>
            <h3 style={{ fontSize: "20px" }}>End Guided Session?</h3>
            <p className="mut sm" style={{ margin: "8px 0 20px" }}>
              Are you sure you want to quit? Unfinished workout progress will not be logged.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <button className="btn gh" onClick={() => setShowQuitConfirm(false)}>
                Continue Training
              </button>
              <button
                className="btn"
                style={{ background: "#ff4d4d" }}
                onClick={() => {
                  setShowQuitConfirm(false);
                  setActiveSession(null);
                }}
              >
                Quit Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
