import { cn } from "@/lib/utils";
export function VizFrame({ title, caption, children, className }: { title: string; caption?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return <figure className={cn("viz my-5 rounded-3xl border border-sky-200/20 bg-sky-300/[0.03] p-4 md:p-5", className)}>
    <figcaption className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[.16em] text-sky-200/90"><span aria-hidden className="inline-block h-1.5 w-1.5 rounded-full bg-sky-300" />{title}</figcaption>
    {children}
    {caption && <p className="mt-3 text-xs leading-5 text-white/50">{caption}</p>}
  </figure>;
}
export function Slider({ label, value, min, max, step = 1, onChange, fmt }: { label: string; value: number; min: number; max: number; step?: number; onChange: (v: number) => void; fmt?: (v: number) => string }) {
  return <label className="grid gap-1 text-xs text-white/65"><span className="flex justify-between gap-2"><span>{label}</span><span className="font-mono text-white">{fmt ? fmt(value) : value}</span></span>
    <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-amber-300" /></label>;
}
export function Stat({ label, value, tone = "neutral" }: { label: string; value: string; tone?: "ok" | "warn" | "bad" | "neutral" }) {
  const t = { ok: "border-emerald-300/30 text-emerald-100", warn: "border-amber-200/30 text-amber-100", bad: "border-red-300/30 text-red-100", neutral: "border-white/10 text-white" }[tone];
  return <div className={cn("rounded-2xl border px-3 py-2", t)}><p className="text-[11px] text-white/50">{label}</p><p className="font-mono text-lg">{value}</p></div>;
}
