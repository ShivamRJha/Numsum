"use client";

import { useEffect, useMemo, useState } from "react";
import { Badge, ScoreBar, field, pct, selectCls } from "@/components/invest/kit";
import { Card } from "@/components/ui";
import { BUCKETS } from "@/lib/invest/buckets";
import { inr } from "@/lib/invest/planner";
import type { BucketSummary, FundLite } from "@/lib/invest/types";
import { cn } from "@/lib/utils";

const SORTS: [string, string, (f: FundLite) => number | null, boolean][] = [
  ["score", "Score", (f) => f.s, false], ["ter", "Lowest expense ratio", (f) => f.t, true], ["c1", "1-year return", (f) => f.c1, false], ["c3", "3-year return", (f) => f.c3, false],
  ["c5", "5-year return", (f) => f.c5, false], ["v", "Lowest volatility", (f) => f.v, true], ["dd", "Smallest max fall", (f) => f.dd, false], ["y", "Longest history", (f) => f.y, false],
];

const ROWS: [string, (f: FundLite) => string, (f: FundLite) => number | null, boolean][] = [
  ["Score (0–100)", (f) => (f.s === null ? "—" : String(Math.round(f.s))), (f) => f.s, false],
  ["Expense ratio (direct)", (f) => (f.t === null ? "—" : `${f.t.toFixed(2)}%`), (f) => f.t, true],
  ["1-year return", (f) => pct(f.c1), (f) => f.c1, false],
  ["3-year return (CAGR)", (f) => pct(f.c3), (f) => f.c3, false],
  ["5-year return (CAGR)", (f) => pct(f.c5), (f) => f.c5, false],
  ["Volatility (3y)", (f) => pct(f.v), (f) => f.v, true],
  ["Max fall (5y)", (f) => pct(f.dd, 0), (f) => f.dd, false],
  ["Sortino ratio (3y)", (f) => (f.so === null ? "—" : f.so.toFixed(2)), (f) => f.so, false],
  ["Beat group median (rolling 12m)", (f) => pct(f.cs, 0), (f) => f.cs, false],
  ["Tracking vs peers", (f) => pct(f.tr, 2), (f) => f.tr, true],
  ["Years of history", (f) => f.y.toFixed(1), (f) => f.y, false],
  ["Rank in group", (f) => String(f.r), (f) => f.r, true],
];

export function FundScreenerClient({ funds, buckets, navDate, methodology, source }: { funds: FundLite[]; buckets: Record<string, BucketSummary>; navDate: string | null; methodology: string; source: string }) {
  const [bucket, setBucket] = useState("idx_n50");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("score");
  const [minYears, setMinYears] = useState(0);
  const [picked, setPicked] = useState<string[]>([]);
  const [limit, setLimit] = useState(30);

  useEffect(() => { const b = new URLSearchParams(window.location.search).get("b"); if (b && buckets[b]) setBucket(b); }, [buckets]);
  const s = SORTS.find((x) => x[0] === sort) || SORTS[0];
  const rows = useMemo(() => {
    const text = q.trim().toLowerCase();
    const list = funds.filter((f) => (text ? f.n.toLowerCase().includes(text) || f.a.toLowerCase().includes(text) : f.b === bucket) && f.y >= minYears);
    return list.sort((a, b) => { const va = s[2](a), vb = s[2](b); if (va === null) return 1; if (vb === null) return -1; return s[3] ? va - vb : vb - va; });
  }, [funds, bucket, q, s, minYears]);
  const pickedFunds = picked.map((c) => funds.find((f) => f.c === c)).filter((f): f is FundLite => Boolean(f));
  const toggle = (c: string) => setPicked((l) => (l.includes(c) ? l.filter((x) => x !== c) : l.length >= 4 ? l : [...l, c]));
  const med = buckets[bucket]?.median;

  if (!funds.length) return <Card><p className="text-white/60">Fund data is refreshed every night from AMFI; scores will appear here after the first refresh.</p></Card>;

  return <div className="grid gap-6">
    <Card className="premium-card">
      <div className="grid gap-3 md:grid-cols-[1.2fr_1fr_1fr_auto]">
        <select aria-label="Fund group" value={bucket} onChange={(e) => { setBucket(e.target.value); setQ(""); setLimit(30); }} className={selectCls}>{BUCKETS.map((b) => <option key={b.key} value={b.key}>{b.label}{buckets[b.key] ? ` (${buckets[b.key].count})` : ""}</option>)}</select>
        <input aria-label="Search funds" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search any fund or AMC…" className={field} />
        <select aria-label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)} className={selectCls}>{SORTS.map(([k, l]) => <option key={k} value={k}>Sort: {l}</option>)}</select>
        <select aria-label="Minimum history" value={minYears} onChange={(e) => setMinYears(Number(e.target.value))} className={selectCls}>{[0, 3, 5, 10].map((y) => <option key={y} value={y}>{y ? `${y}+ years` : "Any age"}</option>)}</select>
      </div>
      {!q && med && <p className="mt-4 text-xs text-white/50">Group median · expense {med.ter != null ? `${med.ter.toFixed(2)}%` : "—"} · 1y {pct(med.cagr1)} · 3y {pct(med.cagr3)} · 5y {pct(med.cagr5)} · volatility {pct(med.vol3)}{navDate ? ` · NAV ${navDate}` : ""}</p>}
      <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[860px] text-left text-sm">
        <thead className="text-xs uppercase tracking-[.12em] text-white/45"><tr><th className="py-2 pr-2">Compare</th><th className="py-2 pr-3">#</th><th className="py-2 pr-3">Fund</th><th className="py-2 pr-3">Score</th><th className="py-2 pr-3 text-right">Expense</th><th className="py-2 pr-3 text-right">1y</th><th className="py-2 pr-3 text-right">3y</th><th className="py-2 pr-3 text-right">5y</th><th className="py-2 pr-3 text-right">Volatility</th><th className="py-2 pr-3 text-right">Max fall</th><th className="py-2 pr-3 text-right">Years</th><th className="py-2 text-right">Confidence</th></tr></thead>
        <tbody>{rows.slice(0, limit).map((f) => <tr key={f.c} className={cn("border-t border-white/8", picked.includes(f.c) && "bg-amber-100/5")}>
          <td className="py-2 pr-2"><input type="checkbox" aria-label={`Compare ${f.n}`} checked={picked.includes(f.c)} disabled={!picked.includes(f.c) && picked.length >= 4} onChange={() => toggle(f.c)} className="h-4 w-4 accent-amber-200" /></td>
          <td className="py-2 pr-3 text-white/45">{f.r}</td><td className="py-2 pr-3"><p className="text-white/90">{f.n}</p>{q && <p className="text-xs text-white/40">{buckets[f.b]?.label}</p>}</td><td className="py-2 pr-3"><ScoreBar score={f.s} /></td>
          <td className="py-2 pr-3 text-right tabular-nums">{f.t === null ? "—" : `${f.t.toFixed(2)}%`}</td><td className="py-2 pr-3 text-right tabular-nums">{pct(f.c1)}</td><td className="py-2 pr-3 text-right tabular-nums">{pct(f.c3)}</td><td className="py-2 pr-3 text-right tabular-nums">{pct(f.c5)}</td><td className="py-2 pr-3 text-right tabular-nums">{pct(f.v)}</td><td className="py-2 pr-3 text-right tabular-nums">{pct(f.dd, 0)}</td><td className="py-2 pr-3 text-right tabular-nums">{f.y.toFixed(1)}</td><td className="py-2 text-right"><Badge kind={f.cf}>{f.cf}</Badge></td></tr>)}</tbody></table></div>
      {rows.length > limit && <button type="button" onClick={() => setLimit((l) => l + 30)} className="mt-4 rounded-full border border-white/15 px-4 py-2 text-sm text-white/75 hover:text-white">Show more ({rows.length - limit} left)</button>}
      {!rows.length && <p className="mt-4 text-sm text-white/50">No funds match these filters.</p>}
    </Card>

    {pickedFunds.length > 0 && <Card className="premium-card" >
      <div id="compare" className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-display text-2xl">Side-by-side comparison</h2><p className="mt-1 text-sm text-white/55">Best value in each row is highlighted. Tick up to four funds in any group.</p></div><button type="button" onClick={() => setPicked([])} className="text-sm text-white/55 hover:text-white">Clear</button></div>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead><tr><th className="py-2 pr-3 text-xs uppercase tracking-[.12em] text-white/45">Metric</th>{pickedFunds.map((f) => <th key={f.c} className="py-2 pr-3 align-bottom font-semibold text-white">{f.n}<p className="text-xs font-normal text-white/45">{buckets[f.b]?.label}</p></th>)}</tr></thead>
        <tbody>{ROWS.map(([label, show, val, low]) => { const vals = pickedFunds.map(val).filter((x): x is number => x !== null); const best = vals.length > 1 ? (low ? Math.min(...vals) : Math.max(...vals)) : null; return <tr key={label} className="border-t border-white/8"><td className="py-2 pr-3 text-white/60">{label}</td>{pickedFunds.map((f) => <td key={f.c} className={cn("py-2 pr-3 tabular-nums", best !== null && val(f) === best ? "font-semibold text-emerald-200" : "text-white/85")}>{show(f)}</td>)}</tr>; })}
          <tr className="border-t border-white/8"><td className="py-2 pr-3 text-white/60">Cost on ₹10 L over 10 years*</td>{pickedFunds.map((f) => <td key={f.c} className="py-2 pr-3 tabular-nums text-white/85">{f.t === null ? "—" : inr(1e6 * (Math.pow(1.12, 10) - Math.pow(1.12 - f.t / 100, 10)))}</td>)}</tr>
        </tbody></table></div>
      <p className="mt-3 text-xs text-white/45">*Value lost to the expense ratio if the portfolio earned 12% a year before costs. Expense ratio = base expense ratio plus GST for the direct plan.</p>
    </Card>}
    {picked.length > 0 && <a href="#compare" className="fixed bottom-5 right-5 z-40 rounded-full bg-amber-100 px-5 py-3 text-sm font-semibold text-black shadow-2xl md:hidden">Compare {picked.length}</a>}

    {methodology && <details className="text-sm text-white/55"><summary className="cursor-pointer font-semibold text-white/75">How funds are scored</summary><p className="mt-2">{methodology}</p><p className="mt-2">Source: {source}. Fund size (AUM), exit loads and portfolio holdings are not included — check the scheme factsheet before investing.</p></details>}
  </div>;
}
