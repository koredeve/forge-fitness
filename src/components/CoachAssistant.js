"use client";
import React, { useState, useRef, useEffect } from "react";
import { useFitness } from "@/context/FitnessContext";
import { useAuth } from "@/context/AuthContext";
import { EXDB, SKILLS, PROGRAMS, WORKOUTS } from "@/data/db";
import { haptics } from "@/lib/haptics";

// Deep Domain Knowledge Base for Biomechanics & Calisthenics
const DOMAIN_KNOWLEDGE = {
  // 1. Master Skill Trees
  skills: {
    pullup: `🏋️ **Strict Pull-Up Mastery Roadmap:**
• **Level 1–3 (The Foundation):** Dead Hang (30–45s) ➔ Active Scapular Pulls (3×8, straight arms) ➔ 5-Second Negative Pull-Ups (jump up, fight gravity for 5s).
• **Level 4–5 (First Strict Rep):** Light Band-Assisted Pull-Ups ➔ First Dead-Hang Strict Pull-Up (no kip, elbows driving to back pockets).
• **Level 6–8 (Advanced & Weighted):** 8 Clean Dead-Hang Reps ➔ Chest-to-Bar Pull-Ups ➔ Weighted Pull-Ups (+10kg to +20kg).
💡 *Coach's Plateau Buster:* Use the **Grease the Groove (GTG)** method: do 50% of your max pull-ups 4–6 times spaced throughout the day. Your central nervous system will skyrocket your rep count!`,

    dip: `💪 **Dip & Upper-Body Pressing Roadmap:**
• **Foundation:** Bench Dips (feet elevated, 3×12) ➔ Band-Assisted Bar Dips ➔ 5-Second Negative Dips.
• **Strict Bar Work:** First Strict Parallel Bar Dip (chest angled 15° forward, elbows ~90° at bottom) ➔ 8 Strict Full-Range Dips.
• **Elite & Ring Progression:** Straight-Bar Dips (clearing the waist) ➔ Gymnastic Ring Dips (turn rings out at the top: RTO) ➔ Weighted Dips (+15kg).
💡 *Joint Safety Cue:* Never let your shoulders collapse forward into internal rotation at the bottom. Keep your lats engaged and chest proud.`,

    muscleup: `⚡ **The Strict Bar Muscle-Up Blueprint:**
1. **Prerequisite Check:** You need **10+ clean strict pull-ups** and **12+ parallel bar dips** before practicing the transition.
2. **Pulling Trajectory:** Pull backward in a slight 'C' arc, not straight up. Aim the bar to your lower sternum / upper abdomen!
3. **The Pivot Point (Turnover):** The moment you reach peak height, aggressively whip your wrists over the top of the bar while leaning your head and chest forward.
4. **The Lockout:** Push out of the straight-bar dip to full arm extension.
💡 *Drill to Master:* Jumping muscle-up transitions on a low bar and explosive chest-to-bar pull-ups.`,

    handstand: `🤸 **Freestanding Handstand Biomechanics:**
1. **Spider-Fingers:** Never keep hands flat. Spread fingers wide, clamp the floor with your fingertips to pull back if you over-balance, and press your palm heel if you under-balance.
2. **Elevated Scapulae:** Push the floor away until your shoulders are hugging your ears. This locks the skeletal stack.
3. **Locked Hollow Alignment:** Squeeze your glutes, lock your knees, point your toes, and knit your ribs in. A banana back leaks balance!
4. **Progression:** Wall Walks ➔ Chest-to-Wall Hold (45s) ➔ Toe Taps off Wall ➔ Freestanding Kick-ups.`,

    planche: `🔥 **Planche Biomechanics (The Ultimate Push):**
1. **Scapular Protraction & Depression:** Push the floor down and dome your upper back like a turtle shell. Keep shoulders depressed away from ears.
2. **Lean Angle:** The centre of mass must shift over your hands. As your legs leave the ground, your shoulders lean forward significantly.
3. **Biceps & Wrist Load:** Tendons adapt 3–5x slower than muscle. Condition wrists with loaded rocks daily.
4. **Ladder:** Frog Stand (30s) ➔ Tuck Planche (15s) ➔ Advanced Tuck (flat back, 12s) ➔ Straddle Planche ➔ Full Planche.`,

    frontlever: `🚩 **Front Lever Biomechanics (Straight-Arm Pull):**
1. **Lat Pulldown Torque:** Think of driving the bar down to your thighs with locked straight elbows.
2. **Retraction + Depression:** Squeeze shoulder blades down and back while keeping core rigid.
3. **Posterior Pelvic Tilt:** Squeeze glutes and tuck hips to eliminate lower-back arch.
4. **Ladder:** Tuck Front Lever (20s) ➔ Advanced Tuck (15s) ➔ Single-Leg FL (10s/side) ➔ Straddle FL ➔ Full Front Lever (8s+).`,

    pistol: `🦵 **Pistol Squat Mastery:**
1. **Ankle Dorsiflexion:** If your heel lifts off the floor, your calf/ankle mobility is the bottleneck. Elevate your heel on a small 1-inch plate while building mobility.
2. **Counterbalance:** Reach both arms straight forward to keep your center of gravity over the mid-foot.
3. **Ladder:** Deep Bodyweight Squats (25 reps) ➔ Bulgarian Split Squats (3×10) ➔ Box Pistol Squats (sit to bench) ➔ Full Floor Pistol Squat.`,

    nordic: `🛡️ **Nordic Hamstring Curl Protocol:**
1. **Knee & ACL Bulletproofing:** The Nordic is the #1 movement for eccentric hamstring strength and knee resilience.
2. **Hips Locked Straight:** Squeeze your glutes throughout the entire descent. Do not hinge at the hips!
3. **5-Second Rule:** Resist gravity for a strict 5-second descent before catching yourself with your hands. Push off lightly to return.`,

    lsit: `🪑 **L-Sit & V-Sit Core Compression:**
1. **Scapular Depression:** Push down through your hands/parallettes so your torso floats high between your shoulders.
2. **Quad & Hip Flexor Lock:** Squeeze your quads rock-hard to keep knees completely straight.
3. **Progression:** Foot-Supported L-Sit ➔ Tuck L-Sit (20s) ➔ One-Leg Extended (15s/side) ➔ Full L-Sit (15s–30s) ➔ V-Sit.`
  },

  // 2. Injury Prevention & Joint Prehab
  injuries: {
    wrist: `🩹 **Wrist Pain in Handstands & Push-Ups:**
• **Immediate Fix:** Train on **parallettes or push-up bars**. A neutral wrist grip immediately eliminates 90° extension joint compression!
• **Finger Weight Distribution:** Spread fingers wide and claw the ground with your fingertips ("spider fingers") so pressure isn't concentrated on the carpal tunnel.
• **Pre-Session Routine:** 30s wrist extension rocks, 30s wrist flexion rocks, and 15 finger-pulse push-ups on knees before every workout.`,

    elbow: `💪 **Elbow Tendon Pain (Golfer's / Tennis Elbow):**
• **Medial Pain (Inner Elbow):** Usually caused by excessive chin-up volume or tight wrist flexors. Switch from straight bar to **gymnastic rings** to allow free joint rotation during pulls!
• **Lateral Pain (Outer Elbow):** Strained from straight-arm planche/handstand work. Perform light eccentric wrist extensions and reverse curls (3×20).
• **Golden Rule:** Cut volume by 50% for 10 days at the first sign of ache. Tendons do not heal if you continue to train through sharp pain.`,

    shoulder: `🛡️ **Shoulder Impingement & Popping on Dips/Pulls:**
• **On Dips:** Stop dipping lower than 90° if you feel anterior shoulder pinch. Keep your elbows tucked at ~45° and maintain a slight forward chest lean.
• **On Pull-Ups:** Never drop into a limp dead hang at the bottom. Keep your rotator cuff and scapulae slightly engaged (active hang).
• **Daily Prehab:** 20 reps of shoulder dislocates with a broomstick or resistance band, plus 15 face-pulls or band pull-aparts.`,

    back: `🧘 **Lower Back Tightness on Core Work:**
• **Hollow Body / Leg Raises:** If your lower back arches off the floor, your deep transverse abdominis is failing and your hip flexors are yanking on your lumbar spine.
• **Correction:** Regress to knee tucks or bend your knees until you can press your lower back completely flat against the mat without space for a piece of paper.`
  },

  // 3. Nutrition, Recovery & Body Composition
  nutrition: {
    protein: `🥩 **Athlete Protein Formula:**
• Target **1.6 to 2.2 grams per kg of bodyweight** daily (e.g. 75kg athlete = 120g to 165g protein).
• Spread intake over 3–4 meals with 30–40g per meal to trigger muscle protein synthesis (MPS).
• Best whole sources: Eggs, chicken breast, lean beef, salmon, Greek yogurt, lentils, whey.`,

    relativeStrength: `⚖️ **Relative Strength & Body Fat for Calisthenics:**
• In calisthenics, **your body is the barbell**. Every extra 2–3kg of non-functional body fat exponentially increases the torque required on Planche, Front Lever, and Muscle-Ups.
• An ideal body fat range for calisthenics performance is **10%–14% for men** and **18%–22% for women**.
• To cut without losing strength: Maintain high protein, keep lifting heavy with low volume, and maintain a modest 300–400 kcal deficit.`,

    hydration: `💧 **Hydration & Tendon Performance:**
• Target **35 ml per kg bodyweight** daily plus 500ml per hour of heavy sweating.
• Fascia and tendon sheaths require optimal cellular hydration to glide without inflammatory friction. If you're dehydrated, grip strength drops by up to 15%!`,

    prepost: `🍎 **Pre- & Post-Training Fueling Strategy:**
• **60–90 Mins Pre-Workout:** Fast-digesting complex carbs (oatmeal + banana or rice cake with honey) + 200mg caffeine if needed.
• **Post-Workout (Within 2 Hours):** High-protein meal with complex carbs (e.g., chicken/salmon with jasmine rice or sweet potatoes) to refill muscle glycogen and start tissue repair.`
  },

  // 4. Programming, Rest & Methodologies
  programming: {
    rest: `⏱️ **Optimal Rest Intervals by Goal:**
• **High-Skill / CNS Max (Planche, Muscle-Up, HSPU, Weighted PRs):** Rest **2.5 to 3.5 minutes**. The nervous system needs full recovery to fire maximum motor units with perfect form.
• **Strength & Hypertrophy (Push-Ups, Dips, Pull-Ups, Squats):** Rest **60 to 90 seconds**.
• **Core Isometrics (Plank, Hollow Body, L-Sit):** Rest **30 to 45 seconds**.
• **HIIT / Tabata Conditioning:** Rest **15 to 30 seconds**.`,

    split: `📋 **Recommended Weekly Training Splits:**
• **3 Days / Week (Best for Beginners & Busy Athletes):** Full Body Mon / Wed / Fri.
• **4 Days / Week (Intermediate Hypertrophy & Skill):** Upper / Lower Split (Mon: Upper, Tue: Lower, Thu: Upper, Fri: Lower).
• **5–6 Days / Week (Advanced Calisthenics & Hybrid):** Push / Pull / Legs rotation with 1 dedicated skill/mobility day.
💡 *Tip:* Check the **Programs** tab in FORGE for our structured 4–6 week roadmaps (**Foundation 30**, **Strength Builder**, and **Hybrid Athlete**)!`,

    overload: `📈 **Progressive Overload in Calisthenics (Without Weights):**
You don't need heavy iron to progressively overload your muscles:
1. **Manipulate the Lever Arm:** Tucked ➔ Advanced Tuck ➔ Straddle ➔ Full body (changes the physics torque).
2. **Tempo Control:** 3-to-4 second eccentric negatives double your time under tension.
3. **Elevate or Incline:** Elevate feet on push-ups or rows to shift load onto upper fibers.
4. **Density:** Complete the same volume in less overall time.`
  }
};

export default function CoachAssistant() {
  const { startWorkout, customRoutines, showToast } = useFitness();
  const { user, openAuthModal } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      sender: "coach",
      text: "👋 Greetings Athlete! I'm Coach FORGE. I have full knowledge of all 42 exercises, 8 mastery trees, programs, nutrition rules, and joint biomechanics. What are we working on today?"
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
    { label: "🤸 Planche Biomechanics", query: "How to progress to a full planche?" },
    { label: "🚩 Front Lever Cues", query: "What are the key cues for front lever?" },
    { label: "🩹 Wrist Pain Fix", query: "How do I stop wrist pain in handstands and pushups?" },
    { label: "💪 Elbow Tendon Pain", query: "How do I fix elbow pain from pullups and dips?" },
    { label: "🥩 Protein & Nutrition", query: "How much protein and what should I eat for calisthenics?" },
    { label: "⏱️ Rest Periods", query: "What are the optimal rest intervals for calisthenics?" },
    { label: "🔥 20-Min Fast Routine", query: "Give me a quick 20 minute calisthenics workout" },
    { label: "🛡️ Nordic Hamstring Curls", query: "How do I master Nordic hamstring curls?" }
  ];

  const generateCoachResponse = (userQuery) => {
    const q = userQuery.toLowerCase().trim();

    // 1. Skill Trees
    if (q.includes("muscle up") || q.includes("muscle-up") || q.includes("muscleup") || q.includes("bar mu")) {
      return DOMAIN_KNOWLEDGE.skills.muscleup;
    }
    if (q.includes("planche") || q.includes("frog stand")) {
      return DOMAIN_KNOWLEDGE.skills.planche;
    }
    if (q.includes("front lever") || q.includes("frontlever") || q.includes("flev")) {
      return DOMAIN_KNOWLEDGE.skills.frontlever;
    }
    if (q.includes("handstand") || q.includes("hstand") || q.includes("hand stand") || q.includes("hspu")) {
      return DOMAIN_KNOWLEDGE.skills.handstand;
    }
    if (q.includes("pullup") || q.includes("pull up") || q.includes("pull-up") || q.includes("chinup") || q.includes("chin up")) {
      return DOMAIN_KNOWLEDGE.skills.pullup;
    }
    if (q.includes("dip") || q.includes("dips") || q.includes("ring dip")) {
      return DOMAIN_KNOWLEDGE.skills.dip;
    }
    if (q.includes("pistol") || q.includes("single leg squat")) {
      return DOMAIN_KNOWLEDGE.skills.pistol;
    }
    if (q.includes("nordic") || q.includes("hamstring curl")) {
      return DOMAIN_KNOWLEDGE.skills.nordic;
    }
    if (q.includes("l-sit") || q.includes("lsit") || q.includes("l sit") || q.includes("v-sit") || q.includes("vsit")) {
      return DOMAIN_KNOWLEDGE.skills.lsit;
    }

    // 2. Injuries & Joint Health
    if (q.includes("wrist") || q.includes("carpal")) {
      return DOMAIN_KNOWLEDGE.injuries.wrist;
    }
    if (q.includes("elbow") || q.includes("golfer") || q.includes("tennis elbow") || q.includes("tendonitis") || q.includes("tendinopathy")) {
      return DOMAIN_KNOWLEDGE.injuries.elbow;
    }
    if (q.includes("shoulder") || q.includes("rotator") || q.includes("impingement") || q.includes("popping")) {
      return DOMAIN_KNOWLEDGE.injuries.shoulder;
    }
    if (q.includes("back pain") || q.includes("lower back") || q.includes("spine")) {
      return DOMAIN_KNOWLEDGE.injuries.back;
    }

    // 3. Nutrition & Recovery
    if (q.includes("protein") || q.includes("shake") || q.includes("chicken") || q.includes("meat")) {
      return DOMAIN_KNOWLEDGE.nutrition.protein;
    }
    if (q.includes("fat") || q.includes("weight loss") || q.includes("cut") || q.includes("bulk") || q.includes("lean") || q.includes("relative strength")) {
      return DOMAIN_KNOWLEDGE.nutrition.relativeStrength;
    }
    if (q.includes("water") || q.includes("hydration") || q.includes("drink")) {
      return DOMAIN_KNOWLEDGE.nutrition.hydration;
    }
    if (q.includes("food") || q.includes("eat") || q.includes("diet") || q.includes("meal") || q.includes("pre workout") || q.includes("post workout")) {
      return DOMAIN_KNOWLEDGE.nutrition.prepost;
    }

    // 4. Programming, Rest, Splits
    if (q.includes("rest") || q.includes("interval") || q.includes("break between sets")) {
      return DOMAIN_KNOWLEDGE.programming.rest;
    }
    if (q.includes("split") || q.includes("program") || q.includes("how many days") || q.includes("routine recommendation")) {
      return DOMAIN_KNOWLEDGE.programming.split;
    }
    if (q.includes("overload") || q.includes("harder") || q.includes("progress without weights") || q.includes("plateau")) {
      return DOMAIN_KNOWLEDGE.programming.overload;
    }
    if (q.includes("20") || q.includes("quick workout") || q.includes("fast routine") || q.includes("short workout")) {
      return `🔥 **Coach FORGE 20-Minute Calisthenics Burner:**
1. **Push-Ups:** 4 sets × 12–15 reps (60s rest)
2. **Australian Rows:** 4 sets × 10–12 reps (60s rest)
3. **Bulgarian Split Squats:** 3 sets × 10/side (45s rest)
4. **Hollow Body Hold:** 3 sets × 30s (30s rest)
💡 *Tip:* You can also open the **Programs** page and use the **+ Build Custom Routine** tool to customize this exact split with your preferred sets and rest times!`;
    }

    // 5. Dynamic match against EXDB (all 42 exercises)
    const matchedEx = EXDB.find(
      (e) => q.includes(e.n.toLowerCase()) || q.includes(e.id) || e.ms.toLowerCase().includes(q)
    );

    if (matchedEx) {
      return `💪 **Exercise Biomechanics: ${matchedEx.n}**
• **Target Muscles:** ${matchedEx.ms}
• **Equipment Needed:** ${matchedEx.eq}
• **Coaching Cues:**
${matchedEx.cu.map((c) => `  ✓ ${c}`).join("\n")}
• **Common Biomechanical Faults:**
${matchedEx.bd.map((b) => `  ✖ ${b}`).join("\n")}
• **Regression (Easier):** ${matchedEx.reg}
• **Progression (Harder):** ${matchedEx.prog}
💡 *In-App Tip:* You can watch the full slow-motion video breakdown of ${matchedEx.n} in the **Library** tab!`;
    }

    // 6. Generic Calisthenics Principle
    return `🎯 **Coach FORGE Core Training Principles:**
1. **Form Over Ego:** In calisthenics, half-reps build zero functional strength and stress connective tissue. Always insist on full lockouts and strict negatives.
2. **Tendon Timeline:** Muscle tissue adapts in weeks; tendons and ligaments take months. When training straight-arm skills (Planche, Front Lever), progress conservatively.
3. **Daily Consistency:** 20–30 minutes done consistently 4 days a week destroys 2-hour marathon sessions done erratically.
*Try asking about specific movements like Muscle-Ups, Planche, Handstands, Dips, Pull-Ups, Wrist Pain, or Protein Targets!*`;
  };

  const handleSend = (textToSend = null) => {
    if (!user) {
      openAuthModal("Sign in or create a free account to consult Coach on form, biomechanics, and workout splits.", "signup");
      return;
    }
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
    }, 450);
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
            if (!user) {
              openAuthModal("Sign in or create a free account to consult Coach on form, biomechanics, and workout splits.", "signup");
              return;
            }
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
            maxWidth: "410px",
            height: "540px",
            maxHeight: "75vh",
            background: "linear-gradient(180deg, #181d24 0%, #0d1013 100%)",
            border: "1px solid var(--ln)",
            borderRadius: "18px",
            boxShadow: "0 20px 60px rgba(0, 0, 0, 0.85), 0 0 30px rgba(255, 107, 44, 0.2)",
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
              background: "rgba(11, 13, 16, 0.94)",
              borderBottom: "1px solid var(--ln)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #ff6b2c 0%, #ff944d 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  boxShadow: "0 0 12px rgba(255, 107, 44, 0.4)"
                }}
              >
                🥋
              </div>
              <div>
                <b style={{ fontSize: "14.5px", display: "block", lineHeight: "1.2" }}>Coach FORGE</b>
                <span className="cali-acc" style={{ fontSize: "9.5px", letterSpacing: "0.15em" }}>
                  BIOMECHANICS & SPORTS SCIENCE
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
                  padding: "11px 14px",
                  borderRadius: m.sender === "user" ? "14px 14px 2px 14px" : "14px 14px 14px 2px",
                  fontSize: "12.5px",
                  lineHeight: "1.5",
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
              background: "rgba(0, 0, 0, 0.25)",
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
                  padding: "4px 9px",
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
              placeholder="Ask about form, pain, cues, splits, fuel..."
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
