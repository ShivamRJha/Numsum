import { CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import type { DataCheck } from "@/lib/invest/types";

const ICON = { pass: [CheckCircle2, "text-emerald-300"], warn: [AlertTriangle, "text-amber-200"], fail: [XCircle, "text-red-300"] } as const;

export function DataQuality({ title, checks, updatedAt }: { title: string; checks?: DataCheck[]; updatedAt?: string }) {
  if (!checks?.length) return <div className="rounded-2xl border border-white/10 p-4 text-sm text-white/50">{title}: checks will appear after the next refresh.</div>;
  const counts = { pass: checks.filter((c) => c.status === "pass").length, warn: checks.filter((c) => c.status === "warn").length, fail: checks.filter((c) => c.status === "fail").length };
  return <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
    <div className="flex flex-wrap items-center justify-between gap-2"><h3 className="font-semibold text-white">{title}</h3><span className="font-mono text-xs text-white/50">{counts.pass} pass · {counts.warn} warn · {counts.fail} fail{updatedAt ? ` · ${new Date(updatedAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}` : ""}</span></div>
    <ul className="mt-3 grid gap-2">{checks.map((c) => { const [Icon, cls] = ICON[c.status]; return <li key={c.name} className="flex gap-3 text-sm"><Icon size={16} className={`mt-0.5 shrink-0 ${cls}`} aria-label={c.status} /><span><span className="text-white/85">{c.name}</span><span className="block text-xs text-white/50">{c.detail}</span></span></li>; })}</ul>
  </div>;
}

export function DataStatus({ label, iso, checks }: { label: string; iso?: string | null; checks?: DataCheck[] }) {
  const age = iso ? (Date.now() - Date.parse(iso)) / 864e5 : null;
  const bad = checks?.some((c) => c.status === "fail");
  const color = age === null ? "bg-white/40" : bad ? "bg-amber-300" : age <= 2 ? "bg-emerald-400" : age <= 5 ? "bg-amber-300" : "bg-red-400";
  return <a href="/tools/methodology#data-quality" className="inline-flex items-center gap-2 rounded-full border border-white/12 px-3 py-1.5 font-mono text-xs text-white/65 hover:text-white"><span className={`h-2 w-2 rounded-full ${color}`} aria-hidden="true" />{label} {iso ? new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "—"}{checks?.length ? ` · ${checks.filter((c) => c.status === "pass").length}/${checks.length} checks` : ""}</a>;
}
