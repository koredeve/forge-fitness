"use client";
import React, { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { EXDB, CATS } from "@/data/db";
import ExerciseModal from "@/components/ExerciseModal";
import AuthGate from "@/components/AuthGate";

function LibraryContent() {
  const searchParams = useSearchParams();
  const initialCat = searchParams.get("cat") || "all";

  const [selectedCat, setSelectedCat] = useState(initialCat);
  const [query, setQuery] = useState("");
  const [selectedEx, setSelectedEx] = useState(null);

  const filtered = EXDB.filter((e) => {
    const mCat = selectedCat === "all" || e.cat === selectedCat;
    const mQ = !query || e.n.toLowerCase().includes(query.toLowerCase()) || e.t.toLowerCase().includes(query.toLowerCase());
    return mCat && mQ;
  });

  return (
    <div className="vw active" id="v-library">
      <h1 className="pg">Movement Library</h1>
      <p className="sub">
        Form is not a suggestion. Search any exercise, click to open slow-motion video analysis, muscle activation maps, and form checklists.
      </p>

      <div className="filters">
        <button
          className={`fbtn ${selectedCat === "all" ? "on" : ""}`}
          onClick={() => setSelectedCat("all")}
        >
          All Movements ({EXDB.length})
        </button>
        {Object.entries(CATS).map(([k, v]) => (
          <button
            key={k}
            className={`fbtn ${selectedCat === k ? "on" : ""}`}
            onClick={() => setSelectedCat(k)}
          >
            {v.n}
          </button>
        ))}
        <input
          id="q"
          placeholder="Search exercises, cues, muscles..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid g3">
        {filtered.map((e) => (
          <div
            key={e.id}
            className="card cl"
            onClick={() => setSelectedEx(e)}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="pill">
                <span className="d" style={{ background: CATS[e.cat]?.c }}></span>
                {CATS[e.cat]?.n}
              </span>
              <span className={`pill lv${e.lv}`}>{"●".repeat(e.lv)} L{e.lv}</span>
            </div>
            <b style={{ display: "block", fontSize: "17px", margin: "8px 0 4px" }}>
              {e.n}
            </b>
            <div className="mut sm">{e.t}</div>
            <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span className="mut sm" style={{ fontSize: "11px" }}>{e.cu?.length || 0} form cues</span>
              <button className="btn gh sm" style={{ fontSize: "11px", padding: "4px 8px" }}>
                Analyze 🎬
              </button>
            </div>
          </div>
        ))}
      </div>

      <ExerciseModal
        exercise={selectedEx}
        onClose={() => setSelectedEx(null)}
        onSelectExercise={(ex) => setSelectedEx(ex)}
      />
    </div>
  );
}

export default function Library() {
  return (
    <AuthGate
      title="Movement Library"
      subtitle="Sign in to browse 35+ exercise breakdowns, target joint angles, and slow-motion video analysis."
      icon="📚"
    >
      <Suspense fallback={<div className="mut sm" style={{ padding: "40px", textAlign: "center" }}>Loading movement library...</div>}>
        <LibraryContent />
      </Suspense>
    </AuthGate>
  );
}
