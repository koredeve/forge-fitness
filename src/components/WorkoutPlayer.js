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
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [repsDone, setRepsDone] = useState(0);
  const [earnedXp, setEarnedXp] = useState(0);
  const [showXpBadge, setShowXpBadge] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const intervalRef = useRef(null);

  // Text-To-Speech Coach
  const speakVoice = (text) => {
    if (!soundEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.05;
      utter.pitch = 1.0;
      window.speechSynthesis.speak(utter);
    } catch (e) {
      // Speech fallback
    }
  };

  // Build steps from active session workout
  const steps = React.useMemo(() => {
    if (!activeSession) return [];
    const firstExObj = EXDB.find((item) => item.id === activeSession.ex[0]?.x) || { n: activeSession.ex[0]?.x || "Exercise" };
    const q = [
      {
        p: "prep",
        t: 5,
        x: firstExObj.n,
        exId: activeSession.ex[0]?.x,
        target: activeSession.ex[0]?.sec ? `${activeSession.ex[0].sec} Seconds` : `${activeSession.ex[0]?.r || 10} Reps`
      }
    ];

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
          cues: exObj.cu || ["Maintain strict tempo", "Brace core tight", "Full range of motion"]
        });
        if (!last) {
          const nextEx = EXDB.find((item) => item.id === activeSession.ex[i + (s === e.s ? 1 : 0)]?.x) || { n: "Next Exercise", id: "" };
          q.push({
            p: "REST",
            t: e.rest || 45,
            x: s === e.s ? nextEx.n : exObj.n,
            exId: s === e.s ? nextEx.id : e.x,
            nextName: nextEx.n,
            set: s === e.s ? 1 : s + 1,
            sets: s === e.s ? activeSession.ex[i + 1]?.s || 3 : e.s,
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
      setRepsDone(0);
      setEarnedXp(0);
      setStartTime(Date.now());
      if (steps[0]) {
        setTimer(steps[0].t || 0);
        speakVoice(`Get ready! First up: ${steps[0].x}. Target: ${steps[0].target}`);
      }
    }
  }, [activeSession, steps]);

  const currentStep = steps[stepIdx];
  const activeExId = currentStep?.exId || "pushup";
  const media = EXERCISE_MEDIA[activeExId] || EXERCISE_MEDIA.default;

  const triggerXpAnimation = () => {
    setEarnedXp((prev) => prev + 25);
    setShowXpBadge(true);
    setTimeout(() => setShowXpBadge(false), 1500);
  };

  const advanceStep = () => {
    const nextIdx = stepIdx + 1;
    setRepsDone(0);

    if (currentStep?.p === "WORK") {
      triggerXpAnimation();
    }

    if (nextIdx >= steps.length || steps[nextIdx].p === "DONE") {
      finishWorkout();
    } else {
      setStepIdx(nextIdx);
      const st = steps[nextIdx];
      setTimer(st.t || 0);

      if (st.p === "WORK") {
        playBeep(880, 0.25);
        if (st.rep) {
          speakVoice(`Set ${st.set}: Do ${st.rep} ${st.x}. Go!`);
        } else {
          speakVoice(`Set ${st.set}: Hold ${st.x} for ${st.t} seconds. Start!`);
        }
      } else if (st.p === "REST") {
        playBeep(520, 0.25);
        speakVoice(`Good job! Rest for ${st.t} seconds.`);
      }
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
    playBeep(880, 0.15);
    setTimeout(() => playBeep(1200, 0.35), 220);
    speakVoice(`Workout completed! Incredible effort! You earned ${earnedXp + 50} XP.`);
    setTimeout(() => {
      setActiveSession(null);
    }, 3200);
  };

  useEffect(() => {
    if (!activeSession || !isRunning || isDone || showQuitConfirm) {
      clearInterval(intervalRef.current);
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev > 0) {
          if (prev <= 3 && prev >= 1) {
            playBeep(700, 0.08);
          }
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

  const isManualRep = currentStep?.p === "WORK" && currentStep?.t === 0;
  const isPrep = currentStep?.p === "prep";
  const isRest = currentStep?.p === "REST";
  const isWork = currentStep?.p === "WORK";

  return (
    <div id="sov" className="show">
      {/* Top Header Bar */}
      <div className="shd" style={{ background: "rgba(11, 13, 16, 0.95)", backdropFilter: "blur(12px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="pill" style={{ borderColor: "var(--acc)", color: "var(--acc)", fontSize: "10px" }}>
            🔥 LIVE COACH
          </span>
          <div>
            <b className="bigt" style={{ fontSize: "16px" }}>{activeSession.n}</b>
            <div className="mut sm" style={{ fontSize: "11px" }}>{activeSession.tag}</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <button
            className="btn gh sm"
            style={{ padding: "6px 10px", fontSize: "12px" }}
            onClick={() => setSoundEnabled(!soundEnabled)}
            title="Toggle Voice & Sound"
          >
            {soundEnabled ? "🔊 Voice On" : "🔇 Muted"}
          </button>
          <button
            className="btn gh sm"
            style={{ padding: "6px 10px", fontSize: "12px" }}
            onClick={() => setIsRunning(!isRunning)}
          >
            {isRunning ? "⏸ Pause" : "▶ Resume"}
          </button>
          <button
            className="btn gh sm"
            style={{ padding: "6px 10px", fontSize: "12px" }}
            onClick={advanceStep}
          >
            ⏭ Skip
          </button>
          <button
            className="btn gh sm"
            style={{ padding: "6px 10px", fontSize: "14px" }}
            onClick={() => setShowQuitConfirm(true)}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Floating XP Reward Badge */}
      {showXpBadge && (
        <div
          style={{
            position: "fixed",
            top: "70px",
            right: "24px",
            background: "linear-gradient(135deg, #ff6b2c 0%, #ff944d 100%)",
            color: "#fff",
            padding: "8px 16px",
            borderRadius: "99px",
            fontWeight: "900",
            fontSize: "14px",
            boxShadow: "0 8px 24px rgba(255, 107, 44, 0.6)",
            zIndex: 1100,
            animation: "up 0.25s ease-out"
          }}
        >
          ⭐ +25 XP EARNED!
        </div>
      )}

      {/* Main Action HUD & Visual Stage */}
      <div
        className="sbd"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(280px, 440px) 1fr",
          gap: "24px",
          alignItems: "center",
          maxWidth: "1050px",
          width: "100%",
          margin: "0 auto",
          padding: "16px 20px"
        }}
      >
        {/* Left: HD Video & Picture Reference */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "330px",
            background: "#000",
            borderRadius: "20px",
            overflow: "hidden",
            border: isWork ? "2px solid var(--acc)" : isRest ? "2px solid var(--ok)" : "2px solid var(--warn)",
            boxShadow: isWork ? "0 16px 48px rgba(255, 107, 44, 0.3)" : "0 14px 40px rgba(0, 0, 0, 0.7)"
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
              filter: "contrast(115%) brightness(92%)"
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.88) 100%)"
            }}
          />

          {/* Phase Badge */}
          <div
            style={{
              position: "absolute",
              top: "14px",
              left: "14px",
              background: isWork ? "var(--acc)" : isRest ? "var(--ok)" : "var(--warn)",
              color: "#000",
              padding: "6px 14px",
              borderRadius: "99px",
              fontSize: "11.5px",
              fontWeight: "900",
              letterSpacing: "0.08em",
              boxShadow: "0 4px 14px rgba(0,0,0,0.4)"
            }}
          >
            {isPrep ? "🟡 GET READY PHASE" : isWork ? "🔥 ACTIVE WORKOUT" : "🟢 REST & RECOVERY"}
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "14px",
              left: "14px",
              right: "14px",
              background: "rgba(11, 13, 16, 0.94)",
              backdropFilter: "blur(10px)",
              padding: "12px 16px",
              borderRadius: "14px",
              border: "1px solid var(--ln)"
            }}
          >
            <span className="cali-acc" style={{ fontSize: "10.5px" }}>
              {isRest ? "UP NEXT" : "CURRENT EXERCISE"}
            </span>
            <b style={{ color: "#fff", display: "block", fontSize: "18px", margin: "2px 0" }}>
              {currentStep?.x}
            </b>
            <span className="mut sm" style={{ fontSize: "12px" }}>
              {currentStep?.set ? `Set ${currentStep.set} of ${currentStep.sets}` : "Prepare your space"}
            </span>
          </div>
        </div>

        {/* Right: Unmissable Action Box & Live Controls */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "100%" }}>
          {isDone ? (
            <div style={{ textAlign: "center", padding: "20px" }}>
              <div style={{ fontSize: "64px" }}>🏆</div>
              <h2 style={{ fontSize: "28px", color: "var(--ok)", margin: "10px 0 4px" }}>
                Workout Crushed!
              </h2>
              <p className="mut sm" style={{ fontSize: "14px" }}>
                Great hustle! Total session saved and streak updated in the cloud.
              </p>
              <div style={{ marginTop: "16px", fontSize: "18px", fontWeight: "800", color: "var(--acc)" }}>
                ⭐ +{earnedXp + 50} XP Earned!
              </div>
            </div>
          ) : isPrep ? (
            /* 10-Year-Old Simple: Prep Screen */
            <div
              style={{
                width: "100%",
                background: "rgba(255, 211, 77, 0.08)",
                border: "2px solid var(--warn)",
                borderRadius: "20px",
                padding: "24px",
                textAlign: "center"
              }}
            >
              <span className="pill" style={{ borderColor: "var(--warn)", color: "var(--warn)", marginBottom: "8px" }}>
                ⏳ PREPARE YOUR POSITION
              </span>
              <h3 style={{ fontSize: "22px", margin: "8px 0" }}>
                Starting in:
              </h3>
              <div className="clk" style={{ color: "var(--warn)", fontSize: "72px", margin: "4px 0" }}>
                {timer}
              </div>
              <p style={{ fontSize: "15px", color: "var(--tx)", fontWeight: "600" }}>
                🎯 Target: <span style={{ color: "var(--acc)" }}>{currentStep?.target}</span> of {currentStep?.x}
              </p>
              <button
                className="btn"
                style={{ marginTop: "16px", padding: "10px 20px", fontSize: "13px" }}
                onClick={advanceStep}
              >
                ▶ Start Right Now
              </button>
            </div>
          ) : isWork ? (
            /* 10-Year-Old Simple: Active Workout Action HUD */
            <div
              style={{
                width: "100%",
                background: "linear-gradient(180deg, #1d1612 0%, #12161b 100%)",
                border: "2px solid var(--acc)",
                borderRadius: "20px",
                padding: "22px",
                textAlign: "center",
                boxShadow: "0 14px 44px rgba(255, 107, 44, 0.25)"
              }}
            >
              <span
                style={{
                  background: "var(--acc)",
                  color: "#000",
                  padding: "4px 12px",
                  borderRadius: "99px",
                  fontSize: "11px",
                  fontWeight: "900",
                  letterSpacing: "0.1em"
                }}
              >
                👉 DO THIS NOW
              </span>

              {/* Huge Action Title */}
              <div style={{ margin: "12px 0 6px" }}>
                {isManualRep ? (
                  <>
                    <h2 style={{ fontSize: "clamp(28px, 6vw, 42px)", fontWeight: "900", color: "#fff", margin: 0 }}>
                      PERFORM {currentStep?.rep} REPS
                    </h2>
                    <span className="mut sm" style={{ fontSize: "13px" }}>
                      Set {currentStep?.set} of {currentStep?.sets} · Count each rep cleanly
                    </span>
                  </>
                ) : (
                  <>
                    <h2 style={{ fontSize: "clamp(28px, 6vw, 38px)", fontWeight: "900", color: "#fff", margin: 0 }}>
                      HOLD POSITION
                    </h2>
                    <div className="clk" style={{ color: "var(--acc)", fontSize: "64px", margin: "4px 0" }}>
                      {timer}s
                    </div>
                  </>
                )}
              </div>

              {/* 3 Clear Form Checklist Pointers */}
              <div
                style={{
                  textAlign: "left",
                  background: "rgba(11, 13, 16, 0.85)",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  margin: "14px 0 18px",
                  border: "1px solid var(--ln)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px"
                }}
              >
                {currentStep?.cues?.slice(0, 3).map((cue, idx) => (
                  <div key={idx} style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "13px" }}>
                    <span style={{ color: "var(--ok)", fontWeight: "bold" }}>✔</span>
                    <span style={{ color: "var(--tx)" }}>{cue}</span>
                  </div>
                ))}
              </div>

              {/* One-Tap Big Green Action Button */}
              {isManualRep ? (
                <button
                  className="btn"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: "16px 24px",
                    fontSize: "16px",
                    fontWeight: "900",
                    background: "linear-gradient(135deg, #3ed598 0%, #20b275 100%)",
                    color: "#0b0d10",
                    boxShadow: "0 8px 28px rgba(62, 213, 152, 0.45)"
                  }}
                  onClick={advanceStep}
                >
                  ✅ I FINISHED MY {currentStep?.rep} REPS → REST
                </button>
              ) : (
                <button
                  className="btn gh"
                  style={{ width: "100%", justifyContent: "center", padding: "12px" }}
                  onClick={advanceStep}
                >
                  ⏭ Finish Early & Rest
                </button>
              )}
            </div>
          ) : (
            /* 10-Year-Old Simple: Rest & Recover Phase */
            <div
              style={{
                width: "100%",
                background: "rgba(62, 213, 152, 0.08)",
                border: "2px solid var(--ok)",
                borderRadius: "20px",
                padding: "24px",
                textAlign: "center"
              }}
            >
              <span className="pill" style={{ borderColor: "var(--ok)", color: "var(--ok)", marginBottom: "8px" }}>
                ☕ REST & BREATHE
              </span>
              <h3 style={{ fontSize: "20px", margin: "6px 0 2px" }}>
                Rest Countdown
              </h3>
              <div className="clk" style={{ color: "var(--ok)", fontSize: "68px", margin: "4px 0" }}>
                {timer}s
              </div>
              <p className="mut sm" style={{ marginBottom: "16px" }}>
                Take deep breaths. Up next: <b>{currentStep?.x}</b> (Set {currentStep?.set} of {currentStep?.sets}).
              </p>
              <button
                className="btn"
                style={{ width: "100%", justifyContent: "center", padding: "12px 20px" }}
                onClick={advanceStep}
              >
                ⚡ Skip Rest & Start Next Move →
              </button>
            </div>
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

      {/* In-App Quit Dialog */}
      {showQuitConfirm && (
        <div className="ov show" style={{ zIndex: 1200 }} onClick={(e) => e.target === e.currentTarget && setShowQuitConfirm(false)}>
          <div className="sheet" style={{ maxWidth: "380px", textAlign: "center" }}>
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
