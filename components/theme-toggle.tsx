"use client";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

/** Light / dark switch. The choice is stored per browser; the page starts in the stored mode without flashing. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [light, setLight] = useState(false);
  useEffect(() => { setLight(document.documentElement.classList.contains("light")); }, []);
  function toggle() {
    const next = !light;
    setLight(next);
    const el = document.documentElement;
    el.classList.toggle("light", next); el.classList.toggle("dark", !next);
    try { localStorage.setItem("numsum-theme", next ? "light" : "dark"); } catch { /* storage unavailable */ }
    document.querySelector('meta[name="theme-color"]')?.setAttribute("content", next ? "#f5f6fa" : "#02050a");
  }
  return <button type="button" onClick={toggle} aria-label={light ? "Switch to dark mode" : "Switch to light mode"} title={light ? "Dark mode" : "Light mode"} className={`rounded-full border border-white/10 p-2.5 text-white/75 transition hover:border-white/30 hover:text-white ${className}`}>{light ? <Moon size={16} /> : <Sun size={16} />}</button>;
}

/** Inline script for <head>: applies the stored theme before first paint. */
export const THEME_SCRIPT = `try{if(localStorage.getItem("numsum-theme")==="light"){var d=document.documentElement;d.classList.add("light");d.classList.remove("dark")}}catch(e){}`;
