"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useFitness } from "@/context/FitnessContext";
import { SKILLS, TESTS, CATS } from "@/data/db";
import AuthGate from "@/components/AuthGate";
import Link from "next/link";

export default function ProfilePage() {
  const { 
    user, 
    logout, 
    isPro, 
    isAdmin, 
    proPassInfo, 
    openProModal,
    grantProPass,
    revokeProPass,
    fetchProPasses 
  } = useAuth();

  const { logs, prs, skills, getStreak, getSkillsPct, showToast } = useFitness();

  // Admin Access Pass Form State
  const [grantEmail, setGrantEmail] = useState("");
  const [grantDuration, setGrantDuration] = useState("1week");
  const [grantNote, setGrantNote] = useState("");
  const [isGranting, setIsGranting] = useState(false);

  // Admin Pass List State
  const [passes, setPasses] = useState([]);
  const [loadingPasses, setLoadingPasses] = useState(false);

  // Load passes if admin
  const loadPasses = async () => {
    if (!isAdmin) return;
    setLoadingPasses(true);
    try {
      const list = await fetchProPasses();
      setPasses(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPasses(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadPasses();
    }
  }, [isAdmin]);

  const handleGrant = async (e) => {
    e.preventDefault();
    if (!grantEmail.trim()) {
      showToast("Please enter a valid email address.");
      return;
    }
    setIsGranting(true);
    try {
      await grantProPass(grantEmail, grantDuration, grantNote);
      showToast(`PRO pass granted to ${grantEmail}! ⚡`);
      setGrantEmail("");
      setGrantNote("");
      await loadPasses();
    } catch (err) {
      showToast(err.message || "Failed to grant pass");
    } finally {
      setIsGranting(false);
    }
  };

  const handleRevoke = async (passId, email) => {
    if (!confirm(`Revoke PRO access for ${email}?`)) return;
    try {
      await revokeProPass(passId);
      showToast(`Access revoked for ${email}`);
      await loadPasses();
    } catch (err) {
      showToast("Failed to revoke pass");
    }
  };

  // Compute Process & Performance Metrics
  const streak = getStreak();
  const masteryPct = getSkillsPct();
  const totalMins = logs.reduce((acc, s) => acc + (s.min || 0), 0);
  const hoursTrained = Math.floor(totalMins / 60);
  const minsRemaining = totalMins % 60;

  // Compute Conquered Milestones across all trees
  let totalLevels = 0;
  let conqueredCount = 0;
  SKILLS.forEach((s) => {
    totalLevels += s.lv.length;
    (skills[s.id] || []).forEach((v) => {
      if (v) conqueredCount++;
    });
  });

  // User details
  const displayName = user?.displayName || user?.email?.split("@")[0] || "Athlete";
  const userInitial = displayName.charAt(0).toUpperCase();
  const memberSince = user?.metadata?.creationTime 
    ? new Date(user.metadata.creationTime).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "Recently";

  // Pass expiration helper
  const formatExpiry = (pass) => {
    if (!pass.active) return { label: "Revoked", color: "var(--mut)", active: false };
    if (!pass.expiresAt) return { label: "Permanent VIP", color: "var(--ok)", active: true };
    const diff = new Date(pass.expiresAt).getTime() - Date.now();
    if (diff <= 0) return { label: "Expired", color: "#ff4d4d", active: false };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) {
      return { label: `Active · ${days}d ${hours}h left`, color: "var(--ok)", active: true };
    }
    return { label: `Active · ${hours}h left`, color: "var(--ok)", active: true };
  };

  return (
    <AuthGate
      title="Athlete Profile"
      subtitle="Sign in to view your personal process, track unlocked skills, and manage your account."
      icon="👤"
    >
      <div className="vw active" id="v-profile">
        {/* Profile Hero Card */}
        <div 
          className="card" 
          style={{ 
            marginBottom: "24px",
            background: "linear-gradient(135deg, rgba(255, 107, 44, 0.08) 0%, rgba(18, 22, 27, 0.8) 100%)",
            border: "1px solid var(--ln)",
            position: "relative",
            overflow: "hidden"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              {user?.photoURL ? (
                <img 
                  src={user.photoURL} 
                  alt={displayName} 
                  style={{ width: "72px", height: "72px", borderRadius: "50%", border: "2px solid var(--acc)", objectFit: "cover" }} 
                />
              ) : (
                <div 
                  style={{ 
                    width: "72px", 
                    height: "72px", 
                    borderRadius: "50%", 
                    background: "linear-gradient(135deg, #ff6b2c 0%, #ff944d 100%)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "28px",
                    fontWeight: "900",
                    color: "#000",
                    boxShadow: "0 0 20px rgba(255, 107, 44, 0.35)"
                  }}
                >
                  {userInitial}
                </div>
              )}

              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                  <h1 style={{ fontSize: "24px", margin: 0, fontWeight: "900" }}>{displayName}</h1>
                  {isAdmin ? (
                    <span className="pill" style={{ borderColor: "#ffd34d", color: "#ffd34d", fontSize: "11px", fontWeight: "bold" }}>
                      👑 CREATOR / ADMIN
                    </span>
                  ) : proPassInfo?.valid ? (
                    <span className="pill" style={{ borderColor: "var(--ok)", color: "var(--ok)", fontSize: "11px", fontWeight: "bold" }}>
                      ⚡ PRO PASS ({proPassInfo.durationLabel})
                    </span>
                  ) : isPro ? (
                    <span className="pill" style={{ borderColor: "var(--acc)", color: "var(--acc)", fontSize: "11px", fontWeight: "bold" }}>
                      👑 PRO ATHLETE
                    </span>
                  ) : (
                    <span className="pill" style={{ borderColor: "var(--ln)", color: "var(--mut)", fontSize: "11px" }}>
                      FREE ATHLETE
                    </span>
                  )}
                </div>

                <p className="mut sm" style={{ margin: "4px 0 0", fontSize: "13px" }}>
                  {user?.email} · Member since {memberSince}
                </p>

                {proPassInfo?.valid && !proPassInfo.permanent && proPassInfo.expiresAt && (
                  <p style={{ margin: "4px 0 0", fontSize: "12px", color: "var(--ok)" }}>
                    ✓ PRO access active until {new Date(proPassInfo.expiresAt).toLocaleDateString()} ({new Date(proPassInfo.expiresAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })})
                  </p>
                )}
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {!isPro && !isAdmin && (
                <button 
                  className="btn sm"
                  style={{ background: "linear-gradient(135deg, #ff6b2c 0%, #ff944d 100%)", fontSize: "12px" }}
                  onClick={() => openProModal("All Calisthenics Mastery Trees")}
                >
                  👑 Upgrade to PRO
                </button>
              )}
              <button 
                className="btn gh sm" 
                style={{ fontSize: "12px" }}
                onClick={() => logout()}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>

        {/* Training Process & Performance Dashboard */}
        <div className="sect">
          <h2>Training Process & Biomechanics</h2>
          <span className="mut">Real-time stats synced to cloud</span>
        </div>

        <div className="grid g4" style={{ marginBottom: "24px" }}>
          <div className="card" style={{ textAlign: "center", padding: "18px" }}>
            <div style={{ fontSize: "28px", marginBottom: "4px" }}>🔥</div>
            <b style={{ fontSize: "24px", color: "var(--acc)", display: "block" }}>{streak}</b>
            <span className="mut sm" style={{ fontSize: "12px" }}>Daily Streak</span>
          </div>

          <div className="card" style={{ textAlign: "center", padding: "18px" }}>
            <div style={{ fontSize: "28px", marginBottom: "4px" }}>🏋️</div>
            <b style={{ fontSize: "24px", color: "var(--tx)", display: "block" }}>{logs.length}</b>
            <span className="mut sm" style={{ fontSize: "12px" }}>Workouts Conquered</span>
          </div>

          <div className="card" style={{ textAlign: "center", padding: "18px" }}>
            <div style={{ fontSize: "28px", marginBottom: "4px" }}>⏱️</div>
            <b style={{ fontSize: "24px", color: "#5aa9ff", display: "block" }}>
              {hoursTrained > 0 ? `${hoursTrained}h ${minsRemaining}m` : `${minsRemaining}m`}
            </b>
            <span className="mut sm" style={{ fontSize: "12px" }}>Total Mat Time</span>
          </div>

          <div className="card" style={{ textAlign: "center", padding: "18px" }}>
            <div style={{ fontSize: "28px", marginBottom: "4px" }}>🤸</div>
            <b style={{ fontSize: "24px", color: "var(--ok)", display: "block" }}>{masteryPct}%</b>
            <span className="mut sm" style={{ fontSize: "12px" }}>Overall Mastery</span>
          </div>
        </div>

        {/* Calisthenics Mastery Snapshot & PR Highlights */}
        <div className="grid g2" style={{ marginBottom: "28px" }}>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "16px" }}>🤸 Calisthenics Milestones</h3>
              <Link href="/calis" style={{ color: "var(--acc)", fontSize: "12px", textDecoration: "none", fontWeight: "bold" }}>
                View Skill Trees →
              </Link>
            </div>
            <p className="mut sm" style={{ fontSize: "13px", marginBottom: "14px" }}>
              Progressive mastery ladder. You have conquered <b>{conqueredCount}</b> of <b>{totalLevels}</b> gymnastics standards.
            </p>
            <div className="pb" style={{ height: "8px" }}>
              <i style={{ width: `${masteryPct}%` }}></i>
            </div>
            <div style={{ marginTop: "16px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
              {SKILLS.slice(0, 4).map((s) => {
                const uL = skills[s.id] || [];
                const dC = uL.filter(Boolean).length;
                return (
                  <div key={s.id} style={{ background: "rgba(255,255,255,0.03)", padding: "8px 10px", borderRadius: "8px", border: "1px solid var(--ln)" }}>
                    <span style={{ fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                      {s.icon} <b>{s.n.split("→")[0].trim()}</b>
                    </span>
                    <span className="mut sm" style={{ fontSize: "11px" }}>Lv{dC} of {s.lv.length} completed</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
              <h3 style={{ margin: 0, fontSize: "16px" }}>🏆 Personal Records (PRs)</h3>
              <Link href="/progress" style={{ color: "var(--acc)", fontSize: "12px", textDecoration: "none", fontWeight: "bold" }}>
                Test New PR →
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              {TESTS.map((t) => {
                const history = prs[t.id] || [];
                const best = history.length ? Math.max(...history.map((h) => h.v)) : null;
                return (
                  <div key={t.id} style={{ padding: "10px", background: "rgba(255,255,255,0.03)", borderRadius: "10px", border: "1px solid var(--ln)" }}>
                    <span className="mut sm" style={{ fontSize: "11px", display: "block" }}>{t.n}</span>
                    <b style={{ fontSize: "18px", color: best ? "var(--acc)" : "var(--mut)" }}>
                      {best ? `${best} ${t.u}` : "No record"}
                    </b>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 👑 Creator Access Pass Manager (Visible exclusively to Admins/Owners) */}
        {isAdmin && (
          <div 
            className="card" 
            style={{ 
              marginBottom: "28px",
              border: "1px solid rgba(255, 211, 77, 0.4)",
              background: "linear-gradient(135deg, rgba(255, 211, 77, 0.04) 0%, rgba(18, 22, 27, 0.9) 100%)"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "18px", display: "flex", alignItems: "center", gap: "8px", color: "#ffd34d" }}>
                  👑 Creator Access Pass Manager
                </h3>
                <p className="mut sm" style={{ margin: "4px 0 0", fontSize: "13px" }}>
                  Grant limited or permanent PRO access to friends, clients, or beta testers by email.
                </p>
              </div>
              <button 
                className="btn gh sm"
                onClick={loadPasses}
                disabled={loadingPasses}
                style={{ fontSize: "11px", padding: "4px 10px" }}
              >
                {loadingPasses ? "Refreshing..." : "↻ Refresh Passes"}
              </button>
            </div>

            {/* Grant Pass Form */}
            <form onSubmit={handleGrant} style={{ display: "grid", gridTemplateColumns: "2fr 1.5fr 2fr auto", gap: "10px", alignItems: "center", margin: "16px 0 20px" }}>
              <input 
                type="email" 
                placeholder="athlete@example.com"
                value={grantEmail}
                onChange={(e) => setGrantEmail(e.target.value)}
                required
                style={{
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid var(--ln)",
                  borderRadius: "8px",
                  padding: "9px 12px",
                  color: "#fff",
                  fontSize: "13px"
                }}
              />

              <select
                value={grantDuration}
                onChange={(e) => setGrantDuration(e.target.value)}
                style={{
                  background: "#181d26",
                  border: "1px solid var(--ln)",
                  borderRadius: "8px",
                  padding: "9px 12px",
                  color: "#fff",
                  fontSize: "13px"
                }}
              >
                <option value="1day">⚡ 1 Day (24h)</option>
                <option value="1week">📅 1 Week (7d)</option>
                <option value="1month">🗓️ 1 Month (30d)</option>
                <option value="permanent">♾️ Permanent VIP</option>
              </select>

              <input 
                type="text" 
                placeholder="Note (e.g. Gym friend Alex)"
                value={grantNote}
                onChange={(e) => setGrantNote(e.target.value)}
                style={{
                  background: "rgba(0,0,0,0.4)",
                  border: "1px solid var(--ln)",
                  borderRadius: "8px",
                  padding: "9px 12px",
                  color: "#fff",
                  fontSize: "13px"
                }}
              />

              <button
                type="submit"
                className="btn sm"
                disabled={isGranting}
                style={{
                  background: "linear-gradient(135deg, #ff6b2c 0%, #ff944d 100%)",
                  padding: "9px 16px",
                  fontSize: "13px",
                  whiteSpace: "nowrap"
                }}
              >
                {isGranting ? "Granting..." : "⚡ Grant PRO Pass"}
              </button>
            </form>

            {/* Granted Passes List */}
            <div style={{ marginTop: "14px" }}>
              <h4 style={{ fontSize: "14px", margin: "0 0 10px", color: "var(--tx)" }}>Active & Past Access Passes ({passes.length})</h4>
              {passes.length === 0 ? (
                <p className="mut sm" style={{ fontSize: "12px" }}>No passes granted yet. Enter an email above to issue your first pass.</p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  {passes.map((p) => {
                    const status = formatExpiry(p);
                    return (
                      <div 
                        key={p.id}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "10px 14px",
                          background: "rgba(0,0,0,0.3)",
                          border: "1px solid var(--ln)",
                          borderRadius: "10px",
                          flexWrap: "wrap",
                          gap: "8px"
                        }}
                      >
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <b style={{ fontSize: "13px", color: "#fff" }}>{p.email}</b>
                            <span className="pill sm" style={{ fontSize: "10px" }}>{p.durationLabel || p.duration}</span>
                            <span style={{ fontSize: "11px", color: status.color, fontWeight: "bold" }}>
                              {status.label}
                            </span>
                          </div>
                          <span className="mut sm" style={{ fontSize: "11px", marginTop: "2px", display: "block" }}>
                            Granted: {new Date(p.grantedAt).toLocaleDateString()} {p.note ? `· "${p.note}"` : ""}
                          </span>
                        </div>

                        {status.active && (
                          <button
                            className="btn gh sm"
                            style={{ color: "#ff4d4d", borderColor: "rgba(255,77,77,0.3)", fontSize: "11px", padding: "3px 8px" }}
                            onClick={() => handleRevoke(p.id, p.email)}
                          >
                            Revoke
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Recent Training Activity Feed */}
        <div className="sect">
          <h2>Recent Sessions</h2>
          <span className="mut">Last workouts completed</span>
        </div>

        <div className="card" style={{ padding: "16px" }}>
          {logs.length === 0 ? (
            <p className="mut sm" style={{ textAlign: "center", margin: "20px 0" }}>
              No workouts logged yet. Start a routine in the Programs or Calisthenics tab!
            </p>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {logs.slice(0, 5).map((s, i) => {
                const catInfo = CATS[s.cat] || { n: s.cat, c: "#ff6b2c" };
                return (
                  <div
                    key={s.id || i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "10px 12px",
                      background: "rgba(255, 255, 255, 0.02)",
                      border: "1px solid var(--ln)",
                      borderRadius: "10px"
                    }}
                  >
                    <div>
                      <b style={{ fontSize: "14px", display: "block" }}>{s.n}</b>
                      <span className="mut sm" style={{ fontSize: "12px" }}>{s.d}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span
                        className="pill sm"
                        style={{
                          borderColor: catInfo.c,
                          color: catInfo.c,
                          fontSize: "10px"
                        }}
                      >
                        {catInfo.n}
                      </span>
                      <b style={{ fontSize: "13px" }}>{s.min}m</b>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
