"use client";
import React from "react";

const TOON_MAP = {
  pullup: "/illustrations/pullup.jpg",
  muscleup: "/illustrations/muscleup.jpg",
  planche: "/illustrations/planche.jpg",
  hstand: "/illustrations/hstand.jpg",
  flev: "/illustrations/flev.jpg",
  pistol: "/illustrations/pistol.jpg",
  lsit: "/illustrations/lsit.jpg"
};

export default function SkillTreeVisual({ skillId }) {
  const imgSrc = TOON_MAP[skillId] || "/illustrations/pullup.jpg";

  return (
    <div
      style={{
        width: "64px",
        height: "64px",
        borderRadius: "14px",
        overflow: "hidden",
        border: "2px solid var(--acc)",
        boxShadow: "0 0 14px rgba(255, 107, 44, 0.3)",
        flexShrink: 0,
        position: "relative"
      }}
    >
      <img
        src={imgSrc}
        alt={skillId}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </div>
  );
}
