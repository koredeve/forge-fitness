"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AuthModal({ isOpen, onClose, defaultMode = "signin", subtitle = "Sign in to save your streaks, track skill mastery, and unlock workouts." }) {
  const { login, signup, loginWithGoogle } = useAuth();
  const [isSignUp, setIsSignUp] = useState(defaultMode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (isSignUp) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      onClose();
    } catch (err) {
      console.error(err);
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        setError("Invalid email or password. Please check and try again.");
      } else if (err.code === "auth/email-already-in-use") {
        setError("An account already exists with this email. Please sign in.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError(err.message || "Failed to authenticate. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      console.error(err);
      setError("Google authentication cancelled or not enabled in Firebase.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="ov show"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 250,
        padding: "16px"
      }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="sheet"
        style={{
          maxWidth: "420px",
          width: "100%",
          borderRadius: "20px",
          background: "linear-gradient(180deg, #171c23 0%, #0e1115 100%)",
          border: "1px solid var(--ln)",
          boxShadow: "0 24px 64px rgba(0, 0, 0, 0.8)",
          padding: "28px 24px",
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

        {/* Logo & Title */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div className="logo" style={{ fontSize: "24px", margin: "0 0 6px" }}>
            FORGE<i>.</i>
          </div>
          <h3 style={{ fontSize: "20px", fontWeight: "800" }}>
            {isSignUp ? "Create Your Account" : "Welcome Back"}
          </h3>
          <p className="mut sm" style={{ marginTop: "4px", fontSize: "12px", lineHeight: "1.4" }}>
            {subtitle}
          </p>
        </div>

        {/* Mode Switcher Tabs */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            background: "rgba(11, 13, 16, 0.8)",
            padding: "4px",
            borderRadius: "10px",
            marginBottom: "18px",
            border: "1px solid var(--ln)"
          }}
        >
          <button
            type="button"
            onClick={() => {
              setIsSignUp(false);
              setError("");
            }}
            style={{
              padding: "8px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "12.5px",
              background: !isSignUp ? "var(--p2)" : "transparent",
              color: !isSignUp ? "#fff" : "var(--mut)",
              border: !isSignUp ? "1px solid var(--ln)" : "none"
            }}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsSignUp(true);
              setError("");
            }}
            style={{
              padding: "8px",
              borderRadius: "8px",
              fontWeight: "700",
              fontSize: "12.5px",
              background: isSignUp ? "var(--p2)" : "transparent",
              color: isSignUp ? "#fff" : "var(--mut)",
              border: isSignUp ? "1px solid var(--ln)" : "none"
            }}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(255, 77, 77, 0.12)",
              border: "1px solid rgba(255, 77, 77, 0.4)",
              color: "#ff8f8f",
              padding: "10px 14px",
              borderRadius: "10px",
              fontSize: "12px",
              marginBottom: "16px",
              lineHeight: "1.4"
            }}
          >
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div className="f">
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--tx)", marginBottom: "4px" }}>
              Email Address
            </label>
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: "100%",
                padding: "11px 14px",
                background: "rgba(11, 13, 16, 0.9)",
                border: "1px solid var(--ln)",
                borderRadius: "10px",
                color: "#fff",
                fontSize: "14px"
              }}
            />
          </div>

          <div className="f">
            <label style={{ fontSize: "12px", fontWeight: "600", color: "var(--tx)", marginBottom: "4px" }}>
              Password
            </label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "11px 14px",
                background: "rgba(11, 13, 16, 0.9)",
                border: "1px solid var(--ln)",
                borderRadius: "10px",
                color: "#fff",
                fontSize: "14px"
              }}
            />
          </div>

          <button
            type="submit"
            className="btn"
            disabled={loading}
            style={{
              width: "100%",
              justifyContent: "center",
              padding: "12px",
              fontSize: "14px",
              marginTop: "6px",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? "Please wait..." : isSignUp ? "Create Free Account →" : "Sign In →"}
          </button>
        </form>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            margin: "18px 0",
            gap: "10px"
          }}
        >
          <div style={{ flex: 1, height: "1px", background: "var(--ln)" }}></div>
          <span className="mut sm" style={{ fontSize: "11px", textTransform: "uppercase" }}>
            or continue with
          </span>
          <div style={{ flex: 1, height: "1px", background: "var(--ln)" }}></div>
        </div>

        <button
          type="button"
          className="btn gh"
          onClick={handleGoogle}
          disabled={loading}
          style={{
            width: "100%",
            justifyContent: "center",
            padding: "11px",
            fontSize: "13.5px",
            gap: "10px"
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.3 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.3-.8-.4-1.8-.4-2.8s.2-2 .4-2.8L1.9 6.3C.7 8.7 0 10.3 0 12s.7 3.3 1.9 5.7l3.7-2.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.3-6.4-5.2L1.9 16C3.7 19.7 7.5 23 12 23z"
            />
          </svg>
          Continue with Google
        </button>
      </div>
    </div>
  );
}
