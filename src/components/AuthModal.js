"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";

export default function AuthModal({ isOpen, onClose }) {
  const { user, login, signup, loginWithGoogle, logout } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
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
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(email, password);
      }
      onClose();
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    try {
      await loginWithGoogle();
      onClose();
    } catch (err) {
      setError(err.message.replace("Firebase: ", ""));
    }
  };

  return (
    <div className="ov show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="sheet" style={{ maxWidth: "420px" }}>
        <button className="xbtn" onClick={onClose}>✕</button>

        {user ? (
          <div>
            <h3>Account Profile</h3>
            <p className="mut sm" style={{ margin: "10px 0 20px" }}>Logged in as: <b>{user.email}</b></p>
            <div className="stat" style={{ marginBottom: "16px" }}>
              <span className="cali-acc">CLOUD SYNC ACTIVE</span>
              <p className="mut sm" style={{ marginTop: "4px" }}>Your workouts and skill levels are safely backed up to Firebase Firestore.</p>
            </div>
            <button className="btn gh" style={{ width: "100%", justifyContent: "center" }} onClick={logout}>
              Sign Out
            </button>
          </div>
        ) : (
          <div>
            <h3>{isLogin ? "Sign In to FORGE" : "Create Your Account"}</h3>
            <p className="mut sm" style={{ marginBottom: "16px" }}>
              {isLogin ? "Access your synced workouts & skill progress." : "Sync your calisthenics journey across all devices."}
            </p>

            {error && <div style={{ color: "#ff8f8f", background: "rgba(255,100,100,0.1)", padding: "10px", borderRadius: "8px", fontSize: "13px", marginBottom: "12px" }}>{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div>
                <label className="mut sm" style={{ display: "block", marginBottom: "4px" }}>Email</label>
                <input
                  type="email"
                  required
                  placeholder="athlete@forge.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", background: "var(--p)", border: "1px solid var(--ln)", borderRadius: "10px", color: "var(--tx)", outline: "none" }}
                />
              </div>
              <div>
                <label className="mut sm" style={{ display: "block", marginBottom: "4px" }}>Password</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: "100%", padding: "10px 14px", background: "var(--p)", border: "1px solid var(--ln)", borderRadius: "10px", color: "var(--tx)", outline: "none" }}
                />
              </div>

              <button type="submit" className="btn" style={{ width: "100%", justifyContent: "center", marginTop: "6px" }} disabled={loading}>
                {loading ? "Processing..." : isLogin ? "Sign In" : "Sign Up"}
              </button>
            </form>

            <div style={{ textAlign: "center", margin: "14px 0 10px", color: "var(--mut)", fontSize: "12px" }}>OR</div>

            <button type="button" className="btn gh" style={{ width: "100%", justifyContent: "center" }} onClick={handleGoogle}>
              Continue with Google
            </button>

            <div style={{ textAlign: "center", marginTop: "16px", fontSize: "13px" }}>
              <span className="mut">{isLogin ? "Don't have an account? " : "Already have an account? "}</span>
              <button style={{ color: "var(--acc)", fontWeight: "bold" }} onClick={() => setIsLogin(!isLogin)}>
                {isLogin ? "Sign Up" : "Sign In"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
