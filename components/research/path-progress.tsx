"use client";
import { createContext, useContext, type ReactNode } from "react";
import { useAuth } from "@/components/auth-provider";
import { LEVELS, type LevelKey } from "@/lib/research/paths";
import { useResearchProfile } from "./use-profile";

type Ctx = { done: Set<string>; toggle: (id: string) => void; signedIn: boolean; level?: LevelKey };
const PathCtx = createContext<Ctx>({ done: new Set(), toggle: () => {}, signedIn: false });

/** Wraps a server-rendered path so each item can be ticked off by a signed-in member (saved privately). */
export function PathProgress({ slug, total, children }: { slug: string; total: number; children: ReactNode }) {
  const { p, update, signedIn } = useResearchProfile();
  const { requestAuth } = useAuth();
  const done = new Set(p?.pathDone?.[slug] || []);
  const toggle = (id: string) => {
    if (!signedIn) { requestAuth({ message: "Sign in to track your progress", returnTo: window.location.pathname }); return; }
    update((x) => { const cur = new Set(x.pathDone?.[slug] || []); if (cur.has(id)) cur.delete(id); else cur.add(id); return { ...x, pathDone: { ...x.pathDone, [slug]: [...cur] } }; });
  };
  const setLevel = (level: LevelKey) => signedIn ? update((x) => ({ ...x, level })) : requestAuth({ message: "Sign in to save your level", returnTo: window.location.pathname });
  const pct = total ? Math.round((done.size / total) * 100) : 0;
  const lvl = LEVELS.find((l) => l.key === p?.level);
  return <PathCtx.Provider value={{ done, toggle, signedIn, level: p?.level }}>
    <div className="sticky top-16 z-20 -mx-2 mb-8 rounded-2xl border border-white/10 bg-[#0b1220]/95 px-4 py-3 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-white/70">I am a<select value={p?.level || ""} onChange={(e) => setLevel(e.target.value as LevelKey)} className="rounded-lg border border-white/15 bg-black/40 px-2 py-1.5 text-white"><option value="">choose level…</option>{LEVELS.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}</select></label>
        <span className="flex items-center gap-2 text-xs text-white/55">{signedIn ? <><span className="h-2 w-40 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-gradient-to-r from-violet-300 to-emerald-300" style={{ width: `${pct}%` }} /></span>{done.size}/{total} done</> : "Sign in to tick items off and track progress"}</span>
      </div>
      {lvl && <p className="mt-2 text-sm text-violet-100/90">Start at <b>{lvl.start === "frontier" ? "Recent developments" : lvl.start[0].toUpperCase() + lvl.start.slice(1)}</b>. {lvl.advice}</p>}
    </div>
    {children}
  </PathCtx.Provider>;
}

export function ItemCheck({ id, label }: { id: string; label: string }) {
  const { done, toggle } = useContext(PathCtx);
  const on = done.has(id);
  return <button type="button" onClick={() => toggle(id)} aria-pressed={on} aria-label={`${on ? "Unmark" : "Mark"} ${label} as done`} className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-[11px] ${on ? "border-emerald-300 bg-emerald-300 text-black" : "border-white/30 hover:border-white/60"}`}>{on ? "✓" : ""}</button>;
}

export function StageBadge({ stage }: { stage: string }) {
  const { level } = useContext(PathCtx);
  const start = LEVELS.find((l) => l.key === level)?.start;
  return start === stage ? <span className="rounded-full bg-violet-200 px-2.5 py-0.5 text-[11px] font-semibold text-black">Start here</span> : null;
}
