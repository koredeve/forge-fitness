import React from "react";

/**
 * Luxury Vector Brand Logo for FORGE HIM
 * Features an athletic V-taper chevron & kinetic titan flame crest
 * with molten amber & solar gold gradients.
 */
export default function ForgeHimLogo({ size = "default", showText = true, className = "" }) {
  const isCompact = size === "small";
  const iconSize = isCompact ? 28 : 34;

  return (
    <div
      className={`forge-him-logo ${className}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: isCompact ? "8px" : "10px",
        textDecoration: "none",
        userSelect: "none"
      }}
    >
      {/* Precision Vector Emblem: Athletic V-Taper Chevron & Kinetic Titan Flame */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, filter: "drop-shadow(0 2px 8px rgba(255, 107, 44, 0.45))" }}
      >
        <defs>
          <linearGradient id="himAmberGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFA439" />
            <stop offset="50%" stopColor="#FF6B2C" />
            <stop offset="100%" stopColor="#E63900" />
          </linearGradient>
          <linearGradient id="himGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE066" />
            <stop offset="100%" stopColor="#FFB703" />
          </linearGradient>
          <radialGradient id="himGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#FF6B2C" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#FF6B2C" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Glow */}
        <circle cx="24" cy="24" r="22" fill="url(#himGlow)" />

        {/* Geometric Outer V-Taper Crest / Shoulders Axis */}
        <path
          d="M8 12L24 4L40 12L24 44L8 12Z"
          fill="rgba(255, 107, 44, 0.12)"
          stroke="url(#himAmberGrad)"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Central Kinetic Titan Core / Muscular Apex */}
        <path
          d="M16 16L24 10L32 16L24 36L16 16Z"
          fill="url(#himAmberGrad)"
        />

        {/* Core Radiance Spark / Diamond Focus */}
        <path
          d="M24 18L27 23L24 28L21 23L24 18Z"
          fill="url(#himGoldGrad)"
        />

        {/* Apex Spark */}
        <circle cx="24" cy="9" r="1.5" fill="#FFE066" />
      </svg>

      {/* Brand Typography */}
      {showText && (
        <span
          style={{
            fontFamily: "Archivo, Inter, sans-serif",
            fontWeight: "900",
            fontSize: isCompact ? "18px" : "21px",
            letterSpacing: "-0.03em",
            lineHeight: 1,
            display: "inline-flex",
            alignItems: "baseline",
            gap: "3px",
            color: "#FFFFFF"
          }}
        >
          <span>FORGE</span>
          <span
            style={{
              background: "linear-gradient(135deg, #FFA439 0%, #FF6B2C 50%, #FFD166 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontWeight: "900",
              letterSpacing: "-0.01em"
            }}
          >
            HIM
          </span>
          <span style={{ color: "#FF6B2C", fontSize: isCompact ? "16px" : "19px" }}>.</span>
        </span>
      )}
    </div>
  );
}
