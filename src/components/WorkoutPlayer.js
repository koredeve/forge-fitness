"use client";
import React, { useState, useEffect, useRef } from "react";
import { useFitness } from "@/context/FitnessContext";
import { EXDB } from "@/data/db";

// Video and artwork mapping for all exercises
const EXERCISE_MEDIA = {
  pushup: { video: "/videos/pushup.mp4", img: "/illustrations/pullup.jpg" },
  diamond: { video: "/videos/pushup.mp4", img: "/illustrations/pullup.jpg" },
  dip: { video: "/videos/dip.mp4", img: "/illustrations/pullup.jpg" },
  pullup: { video: "/videos/pullup.mp4", img: "/illustrations/pullup.jpg" },
  chinup: { video: "/videos/pullup.mp4", img: "/illustrations/pullup.jpg" },
  negpull: { video: "/videos/pullup.mp4", img: "/illustrations/pullup.jpg" },
  exppull: { video: "/videos/pullup.mp4", img: "/illustrations/pullup.jpg" },
  scap: { video: "/videos/pullup.mp4", img: "/illustrations/pullup.jpg" },
  muscleup: { video: "/videos/muscleup.mp4", img: "/illustrations/muscleup.jpg" },
  hstand: { video: "/videos/hstand.mp4", img: "/illustrations/hstand.jpg" },
  hspu: { video: "/videos/hstand.mp4", img: "/illustrations/hstand.jpg" },
  pike: { video: "/videos/hstand.mp4", img: "/illustrations/hstand.jpg" },
  planche: { video: "/videos/planche.mp4", img: "/illustrations/planche.jpg" },
  frontlev: { video: "/videos/flev.mp4", img: "/illustrations/flev.jpg" },
  flev: { video: "/videos/flev.mp4", img: "/illustrations/flev.jpg" },
  lsit: { video: "/videos/lsit.mp4", img: "/illustrations/lsit.jpg" },
  legraise: { video: "/videos/lsit.mp4", img: "/illustrations/lsit.jpg" },
  hollow: { video: "/videos/lsit.mp4", img: "/illustrations/lsit.jpg" },
  plank: { video: "/videos/pushup.mp4", img: "/illustrations/pullup.jpg" },
  squat: { video: "/videos/squat.mp4", img: "/illustrations/pistol.jpg" },
  squatbb: { video: "/videos/squat.mp4", img: "/illustrations/pistol.jpg" },
  bulg: { video: "/videos/squat.mp4", img: "/illustrations/pistol.jpg" },
  pistol: { video: "/videos/squat.mp4", img: "/illustrations/pistol.jpg" },
  default: { video: "/videos/pushup.mp4", img: "/illustrations/pullup.jpg" }
};

export default function WorkoutPlayer() {
  const { activeSession, setActiveSession, playBeep, addLog } = useFitness();

  const [stepIdx, setStepIdx] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(true);
  const [isDone, setIsDone] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const intervalRef = useRef(null);
  const videoRef = useRef(null);

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
      setStartTime(Date.now());
      if (steps[0]) setTimer(steps[0].t || 0);
    }
  }, [activeSession, steps]);

  const currentStep = steps[stepIdx];
  const activeExId = currentStep?.exId || "pushup";
  const media = EXERCISE_MEDIA[activeExId] || EXERCISE_MEDIA.default;

  // Auto-reload video on step change
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [activeExId, stepIdx]);

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
    if (!activeSession || !isRunning || isDone) {
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
  }, [activeSession, isRunning, stepIdx, isDone]);

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
          <button
            className="btn gh sm"
            onClick={() => {
              if (confirm("Quit guided session? Progress will not be saved.")) {
                setActiveSession(null);
              }
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Interactive Workout Arena with Real Video Reference */}
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
        {/* Left Column: Real HD Video / Visual Reference Card */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "300px",
            background: "#000",
            borderRadius: "18px",
            overflow: "hidden",
            border: "2px solid var(--ln)",
            boxShadow: "0 12px 36px rgba(0, 0, 0, 0.6)"
          }}
        >
          <video
            ref={videoRef}
            src={media.video}
            loop
            muted
            autoPlay
            playsInline
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />

          {/* Overlay Status Badge */}
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              background: "rgba(11, 13, 16, 0.85)",
              backdropFilter: "blur(6px)",
              padding: "4px 10px",
              borderRadius: "8px",
              fontSize: "11px",
              color: currentStep?.p === "WORK" ? "var(--acc)" : "var(--ok)",
              fontWeight: "700",
              border: "1px solid var(--ln)"
            }}
          >
            {currentStep?.p === "WORK" ? "⚡ ACTIVE FORM GUIDE" : "👀 UPCOMING MOVEMENT"}
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "12px",
              left: "12px",
              right: "12px",
              background: "rgba(11, 13, 16, 0.88)",
              backdropFilter: "blur(6px)",
              padding: "8px 12px",
              borderRadius: "10px",
              fontSize: "12px",
              border: "1px solid var(--ln)"
            }}
          >
            <b style={{ color: "#fff", display: "block" }}>{currentStep?.x}</b>
            <span className="mut sm" style={{ fontSize: "11px" }}>
              {currentStep?.set ? `Set ${currentStep.set} of ${currentStep.sets}` : "Recovery interval"}
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
                <div style={{ display: "flex", gap: "6px", marginTop: "12px", flexWrap: "wrap", justifyContent: "center" }}>
                  {currentStep.cues.slice(0, 2).map((c, i) => (
                    <span key={i} className="pill" style={{ borderColor: "var(--acc)", color: "var(--tx)", fontSize: "11px" }}>
                      ✔ {c}
                    </span>
                  ))}
                </div>
              )}

              {/* Complete Set Button for Rep-based sets */}
              {manual && (
                <div style={{ marginTop: "16px" }}>
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
    </div>
  );
}
