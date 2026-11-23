"use client";

import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { GLOSSARY } from "@/lib/invest/glossary";
import { cn } from "@/lib/utils";

type Mode = "simple" | "pro";
const Ctx = createContext<{ mode: Mode; setMode: (m: Mode) => void }>({ mode: "simple", setMode: () => {} });

export function ExplainProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<Mode>("simple");
  useEffect(() => { try { const m = localStorage.getItem("numsum-explain"); if (m === "pro" || m === "simple") setModeState(m); } catch { /* storage unavailable */ } }, []);
  const setMode = (m: Mode) => { setModeState(m); try { localStorage.setItem("numsum-explain", m); } catch { /* ignore */ } };
  return <Ctx.Provider value={{ mode, setMode }}>{children}</Ctx.Provider>;
}

export const useExplain = () => useContext(Ctx);

export function ExplainToggle() {
  const { mode, setMode } = useExplain();
  return <div role="group" aria-label="Explanation level" className="inline-flex items-center rounded-full border border-white/12 p-0.5 text-xs">
    {(["simple", "pro"] as Mode[]).map((m) => <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)} className={cn("rounded-full px-3 py-1.5 transition", mode === m ? "bg-white/15 font-semibold text-white" : "text-white/55 hover:text-white")}>{m === "simple" ? "Simple" : "Pro"}</button>)}
  </div>;
}

/** A term with a click/hover popover that explains it in the current mode. */
export function Term({ id, children, className }: { id: string; children?: ReactNode; className?: string }) {
  const entry = GLOSSARY[id];
  const { mode } = useExplain();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const tipId = useId();
  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", close); document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("mousedown", close); document.removeEventListener("keydown", esc); };
  }, [open]);
  if (!entry) return <>{children}</>;
  return <span ref={ref} className={cn("relative inline-flex items-center", className)} onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
    <button type="button" aria-describedby={open ? tipId : undefined} aria-expanded={open} onClick={() => setOpen((o) => !o)} className="inline-flex items-center gap-1 border-b border-dotted border-current/40 text-left normal-case tracking-normal decoration-transparent hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-100/50">
      <span>{children ?? entry.term}</span><HelpCircle size={12} className="shrink-0 opacity-50" aria-hidden="true" />
    </button>
    {open && <span id={tipId} role="tooltip" className="absolute left-0 top-full z-50 mt-2 block w-[19rem] rounded-2xl border border-white/12 bg-[#0a1220] p-4 text-left text-xs font-normal normal-case leading-5 tracking-normal text-white/80 shadow-[0_24px_60px_rgba(0,0,0,.5)]">
      <span className="block text-sm font-semibold text-white">{entry.term}</span>
      <span className="mt-1.5 block">{mode === "pro" ? entry.pro : entry.simple}</span>
      {mode === "simple" && <span className="mt-1.5 block text-white/50">{entry.pro}</span>}
      {entry.good && <span className="mt-2 block text-emerald-200/90">Good: {entry.good}</span>}
      <Link href={`/tools/methodology#term-${id}`} className="mt-2 block text-amber-100 hover:text-white">How we use it →</Link>
    </span>}
  </span>;
}

/** Plain-language help under a section; hidden in Pro mode unless `always`. */
export function Explain({ children, always, className }: { children: ReactNode; always?: boolean; className?: string }) {
  const { mode } = useExplain();
  if (mode === "pro" && !always) return null;
  return <p className={cn("mt-2 rounded-2xl border border-blue-300/15 bg-blue-400/[0.06] px-4 py-3 text-sm leading-6 text-blue-50/80", className)}>{children}</p>;
}
