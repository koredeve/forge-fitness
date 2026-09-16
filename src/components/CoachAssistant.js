"use client";
import React, { useState, useRef, useEffect } from "react";
import { useFitness } from "@/context/FitnessContext";
import { useAuth } from "@/context/AuthContext";
import { EXDB, SKILLS } from "@/data/db";
import { haptics } from "@/lib/haptics";

// Pre-built coaching knowledge base
const KNOWLEDGE_RESPONSES = {
  muscleup: `⚡ **The Strict Bar Muscle-Up Blueprint:**
1. **Strength Foundation:** Before attempting a bar muscle-up, ensure you can do **10+ clean strict pull-ups** and **12+ parallel bar dips**.
2. **Pull Path:** Pull backward and slightly arched rather than directly vertical. The bar should reach your lower sternum or upper abs, not just your chin!
3. **The Transition:** At the peak of your pull, aggressively snap your wrists over the bar and throw your head and chest forward over the pipe.
4. **The Press:** Finish with a powerful straight-bar dip press to full lockout.
💡 *Pro Tip:* Train explosive chest-to-bar pull-ups and jumping transitions 2x per week.`,

  planche: `🔥 **Planche Biomechanics & Progression:**
1. **Straight-Arm Scapular Protraction:** The foundational cue of planche is pushing the floor away so your upper back forms a dome (protraction) with shoulders depressed.
2. **Wrist Conditioning:** Planche places heavy torque on wrist flexors and biceps tendons. Always do 5 mins of loaded wrist rocks first.
3. **Progression Ladder:** Frog Stand (30s) ➔ Tuck Planche (15s) ➔ Advanced Tuck (flat back, 12s) ➔ Straddle Planche ➔ Full Planche.
💡 *Pro Tip:* Don't rush straight-arm work. Tendons adapt 3-5x slower than muscles!`,

  frontlever: `🚩 **Front Lever Mechanics (Pulling Mastery):**
1. **Scapular Depression & Retraction:** Think of pulling the bar down to your hips with straight elbows (like a straight-arm lat pulldown).
2. **Hollow Core Tension:** Squeeze your glutes and pull your belly button to your spine to eliminate any arch in your lower back.
3. **Progression Order:** Tuck FL hold (20s) ➔ Adv. Tuck FL (12s) ➔ Single-Leg FL (10s/side) ➔ Straddle FL ➔ Full Front Lever (8s+).
💡 *Pro Tip:* Australian rows with elevated feet build the exact mid-back density needed for the lever lock.`,

  wrist: `🩹 **Wrist Pain in Handstands & Floor Work:**
1. **Warm-Up First:** Always perform wrist extension rocks, knuckle push-ups, and palm lifts before loading your bodyweight.
2. **The "Spider-Finger" Grip:** Spread your fingers wide and actively press your fingertips and palm pads into the floor to distribute load away from the carpal joint.
3. **Use Parallettes:** If floor work aggravates your wrist angle, train on parallettes or push-up bars. A neutral wrist grip eliminates 90° hyper-extension pain immediately!`,

  rest: `⏱️ **Optimal Calisthenics Rest Intervals:**
- **Neurological & Skill Work (Muscle-Up, Planche, HSPU):** Rest **2 to 3 minutes** between sets. Maximum CNS recovery is required for clean motor patterns.
- **Strength & Hypertrophy (Dips, Weighted Pull-Ups, Squats):** Rest **90 to 120 seconds**.
- **Core & Isometrics (Plank, Hollow Body, L-Sit):** Rest **45 to 60 seconds**.
- **Metabolic HIIT / Conditioning:** Rest **15 to 30 seconds**.`,

  twenty_min_split: `🔥 **High-Impact 20-Minute Calisthenics Split:**
1. **Push-Ups:** 4 sets × 12 reps (60s rest)
2. **Australian Rows or Pull-Ups:** 4 sets × 8 reps (60s rest)
3. **Bulgarian Split Squats:** 3 sets × 10/side (45s rest)
4. **Hollow Body Hold:** 3 sets × 30s hold (30s rest)
*Execute with strict 2-second negatives on every rep for maximum motor unit recruitment!*`,

  shoulder: `🛡️ **Shoulder Protection & Popping on Dips/Pulls:**
1. **Dips:** Avoid dipping deeper than 90° if you feel anterior shoulder pinch. Keep your elbows tucked at ~45° and maintain a slight forward chest lean.
2. **Pull-Ups:** Never bounce at the bottom of a dead hang with loose shoulders. Engage your scapulae (scapular pull) before initiating elbow bend.
3. **Prehab:** Add 20 reps of shoulder dislocates with a stick or resistance band before every pushing session.`
};

export default function CoachAssistant() {
  const { startWorkout, showToast } = useFitness();
  const { user } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "coach",
      text: "👋 Hey Athlete! I'm Coach FORGE. Ask me anything about calisthenics technique, injury prevention, muscle-up cues, or personalized splits."
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const quickChips = [
    { label: "⚡ First Muscle-Up", query: "How do I unlock my first strict muscle-up?" },
    { label: "🤸 Planche vs Lever", query: "Should I learn planche or front lever first?" },
    { label: "🩹 Wrist Pain Fix", query: "How do I prevent wrist pain during handstands?" },
    { label: "⏱️ Rest Periods", query: "What are the optimal rest periods for calisthenics?" },
    { label: "🔥 20-Min Fast Routine", query: "Give me a quick 20 minute calisthenics workout" },
    { label: "🛡️ Shoulder Care", query: "How do I protect my shoulders during dips and pull-ups?" }
  ];

  const generateCoachResponse = (userQuery) => {
    const q = userQuery.toLowerCase();

    if (q.includes("muscle") || q.includes("mu")) {
      return KNOWLEDGE_RESPONSES.muscleup;
    }
    if (q.includes("planche")) {
      return KNOWLEDGE_RESPONSES.planche;
    }
    if (q.includes("front lever") || q.includes("lever") || q.includes("flev")) {
      return KNOWLEDGE_RESPONSES.frontlever;
    }
    if (q.includes("wrist") || q.includes("handstand") || q.includes("pain")) {
      return KNOWLEDGE_RESPONSES.wrist;
    }
    if (q.includes("rest") || q.includes("timer") || q.includes("interval")) {
      return KNOWLEDGE_RESPONSES.rest;
    }
    if (q.includes("20") || q.includes("quick") || q.includes("routine") || q.includes("split") || q.includes("workout")) {
      return KNOWLEDGE_RESPONSES.twenty_min_split;
    }
    if (q.includes("shoulder") || q.includes("dip") || q.includes("joint")) {
      return KNOWLEDGE_RESPONSES.shoulder;
    }

    // Dynamic AI response based on exercise database
    const matchedEx = EXDB.find(
      (e) => q.includes(e.n.toLowerCase()) || q.includes(e.id)
    );

    if (matchedEx) {
      return `💪 **Biomechanics Breakdown: ${matchedEx.n}**
- **Target Muscles:** ${matchedEx.ms}
- **Equipment:** ${matchedEx.eq}
- **Key Coaching Cues:**
${matchedEx.cu.map((c) => `  • ${c}`).join("\n")}
- **Common Faults to Avoid:**
${matchedEx.bd.map((b) => `  ✖ ${b}`).join("\n")}
- **Regression:** ${matchedEx.reg} | **Progression:** ${matchedEx.prog}`;
    }

    return `🎯 **Coach FORGE Training Principle:**
Calisthenics is mastery over bodyweight gravity. For any movement you're working on:
1. **Patience with Tendons:** Connective tissue adapts slower than skeletal muscle. Always leave 1-2 reps in reserve on isometric holds.
2. **Full Range of Motion:** A half-rep is zero reps in calisthenics. Lock out the top, control the bottom stretch.
3. **Progressive Overload:** Progress by increasing lever arm length (tuck ➔ straddle ➔ full) or slowing tempo (3s negatives).
*Need specific advice on a skill tree or routine? Ask about Muscle-Ups, Planche, Dips, Handstands, or Rest Intervals!*`;
  };

  const handleSend = (textToSend = null) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    haptics.light();
    const userMsg = { sender: "user", text: query };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = generateCoachResponse(query);
      setMessages((prev) => [...prev, { sender: "coach", text: response }]);
      setIsTyping(false);
      haptics.medium();
    }, 600);
  };

  return (
    <>
      {/* Floating Trigger Button */}
      <div
        style={{
          position: "fixed",
          bottom: "78px", // Clean clearance above mobile bottom tabs
          right: "18px",
          zIndex: 990,
          display: "flex",
          alignItems: "center"
        }}
      >
        <button
          onClick={() => {
            haptics.light();
            setIsOpen(!isOpen);
          }}
          style={{
            background: "linear-gradient(135deg, #ff6b2c 0%, #ff8a43 100%)",
            color: "#000",
            border: "2px solid rgba(255, 255, 255, 0.2)",
            borderRadius: "99px",
            padding: "10px 16px",
            fontWeight: "900",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 8px 28px rgba(255, 107, 44, 0.45)",
            cursor: "pointer",
            transition: "transform 0.15s ease",
            transform: isOpen ? "scale(0.95)" : "scale(1)"
          }}
          title="Ask Coach FORGE"
        >
          <span style={{ fontSize: "16px" }}>🥋</span>
          <span style={{ letterSpacing: "0.04em" }}>Ask Coach</span>
          <span
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              background: "#000",
              animation: "pulse 2s infinite"
            }}
          />
        </button>
      </div>

      {/* Floating Coach Chat Drawer */}
      {isOpen && (
        <div
          style={{
            position: "fixed",
            bottom: "136px",
            right: "18px",
            width: "calc(100vw - 36px)",
            maxWidth: "390px",
            height: "520px",
            maxHeight: "75vh",
            background: "linear-gradient(180deg, #181d24 0%, #0d1013 100%)",
            border: "1px solid var(--ln)",
            borderRadius: "18px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.8), 0 0 30px rgba(255, 107, 44, 0.15)",
            zIndex: 991,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden"
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "14px 16px",
              background: "rgba(11, 13, 16, 0.9)",
              borderBottom: "1px solid var(--ln)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #ff6b2c 0%, #ff944d 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px"
                }}
              >
                🥋
              </div>
              <div>
                <b style={{ fontSize: "14.5px", display: "block", lineHeight: "1.2" }}>Coach FORGE</b>
                <span className="cali-acc" style={{ fontSize: "9.5px", letterSpacing: "0.15em" }}>
                  BIOMECHANICS & CALISTHENICS
                </span>
              </div>
            </div>

            <button
              className="xbtn"
              onClick={() => {
                haptics.light();
                setIsOpen(false);
              }}
              style={{ padding: "4px", fontSize: "14px" }}
            >
              ✕
            </button>
          </div>

          {/* Messages Scroll Area */}
          <div
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "14px",
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}
          >
            {messages.map((m, idx) => (
              <div
                key={idx}
                style={{
                  alignSelf: m.sender === "user" ? "flex-end" : "flex-start",
                  maxWidth: "88%",
                  background: m.sender === "user" ? "var(--acc)" : "rgba(255, 255, 255, 0.05)",
                  color: m.sender === "user" ? "#000" : "var(--tx)",
                  padding: "10px 14px",
                  borderRadius: m.sender === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                  fontSize: "12.5px",
                  lineHeight: "1.45",
                  whiteSpace: "pre-wrap",
                  border: m.sender === "user" ? "none" : "1px solid var(--ln)"
                }}
              >
                {m.text}
              </div>
            ))}

            {isTyping && (
              <div
                style={{
                  alignSelf: "flex-start",
                  background: "rgba(255, 255, 255, 0.05)",
                  padding: "8px 12px",
                  borderRadius: "14px",
                  fontSize: "11px",
                  color: "var(--mut)"
                }}
              >
                Coach is analyzing biomechanics...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div
            style={{
              padding: "8px 12px",
              background: "rgba(0, 0, 0, 0.2)",
              borderTop: "1px solid rgba(255, 255, 255, 0.05)",
              overflowX: "auto",
              whiteSpace: "nowrap",
              display: "flex",
              gap: "6px"
            }}
          >
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                className="chip"
                style={{
                  fontSize: "10.5px",
                  padding: "4px 8px",
                  cursor: "pointer",
                  border: "1px solid rgba(255, 107, 44, 0.3)",
                  background: "rgba(255, 107, 44, 0.08)",
                  color: "var(--tx)"
                }}
                onClick={() => handleSend(chip.query)}
              >
                {chip.label}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: "10px 12px",
              borderTop: "1px solid var(--ln)",
              display: "flex",
              gap: "8px",
              background: "#0c0f13"
            }}
          >
            <input
              type="text"
              className="inp"
              placeholder="Ask coach about form, cues, pain..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              style={{ flex: 1, padding: "8px 12px", fontSize: "12.5px" }}
            />
            <button
              type="submit"
              className="btn sm"
              style={{ background: "var(--acc)", color: "#000", fontWeight: "900", padding: "0 14px" }}
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
