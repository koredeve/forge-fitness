"use client";
import { useEffect } from "react";

/**
 * Client-Side Security & Media Anti-Tampering Shield
 * - Suppresses DevTools shortcuts (F12, Ctrl+Shift+I, Cmd+Option+I, etc.)
 * - Suppresses View Source (Ctrl+U / Cmd+Option+U)
 * - Suppresses Save Page (Ctrl+S / Cmd+S)
 * - Intercepts global context menu to prevent unauthorized media downloading
 * - Displays active security logging deterrent in console
 */
export default function SecurityShield() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    // 1. Prevent context menu globally (blocks Right-Click -> Inspect / Save Media As)
    const handleContextMenu = (e) => {
      // Allow inputs and textareas to have normal right click if needed
      const tag = e.target.tagName?.toLowerCase();
      if (tag === "input" || tag === "textarea") return;
      e.preventDefault();
      return false;
    };

    // 2. Prevent Developer Tools, Element Inspector, and View Source Keyboard Shortcuts
    const handleKeyDown = (e) => {
      // F12
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+I / Cmd+Option+I (Inspect)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "I" || e.key === "i" || e.keyCode === 73)) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+J / Cmd+Option+J (Console)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "J" || e.key === "j" || e.keyCode === 74)) {
        e.preventDefault();
        return false;
      }
      // Ctrl+Shift+C / Cmd+Option+C (Element Picker)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "C" || e.key === "c" || e.keyCode === 67)) {
        e.preventDefault();
        return false;
      }
      // Ctrl+U / Cmd+Option+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === "U" || e.key === "u" || e.keyCode === 85)) {
        e.preventDefault();
        return false;
      }
      // Ctrl+S / Cmd+S (Save Page As)
      if ((e.ctrlKey || e.metaKey) && (e.key === "S" || e.key === "s" || e.keyCode === 83)) {
        e.preventDefault();
        return false;
      }
    };

    // 3. Security Warning in Console
    const bannerStyle = "color: #FF6B2C; font-size: 16px; font-weight: 900; text-shadow: 0 0 8px rgba(255,107,44,0.5);";
    console.log("%c⚡ FORGE SECURITY SHIELD ACTIVE", bannerStyle);
    console.log("%cUnauthorized media scraping, asset extraction, or reverse-engineering is strictly prohibited.", "color: #8A939D; font-size: 11px;");

    window.addEventListener("contextmenu", handleContextMenu, { capture: true });
    window.addEventListener("keydown", handleKeyDown, { capture: true });

    return () => {
      window.removeEventListener("contextmenu", handleContextMenu, { capture: true });
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
    };
  }, []);

  return null;
}
