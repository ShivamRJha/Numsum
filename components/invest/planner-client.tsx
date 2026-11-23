"use client";

import Link from "next/link";
import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, where } from "firebase/firestore";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { Card } from "@/components/ui";
import { db } from "@/lib/firebase";
import { BUCKET_BY_KEY } from "@/lib/invest/buckets";
import { DEFAULT_INPUTS, RISK_LABELS, inr, pct, plan, suggestRisk, type PlanInputs, type Risk, type YearPoint } from "@/lib/invest/planner";
import type { BucketSummary, FundSummaryDoc, FundTop } from "@/lib/invest/types";
import { cn } from "@/lib/utils";

const GOALS: [string, number, number][] = [["Retirement", 20000000, 25], ["Child's education", 3000000, 12], ["House down-payment", 2500000, 6], ["Car", 1000000, 3], ["Emergency fund", 600000, 1], ["Wealth creation", 10000000, 15]];
const input = "w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-2.5 text-white focus:border-amber-100/60 focus:outline-none focus:ring-2 focus:ring-amber-100/30";

function encode(p: PlanInputs) { try { return btoa(unescape(encodeURIComponent(JSON.stringify(p)))); } catch { return ""; } }
function decode(s: string | null): PlanInputs | null {
  if (!s) return null;
  try { const v = JSON.parse(decodeURIComponent(escape(atob(s)))); return v && typeof v.years === "number" ? { ...DEFAULT_INPUTS, ...v, returns: { ...DEFAULT_INPUTS.returns, ...(v.returns || {}) } } : null; } catch { return null; }
}

function Num({ id, label, value, onChange, step = 1000, min = 0, max, suffix, hint }: { id: string; label: string; value: number; onChange: (v: number) => void; step?: number; min?: number; max?: number; suffix?: string; hint?: string }) {
  return <div><label htmlFor={id} className="mb-1.5 flex justify-between text-sm text-white/75"><span>{label}</span>{hint && <span className="text-white/45">{hint}</span>}</label><div className="relative"><input id={id} type="number" inputMode="decimal" className={input} value={Number.isFinite(value) ? value : 0} step={step} min={min} max={max} onChange={(e) => onChange(Math.max(min, Math.min(max ?? Infinity, Number(e.target.value) || 0)))} />{suffix && <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-white/40">{suffix}</span>}</div></div>;
}

function Chart({ points, target }: { points: YearPoint[]; target: number }) {
  const W = 640, H = 260, P = { l: 56, r: 16, t: 16, b: 28 };
  const maxY = Math.max(target, ...points.map((p) => p.high)) * 1.05 || 1;
  const n = Math.max(1, points.length - 1);
  const x = (i: number) => P.l + (i / n) * (W - P.l - P.r);
  const y = (v: number) => H - P.b - (v / maxY) * (H - P.t - P.b);
  const line = (k: keyof YearPoint) => points.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(p[k]).toFixed(1)}`).join(" ");
  const band = `${points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.high)}`).join(" ")} ${[...points].reverse().map((p, i) => `L${x(points.length - 1 - i)},${y(p.low)}`).join(" ")} Z`;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * maxY);
  return <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Projected value of the plan by year">
    {ticks.map((t) => <g key={t}><line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,.08)" /><text x={P.l - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="rgba(255,255,255,.45)">{inr(t)}</text></g>)}
    {points.map((p, i) => (n <= 12 || i % Math.ceil(n / 10) === 0 || i === n) && <text key={p.year} x={x(i)} y={H - 8} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,.45)">{p.year === 0 ? "Now" : `Y${p.year}`}</text>)}
    <path d={band} fill="rgba(253,230,138,.12)" />
    <line x1={P.l} x2={W - P.r} y1={y(target)} y2={y(target)} stroke="rgba(110,231,183,.8)" strokeDasharray="5 4" />
    <text x={W - P.r} y={y(target) - 6} textAnchor="end" fontSize="11" fill="rgba(110,231,183,.95)">Goal {inr(target)}</text>
    <path d={line("invested")} fill="none" stroke="rgba(147,197,253,.85)" strokeWidth="2" strokeDasharray="4 4" />
    <path d={line("expected")} fill="none" stroke="#fde68a" strokeWidth="2.5" />
  </svg>;
}

function FundTable({ rows, compact }: { rows: FundTop[]; compact?: boolean }) {
  if (!rows.length) return <p className="text-sm text-white/50">No scored funds in this bucket yet.</p>;
  return <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-left text-sm"><thead className="text-xs uppercase tracking-[.12em] text-white/45"><tr><th className="py-2 pr-3">#</th><th className="py-2 pr-3">Fund (direct, growth)</th><th className="py-2 pr-3 text-right">Score</th><th className="py-2 pr-3 text-right">1y</th><th className="py-2 pr-3 text-right">3y</th><th className="py-2 pr-3 text-right">5y</th>{!compact && <><th className="py-2 pr-3 text-right">Volatility</th><th className="py-2 pr-3 text-right">Max fall</th><th className="py-2 pr-3 text-right">Years</th></>}<th className="py-2 text-right">Confidence</th></tr></thead>
    <tbody>{rows.map((f) => <tr key={f.c} className="border-t border-white/8"><td className="py-2 pr-3 text-white/45">{f.r}</td><td className="py-2 pr-3 text-white/85">{f.n}</td><td className="py-2 pr-3 text-right font-semibold text-amber-100">{f.s === null ? "—" : Math.round(f.s)}</td><td className="py-2 pr-3 text-right">{pct(f.c1)}</td><td className="py-2 pr-3 text-right">{pct(f.c3)}</td><td className="py-2 pr-3 text-right">{pct(f.c5)}</td>{!compact && <><td className="py-2 pr-3 text-right">{pct(f.v)}</td><td className="py-2 pr-3 text-right">{pct(f.dd, 0)}</td><td className="py-2 pr-3 text-right">{f.y.toFixed(1)}</td></>}<td className={cn("py-2 text-right text-xs", f.cf === "High" ? "text-emerald-200" : f.cf === "Medium" ? "text-amber-100" : "text-white/50")}>{f.cf}</td></tr>)}</tbody></table></div>;
}

type SavedPlan = { id: string; name: string; inputs: PlanInputs };

export function PlannerClient({ summary }: { summary: FundSummaryDoc | null }) {
  const { user, requestAuth } = useAuth();
  const [p, setP] = useState<PlanInputs>(DEFAULT_INPUTS);
  const [screen, setScreen] = useState("idx_n50");
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState<SavedPlan[]>([]);
  const [saveMsg, setSaveMsg] = useState("");

  useEffect(() => { const fromUrl = decode(new URLSearchParams(window.location.search).get("p")); if (fromUrl) setP(fromUrl); }, []);
  useEffect(() => {
    if (!user) { setSaved([]); return; }
    getDocs(query(collection(db, "investment_plans"), where("userId", "==", user.uid))).then((snap) => setSaved(snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<SavedPlan, "id">) })))).catch(() => setSaved([]));
  }, [user]);

  const set = <K extends keyof PlanInputs>(k: K, v: PlanInputs[K]) => setP((old) => ({ ...old, [k]: v }));
  const result = useMemo(() => plan(p), [p]);
  const buckets = summary?.buckets || {};
  const suggested = suggestRisk(p.years);
  const ref = (asset: "equity" | "debt" | "gold") => { const key = asset === "equity" ? "idx_n50" : asset === "debt" ? "shortdur" : "gold"; return buckets[key]?.median?.cagr5 ?? buckets[key]?.median?.cagr3 ?? null; };
  const screenBucket: BucketSummary | undefined = buckets[screen];

  async function savePlan() {
    if (!user) { requestAuth(); return; }
    setSaveMsg("");
    try {
      const name = (p.goal || "My plan").slice(0, 80);
      const ref = await addDoc(collection(db, "investment_plans"), { userId: user.uid, name, inputs: p, createdAt: serverTimestamp(), updatedAt: serverTimestamp() });
      setSaved((list) => [{ id: ref.id, name, inputs: p }, ...list]); setSaveMsg("Plan saved to your account.");
    } catch { setSaveMsg("Could not save the plan. Please try again."); }
  }
  async function removePlan(id: string) { try { await deleteDoc(doc(db, "investment_plans", id)); setSaved((l) => l.filter((x) => x.id !== id)); } catch { setSaveMsg("Could not delete the plan."); } }
  function copyLink() {
    const url = `${window.location.origin}${window.location.pathname}?p=${encodeURIComponent(encode(p))}`;
    navigator.clipboard?.writeText(url).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000); }).catch(() => window.prompt("Copy this link", url));
  }

  return <div className="grid gap-8">
    <div className="grid gap-6 lg:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)]">
      <Card className="premium-card h-fit">
        <h2 className="font-display text-2xl">Your goal</h2>
        <div className="mt-4 flex flex-wrap gap-2">{GOALS.map(([g, amt, yrs]) => <button key={g} type="button" onClick={() => setP((o) => ({ ...o, goal: g, targetToday: amt, years: yrs, risk: suggestRisk(yrs) }))} className={cn("rounded-full border px-3 py-1.5 text-sm", p.goal === g ? "border-amber-100/70 bg-amber-100/15 text-amber-50" : "border-white/12 text-white/65 hover:text-white")}>{g}</button>)}</div>
        <div className="mt-5 grid gap-4">
          <div><label htmlFor="pl-goal" className="mb-1.5 block text-sm text-white/75">Goal name</label><input id="pl-goal" className={input} value={p.goal} maxLength={80} onChange={(e) => set("goal", e.target.value)} /></div>
          <Num id="pl-target" label="Amount needed in today's money" value={p.targetToday} onChange={(v) => set("targetToday", v)} step={50000} hint={inr(p.targetToday)} />
          <div><label htmlFor="pl-years" className="mb-1.5 flex justify-between text-sm text-white/75"><span>Years to goal</span><span className="text-white/45">{p.years} {p.years === 1 ? "year" : "years"}</span></label><input id="pl-years" type="range" min={1} max={40} value={p.years} onChange={(e) => set("years", Number(e.target.value))} className="w-full accent-amber-200" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Num id="pl-savings" label="Already saved for it" value={p.currentSavings} onChange={(v) => set("currentSavings", v)} step={10000} hint={inr(p.currentSavings)} />
            <Num id="pl-sip" label="Monthly SIP you can invest" value={p.monthlySip} onChange={(v) => set("monthlySip", v)} step={1000} hint={inr(p.monthlySip)} />
            <Num id="pl-step" label="Yearly SIP increase" value={Math.round(p.stepUp * 100)} onChange={(v) => set("stepUp", v / 100)} step={1} max={50} suffix="%" />
            <Num id="pl-infl" label="Inflation" value={Math.round(p.inflation * 1000) / 10} onChange={(v) => set("inflation", v / 100)} step={0.5} max={20} suffix="%" />
          </div>
          <fieldset><legend className="mb-1.5 text-sm text-white/75">Risk you are comfortable with</legend><div className="grid grid-cols-2 gap-2 sm:grid-cols-4">{(Object.keys(RISK_LABELS) as Risk[]).map((r) => <button key={r} type="button" aria-pressed={p.risk === r} onClick={() => set("risk", r)} className={cn("rounded-2xl border px-3 py-2 text-sm", p.risk === r ? "border-amber-100/70 bg-amber-100/15 text-amber-50" : "border-white/12 text-white/65 hover:text-white")}>{RISK_LABELS[r]}</button>)}</div>{p.risk !== suggested && <p className="mt-2 text-xs text-white/50">For {p.years} years, “{RISK_LABELS[suggested]}” is the usual fit.</p>}</fieldset>
          <details className="rounded-2xl border border-white/10 p-4"><summary className="cursor-pointer text-sm font-semibold text-white/80">Return assumptions (per year, before tax)</summary>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">{(["equity", "debt", "gold"] as const).map((a) => <Num key={a} id={`pl-r-${a}`} label={a[0].toUpperCase() + a.slice(1)} value={Math.round(p.returns[a] * 1000) / 10} onChange={(v) => set("returns", { ...p.returns, [a]: v / 100 })} step={0.5} max={25} suffix="%" hint={ref(a) !== null ? `5y data: ${pct(ref(a))}` : undefined} />)}</div>
            <p className="mt-3 text-xs text-white/45">Defaults are deliberately conservative long-run assumptions. “5y data” shows the median 5-year return of the matching fund group from the latest data — past returns are not a forecast.</p></details>
        </div>
      </Card>

      <div className="grid gap-6">
        <Card className="premium-card">
          <div className="grid gap-4 sm:grid-cols-3">
            <div><p className="text-xs uppercase tracking-[.16em] text-white/50">Goal in {p.years} yrs</p><p className="mt-2 font-display text-3xl text-white">{inr(result.target)}</p><p className="mt-1 text-xs text-white/45">{inr(p.targetToday)} today at {pct(p.inflation)} inflation</p></div>
            <div><p className="text-xs uppercase tracking-[.16em] text-white/50">Projected value</p><p className="mt-2 font-display text-3xl text-amber-100">{inr(result.projected)}</p><p className="mt-1 text-xs text-white/45">Range {inr(result.lowCase)} – {inr(result.highCase)}</p></div>
            <div><p className="text-xs uppercase tracking-[.16em] text-white/50">{result.onTrack ? "Surplus" : "Shortfall"}</p><p className={cn("mt-2 font-display text-3xl", result.onTrack ? "text-emerald-200" : "text-red-200")}>{inr(Math.abs(result.gap))}</p><p className="mt-1 text-xs text-white/45">Expected return {pct(result.annualReturn)} a year</p></div>
          </div>
          <div className={cn("mt-5 rounded-2xl border p-4 text-sm", result.onTrack ? "border-emerald-300/30 bg-emerald-400/10 text-emerald-50" : "border-amber-200/30 bg-amber-200/10 text-amber-50")}>{result.onTrack ? <>You are on track. A SIP of <strong>{inr(result.requiredSip, false)}</strong>/month (rising {pct(p.stepUp, 0)} a year) would be enough.</> : <>To reach the goal, raise the SIP to <strong>{inr(result.requiredSip, false)}</strong>/month (rising {pct(p.stepUp, 0)} a year), or add a lump sum of <strong>{inr(result.lumpsumNeeded)}</strong> now, or extend the timeline.</>}</div>
          <div className="mt-5"><Chart points={result.points} target={result.target} /><div className="mt-2 flex flex-wrap gap-4 text-xs text-white/55"><span><span className="mr-1 inline-block h-0.5 w-4 bg-amber-200 align-middle" />Expected</span><span><span className="mr-1 inline-block h-2 w-4 bg-amber-200/20 align-middle" />± 2% return range</span><span><span className="mr-1 inline-block h-0.5 w-4 border-t-2 border-dashed border-blue-300 align-middle" />Amount invested ({inr(result.invested)})</span></div></div>
        </Card>

        <Card className="premium-card">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-display text-2xl">Suggested allocation</h2><p className="mt-1 text-sm text-white/55">{RISK_LABELS[p.risk]} · {p.years} years · of your {inr(p.monthlySip, false)} monthly SIP</p></div></div>
          <div className="mt-4 grid gap-3">{result.lines.map((l) => { const b = BUCKET_BY_KEY[l.bucket]; const top = (buckets[l.bucket]?.top || []).slice(0, 3); return <details key={l.bucket} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4" open={false}>
            <summary className="flex cursor-pointer list-none flex-wrap items-center justify-between gap-2"><span className="font-semibold text-white">{b?.label || l.bucket}<span className="ml-2 text-xs font-normal text-white/45">{l.asset}</span></span><span className="text-sm text-white/75"><strong className="text-amber-100">{pct(l.share, 0)}</strong> · {inr(p.monthlySip * l.share, false)}/mo</span></summary>
            <p className="mt-2 text-xs text-white/50">{l.why}{b?.note ? ` · ${b.note}` : ""}</p>
            <div className="mt-3">{summary ? <FundTable rows={top} compact /> : <p className="text-sm text-white/50">Fund scores appear here after the first data refresh.</p>}</div>
          </details>; })}</div>
          {p.years > 3 && <p className="mt-4 text-sm text-white/55">Glide path: from about {Math.min(3, p.years - 1)} years before the goal, move the equity part step by step into short-duration debt or arbitrage funds so a late market fall cannot derail the goal.</p>}
          <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={savePlan} className="rounded-full bg-amber-100 px-5 py-2.5 text-sm font-semibold text-black hover:bg-white">{user ? "Save plan" : "Sign in to save plan"}</button><button type="button" onClick={copyLink} className="glass rounded-full px-5 py-2.5 text-sm font-semibold text-white">{copied ? "Link copied" : "Copy shareable link"}</button><button type="button" onClick={() => window.print()} className="glass rounded-full px-5 py-2.5 text-sm font-semibold text-white">Print</button></div>
          {saveMsg && <p className="mt-3 text-sm text-white/65" role="status">{saveMsg}</p>}
          {saved.length > 0 && <div className="mt-4 border-t border-white/10 pt-4"><p className="text-sm font-semibold text-white/80">Your saved plans</p><ul className="mt-2 grid gap-2">{saved.map((s) => <li key={s.id} className="flex items-center justify-between gap-3 text-sm"><button type="button" className="text-left text-blue-200 hover:text-white" onClick={() => setP({ ...DEFAULT_INPUTS, ...s.inputs })}>{s.name}</button><button type="button" className="text-xs text-white/45 hover:text-red-200" onClick={() => removePlan(s.id)}>Delete</button></li>)}</ul></div>}
        </Card>
      </div>
    </div>

    <Card className="premium-card">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="section-eyebrow">Fund screener</p><h2 className="mt-2 font-display text-3xl">Best-scoring funds by group</h2><p className="mt-2 max-w-3xl text-sm text-white/55">{summary ? <>Latest NAV date {new Date(summary.navDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {summary.fundCount.toLocaleString("en-IN")} direct-plan funds scored · refreshed daily.</> : "Fund data is refreshed every night from AMFI; scores will appear after the first refresh."}</p></div>
        <select value={screen} onChange={(e) => setScreen(e.target.value)} className="rounded-full border border-white/15 bg-[#0b1220] px-4 py-2.5 text-sm" aria-label="Fund group">{Object.values(BUCKET_BY_KEY).map((b) => <option key={b.key} value={b.key}>{b.label}{buckets[b.key] ? ` (${buckets[b.key].count})` : ""}</option>)}</select></div>
      <div className="mt-5">{screenBucket ? <><FundTable rows={screenBucket.top} /><p className="mt-3 text-xs text-white/45">Group median: 1y {pct(screenBucket.median.cagr1)} · 3y {pct(screenBucket.median.cagr3)} · 5y {pct(screenBucket.median.cagr5)} · volatility {pct(screenBucket.median.vol3)}. Returns are annualised (CAGR).</p></> : <p className="text-sm text-white/50">{summary ? "No funds in this group in the latest data." : "Waiting for the first data refresh."}</p>}</div>
      {summary && <details className="mt-5 text-sm text-white/55"><summary className="cursor-pointer font-semibold text-white/75">How funds are scored</summary><p className="mt-2">{summary.methodology}</p><p className="mt-2">Source: {summary.source}. Expense ratios and portfolio holdings are not yet included — compare the scheme&apos;s factsheet before investing.</p></details>}
    </Card>

    <p className="text-xs leading-5 text-white/45">For education and planning only — not investment advice or a recommendation to buy or sell any fund. NumSum Labs is not a SEBI-registered investment adviser or research analyst. Projections use the assumptions shown and are not guaranteed; past performance does not indicate future returns. Mutual fund investments are subject to market risks — read all scheme-related documents carefully. Questions? <Link href="/contact?topic=investment_tool" className="underline hover:text-white">Contact us</Link>.</p>
  </div>;
}
