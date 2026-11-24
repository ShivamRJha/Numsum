"use client";
/** Screener-style deep sections for the stock page: financial statements, peers and news tone. */
import Link from "next/link";
import { ExternalLink, Newspaper } from "lucide-react";
import { useEffect, useState } from "react";
import { Badge, ScoreBar, num, pct, signed, tone } from "@/components/invest/kit";
import { Card } from "@/components/ui";
import type { Financials, Item, Period, Ratios } from "@/lib/invest/financials";
import type { NewsSummary } from "@/lib/invest/news";
import { cn } from "@/lib/utils";

export type Peer = { s: string; n: string; px: number; pe: number | null; pb: number | null; roe: number | null; de: number | null; dy: number | null; mc: number | null; r1: number | null; c3: number | null; sc: number | null; sig: string };

function useJson<T>(url: string | null) {
  const [state, setState] = useState<{ data: T | null; error: string; loading: boolean }>({ data: null, error: "", loading: !!url });
  useEffect(() => {
    if (!url) return;
    let live = true; setState({ data: null, error: "", loading: true });
    fetch(url).then(async (r) => { const j = await r.json(); if (live) setState(r.ok ? { data: j, error: "", loading: false } : { data: null, error: j.error || "Not available", loading: false }); }).catch(() => live && setState({ data: null, error: "Could not reach the data service.", loading: false }));
    return () => { live = false; };
  }, [url]);
  return state;
}

export function useNews(symbol: string, name: string) { return useJson<NewsSummary>(`/api/stocks/${encodeURIComponent(symbol)}/news?name=${encodeURIComponent(name)}`); }

const cr = (x: number | null | undefined) => (x == null || !Number.isFinite(x) ? "—" : (x / 1e7).toLocaleString("en-IN", { maximumFractionDigits: x / 1e7 >= 100 ? 0 : 1 }));
const label = (end: string, q: boolean) => { const d = new Date(end); return q ? d.toLocaleDateString("en-IN", { month: "short", year: "2-digit", timeZone: "UTC" }) : `FY${String(d.getUTCMonth() < 6 ? d.getUTCFullYear() : d.getUTCFullYear() + 1).slice(-2)}`; };

type RowDef = [string, (p: Period & Ratios) => string, ((p: Period & Ratios) => number | null)?];
const PL: RowDef[] = [
  ["Sales", (p) => cr(p.sales)], ["Operating profit", (p) => cr(p.op ?? p.ebitda)], ["OPM %", (p) => pct(p.opm, 0)], ["Interest", (p) => cr(p.interest == null ? null : Math.abs(p.interest))],
  ["Depreciation", (p) => cr(p.dep)], ["Profit before tax", (p) => cr(p.pbt)], ["Tax", (p) => cr(p.tax)], ["Net profit", (p) => cr(p.np), (p) => p.np ?? null], ["NPM %", (p) => pct(p.npm, 0)], ["EPS (₹)", (p) => num(p.eps, 1)],
];
const BS: RowDef[] = [["Equity (net worth)", (p) => cr(p.equity)], ["Borrowings", (p) => cr(p.debt)], ["Cash", (p) => cr(p.cash)], ["Total assets", (p) => cr(p.assets)], ["Debt / equity", (p) => num(p.de, 2)]];
const CF: RowDef[] = [["Cash from operations", (p) => cr(p.cfo), (p) => p.cfo ?? null], ["Capex", (p) => cr(p.capex == null ? null : Math.abs(p.capex))], ["Free cash flow", (p) => cr(p.fcf), (p) => p.fcf ?? null], ["CFO / net profit", (p) => num(p.cfoToNp, 2)], ["Dividend payout", (p) => pct(p.payout, 0)]];
const RT: RowDef[] = [["ROE %", (p) => pct(p.roe, 0)], ["ROCE %", (p) => pct(p.roce, 0)], ["OPM %", (p) => pct(p.opm, 0)], ["Debt / equity", (p) => num(p.de, 2)]];

function Table({ rows, defs, q }: { rows: (Period & Ratios)[]; defs: RowDef[]; q: boolean }) {
  const shown = defs.filter(([, f]) => rows.some((r) => f(r) !== "—"));
  if (!shown.length) return <p className="text-sm text-white/50">Not reported.</p>;
  return <div className="overflow-x-auto"><table className="w-full min-w-[560px] text-right text-sm tabular-nums">
    <thead><tr className="text-xs text-white/45"><th className="py-2 pr-4 text-left font-normal" />{rows.map((r) => <th key={r.end} className="py-2 pl-3 font-medium">{label(r.end, q)}</th>)}</tr></thead>
    <tbody>{shown.map(([n, f, val]) => <tr key={n} className="border-t border-white/[0.07]"><td className="whitespace-nowrap py-2 pr-4 text-left text-white/65">{n}</td>{rows.map((r) => { const v = val?.(r); return <td key={r.end} className={cn("py-2 pl-3", v != null && v < 0 ? "text-red-200" : "text-white/90")}>{f(r)}</td>; })}</tr>)}</tbody>
  </table></div>;
}

function Bars({ rows, pick, q }: { rows: (Period & Ratios)[]; pick: Item; q: boolean }) {
  const vals = rows.map((r) => (r[pick] as number | null | undefined) ?? null);
  const max = Math.max(...vals.map((v) => Math.abs(v ?? 0)), 1);
  return <div className="flex h-28 items-end gap-1.5">{rows.map((r, i) => { const v = vals[i]; return <div key={r.end} className="flex flex-1 flex-col items-center gap-1"><div className={cn("w-full rounded-t-md transition-all duration-700", (v ?? 0) < 0 ? "bg-red-300/70" : "bg-amber-100/70")} style={{ height: `${Math.max(2, (Math.abs(v ?? 0) / max) * 100)}%` }} title={`${label(r.end, q)}: ₹${cr(v)} Cr`} /><span className="text-[10px] text-white/40">{label(r.end, q)}</span></div>; })}</div>;
}

export function FinancialsPanel({ symbol }: { symbol: string }) {
  const { data, error, loading } = useJson<Financials>(`/api/stocks/${encodeURIComponent(symbol)}/financials`);
  const [view, setView] = useState<"q" | "a">("q");
  if (loading) return <Card className="premium-card animate-pulse text-white/55">Loading financial statements…</Card>;
  if (error || !data) return <Card className="premium-card"><h2 className="font-display text-2xl">Financial statements</h2><p className="mt-2 text-sm text-white/55">{error || "Not available right now."} Check the company&rsquo;s latest filing on NSE or BSE.</p></Card>;
  const q = view === "q"; const rows = (q ? data.quarterly : data.annual).slice(q ? -8 : -10);
  const g = data.growth;
  return <Card className="premium-card">
    <div className="flex flex-wrap items-end justify-between gap-3"><div><h2 className="font-display text-2xl">Financial statements</h2><p className="mt-1 text-sm text-white/55">₹ crore. Consolidated where the company reports it. Ratios are computed by NumSum from the reported figures.</p></div>
      <div className="flex rounded-full border border-white/15 p-0.5 text-sm">{([["q", "Quarterly"], ["a", "Annual"]] as const).map(([k, l]) => <button key={k} type="button" onClick={() => setView(k)} className={cn("rounded-full px-4 py-1.5 transition", view === k ? "bg-amber-100 text-black" : "text-white/65 hover:text-white")}>{l}</button>)}</div></div>
    <div className="mt-5 grid gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {[["Sales growth 3y", g.sales3], ["Profit growth 3y", g.profit3], ["Sales growth 1y", g.sales1], ["Profit growth 1y", g.profit1], ["Latest qtr sales YoY", g.qSalesYoy], ["Latest qtr profit YoY", g.qProfitYoy]].map(([l, v]) => <div key={l as string} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"><p className="text-[11px] uppercase tracking-[.12em] text-white/45">{l}</p><p className={cn("mt-1 font-mono text-lg font-semibold", tone(v as number | null))}>{signed(v as number | null, 0)}</p></div>)}
    </div>
    <div className="mt-6 grid gap-6 lg:grid-cols-2"><div><p className="mb-2 text-xs font-semibold uppercase tracking-[.16em] text-amber-100/80">Sales</p><Bars rows={rows} pick="sales" q={q} /></div><div><p className="mb-2 text-xs font-semibold uppercase tracking-[.16em] text-amber-100/80">Net profit</p><Bars rows={rows} pick="np" q={q} /></div></div>
    <h3 className="mt-8 text-sm font-semibold uppercase tracking-[.16em] text-white/55">Profit &amp; loss</h3><Table rows={rows} defs={PL} q={q} />
    <h3 className="mt-8 text-sm font-semibold uppercase tracking-[.16em] text-white/55">Balance sheet</h3><Table rows={rows} defs={BS} q={q} />
    <h3 className="mt-8 text-sm font-semibold uppercase tracking-[.16em] text-white/55">Cash flow</h3><Table rows={rows} defs={CF} q={q} />
    <h3 className="mt-8 text-sm font-semibold uppercase tracking-[.16em] text-white/55">Ratios</h3><Table rows={rows} defs={RT} q={q} />
    <p className="mt-4 text-xs text-white/40">Source: {data.source}. Free sources publish about four to five years of annual and five to eight quarters of results; older years appear as they become available. Quarterly ROE and ROCE are annualised.</p>
  </Card>;
}

export function PeersPanel({ symbol, peers, industry }: { symbol: string; peers: Peer[]; industry: string }) {
  if (peers.length < 2) return null;
  return <Card className="premium-card"><h2 className="font-display text-2xl">Peer comparison</h2><p className="mt-1 text-sm text-white/55">Largest Nifty 500 companies in {industry}, by market cap.</p>
    <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[820px] text-right text-sm tabular-nums">
      <thead className="text-xs uppercase tracking-[.1em] text-white/45"><tr><th className="py-2 pr-3 text-left">Company</th><th className="py-2 pl-3">Mkt cap ₹Cr</th><th className="py-2 pl-3">Price</th><th className="py-2 pl-3">P/E</th><th className="py-2 pl-3">P/B</th><th className="py-2 pl-3">ROE</th><th className="py-2 pl-3">D/E</th><th className="py-2 pl-3">Div yld</th><th className="py-2 pl-3">1y</th><th className="py-2 pl-3">3y/yr</th><th className="py-2 pl-3 text-left">Score</th></tr></thead>
      <tbody>{peers.map((p) => <tr key={p.s} className={cn("border-t border-white/[0.07]", p.s === symbol && "bg-amber-100/[0.06]")}>
        <td className="py-2 pr-3 text-left"><Link href={`/tools/stock-analyzer/${encodeURIComponent(p.s)}`} className="font-medium text-blue-100 hover:text-white">{p.n}</Link><span className="ml-1.5 text-xs text-white/40">{p.s}</span></td>
        <td className="py-2 pl-3">{p.mc ? Math.round(p.mc).toLocaleString("en-IN") : "—"}</td><td className="py-2 pl-3">{num(p.px, 1)}</td><td className="py-2 pl-3">{p.pe && p.pe > 0 ? num(p.pe, 1) : "—"}</td><td className="py-2 pl-3">{num(p.pb, 1)}</td><td className="py-2 pl-3">{pct(p.roe, 0)}</td><td className="py-2 pl-3">{num(p.de, 2)}</td><td className="py-2 pl-3">{pct(p.dy, 1)}</td>
        <td className={cn("py-2 pl-3", tone(p.r1))}>{pct(p.r1, 0)}</td><td className={cn("py-2 pl-3", tone(p.c3))}>{pct(p.c3, 0)}</td><td className="py-2 pl-3 text-left"><ScoreBar score={p.sc} /></td></tr>)}</tbody>
    </table></div></Card>;
}

const toneCls = (t: number) => (t > 0.15 ? "border-emerald-300/30 text-emerald-100" : t < -0.15 ? "border-red-300/30 text-red-100" : "border-white/12 text-white/60");
const ago = (iso: string) => { const h = (Date.now() - Date.parse(iso)) / 36e5; return h < 1 ? "just now" : h < 24 ? `${Math.round(h)}h ago` : `${Math.round(h / 24)}d ago`; };

export function NewsPanel({ news }: { news: ReturnType<typeof useNews> }) {
  const { data, loading } = news;
  const [n, setN] = useState(10);
  if (loading) return <Card className="premium-card animate-pulse text-white/55">Reading the latest news…</Card>;
  if (!data) return null;
  return <Card className="premium-card">
    <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="flex items-center gap-2 font-display text-2xl"><Newspaper size={20} className="text-amber-100" />News in the last 30 days</h2><p className="mt-1 max-w-2xl text-sm text-white/55">Each headline is scored for tone using a finance word list; recent stories that clearly name the company count most. News tone moves the checklist score by at most ±6 points — a reason to look closer, never a reason to buy or sell on its own.</p></div>
      <div className="text-right"><Badge kind={data.label.includes("Positive") ? "Positive" : data.label.includes("Negative") ? "Weak" : "Neutral"}>{data.label}</Badge><p className="mt-1 text-xs text-white/45">{data.count} stories · effect on score {data.points > 0 ? "+" : ""}{data.points}</p></div></div>
    {data.items.length ? <ul className="mt-4 grid gap-2">{data.items.slice(0, n).map((i) => <li key={i.link}><a href={i.link} target="_blank" rel="noopener noreferrer nofollow" className="group flex items-start gap-3 rounded-2xl border border-white/[0.08] p-3 transition hover:border-white/25">
      <span className={cn("mt-0.5 shrink-0 rounded-full border px-2 py-0.5 font-mono text-[11px]", toneCls(i.tone))}>{i.tone > 0 ? "+" : ""}{i.tone.toFixed(1)}</span>
      <span className="min-w-0 flex-1"><span className="block text-sm text-white/90 group-hover:text-white">{i.title}</span><span className="mt-0.5 block text-xs text-white/40">{i.source} · {ago(i.date)}{i.tags.length ? ` · ${i.tags.join(", ")}` : ""}</span></span>
      <ExternalLink size={14} className="mt-1 shrink-0 text-white/30 group-hover:text-white/70" /></a></li>)}</ul> : <p className="mt-4 text-sm text-white/50">No recent stories found.</p>}
    {data.items.length > n && <button type="button" onClick={() => setN((x) => x + 10)} className="mt-3 rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 hover:text-white">More stories</button>}
    <p className="mt-3 text-xs text-white/40">Source: {data.source}. Headlines link to the publisher. Tone scoring is automatic and can misread sarcasm, questions or mixed stories.</p>
  </Card>;
}
