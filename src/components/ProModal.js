"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "./AuthModal";

export default function ProModal({ isOpen, onClose, featureName }) {
  const { user, isPro, setProPlan } = useAuth();
  const [selectedTier, setSelectedTier] = useState("annual"); // 'annual' | 'monthly'
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleUpgrade = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    await setProPlan(true);
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 1800);
  };

  return (
    <>
      <div
        className="ov show"
        style={{ zIndex: 220 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <div
          className="sheet"
          style={{
            maxWidth: "480px",
            textAlign: "center",
            background: "linear-gradient(180deg, #1b1612 0%, #11151a 100%)",
            border: "2px solid var(--acc)",
            boxShadow: "0 24px 72px rgba(255, 107, 44, 0.35)",
            position: "relative"
          }}
        >
          <button
            className="xbtn"
            onClick={onClose}
            style={{ position: "absolute", top: "18px", right: "18px" }}
          >
            ✕
          </button>

          {success ? (
            <div style={{ padding: "30px 10px" }}>
              <div style={{ fontSize: "56px" }}>🎉</div>
              <h3 style={{ fontSize: "24px", color: "var(--ok)", margin: "12px 0 6px" }}>
                Welcome to FORGE PRO!
              </h3>
              <p className="mut sm">
                All 7 skill ladders, master progressions, and multi-week programs are now fully unlocked!
              </p>
            </div>
          ) : (
            <>
              <div style={{ fontSize: "40px", marginBottom: "4px" }}>👑</div>

              <span className="cali-acc" style={{ fontSize: "11px", letterSpacing: "0.22em" }}>
                FORGE PRO UNLOCK
              </span>

              <h3 style={{ fontSize: "22px", margin: "6px 0 4px", fontWeight: "900" }}>
                Unlock {featureName || "Elite Calisthenics"}
              </h3>

              <p className="mut sm" style={{ marginBottom: "16px", fontSize: "12.5px" }}>
                Master bodyweight physics, unlock all 7 skill trees, and follow elite programs.
              </p>

              {/* Benefits Checklist */}
              <div
                style={{
                  textAlign: "left",
                  background: "rgba(11, 13, 16, 0.75)",
                  padding: "14px 16px",
                  borderRadius: "12px",
                  border: "1px solid var(--ln)",
                  marginBottom: "16px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px"
                }}
              >
                <div style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "13px" }}>
                  <span style={{ color: "var(--ok)", fontWeight: "bold" }}>✔</span>
                  <span>All 7 Skill Trees (Planche, Muscle-Up, Handstand, Front Lever)</span>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "13px" }}>
                  <span style={{ color: "var(--ok)", fontWeight: "bold" }}>✔</span>
                  <span>All Multi-Week Programs (Strength Builder & Hybrid Iron)</span>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "13px" }}>
                  <span style={{ color: "var(--ok)", fontWeight: "bold" }}>✔</span>
                  <span>Slow-Mo Video Analysis & Cloud Firestore Sync</span>
                </div>
                <div style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "13px" }}>
                  <span style={{ color: "var(--ok)", fontWeight: "bold" }}>✔</span>
                  <span>Personal Record Max Testing Analytics</span>
                </div>
              </div>

              {/* Interactive Pricing Options */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "18px" }}>
                <div
                  className="card"
                  onClick={() => setSelectedTier("annual")}
                  style={{
                    padding: "12px",
                    cursor: "pointer",
                    borderColor: selectedTier === "annual" ? "var(--acc)" : "var(--ln)",
                    background: selectedTier === "annual" ? "rgba(255, 107, 44, 0.12)" : "var(--p)",
                    transition: "0.15s ease"
                  }}
                >
                  <span
                    className="pill"
                    style={{
                      borderColor: "var(--acc)",
                      color: "var(--acc)",
                      fontSize: "9.5px",
                      padding: "2px 6px"
                    }}
                  >
                    BEST VALUE · SAVE 38%
                  </span>
                  <b style={{ display: "block", fontSize: "20px", marginTop: "4px" }}>$59.99</b>
                  <span className="mut sm" style={{ fontSize: "11px" }}>/ year ($4.99/mo)</span>
                </div>

                <div
                  className="card"
                  onClick={() => setSelectedTier("monthly")}
                  style={{
                    padding: "12px",
                    cursor: "pointer",
                    borderColor: selectedTier === "monthly" ? "var(--acc)" : "var(--ln)",
                    background: selectedTier === "monthly" ? "rgba(255, 107, 44, 0.12)" : "var(--p)",
                    transition: "0.15s ease"
                  }}
                >
                  <span className="pill" style={{ fontSize: "9.5px", padding: "2px 6px" }}>
                    MONTHLY
                  </span>
                  <b style={{ display: "block", fontSize: "20px", marginTop: "4px" }}>$7.99</b>
                  <span className="mut sm" style={{ fontSize: "11px" }}>/ month</span>
                </div>
              </div>

              <button
                className="btn"
                style={{
                  width: "100%",
                  justifyContent: "center",
                  padding: "13px",
                  fontSize: "15px",
                  boxShadow: "0 6px 24px rgba(255, 107, 44, 0.4)"
                }}
                onClick={handleUpgrade}
              >
                {user
                  ? `🚀 Unlock PRO Now (${selectedTier === "annual" ? "$59.99/yr" : "$7.99/mo"})`
                  : "🔐 Sign In to Unlock PRO"}
              </button>

              <span className="mut sm" style={{ display: "block", marginTop: "10px", fontSize: "11px" }}>
                Cancel anytime · 7-day money back guarantee
              </span>
            </>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        subtitle="Sign in or create an account to activate your FORGE PRO membership."
      />
    </>
  );
}
