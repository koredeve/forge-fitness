"use client";
import React, { useState } from "react";
import { TESTS, CATS } from "@/data/db";
import { useFitness } from "@/context/FitnessContext";
import { useAuth } from "@/context/AuthContext";
import AuthGate from "@/components/AuthGate";

export default function Progress() {
  const { logs, prs, addLog, deleteLog, addPR, getStreak } = useFitness();
  const { user } = useAuth();

  const [sessName, setSessName] = useState("");
  const [sessCat, setSessCat] = useState("calis");
  const [sessMin, setSessMin] = useState(30);

  // Custom PR Modal state
  const [activePRTest, setActivePRTest] = useState(null);
  const [prScoreInput, setPrScoreInput] = useState("");

  const streak = getStreak();
  const totalMins = logs.reduce((a, s) => a + (s.min || 0), 0);
  const avgMins = logs.length ? Math.round(totalMins / logs.length) : 0;

  // Last 7 days chart
  const days = [...Array(7)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - 6 + i);
    return d;
  });

  const dayMins = days.map((d) => {
    const dateStr = d.toISOString().slice(0, 10);
    return logs.filter((s) => s.d === dateStr).reduce((a, s) => a + (s.min || 0), 0);
  });

  const maxMin = Math.max(30, ...dayMins);

  const handleAddSess = (e) => {
    e.preventDefault();
    addLog({
      d: new Date().toISOString().slice(0, 10),
      n: sessName.trim() || "Training Session",
      cat: sessCat,
      min: Math.max(1, parseInt(sessMin, 10) || 1)
    });
    setSessName("");
  };

  const handleSavePR = (e) => {
    e.preventDefault();
    if (!activePRTest) return;
    const val = parseInt(prScoreInput, 10);
    if (!val || val <= 0) return;
    addPR(activePRTest.id, val);
    setActivePRTest(null);
    setPrScoreInput("");
  };

  return (
    <AuthGate
      title="Progress & PR Tracking"
      subtitle="Sign in to track your 7-day training volume, log personal records, and sync your workout logs to the cloud."
      icon="📈"
    >
      <div className="vw active" id="v-progress">
        <h1 className="pg">Progress</h1>
        <p className="sub">
          Numbers that keep you honest. {user ? "Synchronized live with Firebase Cloud Firestore." : "Saved locally on this device."}
        </p>

        <div className="stats">
          <div className="stat">
            <b>{streak}</b>
            <span>Day streak</span>
          </div>
          <div className="stat">
            <b>{logs.length}</b>
            <span>Sessions</span>
          </div>
          <div className="stat">
            <b>{totalMins}</b>
            <span>Total minutes</span>
          </div>
          <div className="stat">
            <b>{avgMins}</b>
            <span>Avg / session</span>
          </div>
        </div>

        <div className="sect">
          <h2>Last 7 Days</h2>
          <span className="mut">minutes trained</span>
        </div>

        <div className="card">
          <div className="bars">
            {dayMins.map((m, i) => (
              <div key={i}>
                <span className="bw">{m || ""}</span>
                <div
                  className={`bar ${m ? "hot" : ""}`}
                  style={{ height: `${Math.max(4, (m / maxMin) * 90)}px` }}
                ></div>
                <span className="bw">{days[i].toLocaleDateString(undefined, { weekday: "short" })}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="sect">
          <h2>Personal Records</h2>
          <span className="mut">Max tests — take them monthly</span>
        </div>

        <div className="grid g2">
          {TESTS.map((t) => {
            const history = prs[t.id] || [];
            const best = history.length ? Math.max(...history.map((x) => x.v)) : 0;
            const last = history[history.length - 1];

            return (
              <div key={t.id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "8px" }}>
                  <b>{t.n}</b>
                  <button
                    className="btn gh sm"
                    onClick={() => {
                      setActivePRTest(t);
                      setPrScoreInput("");
                    }}
                  >
                    + Log test
                  </button>
                </div>

                <div style={{ display: "flex", gap: "20px", marginTop: "8px" }}>
                  <div>
                    <b style={{ fontFamily: "Archivo", fontSize: "22px", color: "var(--acc)" }}>
                      {best || "—"}
                    </b>
                    <br />
                    <span className="mut" style={{ fontSize: "11px" }}>
                      BEST ({t.u})
                    </span>
                  </div>
                  <div>
                    <b style={{ fontFamily: "Archivo", fontSize: "22px" }}>
                      {last ? last.v : "—"}
                    </b>
                    <br />
                    <span className="mut" style={{ fontSize: "11px" }}>
                      LAST {last ? `· ${last.d}` : ""}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="sect">
          <h2>Log a Session Manually</h2>
        </div>

        <div className="card">
          <form onSubmit={handleAddSess} className="fr">
            <div className="f">
              Workout name
              <input
                placeholder="e.g. Push Power"
                value={sessName}
                onChange={(e) => setSessName(e.target.value)}
              />
            </div>
            <div className="f">
              Type
              <select value={sessCat} onChange={(e) => setSessCat(e.target.value)}>
                {Object.entries(CATS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.n}
                  </option>
                ))}
              </select>
            </div>
            <div className="f">
              Minutes
              <input
                type="number"
                value={sessMin}
                onChange={(e) => setSessMin(e.target.value)}
                style={{ width: "80px" }}
              />
            </div>
            <button type="submit" className="btn sm">
              + Add to log
            </button>
          </form>

          <div style={{ marginTop: "14px" }}>
            {logs.length > 0 ? (
              logs.slice(0, 12).map((s, i) => (
                <div key={i} className="si">
                  <span>
                    <span className="pill" style={{ marginRight: "8px" }}>
                      <span className="d" style={{ background: CATS[s.cat]?.c }}></span>
                      {CATS[s.cat]?.n}
                    </span>
                    <b>{s.n}</b>
                  </span>
                  <span className="mut sm">
                    {s.d} · {s.min} min{" "}
                    <button
                      className="mut"
                      onClick={() => deleteLog(i)}
                      style={{ padding: "0 4px", marginLeft: "6px" }}
                    >
                      ✕
                    </button>
                  </span>
                </div>
              ))
            ) : (
              <span className="mut sm">No sessions yet — finish a guided workout or add one above.</span>
            )}
          </div>
        </div>

        {/* Custom Sleek PR Test Log Modal */}
        {activePRTest && (
          <div className="ov show" onClick={(e) => e.target === e.currentTarget && setActivePRTest(null)}>
            <div className="sheet" style={{ maxWidth: "420px" }}>
              <button className="xbtn" onClick={() => setActivePRTest(null)}>✕</button>
              <span className="cali-acc">MAX REPS / HOLD TEST</span>
              <h3 style={{ marginTop: "4px" }}>Log {activePRTest.n}</h3>
              <p className="mut sm" style={{ marginBottom: "16px" }}>
                Record your current maximum benchmark ({activePRTest.u}).
              </p>

              <form onSubmit={handleSavePR}>
                <label className="mut sm" style={{ display: "block", marginBottom: "6px" }}>
                  Score ({activePRTest.u})
                </label>
                <input
                  type="number"
                  autoFocus
                  required
                  min="1"
                  placeholder={`e.g. 15`}
                  value={prScoreInput}
                  onChange={(e) => setPrScoreInput(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "12px",
                    background: "var(--p)",
                    border: "1px solid var(--ln)",
                    borderRadius: "10px",
                    color: "#fff",
                    fontSize: "18px",
                    fontWeight: "bold",
                    outline: "none",
                    marginBottom: "16px"
                  }}
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <button type="button" className="btn gh" onClick={() => setActivePRTest(null)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn" style={{ justifyContent: "center" }}>
                    Save PR 🎯
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthGate>
  );
}
