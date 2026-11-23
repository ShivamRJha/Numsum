import { cn } from "@/lib/utils";

export const pct = (x: number | null | undefined, d = 1) => (x === null || x === undefined || !Number.isFinite(x) ? "—" : `${(x * 100).toFixed(d)}%`);
export const num = (x: number | null | undefined, d = 2) => (x === null || x === undefined || !Number.isFinite(x) ? "—" : x.toLocaleString("en-IN", { maximumFractionDigits: d, minimumFractionDigits: d }));
export const signed = (x: number | null | undefined, d = 1) => (x === null || x === undefined || !Number.isFinite(x) ? "—" : `${x > 0 ? "+" : ""}${(x * 100).toFixed(d)}%`);
export const tone = (x: number | null | undefined) => (x === null || x === undefined ? "text-white/60" : x > 0 ? "text-emerald-200" : x < 0 ? "text-red-200" : "text-white/80");

export function Stat({ label, value, hint, className }: { label: string; value: React.ReactNode; hint?: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-white/10 bg-white/[0.03] p-4", className)}><p className="text-[11px] uppercase tracking-[.16em] text-white/45">{label}</p><p className="mt-1.5 text-xl font-semibold text-white">{value}</p>{hint && <p className="mt-1 text-xs text-white/45">{hint}</p>}</div>;
}

const SIGNAL: Record<string, string> = { Strong: "border-emerald-300/40 bg-emerald-400/15 text-emerald-100", Positive: "border-lime-300/30 bg-lime-300/10 text-lime-100", Neutral: "border-white/15 bg-white/5 text-white/75", Mixed: "border-amber-200/30 bg-amber-200/10 text-amber-100", Weak: "border-red-300/30 bg-red-400/10 text-red-100", High: "border-emerald-300/40 bg-emerald-400/15 text-emerald-100", Medium: "border-amber-200/30 bg-amber-200/10 text-amber-100", Low: "border-white/15 bg-white/5 text-white/60" };
export function Badge({ children, kind }: { children: React.ReactNode; kind?: string }) {
  return <span className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium", SIGNAL[kind || String(children)] || "border-white/15 text-white/70")}>{children}</span>;
}

export function ScoreBar({ score }: { score: number | null }) {
  if (score === null) return <span className="text-white/40">—</span>;
  const c = score >= 70 ? "bg-emerald-300" : score >= 55 ? "bg-lime-300" : score >= 43 ? "bg-amber-200" : "bg-red-300";
  return <span className="inline-flex items-center gap-2"><span className="h-1.5 w-12 overflow-hidden rounded-full bg-white/10"><span className={cn("block h-full rounded-full", c)} style={{ width: `${Math.max(4, Math.min(100, score))}%` }} /></span><span className="w-7 text-right font-semibold tabular-nums text-white">{Math.round(score)}</span></span>;
}

export const field = "w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-white placeholder:text-white/35 focus:border-amber-100/60 focus:outline-none focus:ring-2 focus:ring-amber-100/30";
export const selectCls = "rounded-full border border-white/15 bg-[#0b1220] px-4 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-amber-100/30";
