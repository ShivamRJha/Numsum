"use client";
import { useCallback, useEffect, useState } from "react";
export type ModProgress = { done: string[]; best?: number; last?: string; completedAt?: string };
type All = Record<string, ModProgress>;
const KEY = "ns-learn-v1";
const read = (): All => { try { return JSON.parse(localStorage.getItem(KEY) || "{}"); } catch { return {}; } };
const write = (a: All) => { try { localStorage.setItem(KEY, JSON.stringify(a)); window.dispatchEvent(new Event("ns-learn")); } catch { /* storage unavailable */ } };

export function useProgress(slug: string) {
  const [p, setP] = useState<ModProgress>({ done: [] });
  useEffect(() => { const sync = () => setP(read()[slug] || { done: [] }); sync(); window.addEventListener("ns-learn", sync); window.addEventListener("storage", sync); return () => { window.removeEventListener("ns-learn", sync); window.removeEventListener("storage", sync); }; }, [slug]);
  const update = useCallback((f: (m: ModProgress) => ModProgress) => { const a = read(); a[slug] = f(a[slug] || { done: [] }); write(a); setP(a[slug]); }, [slug]);
  return { p, update };
}
