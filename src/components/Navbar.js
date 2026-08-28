"use client";
import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, isPro, openAuthModal, openProModal } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const mainLinks = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/calis", label: "Calisthenics", icon: "🤸" },
    { href: "/programs", label: "Programs", icon: "📋" },
    { href: "/library", label: "Library", icon: "📚" },
    { href: "/timer", label: "Timer", icon: "⏱" },
    { href: "/progress", label: "Progress", icon: "📈" },
    { href: "/fuel", label: "Fuel", icon: "🍎" }
  ];

  // Primary bottom tabs for mobile
  const bottomTabs = [
    { href: "/", label: "Home", icon: "🏠" },
    { href: "/calis", label: "Skills", icon: "🤸" },
    { href: "/programs", label: "Programs", icon: "📋" },
    { href: "/timer", label: "Timer", icon: "⏱" },
    { href: "/progress", label: "Progress", icon: "📈" }
  ];

  return (
    <>
      {/* Top Header for Desktop & Mobile Header Bar */}
      <header>
        <div className="nav">
          <Link href="/" className="logo" onClick={() => setMobileMenuOpen(false)}>
            FORGE<i>.</i>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="desktop-links">
            {mainLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`navbtn ${pathname === l.href ? "on" : ""}`}
              >
                {l.icon} {l.label}
              </Link>
            ))}
          </div>

          {/* Right Action Area */}
          <div style={{ marginLeft: "auto", display: "flex", gap: "8px", alignItems: "center" }}>
            {!isPro ? (
              <button
                className="btn sm"
                style={{
                  background: "linear-gradient(135deg, #ff6b2c 0%, #ff944d 100%)",
                  boxShadow: "0 4px 14px rgba(255, 107, 44, 0.3)",
                  fontSize: "12px",
                  padding: "6px 12px",
                  whiteSpace: "nowrap"
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
                👑 PRO
              </span>
            )}

            {/* Desktop User Status */}
            <div className="desktop-user">
              {user ? (
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span className="mut sm" style={{ maxWidth: "100px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
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

            {/* Mobile Hamburger Toggle Button */}
            <button
              className="mobile-burger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Slide-Over Drawer Navigation */}
      {mobileMenuOpen && (
        <div
          className="mobile-drawer-backdrop"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="mobile-drawer"
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div className="logo" style={{ fontSize: "22px" }}>
                FORGE<i>.</i>
              </div>
              <button
                className="xbtn"
                style={{ fontSize: "22px" }}
                onClick={() => setMobileMenuOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* User Profile Card in Drawer */}
            <div
              style={{
                background: "var(--p)",
                border: "1px solid var(--ln)",
                borderRadius: "14px",
                padding: "14px",
                marginBottom: "20px"
              }}
            >
              {user ? (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--mut)", textTransform: "uppercase" }}>Logged In As</div>
                    <b style={{ fontSize: "14px", color: "#fff" }}>{user.email}</b>
                  </div>
                  <button
                    className="btn gh sm"
                    onClick={() => {
                      logout();
                      setMobileMenuOpen(false);
                    }}
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontSize: "11px", color: "var(--mut)" }}>⚡ Guest Mode</div>
                    <b style={{ fontSize: "13.5px" }}>Sign in for full access</b>
                  </div>
                  <button
                    className="btn sm"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal("Sign in to save your streaks, track skill mastery, and unlock full workouts.");
                    }}
                  >
                    Sign In
                  </button>
                </div>
              )}
            </div>

            {/* Drawer Navigation Links */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {mainLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`drawer-link ${pathname === l.href ? "on" : ""}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <span style={{ fontSize: "18px" }}>{l.icon}</span>
                  <span style={{ fontWeight: "700", fontSize: "15px" }}>{l.label}</span>
                  {pathname === l.href && <span style={{ marginLeft: "auto", color: "var(--acc)" }}>●</span>}
                </Link>
              ))}
            </div>

            {!isPro && (
              <div style={{ marginTop: "24px" }}>
                <button
                  className="btn"
                  style={{ width: "100%", justifyContent: "center", padding: "14px", fontSize: "15px" }}
                  onClick={() => {
                    setMobileMenuOpen(false);
                    openProModal("All Master Calisthenics Trees & Roadmaps");
                  }}
                >
                  👑 Upgrade to FORGE PRO
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* App-Style Bottom Navigation Bar on Mobile */}
      <nav className="mobile-bottom-bar">
        {bottomTabs.map((tab) => {
          const isActive = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`bottom-tab ${isActive ? "active" : ""}`}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
