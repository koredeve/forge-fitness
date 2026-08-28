"use client";
import React, { useState, useRef, useEffect } from "react";

// Local self-hosted 60FPS video loops with zero network latency
const LOCAL_VIDEOS = {
  pushup: "/videos/pushup.mp4",
  diamond: "/videos/pushup.mp4",
  pike: "/videos/hstand.mp4",
  dip: "/videos/dip.mp4",
  pullup: "/videos/pullup.mp4",
  chinup: "/videos/pullup.mp4",
  negpull: "/videos/pullup.mp4",
  exppull: "/videos/pullup.mp4",
  scap: "/videos/pullup.mp4",
  muscleup: "/videos/muscleup.mp4",
  hstand: "/videos/hstand.mp4",
  hspu: "/videos/hstand.mp4",
  planche: "/videos/planche.mp4",
  frontlev: "/videos/flev.mp4",
  flev: "/videos/flev.mp4",
  lsit: "/videos/lsit.mp4",
  legraise: "/videos/lsit.mp4",
  rollout: "/videos/lsit.mp4",
  hollow: "/videos/lsit.mp4",
  squat: "/videos/squat.mp4",
  squatbb: "/videos/squat.mp4",
  bulg: "/videos/squat.mp4",
  pistol: "/videos/squat.mp4",
  nordic: "/videos/squat.mp4",
  calf: "/videos/squat.mp4",
  bench: "/videos/dip.mp4",
  ohp: "/videos/hstand.mp4",
  dead: "/videos/squat.mp4",
  sprint: "/videos/squat.mp4",
  burpee: "/videos/pushup.mp4",
  kb: "/videos/squat.mp4",
  run: "/videos/squat.mp4",
  rope: "/videos/squat.mp4",
  shadow: "/videos/pushup.mp4",
  plank: "/videos/pushup.mp4",
  sidep: "/videos/pushup.mp4",
  wrist: "/videos/hstand.mp4",
  dloc: "/videos/pullup.mp4",
  dog: "/videos/hstand.mp4",
  default: "/videos/pullup.mp4"
};

const MUSCLE_MAPS = {
  pushup: { primary: ["Chest (Pectorals)", "Triceps"], secondary: ["Anterior Deltoids", "Core (Plank)"] },
  diamond: { primary: ["Inner Chest", "Triceps Lateral Head"], secondary: ["Anterior Deltoids", "Abs"] },
  dip: { primary: ["Lower Pectorals", "Triceps Brachii"], secondary: ["Front Deltoids", "Rhomboids"] },
  pullup: { primary: ["Lats (Latissimus Dorsi)", "Biceps"], secondary: ["Rear Delts", "Forearm Grip", "Rhomboids"] },
  chinup: { primary: ["Biceps Brachii", "Lats"], secondary: ["Forearms", "Core"] },
  muscleup: { primary: ["Lats & Upper Back", "Chest & Triceps"], secondary: ["Explosive Core", "Grip Strength", "Shoulders"] },
  planche: { primary: ["Anterior Deltoids", "Chest"], secondary: ["Biceps", "Scapular Protractor", "Lower Back"] },
  hstand: { primary: ["Shoulders (Deltoids)", "Trapezius"], secondary: ["Triceps", "Forearms", "Deep Core"] },
  flev: { primary: ["Lats", "Teres Major"], secondary: ["Deep Core", "Rear Delts", "Forearms"] },
  lsit: { primary: ["Abs (Rectus Abdominis)", "Hip Flexors"], secondary: ["Triceps", "Quadriceps", "Shoulders"] },
  squat: { primary: ["Quadriceps", "Gluteus Maximus"], secondary: ["Hamstrings", "Calves", "Core"] }
};

export default function ExerciseVideoPlayer({ exerciseId, exerciseName, category }) {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showOverlay, setShowOverlay] = useState(true);

  const videoSrc = LOCAL_VIDEOS[exerciseId] || LOCAL_VIDEOS.default;
  const muscleKey = MUSCLE_MAPS[exerciseId] ? exerciseId : "pushup";
  const muscles = MUSCLE_MAPS[muscleKey];

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.playbackRate = playbackRate;
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  }, [videoSrc]);

  const handlePlayPause = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSpeedChange = (speed) => {
    setPlaybackRate(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
      setDuration(videoRef.current.duration || 0);
    }
  };

  const handleSeek = (e) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
    }
  };

  return (
    <div style={{ marginTop: "14px", background: "var(--p)", border: "1px solid var(--ln)", borderRadius: "14px", padding: "16px" }}>
      {/* Header bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <b style={{ fontSize: "14px", color: "var(--acc)", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>🎬</span> HD Video Loop & Slow-Mo Analysis
          </b>
          <span className="mut sm" style={{ display: "block" }}>
            Instant local 60FPS video playback with frame-by-frame scrubbing.
          </span>
        </div>

        <button
          className={`btn sm ${showOverlay ? "" : "gh"}`}
          style={{ padding: "5px 10px", fontSize: "11px" }}
          onClick={() => setShowOverlay(!showOverlay)}
        >
          {showOverlay ? "📐 Hide Overlay" : "📐 Show Angle Gauge"}
        </button>
      </div>

      {/* Video Viewport */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "280px",
          background: "#000",
          borderRadius: "12px",
          overflow: "hidden",
          border: "1px solid var(--ln)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.5)"
        }}
      >
        <video
          ref={videoRef}
          src={videoSrc}
          loop
          muted
          autoPlay
          playsInline
          onTimeUpdate={handleTimeUpdate}
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />

        {/* Video HUD Overlays */}
        {showOverlay && (
          <>
            <div
              style={{
                position: "absolute",
                top: "14px",
                left: "14px",
                background: "rgba(11, 13, 16, 0.85)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255, 107, 44, 0.4)",
                borderRadius: "8px",
                padding: "6px 12px",
                fontSize: "12px",
                zIndex: 10
              }}
            >
              <span className="mut">Cadence Status: </span>
              <b style={{ color: "var(--ok)" }}>Full Rep Cycle</b>
            </div>

            <div
              style={{
                position: "absolute",
                top: "14px",
                right: "14px",
                background: "rgba(11, 13, 16, 0.85)",
                backdropFilter: "blur(8px)",
                border: "1px solid var(--ln)",
                borderRadius: "8px",
                padding: "6px 12px",
                fontSize: "11px",
                color: "var(--acc)",
                zIndex: 10
              }}
            >
              📐 Target Angle: <b>90° - 180°</b>
            </div>

            <div
              style={{
                position: "absolute",
                bottom: "55px",
                left: "14px",
                display: "flex",
                gap: "6px",
                flexWrap: "wrap",
                zIndex: 10
              }}
            >
              <span className="pill" style={{ background: "rgba(0,0,0,0.75)", borderColor: "var(--ok)", color: "#fff" }}>
                ✔ Zero Kip
              </span>
              <span className="pill" style={{ background: "rgba(0,0,0,0.75)", borderColor: "var(--ok)", color: "#fff" }}>
                ✔ Full Range
              </span>
              <span className="pill" style={{ background: "rgba(0,0,0,0.75)", borderColor: "var(--acc)", color: "#fff" }}>
                ⚡ Core Braced
              </span>
            </div>
          </>
        )}

        {/* Video Scrubber & Play Bar */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background: "linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.95) 100%)",
            padding: "12px 14px 10px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
            zIndex: 20
          }}
        >
          <input
            type="range"
            min="0"
            max={duration || 2}
            step="0.01"
            value={currentTime}
            onChange={handleSeek}
            style={{
              width: "100%",
              accentColor: "var(--acc)",
              height: "4px",
              cursor: "pointer"
            }}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <button
                className="btn sm"
                style={{ padding: "4px 10px", fontSize: "12px" }}
                onClick={handlePlayPause}
              >
                {isPlaying ? "⏸ Pause" : "▶ Play"}
              </button>

              <div style={{ display: "flex", gap: "4px", background: "rgba(23, 28, 35, 0.8)", padding: "2px", borderRadius: "8px" }}>
                {[0.25, 0.5, 1.0, 1.5].map((speed) => (
                  <button
                    key={speed}
                    onClick={() => handleSpeedChange(speed)}
                    style={{
                      padding: "3px 7px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: "700",
                      background: playbackRate === speed ? "var(--acc)" : "transparent",
                      color: playbackRate === speed ? "#fff" : "var(--mut)"
                    }}
                  >
                    {speed === 0.25 ? "0.25x (Slow-Mo)" : `${speed}x`}
                  </button>
                ))}
              </div>
            </div>

            <span className="mut sm" style={{ fontSize: "11px" }}>
              {currentTime.toFixed(1)}s / {duration ? duration.toFixed(1) : "2.0"}s
            </span>
          </div>
        </div>
      </div>

      {/* Target Muscle Anatomy Activation Panel */}
      <div style={{ marginTop: "14px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
        <div className="card" style={{ padding: "12px", background: "var(--p2)" }}>
          <b style={{ fontSize: "12px", color: "var(--acc)", display: "flex", alignItems: "center", gap: "4px" }}>
            <span>🔥</span> Primary Movers
          </b>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
            {muscles.primary.map((m, i) => (
              <span key={i} className="pill" style={{ borderColor: "var(--acc)", color: "var(--tx)", fontSize: "11px" }}>
                {m}
              </span>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: "12px", background: "var(--p2)" }}>
          <b style={{ fontSize: "12px", color: "var(--ok)", display: "flex", alignItems: "center", gap: "4px" }}>
            <span>⚡</span> Secondary Stabilizers
          </b>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "6px" }}>
            {muscles.secondary.map((m, i) => (
              <span key={i} className="pill" style={{ borderColor: "var(--ok)", color: "var(--tx)", fontSize: "11px" }}>
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
