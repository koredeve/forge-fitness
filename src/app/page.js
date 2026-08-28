"use client";
import React, { useState } from "react";
import Link from "next/link";
import { CATS, WORKOUTS } from "@/data/db";
import { useFitness } from "@/context/FitnessContext";
import { useAuth } from "@/context/AuthContext";
import WorkoutModal from "@/components/WorkoutModal";
import AuthModal from "@/components/AuthModal";

const CATEGORY_IMAGES = {
  calis: "/illustrations/muscleup.jpg",
  weights: "/banners/weights.jpg",
  hiit: "/banners/strength.jpg",
  cardio: "/banners/foundation.jpg",
  core: "/illustrations/lsit.jpg",
  mobility: "/illustrations/hstand.jpg"
};

const FAQS = [
  {
    q: "What makes FORGE calisthenics-first?",
    a: "Unlike traditional gym apps centered around heavy barbells or machines, FORGE treats your body as the primary resistance. Every movement progresses along biomechanical lever mechanics and strict relative strength ladders."
  },
  {
    q: "Do I need any gym equipment to start?",
    a: "Zero equipment is needed for Level 1 fundamentals (Push-ups, Bodyweight Squats, Hollow Body). To climb the advanced trees (Pull-up, Dip, Muscle-up), a simple pull-up bar and dip station or parallettes are all you will ever need."
  },
  {
    q: "How do the Gamified Skill Trees work?",
    a: "Each signature calisthenics skill (like the Full Planche or Bar Muscle-up) is broken into progressive milestones from Level 1 to 8. As you meet each form criterion, you check off the level to unlock the next progression and increase your Mastery Score."
  },
  {
    q: "Can I build real muscle and strength with bodyweight alone?",
    a: "Absolutely. Muscle hypertrophy and strength respond to mechanical tension. By shifting leverage (e.g. from regular push-ups to pseudo-planche or handstand push-ups), you can safely apply immense overload without ever touching a weight plate."
  },
  {
    q: "Is FORGE suitable for complete beginners?",
    a: "Yes! The Foundation 30 program and Level 1 skill progressions start from the absolute ground up (wall pushes, negative dips, dead hangs) with slow-motion video breakdowns to build foundational tendon integrity."
  },
  {
    q: "What is included in the FORGE PRO plan?",
    a: "PRO unlocks all 7 master skill ladders (Planche, Muscle-Up, Front Lever, Handstand), all structured multi-week programs (Strength Builder & Hybrid Iron), cloud sync across devices, and personal record tracking."
  }
];

export default function Home() {
  const { logs, getStreak, getSkillsPct, startWorkout } = useFitness();
  const { user } = useAuth();
  const [previewWorkout, setPreviewWorkout] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authSubtitle, setAuthSubtitle] = useState("");
  const [openFaq, setOpenFaq] = useState(null);

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

  const handleStartWorkout = () => {
    if (!user) {
      setAuthSubtitle("Create a free account or sign in to start guided workouts and save your streaks!");
      setAuthModalOpen(true);
      return;
    }
    setPreviewWorkout(ignitionWorkout);
  };

  const toggleFaq = (idx) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

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
            height: "380px",
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
            🔥 TODAY · {dateStr} {user ? `· ☁️ ${user.email.split("@")[0]}` : "· ⚡ PREVIEW MODE"}
          </div>

          <h1 className="pg" style={{ margin: "4px 0" }}>
            Own your<br />
            <em>bodyweight.</em>
          </h1>
          <p className="sub" style={{ margin: "6px 0 16px", maxWidth: "600px" }}>
            FORGE is built calisthenics-first: your body is the barbell. Master bodyweight physics, climb the skill trees, and unlock elite relative strength.
          </p>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button className="btn" onClick={handleStartWorkout}>
              ▶ {user ? "Start: Full Body Ignition" : "Sign In to Start Training"}
            </button>
            <Link href="/calis" className="btn gh">
              🤸 Explore Skill Trees
            </Link>
          </div>
        </div>
      </div>

      {/* Guest Mode Banner if not logged in */}
      {!user && (
        <div
          style={{
            background: "rgba(255, 107, 44, 0.08)",
            border: "1px solid rgba(255, 107, 44, 0.35)",
            borderRadius: "14px",
            padding: "14px 18px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px",
            marginBottom: "20px"
          }}
        >
          <div>
            <b style={{ color: "var(--acc)", fontSize: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
              <span>🔐</span> You are browsing in Preview Mode
            </b>
            <span className="mut sm" style={{ display: "block", fontSize: "12px", marginTop: "2px" }}>
              Sign in or create a free account to unlock full guided workouts, log sets, and save your progress to the cloud.
            </span>
          </div>
          <button
            className="btn sm"
            onClick={() => {
              setAuthSubtitle("Sign in to save your streaks, track skill mastery, and unlock full workouts.");
              setAuthModalOpen(true);
            }}
          >
            Sign In / Register →
          </button>
        </div>
      )}

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

        {["weights", "hiit", "cardio", "core", "mobility"].map((c) => (
          <Link
            key={c}
            href={`/library?cat=${c}`}
            className="mtile cl"
            style={{
              background: "linear-gradient(180deg, rgba(20, 23, 28, 0.3) 0%, rgba(20, 23, 28, 0.95) 100%)"
            }}
          >
            <img
              src={CATEGORY_IMAGES[c]}
              alt={CATS[c]?.n}
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
              <span className="pill" style={{ borderColor: CATS[c]?.c, color: CATS[c]?.c, marginBottom: "4px" }}>
                {CATS[c]?.n.toUpperCase()}
              </span>
              <br />
              <b style={{ fontSize: "20px" }}>{CATS[c]?.n}</b>
              <small>Explore {CATS[c]?.n.toLowerCase()} library & workouts</small>
            </div>
          </Link>
        ))}
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

      {/* Interactive FAQ Section */}
      <div className="sect" style={{ marginTop: "48px" }}>
        <h2>Frequently Asked Questions</h2>
        <span className="mut">Everything you need to know</span>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        {FAQS.map((faq, i) => {
          const isOpen = openFaq === i;
          return (
            <div
              key={i}
              className="card"
              style={{
                cursor: "pointer",
                padding: "16px 20px",
                borderColor: isOpen ? "var(--acc)" : "var(--ln)",
                transition: "0.2s ease"
              }}
              onClick={() => toggleFaq(i)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                <b style={{ fontSize: "15.5px", color: isOpen ? "var(--acc)" : "var(--tx)" }}>
                  {faq.q}
                </b>
                <span style={{ fontSize: "18px", color: "var(--mut)", transform: isOpen ? "rotate(45deg)" : "rotate(0deg)", transition: "0.2s" }}>
                  +
                </span>
              </div>
              {isOpen && (
                <p className="mut sm" style={{ marginTop: "10px", lineHeight: "1.6", fontSize: "13.5px" }}>
                  {faq.a}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Routine Detail Modal */}
      <WorkoutModal
        workout={previewWorkout}
        onClose={() => setPreviewWorkout(null)}
      />

      {/* Sleek Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        subtitle={authSubtitle}
      />
    </div>
  );
}
