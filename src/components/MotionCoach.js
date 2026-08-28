"use client";
import React, { useEffect, useRef, useState } from "react";

// Individual Biomechanical joint animations for ALL exercise types
const ANIM_CONFIGS = {
  // 1. PUSH-UP
  pushup: {
    name: "Push-Up",
    phases: ["Descend (3s)", "Chest to Floor (1s)", "Drive Up (1s)", "Full Lockout"],
    cadence: "3-1-1-0",
    checkpoints: [
      { name: "Scapula", desc: "Protracted at top" },
      { name: "Elbows", desc: "45° Arrow Shape" },
      { name: "Core", desc: "Rigid Plank Line" }
    ],
    draw: (ctx, t, w, h) => {
      const cx = w / 2;
      const cy = h / 2 + 15;
      const depth = Math.sin(t * Math.PI) * 45; // 0..45

      const headX = cx + 75;
      const headY = cy - 25 + depth;
      const shoulderX = cx + 50;
      const shoulderY = cy - 10 + depth;
      const elbowX = cx + 50 + (depth > 20 ? 25 : 10);
      const elbowY = cy + 15 + depth * 0.4;
      const handX = cx + 50;
      const handY = cy + 45;

      const hipX = cx - 25;
      const hipY = cy - 10 + depth * 0.8;
      const kneeX = cx - 85;
      const kneeY = cy + 15;
      const feetX = cx - 135;
      const feetY = cy + 45;

      // Floor
      ctx.strokeStyle = "#232a33";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 160, cy + 45);
      ctx.lineTo(cx + 120, cy + 45);
      ctx.stroke();

      // Body Line
      ctx.strokeStyle = "#3ed598";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(feetX, feetY);
      ctx.lineTo(kneeX, kneeY);
      ctx.lineTo(hipX, hipY);
      ctx.lineTo(shoulderX, shoulderY);
      ctx.lineTo(headX, headY);
      ctx.stroke();

      // Arm Line
      ctx.strokeStyle = "#ff6b2c";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(shoulderX, shoulderY);
      ctx.lineTo(elbowX, elbowY);
      ctx.lineTo(handX, handY);
      ctx.stroke();

      // Head
      ctx.fillStyle = "#e9edf1";
      ctx.beginPath();
      ctx.arc(headX + 10, headY - 5, 12, 0, Math.PI * 2);
      ctx.fill();

      // Angle indicator
      ctx.fillStyle = "#ffb38a";
      ctx.font = "10px Inter";
      ctx.fillText(depth > 25 ? "Elbow 90°" : "Lockout 180°", elbowX + 8, elbowY - 6);
    }
  },

  // 2. PARALLEL BAR DIP (Distinct between two vertical bars!)
  dip: {
    name: "Parallel Bar Dip",
    phases: ["Lower Body (3s)", "Bottom 90° (1s)", "Press Up (1s)", "Top Lockout"],
    cadence: "3-1-1-0",
    checkpoints: [
      { name: "Torso", desc: "Slight Forward Lean" },
      { name: "Elbows", desc: "90° at Bottom" },
      { name: "Shoulders", desc: "Depressed & Away" }
    ],
    draw: (ctx, t, w, h) => {
      const cx = w / 2;
      const cy = h / 2 - 10;
      const drop = Math.sin(t * Math.PI) * 45; // 0..45 downward drop

      const barLeftX = cx - 45;
      const barRightX = cx + 45;
      const barY = cy + 15;

      // Draw Parallel Bars
      ctx.strokeStyle = "#8a939d";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      // Left bar & post
      ctx.beginPath();
      ctx.moveTo(barLeftX - 20, barY);
      ctx.lineTo(barLeftX + 20, barY);
      ctx.moveTo(barLeftX, barY);
      ctx.lineTo(barLeftX, cy + 90);
      // Right bar & post
      ctx.moveTo(barRightX - 20, barY);
      ctx.lineTo(barRightX + 20, barY);
      ctx.moveTo(barRightX, barY);
      ctx.lineTo(barRightX, cy + 90);
      ctx.stroke();

      const headX = cx + 8;
      const headY = cy - 40 + drop;
      const shoulderX = cx + 5;
      const shoulderY = cy - 20 + drop;
      const elbowLeftX = barLeftX - (drop > 20 ? 18 : 5);
      const elbowRightX = barRightX + (drop > 20 ? 18 : 5);
      const elbowY = shoulderY + (drop > 20 ? 10 : 25);
      const hipX = cx - 8;
      const hipY = shoulderY + 50;
      const kneeX = cx - 22;
      const kneeY = hipY + 35;
      const feetX = cx - 25;
      const feetY = kneeY + 25;

      // Arms (From shoulders to elbows to hands on bars)
      ctx.strokeStyle = "#ff6b2c";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(shoulderX - 15, shoulderY);
      ctx.lineTo(elbowLeftX, elbowY);
      ctx.lineTo(barLeftX, barY);
      ctx.moveTo(shoulderX + 15, shoulderY);
      ctx.lineTo(elbowRightX, elbowY);
      ctx.lineTo(barRightX, barY);
      ctx.stroke();

      // Torso & Bent Legs
      ctx.strokeStyle = "#3ed598";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(shoulderX, shoulderY);
      ctx.lineTo(hipX, hipY);
      ctx.lineTo(kneeX, kneeY);
      ctx.lineTo(feetX, feetY);
      ctx.stroke();

      // Head
      ctx.fillStyle = "#e9edf1";
      ctx.beginPath();
      ctx.arc(headX, headY, 12, 0, Math.PI * 2);
      ctx.fill();

      // Depth tag
      if (drop > 30) {
        ctx.fillStyle = "#ff6b2c";
        ctx.font = "bold 11px Inter";
        ctx.fillText("90° DEPTH REACHED ✔", cx - 55, cy + 105);
      }
    }
  },

  // 3. PULL-UP
  pullup: {
    name: "Pull-Up",
    phases: ["Dead Hang (1s)", "Drive Elbows (1s)", "Chest to Bar (1s)", "Eccentric Descent (3s)"],
    cadence: "3-1-1-0",
    checkpoints: [
      { name: "Grip", desc: "Overhand Pronated" },
      { name: "Scapula", desc: "Active Depression" },
      { name: "Range", desc: "Full Dead Hang to Chin" }
    ],
    draw: (ctx, t, w, h) => {
      const cx = w / 2;
      const cy = h / 2 - 10;
      const pull = Math.sin(t * Math.PI) * 65; // 0..65px lift

      const barY = cy - 35;
      // Bar
      ctx.strokeStyle = "#8a939d";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx - 70, barY);
      ctx.lineTo(cx + 70, barY);
      ctx.stroke();

      const headY = cy + 20 - pull;
      const shoulderY = headY + 22;
      const elbowX = cx + (pull > 35 ? 32 : 18);
      const elbowY = shoulderY + (pull > 35 ? 8 : 32);
      const hipY = shoulderY + 48;
      const feetY = hipY + 50;

      // Arms
      ctx.strokeStyle = "#ff6b2c";
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(cx - 28, barY);
      ctx.lineTo(cx - (elbowX - cx), elbowY);
      ctx.lineTo(cx - 15, shoulderY);
      ctx.moveTo(cx + 28, barY);
      ctx.lineTo(elbowX, elbowY);
      ctx.lineTo(cx + 15, shoulderY);
      ctx.stroke();

      // Torso & Legs
      ctx.strokeStyle = "#3ed598";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx, shoulderY);
      ctx.lineTo(cx, hipY);
      ctx.lineTo(cx + 3, feetY);
      ctx.stroke();

      // Head
      ctx.fillStyle = "#e9edf1";
      ctx.beginPath();
      ctx.arc(cx, headY, 13, 0, Math.PI * 2);
      ctx.fill();

      if (pull > 48) {
        ctx.fillStyle = "#3ed598";
        ctx.font = "bold 11px Inter";
        ctx.fillText("CHIN OVER BAR ✔", cx - 45, barY - 12);
      }
    }
  },

  // 4. BAR MUSCLE-UP (Distinct multi-phase turnover above the bar!)
  muscleup: {
    name: "Bar Muscle-Up",
    phases: ["Explosive High Pull", "Chest Over Bar Transition", "Dip Press-out", "Controlled Return"],
    cadence: "Explosive Turnover",
    checkpoints: [
      { name: "Pull Height", desc: "Sternum to Bar" },
      { name: "Turnover", desc: "Aggressive Wrists" },
      { name: "Press", desc: "Full Straight Bar Dip" }
    ],
    draw: (ctx, t, w, h) => {
      const cx = w / 2;
      const cy = h / 2;

      // 4 phases: 0..0.3 pull, 0.3..0.6 turnover & press above bar, 0.6..1 return
      let stage = "PULL";
      let athleteY = cy + 30; // base hanging height
      let isAboveBar = false;

      const barY = cy;
      // Draw Bar
      ctx.strokeStyle = "#8a939d";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx - 75, barY);
      ctx.lineTo(cx + 75, barY);
      ctx.stroke();

      if (t < 0.35) {
        // High Pulling
        stage = "1. EXPLOSIVE HIGH PULL";
        athleteY = cy + 30 - (t / 0.35) * 55;
      } else if (t < 0.7) {
        // Above bar press-out
        stage = "2. TURNOVER & DIP PRESS";
        isAboveBar = true;
        const pressProgress = (t - 0.35) / 0.35;
        athleteY = cy - 25 - Math.sin(pressProgress * Math.PI) * 25;
      } else {
        // Return
        stage = "3. CONTROLLED DESCENT";
        const returnProgress = (t - 0.7) / 0.3;
        athleteY = cy - 25 + returnProgress * 55;
      }

      const headY = athleteY - 20;
      const shoulderY = athleteY;
      const hipY = athleteY + 45;
      const feetY = hipY + 45;

      // Draw Athlete Arms based on position
      ctx.strokeStyle = "#ff6b2c";
      ctx.lineWidth = 5;
      ctx.beginPath();
      if (!isAboveBar) {
        // Pulling from below
        ctx.moveTo(cx - 20, barY);
        ctx.lineTo(cx - 30, shoulderY + 10);
        ctx.lineTo(cx - 12, shoulderY);
        ctx.moveTo(cx + 20, barY);
        ctx.lineTo(cx + 30, shoulderY + 10);
        ctx.lineTo(cx + 12, shoulderY);
      } else {
        // Pushing from above bar
        ctx.moveTo(cx - 20, barY);
        ctx.lineTo(cx - 25, shoulderY + 15);
        ctx.lineTo(cx - 12, shoulderY);
        ctx.moveTo(cx + 20, barY);
        ctx.lineTo(cx + 25, shoulderY + 15);
        ctx.lineTo(cx + 12, shoulderY);
      }
      ctx.stroke();

      // Torso & Legs
      ctx.strokeStyle = "#3ed598";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx, shoulderY);
      ctx.lineTo(cx, hipY);
      ctx.lineTo(cx + (isAboveBar ? 10 : 0), feetY);
      ctx.stroke();

      // Head
      ctx.fillStyle = "#e9edf1";
      ctx.beginPath();
      ctx.arc(cx, headY, 13, 0, Math.PI * 2);
      ctx.fill();

      // Phase badge on canvas
      ctx.fillStyle = isAboveBar ? "#ff6b2c" : "#3ed598";
      ctx.font = "bold 11px Inter";
      ctx.fillText(stage, cx - 65, cy - 65);
    }
  },

  // 5. HANDSTAND & HSPU
  hstand: {
    name: "Handstand / HSPU",
    phases: ["Lockout Stack", "Crown of Head Descent", "Touch Point", "Overhead Press"],
    cadence: "2-1-1-0",
    checkpoints: [
      { name: "Alignment", desc: "Wrists, Shoulders, Hips" },
      { name: "Grip", desc: "Talon Floor Push" },
      { name: "Core", desc: "Hollow Body Line" }
    ],
    draw: (ctx, t, w, h) => {
      const cx = w / 2;
      const cy = h / 2;
      const dip = Math.sin(t * Math.PI) * 35; // 0..35 descent of head

      // Floor
      ctx.strokeStyle = "#232a33";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 80, cy + 75);
      ctx.lineTo(cx + 80, cy + 75);
      ctx.stroke();

      const handY = cy + 75;
      const headY = cy + 60 - (35 - dip);
      const shoulderY = headY - 18;
      const hipY = shoulderY - 45;
      const feetY = hipY - 55;

      // Arms
      ctx.strokeStyle = "#ff6b2c";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx - 20, handY);
      ctx.lineTo(cx - 30 - dip * 0.2, (handY + shoulderY) / 2);
      ctx.lineTo(cx - 12, shoulderY);
      ctx.moveTo(cx + 20, handY);
      ctx.lineTo(cx + 30 + dip * 0.2, (handY + shoulderY) / 2);
      ctx.lineTo(cx + 12, shoulderY);
      ctx.stroke();

      // Inverted Body
      ctx.strokeStyle = "#3ed598";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(cx, shoulderY);
      ctx.lineTo(cx, hipY);
      ctx.lineTo(cx, feetY);
      ctx.stroke();

      // Head
      ctx.fillStyle = "#e9edf1";
      ctx.beginPath();
      ctx.arc(cx, headY, 12, 0, Math.PI * 2);
      ctx.fill();

      // Guide line
      ctx.strokeStyle = "rgba(62, 213, 152, 0.3)";
      ctx.setLineDash([3, 3]);
      ctx.beginPath();
      ctx.moveTo(cx, cy + 75);
      ctx.lineTo(cx, cy - 90);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  },

  // 6. PLANCHE
  planche: {
    name: "Planche",
    phases: ["Straight Arm Lean", "Scapular Protraction", "Horizontal Float", "Rigid Isometric Lock"],
    cadence: "Max Tension Hold",
    checkpoints: [
      { name: "Elbows", desc: "100% Locked Out" },
      { name: "Scapula", desc: "Max Protraction" },
      { name: "Hips", desc: "Level with Shoulders" }
    ],
    draw: (ctx, t, w, h) => {
      const cx = w / 2;
      const cy = h / 2 + 15;
      const tremor = Math.sin(t * Math.PI * 4) * 2;

      // Floor
      ctx.strokeStyle = "#232a33";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 150, cy + 40);
      ctx.lineTo(cx + 150, cy + 40);
      ctx.stroke();

      const handsX = cx + 25;
      const handsY = cy + 40;
      const shouldersX = cx + 60;
      const shouldersY = cy - 20 + tremor;
      const headX = shouldersX + 28;
      const headY = shouldersY - 5;

      const hipX = cx - 30;
      const hipY = cy - 20 + tremor;
      const feetX = cx - 125;
      const feetY = cy - 20 + tremor;

      // Straight Arms
      ctx.strokeStyle = "#ff6b2c";
      ctx.lineWidth = 6;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(handsX, handsY);
      ctx.lineTo(shouldersX, shouldersY);
      ctx.stroke();

      // Parallel Body Line
      ctx.strokeStyle = "#3ed598";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(feetX, feetY);
      ctx.lineTo(hipX, hipY);
      ctx.lineTo(shouldersX, shouldersY);
      ctx.stroke();

      // Head
      ctx.fillStyle = "#e9edf1";
      ctx.beginPath();
      ctx.arc(headX, headY, 13, 0, Math.PI * 2);
      ctx.fill();

      // CG Marker
      ctx.fillStyle = "rgba(255, 107, 44, 0.25)";
      ctx.beginPath();
      ctx.arc(handsX, handsY - 30, 20, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  // 7. SQUAT & PISTOL SQUAT
  squat: {
    name: "Squat / Pistol",
    phases: ["Hip Hinge (3s)", "Depth Below Parallel (1s)", "Drive Heels (1s)", "Glute Squeeze"],
    cadence: "3-1-1-0",
    checkpoints: [
      { name: "Depth", desc: "Hip Crease Below Knee" },
      { name: "Knees", desc: "Track Over Toes" },
      { name: "Spine", desc: "Neutral & Upright" }
    ],
    draw: (ctx, t, w, h) => {
      const cx = w / 2;
      const cy = h / 2;
      const depth = Math.sin(t * Math.PI) * 45; // 0..45 squat depth

      // Floor
      ctx.strokeStyle = "#232a33";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 80, cy + 75);
      ctx.lineTo(cx + 80, cy + 75);
      ctx.stroke();

      const feetX = cx - 15;
      const feetY = cy + 75;
      const kneeX = cx + (depth > 20 ? 15 : 0);
      const kneeY = cy + 45 + depth * 0.2;
      const hipX = cx - (depth > 20 ? 30 : 10);
      const hipY = cy + 10 + depth;
      const shoulderX = cx - 10 + depth * 0.2;
      const shoulderY = hipY - 45;
      const headX = shoulderX + 5;
      const headY = shoulderY - 20;

      // Leg
      ctx.strokeStyle = "#3ed598";
      ctx.lineWidth = 7;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(feetX, feetY);
      ctx.lineTo(kneeX, kneeY);
      ctx.lineTo(hipX, hipY);
      ctx.lineTo(shoulderX, shoulderY);
      ctx.stroke();

      // Arms reaching forward for counterbalance
      ctx.strokeStyle = "#ff6b2c";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(shoulderX, shoulderY);
      ctx.lineTo(shoulderX + 45, shoulderY - 5);
      ctx.stroke();

      // Head
      ctx.fillStyle = "#e9edf1";
      ctx.beginPath();
      ctx.arc(headX, headY, 13, 0, Math.PI * 2);
      ctx.fill();

      if (depth > 35) {
        ctx.fillStyle = "#3ed598";
        ctx.font = "bold 11px Inter";
        ctx.fillText("PARALLEL DEPTH ✔", cx - 50, cy + 95);
      }
    }
  },

  // 8. FRONT LEVER
  flev: {
    name: "Front Lever",
    phases: ["Active Shoulder Depression", "Hollow Core Tension", "Horizontal Lat Lock", "Parallel Float"],
    cadence: "Max Tension Hold",
    checkpoints: [
      { name: "Lats", desc: "Max Depressed" },
      { name: "Arms", desc: "Completely Straight" },
      { name: "Body", desc: "180° Parallel Plane" }
    ],
    draw: (ctx, t, w, h) => {
      const cx = w / 2;
      const cy = h / 2;
      const tremor = Math.sin(t * Math.PI * 4) * 2;

      const barY = cy - 40;
      // Bar
      ctx.strokeStyle = "#8a939d";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx + 30, barY);
      ctx.lineTo(cx + 100, barY);
      ctx.stroke();

      const handsX = cx + 65;
      const handsY = barY;
      const shouldersX = cx + 55;
      const shouldersY = cy + 5 + tremor;
      const headX = shouldersX + 22;
      const headY = shouldersY - 3;
      const hipX = cx - 25;
      const hipY = shouldersY;
      const feetX = cx - 120;
      const feetY = shouldersY;

      // Straight Arms Hanging
      ctx.strokeStyle = "#ff6b2c";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(handsX, handsY);
      ctx.lineTo(shouldersX, shouldersY);
      ctx.stroke();

      // Horizontal Rigid Body
      ctx.strokeStyle = "#3ed598";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(feetX, feetY);
      ctx.lineTo(hipX, hipY);
      ctx.lineTo(shouldersX, shouldersY);
      ctx.stroke();

      // Head
      ctx.fillStyle = "#e9edf1";
      ctx.beginPath();
      ctx.arc(headX, headY, 13, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  // 9. L-SIT
  lsit: {
    name: "L-Sit / V-Sit",
    phases: ["Shoulder Depression Push", "Quad Lockout", "90° L Angle", "Toes Pointed"],
    cadence: "Max Isometric Hold",
    checkpoints: [
      { name: "Shoulders", desc: "Pushed Down Hard" },
      { name: "Knees", desc: "100% Locked Straight" },
      { name: "Hip Compression", desc: "Tight Abdominal Hinge" }
    ],
    draw: (ctx, t, w, h) => {
      const cx = w / 2;
      const cy = h / 2 + 10;
      const tremor = Math.sin(t * Math.PI * 4) * 2;

      // Floor / Parallettes
      ctx.strokeStyle = "#232a33";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 80, cy + 60);
      ctx.lineTo(cx + 80, cy + 60);
      ctx.stroke();

      const handsX = cx - 10;
      const handsY = cy + 60;
      const shouldersX = cx - 10;
      const shouldersY = cy + 10 + tremor;
      const headX = shouldersX;
      const headY = shouldersY - 22;
      const hipX = cx - 10;
      const hipY = cy + 38 + tremor;
      const feetX = cx + 85;
      const feetY = hipY;

      // Arms Pushing Down
      ctx.strokeStyle = "#ff6b2c";
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(handsX, handsY);
      ctx.lineTo(shouldersX, shouldersY);
      ctx.stroke();

      // Torso
      ctx.strokeStyle = "#3ed598";
      ctx.lineWidth = 7;
      ctx.beginPath();
      ctx.moveTo(shouldersX, shouldersY);
      ctx.lineTo(hipX, hipY);
      // 90 degree Legs
      ctx.lineTo(feetX, feetY);
      ctx.stroke();

      // Head
      ctx.fillStyle = "#e9edf1";
      ctx.beginPath();
      ctx.arc(headX, headY, 13, 0, Math.PI * 2);
      ctx.fill();

      // 90° Marker
      ctx.fillStyle = "#ff6b2c";
      ctx.font = "bold 11px Inter";
      ctx.fillText("90° L-SHAPE ✔", cx + 15, hipY - 10);
    }
  }
};

export default function MotionCoach({ exerciseId, exerciseName }) {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [tempoSpeed, setTempoSpeed] = useState(1);
  const [activeCue, setActiveCue] = useState(0);

  // Exact matching for every movement
  const resolvedKey = React.useMemo(() => {
    if (!exerciseId) return "pushup";
    const id = exerciseId.toLowerCase();

    if (id === "dip" || id.includes("dip")) return "dip";
    if (id === "muscleup" || id.includes("muscle")) return "muscleup";
    if (id === "pullup" || id === "chinup" || id === "negpull" || id === "exppull" || id === "scap" || id === "row") return "pullup";
    if (id === "hspu" || id === "pike" || id.includes("handstand") || id.includes("hstand")) return "hstand";
    if (id === "planche") return "planche";
    if (id === "frontlev" || id === "flev") return "flev";
    if (id === "squat" || id === "squatbb" || id === "bulg" || id === "pistol" || id === "nordic" || id === "calf") return "squat";
    if (id === "lsit" || id === "legraise" || id === "rollout" || id === "hollow" || id === "plank" || id === "sidep") return "lsit";
    
    return "pushup";
  }, [exerciseId]);

  const config = ANIM_CONFIGS[resolvedKey] || ANIM_CONFIGS.pushup;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animId;
    let start = performance.now();

    const loop = (now) => {
      const elapsed = (now - start) / 1000;
      const duration = 4 / tempoSpeed; // 4s per rep cycle
      const progress = (elapsed % duration) / duration;

      const phaseIdx = Math.floor(progress * config.phases.length);
      setActiveCue(phaseIdx % config.phases.length);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Grid Lines
      ctx.strokeStyle = "#12161b";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }
      for (let y = 0; y < canvas.height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      // Draw Biomechanical Motion
      config.draw(ctx, progress, canvas.width, canvas.height);

      if (isPlaying) {
        animId = requestAnimationFrame(loop);
      }
    };

    animId = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(animId);
  }, [resolvedKey, isPlaying, tempoSpeed, config]);

  return (
    <div style={{ marginTop: "14px", background: "var(--p)", border: "1px solid var(--ln)", borderRadius: "14px", padding: "16px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
        <div>
          <b style={{ fontSize: "14px", color: "var(--acc)", display: "flex", alignItems: "center", gap: "6px" }}>
            <span>⚡</span> Motion Guide: {config.name}
          </b>
          <span className="mut sm" style={{ display: "block" }}>
            Kinetic joint angles & eccentric pacing.
          </span>
        </div>
        <div style={{ display: "flex", gap: "6px" }}>
          <button
            className="btn gh sm"
            onClick={() => setTempoSpeed(tempoSpeed === 1 ? 0.5 : tempoSpeed === 0.5 ? 1.5 : 1)}
          >
            Speed: {tempoSpeed}x
          </button>
          <button className="btn sm" onClick={() => setIsPlaying(!isPlaying)}>
            {isPlaying ? "⏸ Pause" : "▶ Play"}
          </button>
        </div>
      </div>

      {/* Kinetic Canvas */}
      <div style={{ position: "relative", width: "100%", height: "220px", background: "#0b0d10", borderRadius: "10px", overflow: "hidden", border: "1px solid var(--ln)" }}>
        <canvas ref={canvasRef} width={560} height={220} style={{ width: "100%", height: "100%", display: "block" }} />

        <div style={{ position: "absolute", top: "12px", left: "12px", background: "rgba(18, 22, 27, 0.85)", backdropFilter: "blur(6px)", border: "1px solid var(--ln)", padding: "6px 12px", borderRadius: "8px", fontSize: "12px" }}>
          <span className="mut">Phase: </span>
          <b style={{ color: "var(--ok)" }}>{config.phases[activeCue] || config.phases[0]}</b>
        </div>

        <div style={{ position: "absolute", bottom: "12px", right: "12px", background: "rgba(18, 22, 27, 0.85)", padding: "4px 10px", borderRadius: "6px", fontSize: "11px", color: "var(--acc)" }}>
          Cadence: {config.cadence}
        </div>
      </div>

      {/* Biomechanical Form Checkpoints */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "8px", marginTop: "12px" }}>
        {config.checkpoints.map((cp, idx) => (
          <div key={idx} className="card" style={{ padding: "8px", textAlign: "center" }}>
            <b style={{ fontSize: "12px", color: "var(--ok)" }}>✔ {cp.name}</b>
            <div className="mut sm" style={{ fontSize: "11px" }}>{cp.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
