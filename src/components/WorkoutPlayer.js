"use client";
import React, { useState, useEffect, useRef } from "react";
import { useFitness } from "@/context/FitnessContext";
import { EXDB } from "@/data/db";

// Video and image media definitions
const EXERCISE_MEDIA = {
  pushup: { img: "/illustrations/pullup.jpg", video: "/videos/pushup.mp4" },
  diamond: { img: "/illustrations/pullup.jpg", video: "/videos/diamond.mp4" },
  dip: { img: "/illustrations/pullup.jpg", video: "/videos/dip.mp4" },
  pullup: { img: "/illustrations/pullup.jpg", video: "/videos/pullup.mp4" },
  chinup: { img: "/illustrations/pullup.jpg", video: "/videos/chinup.mp4" },
  negpull: { img: "/illustrations/pullup.jpg", video: "/videos/pullup.mp4" },
  exppull: { img: "/illustrations/pullup.jpg", video: "/videos/pullup.mp4" },
  scap: { img: "/illustrations/pullup.jpg", video: "/videos/scap.mp4" },
  row: { img: "/illustrations/pullup.jpg", video: "/videos/row.mp4" },
  muscleup: { img: "/illustrations/muscleup.jpg", video: "/videos/muscleup.mp4" },
  hstand: { img: "/illustrations/hstand.jpg", video: "/videos/hstand.mp4" },
  hspu: { img: "/illustrations/hstand.jpg", video: "/videos/hstand.mp4" },
  pike: { img: "/illustrations/hstand.jpg", video: "/videos/pike.mp4" },
  planche: { img: "/illustrations/planche.jpg", video: "/videos/planche.mp4" },
  frontlev: { img: "/illustrations/flev.jpg", video: "/videos/flev.mp4" },
  flev: { img: "/illustrations/flev.jpg", video: "/videos/flev.mp4" },
  lsit: { img: "/illustrations/lsit.jpg", video: "/videos/lsit.mp4" },
  legraise: { img: "/illustrations/lsit.jpg", video: "/videos/legraise.mp4" },
  rollout: { img: "/illustrations/lsit.jpg", video: "/videos/rollout.mp4" },
  hollow: { img: "/illustrations/lsit.jpg", video: "/videos/hollow.mp4" },
  plank: { img: "/illustrations/pullup.jpg", video: "/videos/plank.mp4" },
  sidep: { img: "/illustrations/pullup.jpg", video: "/videos/sidep.mp4" },
  squat: { img: "/illustrations/pistol.jpg", video: "/videos/squat.mp4" },
  squatbb: { img: "/illustrations/pistol.jpg", video: "/videos/squat.mp4" },
  bulg: { img: "/illustrations/pistol.jpg", video: "/videos/bulg.mp4" },
  pistol: { img: "/illustrations/pistol.jpg", video: "/videos/pistol.mp4" },
  calf: { img: "/illustrations/pistol.jpg", video: "/videos/calf.mp4" },
  bench: { img: "/illustrations/pullup.jpg", video: "/videos/bench.mp4" },
  ohp: { img: "/illustrations/hstand.jpg", video: "/videos/ohp.mp4" },
  dead: { img: "/illustrations/pistol.jpg", video: "/videos/dead.mp4" },
  burpee: { img: "/illustrations/pullup.jpg", video: "/videos/burpee.mp4" },
  rope: { img: "/illustrations/pistol.jpg", video: "/videos/rope.mp4" },
  kb: { img: "/illustrations/pistol.jpg", video: "/videos/kb.mp4" },
  wrist: { img: "/illustrations/hstand.jpg", video: "/videos/wrist.mp4" },
  dloc: { img: "/illustrations/pullup.jpg", video: "/videos/dloc.mp4" },
  dog: { img: "/illustrations/hstand.jpg", video: "/videos/dog.mp4" },
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
  const [viewMode, setViewMode] = useState("video"); // 'video' | 'artwork'
  const [earnedXp, setEarnedXp] = useState(0);
  const [showXpBadge, setShowXpBadge] = useState(false);
  const [startTime, setStartTime] = useState(Date.now());
  const intervalRef = useRef(null);
  const videoRef = useRef(null);

  // Clear, natural, audible voice coach (rate: 0.88, loud and distinct)
  const speakVoice = (text) => {
    if (!soundEnabled || typeof window === "undefined" || !("speechSynthesis" in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.88; // Slower, clear, and perfectly audible
      utter.pitch = 1.0;
      utter.volume = 1.0;
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
      setEarnedXp(0);
      setStartTime(Date.now());
      if (steps[0]) {
        setTimer(steps[0].t || 0);
        speakVoice(`Get ready. First exercise is ${steps[0].x}. Target: ${steps[0].target}.`);
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
          speakVoice(`Set ${st.set}. Do ${st.rep} reps of ${st.x}. Tap the green button when finished.`);
        } else {
          speakVoice(`Set ${st.set}. Hold ${st.x} for ${st.t} seconds.`);
        }
      } else if (st.p === "REST") {
        playBeep(520, 0.25);
        speakVoice(`Set complete! Take a rest for ${st.t} seconds.`);
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
    speakVoice(`Congratulations! Workout complete! You earned ${earnedXp + 50} experience points.`);
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
  const targetReps = currentStep?.rep || 15;

  return (
    <div id="sov" className="show">
      {/* Top Header Bar */}
      <div className="shd" style={{ background: "rgba(11, 13, 16, 0.96)", backdropFilter: "blur(14px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="pill" style={{ borderColor: "var(--acc)", color: "var(--acc)", fontSize: "10px", fontWeight: "900" }}>
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
            style={{ padding: "6px 10px", fontSize: "12px", background: soundEnabled ? "rgba(255, 107, 44, 0.15)" : undefined, borderColor: soundEnabled ? "var(--acc)" : undefined }}
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

      {/* Main Action Arena */}
      <div
        className="sbd"
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(300px, 460px) 1fr",
          gap: "24px",
          alignItems: "center",
          maxWidth: "1050px",
          width: "100%",
          margin: "0 auto",
          padding: "16px 20px"
        }}
      >
        {/* Left: Real Looping Video Motion Guide / Artwork */}
        <div
          style={{
            position: "relative",
            width: "100%",
            height: "350px",
            background: "#000",
            borderRadius: "20px",
            overflow: "hidden",
            border: isWork ? "2px solid var(--acc)" : isRest ? "2px solid var(--ok)" : "2px solid var(--warn)",
            boxShadow: isWork ? "0 16px 48px rgba(255, 107, 44, 0.35)" : "0 14px 40px rgba(0, 0, 0, 0.7)"
          }}
        >
          {viewMode === "video" && media.video ? (
            <video
              ref={videoRef}
              src={media.video}
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block"
              }}
            />
          ) : (
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
          )}

          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.85) 100%)",
              pointerEvents: "none"
            }}
          />

          {/* Top Controls on Video */}
          <div
            style={{
              position: "absolute",
              top: "12px",
              left: "12px",
              right: "12px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <span
              style={{
                background: isWork ? "var(--acc)" : isRest ? "var(--ok)" : "var(--warn)",
                color: "#000",
                padding: "4px 12px",
                borderRadius: "99px",
                fontSize: "10.5px",
                fontWeight: "900",
                letterSpacing: "0.08em"
              }}
            >
              {isPrep ? "🟡 GET READY" : isWork ? "🔥 WATCH & PERFORM" : "🟢 RESTING"}
            </span>

            <div style={{ display: "flex", gap: "4px", background: "rgba(0,0,0,0.7)", padding: "3px", borderRadius: "8px", backdropFilter: "blur(6px)" }}>
              <button
                className={`btn sm ${viewMode === "video" ? "" : "gh"}`}
                style={{ padding: "3px 8px", fontSize: "10px" }}
                onClick={() => setViewMode("video")}
              >
                🎬 Video Demo
              </button>
              <button
                className={`btn sm ${viewMode === "artwork" ? "" : "gh"}`}
                style={{ padding: "3px 8px", fontSize: "10px" }}
                onClick={() => setViewMode("artwork")}
              >
                🎨 Artwork
              </button>
            </div>
          </div>

          <div
            style={{
              position: "absolute",
              bottom: "12px",
              left: "12px",
              right: "12px",
              background: "rgba(11, 13, 16, 0.94)",
              backdropFilter: "blur(10px)",
              padding: "10px 14px",
              borderRadius: "12px",
              border: "1px solid var(--ln)"
            }}
          >
            <span className="cali-acc" style={{ fontSize: "10px" }}>
              {isRest ? "UP NEXT" : "CURRENT EXERCISE"}
            </span>
            <b style={{ color: "#fff", display: "block", fontSize: "17px", margin: "1px 0" }}>
              {currentStep?.x}
            </b>
            <span className="mut sm" style={{ fontSize: "11.5px" }}>
              {currentStep?.set ? `Set ${currentStep.set} of ${currentStep.sets}` : "Prepare your space"}
            </span>
          </div>
        </div>

        {/* Right: Step-by-Step Instructions & Clean Action */}
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
            /* Prep Screen */
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
                ⏳ PREPARE YOUR BODY
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
            /* Active Workout HUD: Clean, Clear & Frictionless */
            <div
              style={{
                width: "100%",
                background: "linear-gradient(180deg, #1d1612 0%, #12161b 100%)",
                border: "2px solid var(--acc)",
                borderRadius: "20px",
                padding: "26px 22px",
                textAlign: "center",
                boxShadow: "0 14px 44px rgba(255, 107, 44, 0.25)"
              }}
            >
              {/* Huge Action Title */}
              <div style={{ margin: "4px 0 14px" }}>
                {isManualRep ? (
                  <>
                    <h2 style={{ fontSize: "clamp(30px, 6vw, 44px)", fontWeight: "900", color: "#fff", margin: 0 }}>
                      DO {targetReps} REPS NOW
                    </h2>
                    <span className="mut sm" style={{ fontSize: "13px", display: "block", marginTop: "4px" }}>
                      Set {currentStep?.set} of {currentStep?.sets} · Follow the video demo on the left
                    </span>
                  </>
                ) : (
                  <>
                    <h2 style={{ fontSize: "clamp(28px, 6vw, 38px)", fontWeight: "900", color: "#fff", margin: 0 }}>
                      HOLD POSITION
                    </h2>
                    <div className="clk" style={{ color: "var(--acc)", fontSize: "64px", margin: "2px 0" }}>
                      {timer}s
                    </div>
                  </>
                )}
              </div>

              {/* 3 Form Cues */}
              <div
                style={{
                  textAlign: "left",
                  background: "rgba(11, 13, 16, 0.85)",
                  padding: "14px 18px",
                  borderRadius: "12px",
                  margin: "12px 0 20px",
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

              {/* Single Big Green Finish Button */}
              {isManualRep ? (
                <button
                  className="btn"
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: "18px 24px",
                    fontSize: "17px",
                    fontWeight: "900",
                    background: "linear-gradient(135deg, #3ed598 0%, #20b275 100%)",
                    color: "#0b0d10",
                    boxShadow: "0 8px 28px rgba(62, 213, 152, 0.45)"
                  }}
                  onClick={advanceStep}
                >
                  ✅ I FINISHED MY {targetReps} REPS → START REST
                </button>
              ) : (
                <button
                  className="btn gh"
                  style={{ width: "100%", justifyContent: "center", padding: "14px" }}
                  onClick={advanceStep}
                >
                  ⏭ Finish Hold Early & Rest
                </button>
              )}
            </div>
          ) : (
            /* Rest Phase */
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
                ☕ REST & RECOVER
              </span>
              <h3 style={{ fontSize: "20px", margin: "6px 0 2px" }}>
                Take Deep Breaths
              </h3>
              <div className="clk" style={{ color: "var(--ok)", fontSize: "68px", margin: "4px 0" }}>
                {timer}s
              </div>
              <p className="mut sm" style={{ marginBottom: "16px" }}>
                Get ready for next set: <b>{currentStep?.x}</b> (Set {currentStep?.set} of {currentStep?.sets}).
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
