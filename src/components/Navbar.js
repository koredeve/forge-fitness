"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  const NAVS = [
    { v: "/", l: "🏠 Home" },
    { v: "/calis", l: "🤸 Calisthenics" },
    { v: "/programs", l: "📋 Programs" },
    { v: "/library", l: "📚 Library" },
    { v: "/timer", l: "⏱️ Timer" },
    { v: "/progress", l: "📈 Progress" },
    { v: "/fuel", l: "🍎 Fuel" }
  ];

  return (
    <>
      <header>
        <nav className="nav" id="nav">
          <span className="logo">FORGE<i>.</i></span>
          {NAVS.map((n) => (
            <Link
              key={n.v}
              href={n.v}
              className={`navbtn ${pathname === n.v ? "on" : ""}`}
            >
              {n.l}
            </Link>
          ))}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
            <button
              className={`btn sm ${user ? "gh" : ""}`}
              onClick={() => setAuthModalOpen(true)}
              style={{ whiteSpace: "nowrap" }}
            >
              {user ? `👤 ${user.email.split("@")[0]}` : "🔐 Sign In"}
            </button>
          </div>
        </nav>
      </header>

      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </>
  );
}
