"use client";
import React from "react";

export default function Fuel() {
  return (
    <div className="vw active" id="v-fuel">
      {/* Nutrition Flatlay Hero Banner */}
      <div
        style={{
          position: "relative",
          borderRadius: "20px",
          overflow: "hidden",
          border: "1px solid var(--ln)",
          marginBottom: "24px",
          height: "220px",
          background: "#000"
        }}
      >
        <img
          src="/banners/fuel.jpg"
          alt="Athlete Nutrition & Fuel"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: 0.55,
            filter: "contrast(115%)"
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(11, 13, 16, 0.2) 0%, rgba(11, 13, 16, 0.9) 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            padding: "20px 24px"
          }}
        >
          <span className="pill" style={{ alignSelf: "flex-start", marginBottom: "6px", borderColor: "var(--ok)", color: "var(--ok)" }}>
            🥗 RECOVERY & NUTRITION
          </span>
          <h1 className="pg" style={{ margin: 0, fontSize: "28px" }}>
            Fuel for <em>Relative Strength</em>
          </h1>
        </div>
      </div>

      <p className="sub">
        Training writes the check; nutrition cashes it. Keep it simple: high protein, clean hydration, restorative sleep, and nutrient-dense whole foods.
      </p>

      <div className="grid g2">
        <div className="card">
          <b style={{ color: "var(--acc)", fontSize: "16px" }}>🥩 Protein First</b>
          <p className="mut sm" style={{ marginTop: "6px" }}>
            1.6–2.2 g per kg bodyweight daily, spread over 3–4 meals. Muscle recovery happens in the kitchen and in bed.
          </p>
        </div>
        <div className="card">
          <b style={{ color: "var(--ok)", fontSize: "16px" }}>💧 Hydration</b>
          <p className="mut sm" style={{ marginTop: "6px" }}>
            ~35 ml per kg daily. Grip endurance, tendon health, and handstand focus drop sharply when dehydrated.
          </p>
        </div>
        <div className="card">
          <b style={{ color: "var(--warn)", fontSize: "16px" }}>😴 Sleep = Gains</b>
          <p className="mut sm" style={{ marginTop: "6px" }}>
            7–9 hours. Your central nervous system rewires and masters complex calisthenics skill patterns while you sleep.
          </p>
        </div>
        <div className="card">
          <b style={{ color: "var(--tx)", fontSize: "16px" }}>⚖️ Energy Balance</b>
          <p className="mut sm" style={{ marginTop: "6px" }}>
            Recomp: maintenance calories. Mass: +250 kcal surplus. Cut: −400 kcal deficit while keeping protein high.
          </p>
        </div>
      </div>

      <div className="sect">
        <h2>A Solid Calisthenics Day</h2>
      </div>
      <div className="card">
        <ul className="rl">
          <li>
            <span>Breakfast</span>
            <span className="mut">Eggs + oats + berries — complete protein & complex carbs</span>
          </li>
          <li>
            <span>Pre-training</span>
            <span className="mut">Banana or espresso, 60–90 min out for glycogen</span>
          </li>
          <li>
            <span>Post-training</span>
            <span className="mut">Salmon/Steak + rice/sweet potato — repair & replenish</span>
          </li>
          <li>
            <span>Dinner</span>
            <span className="mut">Lean protein + green vegetables + olive oil</span>
          </li>
          <li>
            <span>Anytime Recovery</span>
            <span className="mut">Greek yogurt, raw almonds, electrolyte water</span>
          </li>
        </ul>
      </div>

      <div className="sect">
        <h2>Joint & Tendon Health</h2>
      </div>
      <div className="grid g3">
        <div className="card">
          <b>✋ Wrists</b>
          <p className="mut sm" style={{ marginTop: "6px" }}>
            Handstands load wrists hard — prep every session, stretch after.
          </p>
        </div>
        <div className="card">
          <b>💪 Elbows</b>
          <p className="mut sm" style={{ marginTop: "6px" }}>
            Climbing and chin-ups stress tendons — build volume gradually.
          </p>
        </div>
        <div className="card">
          <b>🎯 Leanness</b>
          <p className="mut sm" style={{ marginTop: "6px" }}>
            Static skills scale with relative strength — staying lighter makes everything easier.
          </p>
        </div>
      </div>
    </div>
  );
}
