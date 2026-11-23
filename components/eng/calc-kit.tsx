"use client";

import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import type { ReactNode } from "react";
import { P_UNITS, type PUnit } from "@/lib/eng/units";
import { cn } from "@/lib/utils";

export const inputCls = "w-full rounded-xl border border-white/12 bg-white/[0.04] px-3 py-2.5 font-mono text-white focus:border-amber-100/60 focus:outline-none focus:ring-2 focus:ring-amber-100/30";

export function Field({ label, hint, children, htmlFor }: { label: ReactNode; hint?: ReactNode; children: ReactNode; htmlFor?: string }) {
  return <div><label htmlFor={htmlFor} className="mb-1.5 block text-sm text-white/80">{label}</label>{children}{hint && <p className="mt-1 text-xs text-white/45">{hint}</p>}</div>;
}

export function Num({ id, value, onChange, step = "any", min, suffix }: { id: string; value: number | ""; onChange: (v: number | "") => void; step?: number | "any"; min?: number; suffix?: string }) {
  return <div className="relative"><input id={id} type="number" inputMode="decimal" step={step} min={min} value={value} onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))} className={cn(inputCls, suffix && "pr-16")} />{suffix && <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-white/45">{suffix}</span>}</div>;
}

export function PressureInput({ id, value, unit, onValue, onUnit }: { id: string; value: number | ""; unit: PUnit; onValue: (v: number | "") => void; onUnit: (u: PUnit) => void }) {
  return <div className="flex gap-2"><input id={id} type="number" inputMode="decimal" step="any" value={value} onChange={(e) => onValue(e.target.value === "" ? "" : Number(e.target.value))} className={inputCls} /><select aria-label="Pressure unit" value={unit} onChange={(e) => onUnit(e.target.value as PUnit)} className="rounded-xl border border-white/12 bg-[#0b1220] px-2 text-sm text-white">{(Object.keys(P_UNITS) as PUnit[]).map((u) => <option key={u} value={u}>{P_UNITS[u].label}</option>)}</select></div>;
}

export function Choice<T extends string>({ value, options, onChange, label }: { value: T; options: [T, string][]; onChange: (v: T) => void; label: string }) {
  return <div role="group" aria-label={label} className="flex flex-wrap gap-2">{options.map(([k, l]) => <button key={k} type="button" aria-pressed={value === k} onClick={() => onChange(k)} className={cn("rounded-full border px-3 py-1.5 text-sm transition", value === k ? "border-amber-100/70 bg-amber-100/15 text-amber-50" : "border-white/12 text-white/65 hover:text-white")}>{l}</button>)}</div>;
}

export function BigResult({ label, value, unit, tone = "neutral", sub }: { label: string; value: string; unit?: string; tone?: "ok" | "bad" | "warn" | "neutral"; sub?: ReactNode }) {
  const c = tone === "ok" ? "text-emerald-200" : tone === "bad" ? "text-red-200" : tone === "warn" ? "text-amber-100" : "text-white";
  return <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="text-[11px] uppercase tracking-[.16em] text-white/45">{label}</p><p className={cn("mt-1 font-mono text-3xl font-semibold tabular-nums", c)}>{value}{unit && <span className="ml-1 text-base font-normal text-white/50">{unit}</span>}</p>{sub && <p className="mt-1 text-xs text-white/50">{sub}</p>}</div>;
}

export function Verdict({ ok, yes, no }: { ok: boolean | null; yes: string; no: string }) {
  if (ok === null) return null;
  return <p className={cn("flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm", ok ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-50" : "border-red-300/30 bg-red-500/10 text-red-50")}>{ok ? <CheckCircle2 size={18} className="text-emerald-300" /> : <XCircle size={18} className="text-red-300" />}{ok ? yes : no}</p>;
}

export function Warnings({ items }: { items: string[] }) {
  if (!items.length) return null;
  return <ul className="grid gap-2">{items.map((w) => <li key={w} className="flex gap-2 rounded-2xl border border-amber-200/25 bg-amber-200/5 px-4 py-3 text-sm text-amber-50/90"><AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-200" />{w}</li>)}</ul>;
}

export function Working({ steps }: { steps: { label: string; formula: string; value: string }[] }) {
  return <details className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"><summary className="cursor-pointer text-sm font-semibold text-white/80">Show the working (step by step)</summary>
    <ol className="mt-3 grid gap-2 text-sm">{steps.map((s, i) => <li key={i} className="grid gap-1 border-t border-white/8 pt-2 sm:grid-cols-[1.1fr_1.4fr_.8fr]"><span className="text-white/80">{i + 1}. {s.label}</span><span className="font-mono text-xs text-white/55">{s.formula}</span><span className="font-mono text-right text-white">{s.value}</span></li>)}</ol>
  </details>;
}

export function CalcLayout({ inputs, results }: { inputs: ReactNode; results: ReactNode }) {
  return <div className="grid gap-6 lg:grid-cols-[minmax(0,.9fr)_minmax(0,1.1fr)]">
    <div className="premium-card h-fit rounded-3xl border p-6">{inputs}</div>
    <div className="grid h-fit gap-4" aria-live="polite">{results}</div>
  </div>;
}

export const num = (v: number | "", fallback = 0) => (v === "" || !Number.isFinite(v) ? fallback : v);
