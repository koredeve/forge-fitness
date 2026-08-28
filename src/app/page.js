"use client";
import React, { useState } from "react";
import Link from "next/link";
import { CATS, WORKOUTS } from "@/data/db";
import { useFitness } from "@/context/FitnessContext";
import { useAuth } from "@/context/AuthContext";
import WorkoutModal from "@/components/WorkoutModal";

const CATEGORY_IMAGES = {
  calis: "/illustrations/muscleup.jpg",
  weights: "/banners/weights.jpg",
  hiit: "/banners/strength.jpg",
  cardio: "/banners/foundation.jpg",
  core: "/illustrations/lsit.jpg",
  mobility: "/illustrations/hstand.jpg"
};

export default function Home() {
  const { logs, getStreak, getSkillsPct, startWorkout } = useFitness();
  const { user } = useAuth();
  const [previewWorkout, setPreviewWorkout] = useState(null);

  const streak = getStreak();
  const mastery = getSkillsPct();
  const total = logs.length;
  const wk = logs.filter((s) => Date.now() - new Date(s.d).getTime() < 7 * 864e5).length;

  const dateStr = new Date().toLocaleDateString(undefined, {
    weekday: "long",
    month: "short",
    day: "numeric"
  });

  const mqText = ("PULL-UP · MUSCLE-UP · PLANCHE · FRONT LEVER · HANDSTAND · L-SIT · PISTOL · ").repeat(3);
  const ignitionWorkout = WORKOUTS.find((w) => w.id === "w1");

  return (
    <div className="vw active" id="v-home">
      {/* Cinematic Hero Section with High-Res Photography */}
      <div
        style={{
          position: "relative",
          borderRadius: "24px",
          overflow: "hidden",
          border: "1px solid var(--ln)",
          marginBottom: "24px",
          background: "#000"
        }}
      >
        <img
          src="/banners/hero.jpg"
          alt="Calisthenics Athlete"
          style={{
            width: "100%",
            height: "360px",
            objectFit: "cover",
            opacity: 0.45,
            filter: "contrast(115%) brightness(90%)",
            display: "block"
          }}
        />

        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(11, 13, 16, 0.15) 0%, rgba(11, 13, 16, 0.95) 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "24px 28px"
          }}
        >
          <div className="kick" style={{ alignSelf: "flex-start", marginBottom: "8px" }}>
            🔥 TODAY · {dateStr} {user ? `· ☁️ ${user.email.split("@")[0]}` : "· ⚡ Guest Mode"}
          </div>

          <h1 className="pg" style={{ margin: "4px 0" }}>
            Own your<br />
            <em>bodyweight.</em>
          </h1>
          <p className="sub" style={{ margin: "6px 0 16px", maxWidth: "600px" }}>
            FORGE is built calisthenics-first: your body is the barbell. Master bodyweight physics, climb the skill trees, and unlock elite relative strength.
          </p>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              className="btn"
              onClick={() => setPreviewWorkout(ignitionWorkout)}
            >
              ▶ Start: Full Body Ignition
            </button>
            <Link href="/calis" className="btn gh">
              🤸 Open Calisthenics Hub
            </Link>
          </div>
        </div>
      </div>

      {/* Reactive Live Stats */}
      <div className="stats" style={{ marginTop: 0 }}>
        <div className="stat">
          <b>{streak}</b>
          <span>Day streak</span>
        </div>
        <div className="stat">
          <b>{wk}</b>
          <span>Sessions / 7d</span>
        </div>
        <div className="stat">
          <b>{total}</b>
          <span>Total sessions</span>
        </div>
        <div className="stat">
          <b>{mastery}%</b>
          <span>Skill mastery</span>
        </div>
      </div>

      <div className="mq">
        <div>{mqText}</div>
      </div>

      <div className="sect">
        <h2>Train Your Way</h2>
        <span className="mut">Calisthenics leads the pack</span>
      </div>

      {/* Responsive Category Grid with Visual Artwork Backgrounds */}
      <div className="homecats">
        {/* 1. Calisthenics Focus Card */}
        <Link
          href="/calis"
          className="mtile cl"
          style={{
            background: "linear-gradient(180deg, rgba(58, 28, 10, 0.4) 0%, rgba(20, 23, 28, 0.95) 100%)"
          }}
        >
          <img
            src={CATEGORY_IMAGES.calis}
            alt="Calisthenics"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.38,
              zIndex: 1
            }}
          />
          <div style={{ position: "relative", zIndex: 2 }}>
            <span className="cali-acc">⭐ FOCUS CATEGORY</span>
            <br />
            <b style={{ fontSize: "20px" }}>Calisthenics</b>
            <small>Skill trees · progressions · bodyweight mastery</small>
          </div>
        </Link>

        {/* 2. Weights */}
        <Link
          href="/library?cat=weights"
          className="mtile cl"
          style={{
            background: "linear-gradient(180deg, rgba(20, 23, 28, 0.3) 0%, rgba(20, 23, 28, 0.95) 100%)"
          }}
        >
          <img
            src={CATEGORY_IMAGES.weights}
            alt="Weights"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.35,
              zIndex: 1
            }}
          />
          <div style={{ position: "relative", zIndex: 2 }}>
            <span className="pill" style={{ borderColor: "#6ba4ff", color: "#6ba4ff", marginBottom: "4px" }}>
              BARBELL & DUMBBELL
            </span>
            <br />
            <b style={{ fontSize: "20px" }}>Weights</b>
            <small>Compound strength · hypertrophy · iron</small>
          </div>
        </Link>

        {/* 3. HIIT */}
        <Link
          href="/library?cat=hiit"
          className="mtile cl"
          style={{
            background: "linear-gradient(180deg, rgba(20, 23, 28, 0.3) 0%, rgba(20, 23, 28, 0.95) 100%)"
          }}
        >
          <img
            src={CATEGORY_IMAGES.hiit}
            alt="HIIT"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.35,
              zIndex: 1
            }}
          />
          <div style={{ position: "relative", zIndex: 2 }}>
            <span className="pill" style={{ borderColor: "#ff6b2c", color: "#ff6b2c", marginBottom: "4px" }}>
              HIGH INTENSITY
            </span>
            <br />
            <b style={{ fontSize: "20px" }}>HIIT</b>
            <small>Tabata intervals · metabolic conditioning</small>
          </div>
        </Link>

        {/* 4. Cardio */}
        <Link
          href="/library?cat=cardio"
          className="mtile cl"
          style={{
            background: "linear-gradient(180deg, rgba(20, 23, 28, 0.3) 0%, rgba(20, 23, 28, 0.95) 100%)"
          }}
        >
          <img
            src={CATEGORY_IMAGES.cardio}
            alt="Cardio"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.35,
              zIndex: 1
            }}
          />
          <div style={{ position: "relative", zIndex: 2 }}>
            <span className="pill" style={{ borderColor: "#3ed598", color: "#3ed598", marginBottom: "4px" }}>
              ENDURANCE
            </span>
            <br />
            <b style={{ fontSize: "20px" }}>Cardio</b>
            <small>Sprints · jump rope · aerobic engine</small>
          </div>
        </Link>

        {/* 5. Core */}
        <Link
          href="/library?cat=core"
          className="mtile cl"
          style={{
            background: "linear-gradient(180deg, rgba(20, 23, 28, 0.3) 0%, rgba(20, 23, 28, 0.95) 100%)"
          }}
        >
          <img
            src={CATEGORY_IMAGES.core}
            alt="Core"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.35,
              zIndex: 1
            }}
          />
          <div style={{ position: "relative", zIndex: 2 }}>
            <span className="pill" style={{ borderColor: "#ffd34d", color: "#ffd34d", marginBottom: "4px" }}>
              MIDSECTION STEEL
            </span>
            <br />
            <b style={{ fontSize: "20px" }}>Core</b>
            <small>L-sits · hollow body · ab rollouts</small>
          </div>
        </Link>

        {/* 6. Mobility */}
        <Link
          href="/library?cat=mobility"
          className="mtile cl"
          style={{
            background: "linear-gradient(180deg, rgba(20, 23, 28, 0.3) 0%, rgba(20, 23, 28, 0.95) 100%)"
          }}
        >
          <img
            src={CATEGORY_IMAGES.mobility}
            alt="Mobility"
            style={{
              position: "absolute",
              inset: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              opacity: 0.35,
              zIndex: 1
            }}
          />
          <div style={{ position: "relative", zIndex: 2 }}>
            <span className="pill" style={{ borderColor: "#9b7bff", color: "#9b7bff", marginBottom: "4px" }}>
              JOINT HEALTH
            </span>
            <br />
            <b style={{ fontSize: "20px" }}>Mobility</b>
            <small>Wrist prep · shoulder dislocates · flow</small>
          </div>
        </Link>
      </div>

      <div className="sect">
        <h2>Why Calisthenics First?</h2>
      </div>
      <div className="grid g3">
        <div className="card">
          <b style={{ fontSize: "16px", color: "var(--acc)" }}>📐 Relative Strength</b>
          <p className="mut sm" style={{ marginTop: "6px" }}>
            Being strong FOR your size beats machine numbers. Every kilo must earn its place.
          </p>
        </div>
        <div className="card">
          <b style={{ fontSize: "16px", color: "var(--ok)" }}>🔋 Zero Excuses</b>
          <p className="mut sm" style={{ marginTop: "6px" }}>
            A bar and a floor is a full gym. Travel-proof, weatherproof, membership-optional.
          </p>
        </div>
        <div className="card">
          <b style={{ fontSize: "16px", color: "var(--warn)" }}>🎯 Skills, Not Sets</b>
          <p className="mut sm" style={{ marginTop: "6px" }}>
            Muscle-ups and handstands turn training into mastery — motivation that never runs out.
          </p>
        </div>
      </div>

      {/* Routine Detail Modal */}
      <WorkoutModal
        workout={previewWorkout}
        onClose={() => setPreviewWorkout(null)}
      />
    </div>
  );
}
