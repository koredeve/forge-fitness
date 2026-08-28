"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, isPro, openAuthModal, openProModal } = useAuth();

  const links = [
    { href: "/", label: "🏠 Home" },
    { href: "/calis", label: "🤸 Calisthenics" },
    { href: "/programs", label: "📋 Programs" },
    { href: "/library", label: "📚 Library" },
    { href: "/timer", label: "⏱ Timer" },
    { href: "/progress", label: "📈 Progress" },
    { href: "/fuel", label: "🍎 Fuel" }
  ];

  return (
    <header>
      <div className="nav">
        <Link href="/" className="logo">
          FORGE<i>.</i>
        </Link>
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`navbtn ${pathname === l.href ? "on" : ""}`}
          >
            {l.label}
          </Link>
        ))}

        <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
          {!isPro ? (
            <button
              className="btn sm"
              style={{
                background: "linear-gradient(135deg, #ff6b2c 0%, #ff944d 100%)",
                boxShadow: "0 4px 14px rgba(255, 107, 44, 0.3)",
                fontSize: "12px",
                padding: "6px 12px"
              }}
              onClick={() => openProModal("All Master Calisthenics Trees & Roadmaps")}
            >
              👑 Get PRO
            </button>
          ) : (
            <span
              className="pill"
              style={{ borderColor: "var(--acc)", color: "var(--acc)", fontSize: "11px", fontWeight: "bold" }}
            >
              👑 PRO MEMBER
            </span>
          )}

          {user ? (
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span className="mut sm" style={{ maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.displayName || user.email?.split("@")[0]}
              </span>
              <button
                className="btn gh sm"
                style={{ padding: "5px 10px", fontSize: "11px" }}
                onClick={() => logout()}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <button
              className="btn sm gh"
              style={{ padding: "6px 12px", fontSize: "12px" }}
              onClick={() => openAuthModal("Sign in to save your streaks, track skill mastery, and unlock full workouts.")}
            >
              🔐 Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
