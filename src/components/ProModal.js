"use client";
import React from "react";
import { useAuth } from "@/context/AuthContext";

export default function ProModal({ isOpen, onClose, featureName }) {
  const { user } = useAuth();

  if (!isOpen) return null;

  const handleUpgrade = () => {
    alert("Stripe Checkout will be connected here! For testing, your account is upgraded to PRO.");
    onClose();
  };

  return (
    <div className="ov show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="sheet"
        style={{
          maxWidth: "480px",
          textAlign: "center",
          background: "linear-gradient(180deg, #1a1510 0%, #12161b 100%)",
          border: "2px solid var(--acc)",
          boxShadow: "0 16px 48px rgba(255, 107, 44, 0.25)"
        }}
      >
        <button className="xbtn" onClick={onClose}>✕</button>

        <div style={{ fontSize: "40px", marginTop: "8px" }}>👑</div>

        <span className="cali-acc" style={{ fontSize: "12px", letterSpacing: "0.2em" }}>
          FORGE PRO ACCESS
        </span>

        <h3 style={{ fontSize: "26px", margin: "8px 0 6px" }}>
          Unlock {featureName || "Elite Calisthenics"}
        </h3>

        <p className="mut sm" style={{ marginBottom: "20px" }}>
          Master advanced bodyweight mechanics, unlock all 7 skill ladders, and access pro workout roadmaps.
        </p>

        {/* Pro Benefits List */}
        <div style={{ textAlign: "left", background: "var(--p2)", padding: "16px", borderRadius: "14px", border: "1px solid var(--ln)", marginBottom: "20px" }}>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px", fontSize: "13.5px" }}>
            <span style={{ color: "var(--ok)", fontWeight: "bold" }}>✔</span>
            <span>All 7 Skill Trees (Planche, Muscle-Up, Handstand, Front Lever)</span>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px", fontSize: "13.5px" }}>
            <span style={{ color: "var(--ok)", fontWeight: "bold" }}>✔</span>
            <span>All Multi-Week Programs (Strength Builder & Hybrid Iron)</span>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginBottom: "10px", fontSize: "13.5px" }}>
            <span style={{ color: "var(--ok)", fontWeight: "bold" }}>✔</span>
            <span>Slow-Mo Video Analysis & Cloud Firestore Sync</span>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "13.5px" }}>
            <span style={{ color: "var(--ok)", fontWeight: "bold" }}>✔</span>
            <span>Personal Record Max Testing Analytics</span>
          </div>
        </div>

        {/* Pricing Options */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "20px" }}>
          <div
            className="card"
            style={{
              padding: "14px",
              borderColor: "var(--acc)",
              background: "rgba(255, 107, 44, 0.08)",
              cursor: "pointer"
            }}
          >
            <span className="pill" style={{ borderColor: "var(--acc)", color: "var(--acc)", fontSize: "10px" }}>
              MOST POPULAR
            </span>
            <b style={{ display: "block", fontSize: "20px", marginTop: "4px" }}>$59.99</b>
            <span className="mut sm" style={{ fontSize: "11px" }}>/ year ($4.99/mo)</span>
          </div>

          <div
            className="card"
            style={{ padding: "14px", cursor: "pointer" }}
          >
            <span className="pill" style={{ fontSize: "10px" }}>MONTHLY</span>
            <b style={{ display: "block", fontSize: "20px", marginTop: "4px" }}>$7.99</b>
            <span className="mut sm" style={{ fontSize: "11px" }}>/ month</span>
          </div>
        </div>

        <button
          className="btn"
          style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: "16px" }}
          onClick={handleUpgrade}
        >
          {user ? "🚀 Upgrade to FORGE PRO" : "🔐 Sign In to Unlock PRO"}
        </button>

        <span className="mut sm" style={{ display: "block", marginTop: "12px", fontSize: "11px" }}>
          Cancel anytime · 7-day money back guarantee
        </span>
      </div>
    </div>
  );
}
