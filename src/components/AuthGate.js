"use client";
import React from "react";
import { useAuth } from "@/context/AuthContext";

export default function AuthGate({ title, subtitle, icon = "🔐", children }) {
  const { user, loading, openAuthModal } = useAuth();

  if (loading && !user) {
    return (
      <div style={{ textAlign: "center", padding: "80px 20px" }}>
        <div className="clk" style={{ fontSize: "32px" }}>⏳</div>
        <p className="mut sm" style={{ marginTop: "10px" }}>Loading FORGE...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="vw active" style={{ maxWidth: "600px", margin: "40px auto", textAlign: "center" }}>
          <div
            className="card"
            style={{
              position: "relative",
              padding: "40px 28px",
              background: "linear-gradient(180deg, #171c23 0%, #0e1115 100%)",
              border: "2px solid var(--acc)",
              boxShadow: "0 20px 60px rgba(0, 0, 0, 0.7)",
              borderRadius: "24px"
            }}
          >
            {/* Top Right Close Button */}
            <button
              className="xbtn"
              onClick={() => {
                if (typeof window !== "undefined" && window.history.length > 1) {
                  window.history.back();
                } else {
                  window.location.href = "/";
                }
              }}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.08)",
                border: "1px solid var(--ln)",
                color: "#fff",
                fontSize: "16px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease",
                zIndex: 10
              }}
              title="Close & Return"
              aria-label="Close"
            >
              ✕
            </button>

            <div style={{ fontSize: "52px", marginBottom: "12px" }}>{icon}</div>

            <span className="cali-acc" style={{ fontSize: "12px", letterSpacing: "0.2em" }}>
              MEMBERS ONLY ACCESS
            </span>

            <h2 style={{ fontSize: "28px", margin: "10px 0 8px", textTransform: "uppercase" }}>
              {title || "Unlock Full Training"}
            </h2>

            <p className="sub" style={{ margin: "0 auto 24px", maxWidth: "460px", fontSize: "14.5px" }}>
              {subtitle || "Create a free account or sign in to access video motion guides, skill trees, daily workouts, and cloud tracking."}
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "340px", margin: "0 auto" }}>
              <button
                className="btn"
                style={{ justifyContent: "center", padding: "14px", fontSize: "15px", boxShadow: "0 6px 24px rgba(255, 107, 44, 0.4)" }}
                onClick={() => openAuthModal(`Sign in or create a free account to access ${title || "FORGE features"}.`)}
              >
                🔐 Sign In / Create Free Account →
              </button>

              <button
                className="btn gh sm"
                style={{ justifyContent: "center", padding: "10px", fontSize: "13px" }}
                onClick={() => {
                  if (typeof window !== "undefined" && window.history.length > 1) {
                    window.history.back();
                  } else {
                    window.location.href = "/";
                  }
                }}
              >
                ← Return to Home Preview
              </button>
            </div>

          <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px dashed var(--ln)", display: "flex", justifyContent: "space-around", color: "var(--mut)", fontSize: "12px" }}>
            <span>✔ Free Forever Tier</span>
            <span>✔ Zero Credit Card</span>
            <span>✔ Cloud Sync</span>
          </div>
        </div>
      </div>
    );
  }

  return children;
}
