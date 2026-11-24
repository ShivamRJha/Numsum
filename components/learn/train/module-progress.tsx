"use client";
import { useProgress } from "./progress";
export function ModuleProgress({ slug, total, compact = false }: { slug: string; total: number; compact?: boolean }) {
  const { p } = useProgress(slug);
  const n = p.done.length; if (!n && p.best === undefined) return compact ? <span className="text-xs text-white/35">Not started</span> : null;
  const pct = Math.round((n / total) * 100);
  return <span className="inline-flex items-center gap-2 text-xs text-white/60"><span className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-emerald-300/80" style={{ width: `${pct}%` }} /></span>{n}/{total} lessons{p.best !== undefined && ` · quiz best ${p.best}%`}{p.completedAt && " · ✓ complete"}</span>;
}
