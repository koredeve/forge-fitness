"use client";
import React, { useState } from "react";
import { EXDB, CATS } from "@/data/db";
import ExerciseModal from "@/components/ExerciseModal";

export default function Library() {
  const [filterCat, setFilterCat] = useState("all");
  const [filterLv, setFilterLv] = useState(0);
  const [query, setQuery] = useState("");
  const [selectedEx, setSelectedEx] = useState(null);

  const q = query.toLowerCase();
  const list = EXDB.filter(
    (e) =>
      (filterCat === "all" || e.cat === filterCat) &&
      (!filterLv || e.lv === filterLv) &&
      (!q || (e.n + " " + e.ms + " " + e.d).toLowerCase().includes(q))
  );

  return (
    <div className="vw active" id="v-library">
      <h1 className="pg">Exercise Library</h1>
      <p className="sub">
        The encyclopedia: {EXDB.length} movements with cues, common mistakes, regression → progression paths, and AI video form coaches.
      </p>

      <div className="filters">
        <button
          className={`fbtn ${filterCat === "all" ? "on" : ""}`}
          onClick={() => setFilterCat("all")}
        >
          All
        </button>
        {Object.entries(CATS).map(([k, v]) => (
          <button
            key={k}
            className={`fbtn ${filterCat === k ? "on" : ""}`}
            onClick={() => setFilterCat(k)}
          >
            {v.n}
          </button>
        ))}
      </div>

      <div className="filters">
        {["All levels", "Beginner", "Intermediate", "Advanced"].map((t, i) => (
          <button
            key={i}
            className={`fbtn ${filterLv === i ? "on" : ""}`}
            onClick={() => setFilterLv(i)}
          >
            {t}
          </button>
        ))}
        <input
          id="q"
          placeholder="Search exercises… (try: planche)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid g3">
        {list.length > 0 ? (
          list.map((e) => (
            <div
              key={e.id}
              className="card cl"
              onClick={() => setSelectedEx(e)}
              style={e.cat === "calis" ? { borderColor: "#3a2a1d" } : {}}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "6px", flexWrap: "wrap" }}>
                <span className="pill">
                  <span className="d" style={{ background: CATS[e.cat]?.c }}></span>
                  {CATS[e.cat]?.n}
                </span>
                <span className={`pill lv${e.lv}`}>{"●".repeat(e.lv)} L{e.lv}</span>
              </div>
              <b style={{ display: "block", marginTop: "8px" }}>
                {e.cat === "calis" ? "🤸 " : ""}
                {e.n}
              </b>
              <div className="mut sm">{e.ms}</div>
              <div className="mut sm">🧰 {e.eq}</div>
            </div>
          ))
        ) : (
          <p className="mut">No matches — try clearing filters.</p>
        )}
      </div>

      <ExerciseModal exercise={selectedEx} onClose={() => setSelectedEx(null)} />
    </div>
  );
}
