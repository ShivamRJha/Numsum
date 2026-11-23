"use client";

import Link from "next/link";
import { CheckCircle2, CircleHelp, XCircle } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Badge, Stat, field, num, pct, signed, tone } from "@/components/invest/kit";
import { Explain, Term } from "@/components/invest/explain";
import { StockSearch } from "@/components/invest/stock-search";
import { ToolHeader } from "@/components/invest/tools-nav";
import { Card } from "@/components/ui";
import { inr } from "@/lib/invest/planner";
import type { Check, Fundamentals, StockStats, Verdict } from "@/lib/invest/stocks";
import { Flame } from "lucide-react";
import { cn } from "@/lib/utils";

type Analysis = {
  symbol: string; name: string; industry: string; inNifty500: boolean;
  stats: StockStats; fundamentals: Fundamentals | null; checks: Check[]; verdict: Verdict;
  indexPe: number | null; industryPe: number | null; screen: { score: number | null; signal: string; rankOf?: number } | null;
  chart: [number, number, number | null, number | null][]; weekly: [number, number][]; indexWeekly: [number, number][]; sources: string[];
  dataCheck?: { prices: string; priceCheck: string; fundamentals: string };
};

function PriceChart({ data }: { data: Analysis["chart"] }) {
  const [range, setRange] = useState(250);
  const d = data.slice(-range);
  if (d.length < 10) return null;
  const W = 760, H = 280, P = { l: 52, r: 12, t: 12, b: 24 };
  const vals = d.flatMap((x) => [x[1], x[2], x[3]].filter((v): v is number => v !== null));
  const lo = Math.min(...vals) * 0.98, hi = Math.max(...vals) * 1.02;
  const x = (i: number) => P.l + (i / (d.length - 1)) * (W - P.l - P.r);
  const y = (v: number) => H - P.b - ((v - lo) / (hi - lo)) * (H - P.t - P.b);
  const path = (k: 1 | 2 | 3) => d.map((p, i) => (p[k] === null ? "" : `${i && d[i - 1][k] !== null ? "L" : "M"}${x(i).toFixed(1)},${y(p[k] as number).toFixed(1)}`)).join(" ");
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => lo + f * (hi - lo));
  const months = d.map((p, i) => [i, new Date(p[0])] as const).filter(([i, dt], k, arr) => k === 0 || dt.getUTCMonth() !== arr[k - 1][1].getUTCMonth()).filter((_, k, arr) => k % Math.ceil(arr.length / 8) === 0);
  return <div>
    <div className="mb-2 flex justify-end gap-1 text-xs">{[[63, "3M"], [125, "6M"], [250, "1Y"], [520, "2Y"]].map(([n, l]) => <button key={l} type="button" onClick={() => setRange(n as number)} className={cn("rounded-full px-3 py-1", range === n ? "bg-white/15 text-white" : "text-white/50 hover:text-white")}>{l}</button>)}</div>
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Price with 50- and 200-day moving averages">
      {ticks.map((t) => <g key={t}><line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,.07)" /><text x={P.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="rgba(255,255,255,.45)">{t >= 1000 ? Math.round(t).toLocaleString("en-IN") : t.toFixed(1)}</text></g>)}
      {months.map(([i, dt]) => <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="11" fill="rgba(255,255,255,.4)">{dt.toLocaleDateString("en-IN", { month: "short", year: "2-digit", timeZone: "UTC" })}</text>)}
      <path d={path(3)} fill="none" stroke="rgba(147,197,253,.9)" strokeWidth="1.6" />
      <path d={path(2)} fill="none" stroke="rgba(244,114,182,.85)" strokeWidth="1.4" />
      <path d={path(1)} fill="none" stroke="#fde68a" strokeWidth="2" />
    </svg>
    <div className="mt-1 flex gap-4 text-xs text-white/55"><span><i className="mr-1 inline-block h-0.5 w-4 bg-amber-200 align-middle" />Price</span><span><i className="mr-1 inline-block h-0.5 w-4 bg-pink-400 align-middle" />50-day avg</span><span><i className="mr-1 inline-block h-0.5 w-4 bg-blue-300 align-middle" />200-day avg</span></div>
  </div>;
}

function DrawdownChart({ weekly }: { weekly: [number, number][] }) {
  const d = weekly.slice(-260);
  if (d.length < 20) return null;
  let peak = 0;
  const dd = d.map(([t, c]) => { peak = Math.max(peak, c); return [t, c / peak - 1] as const; });
  const min = Math.min(...dd.map((x) => x[1]), -0.05);
  const W = 760, H = 140, P = { l: 52, r: 12, t: 8, b: 20 };
  const x = (i: number) => P.l + (i / (dd.length - 1)) * (W - P.l - P.r);
  const y = (v: number) => P.t + (v / min) * (H - P.t - P.b);
  const area = `M${x(0)},${y(0)} ${dd.map((p, i) => `L${x(i).toFixed(1)},${y(p[1]).toFixed(1)}`).join(" ")} L${x(dd.length - 1)},${y(0)} Z`;
  return <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Drawdown from the previous peak, last 5 years">
    {[0, min / 2, min].map((t) => <g key={t}><line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="rgba(255,255,255,.07)" /><text x={P.l - 6} y={y(t) + 4} textAnchor="end" fontSize="11" fill="rgba(255,255,255,.45)">{pct(t, 0)}</text></g>)}
    <path d={area} fill="rgba(248,113,113,.25)" stroke="rgba(248,113,113,.8)" strokeWidth="1.2" />
  </svg>;
}

function xirr(flows: [number, number][]) {
  let r = 0.1;
  for (let k = 0; k < 60; k++) {
    let f = 0, df = 0; const t0 = flows[0][0];
    for (const [t, v] of flows) { const y = (t - t0) / (365.25 * 864e5); f += v / Math.pow(1 + r, y); df -= (y * v) / Math.pow(1 + r, y + 1); }
    if (!df) break; const nr = r - f / df; if (!Number.isFinite(nr)) break; if (Math.abs(nr - r) < 1e-7) return nr; r = Math.max(-0.99, nr);
  }
  return r;
}

function sipBacktest(weekly: [number, number][], monthly: number, years: number) {
  if (weekly.length < 10) return null;
  const end = weekly[weekly.length - 1][0], start = end - years * 365.25 * 864e5;
  const pts = weekly.filter(([t]) => t >= start);
  if (!pts.length || weekly[0][0] > start + 30 * 864e5) return null;
  let units = 0, invested = 0, lastMonth = -1; const flows: [number, number][] = [];
  for (const [t, c] of pts) { const m = new Date(t).getUTCMonth(); if (m !== lastMonth) { units += monthly / c; invested += monthly; flows.push([t, -monthly]); lastMonth = m; } }
  const value = units * pts[pts.length - 1][1];
  flows.push([end, value]);
  return { invested, value, xirr: xirr(flows) };
}

export function StockAnalyzerClient({ symbol, universe }: { symbol: string; universe: [string, string, string][] }) {
  const [data, setData] = useState<Analysis | null>(null);
  const [error, setError] = useState("");
  const [sip, setSip] = useState(10000);
  const [years, setYears] = useState(5);

  useEffect(() => {
    let live = true;
    setData(null); setError("");
    fetch(`/api/stocks/${encodeURIComponent(symbol)}`).then(async (r) => { const j = await r.json(); if (!live) return; if (!r.ok) setError(j.error || "Could not analyse this stock."); else setData(j); }).catch(() => live && setError("Could not reach the data service. Please try again."));
    return () => { live = false; };
  }, [symbol]);

  const bt = useMemo(() => (data ? { stock: sipBacktest(data.weekly, sip, years), nifty: sipBacktest(data.indexWeekly, sip, years) } : null), [data, sip, years]);
  const groups = useMemo(() => { const m = new Map<string, Check[]>(); data?.checks.forEach((c) => m.set(c.group, [...(m.get(c.group) || []), c])); return [...m.entries()]; }, [data]);

  const search = <div className="mb-6 max-w-2xl"><StockSearch universe={universe} placeholder="Analyse another stock…" /></div>;
  if (error) return <>{search}<Card><p className="text-red-100">{error}</p></Card></>;
  if (!data) return <>{search}<Card className="animate-pulse text-white/60">Running the checks on {symbol}… (fetching price history and fundamentals)</Card></>;
  const s = data.stats, fu = data.fundamentals, v = data.verdict;

  return <>
    {search}
    <ToolHeader eyebrow={`${data.symbol}${data.industry ? ` · ${data.industry}` : ""}`} title={data.name} intro={<p className="flex flex-wrap items-center gap-3"><span className="text-2xl font-semibold text-white">₹{num(s.price)}</span><span className={tone(s.r1m)}>{signed(s.r1m)} 1M</span><span className={tone(s.r1y)}>{signed(s.r1y)} 1Y</span><span className="text-sm text-white/45">as of {new Date(s.asOf).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span></p>}>
      <div className="flex gap-2"><Link href={`/tools/portfolio?s=${encodeURIComponent(data.symbol)}`} className="glass rounded-full px-4 py-2 text-sm text-white">Add to portfolio check</Link></div>
    </ToolHeader>

    <div className="grid gap-6 lg:grid-cols-[1.3fr_.7fr]">
      <Card className="premium-card"><PriceChart data={data.chart} /></Card>
      <Card className={cn("premium-card border", v.label === "Strong" ? "border-emerald-300/40" : v.label === "Positive" ? "border-lime-300/30" : v.label === "Mixed" ? "border-amber-200/30" : "border-red-300/30")}>
        <p className="text-xs uppercase tracking-[.16em] text-white/50"><Term id="signal">Long-term checklist signal</Term></p>
        <div className="mt-2 flex items-center gap-3"><span className="font-display text-5xl text-white">{v.score}</span><Badge kind={v.label}>{v.label}</Badge></div>
        <p className="mt-3 text-sm leading-6 text-white/75">{v.summary}</p>
        <div className="mt-4 grid gap-2">{Object.entries(v.groups).map(([g, x]) => <div key={g} className="flex items-center justify-between text-sm"><span className="text-white/60">{g}</span><span className="flex items-center gap-2"><span className="h-1.5 w-24 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-amber-200" style={{ width: `${(x.pass / x.total) * 100}%` }} /></span><span className="w-10 text-right text-white/75">{x.pass}/{x.total}</span></span></div>)}</div>
        <div className={cn("mt-4 rounded-2xl border p-3", v.heat.label === "Overheated" ? "border-red-300/40 bg-red-500/10" : v.heat.label === "Hot" ? "border-orange-300/40 bg-orange-400/10" : "border-white/10 bg-white/[0.03]")}>
          <div className="flex items-center justify-between gap-2"><span className="flex items-center gap-2 text-sm text-white"><Flame size={16} className={v.heat.label === "Calm" ? "text-emerald-300" : v.heat.label === "Warm" ? "text-amber-200" : "text-red-300"} aria-hidden="true" /><Term id="heat">Risen too much?</Term></span><span className="flex items-center gap-2"><span className="font-mono text-sm text-white/70">{v.heat.score}/100</span><Badge kind={v.heat.label}>{v.heat.label}</Badge></span></div>
          {v.heat.reasons.length > 0 && <ul className="mt-2 list-disc pl-5 text-xs text-white/65">{v.heat.reasons.map((r) => <li key={r}>{r}</li>)}</ul>}
          <p className="mt-2 text-xs text-white/70">{v.heat.sip}</p>
        </div>
        <p className="mt-3 rounded-2xl border border-white/10 bg-white/[0.03] p-3 text-xs text-white/60"><Term id="position">Position-size guide</Term>: keep this stock to about <strong className="text-white">{pct(v.maxWeight, 0)}</strong> of your stock money, so even a very bad year — about twice its usual yearly swing of {pct(s.vol1y || 0, 0)} — would cost no more than ~5% of the total.</p>
        {data.screen && <p className="mt-3 text-xs text-white/45">Nifty 500 screener score {data.screen.score ?? "—"} ({data.screen.signal}).</p>}
      </Card>
    </div>

    <Card className="premium-card mt-6">
      <h2 className="font-display text-2xl">Long-term investor checklist</h2>
      <Explain>These are the questions careful investors ask before starting a SIP in a stock: Is it a good business? Is the price fair? How bumpy is the ride? Is the long-term trend up? Has it already run up too much? Can I buy and sell it easily? Green = passes, red = fails, grey = data not available. Tap any underlined term for an explanation.</Explain>
      <div className="mt-4 grid gap-5 lg:grid-cols-2">{groups.map(([g, list]) => <div key={g}><p className="mb-2 text-xs font-semibold uppercase tracking-[.18em] text-amber-100/80">{g}</p><ul className="grid gap-2">{list.map((c) => <li key={c.label} className="rounded-2xl border border-white/10 bg-white/[0.03] p-3"><div className="flex items-start gap-3">{c.pass === true ? <CheckCircle2 className="mt-0.5 shrink-0 text-emerald-300" size={18} aria-label="Pass" /> : c.pass === false ? <XCircle className="mt-0.5 shrink-0 text-red-300" size={18} aria-label="Fail" /> : <CircleHelp className="mt-0.5 shrink-0 text-white/35" size={18} aria-label="Not available" />}<div className="min-w-0 flex-1"><div className="flex flex-wrap justify-between gap-2 text-sm"><span className="text-white">{c.term ? <Term id={c.term}>{c.label}</Term> : c.label}</span><span className="font-mono tabular-nums text-white/70">{c.value}</span></div><p className="mt-1 text-xs text-white/45">{c.note}</p></div></div></li>)}</ul></div>)}</div>
    </Card>

    <div className="mt-6 grid gap-6 lg:grid-cols-2">
      <Card className="premium-card"><h2 className="font-display text-2xl">Returns</h2><Explain>How much the share price changed. Returns over 3 and 5 years are shown per year (<Term id="cagr">CAGR</Term>). Dividends are not included.</Explain><div className="mt-4 grid grid-cols-3 gap-3">{([["1 month", s.r1m], ["3 months", s.r3m], ["6 months", s.r6m], ["1 year", s.r1y], ["3y per year", s.cagr3], ["5y per year", s.cagr5]] as const).map(([l, x]) => <Stat key={l} label={l} value={<span className={tone(x)}>{signed(x)}</span>} />)}</div>
        {s.rolling1y && <p className="mt-4 text-sm text-white/60"><Term id="rolling">Rolling 1-year returns</Term> over 5 years: worst <span className={tone(s.rolling1y.min)}>{pct(s.rolling1y.min, 0)}</span>, median <span className={tone(s.rolling1y.median)}>{pct(s.rolling1y.median, 0)}</span>, best <span className={tone(s.rolling1y.max)}>{pct(s.rolling1y.max, 0)}</span>; positive in {pct(s.rolling1y.positive, 0)} of periods.</p>}</Card>
      <Card className="premium-card"><h2 className="font-display text-2xl">Risk</h2><Explain>How bumpy the ride has been. Higher volatility and deeper falls mean you need more patience and should put a smaller share of your money here.</Explain><div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label={<Term id="volatility">Volatility (1y)</Term>} value={pct(s.vol1y)} hint={`Downside ${pct(s.downVol1y)}`} /><Stat label={<Term id="beta">Beta vs Nifty</Term>} value={num(s.beta1y)} hint={`Correlation ${num(s.corr1y)}`} /><Stat label={<Term id="drawdown">Max fall (3y)</Term>} value={pct(s.mdd3y, 0)} />
        <Stat label={<Term id="var">1-day VaR (95%)</Term>} value={pct(s.var95)} hint="Loss exceeded on 1 day in 20" /><Stat label={<Term id="sharpe">Sharpe (1y)</Term>} value={num(s.sharpe1y)} hint={`Sortino ${num(s.sortino1y)}`} /><Stat label={<Term id="alpha">Alpha (1y)</Term>} value={<span className={tone(s.alpha1y)}>{signed(s.alpha1y)}</span>} hint="vs beta-adjusted Nifty" />
      </div></Card>
      <Card className="premium-card"><h2 className="font-display text-2xl">Price behaviour</h2><Explain>Long-term investors use these only to avoid starting at a bad moment — for example right after a sharp spike — not to trade.</Explain><div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label={<Term id="rsi">RSI (14)</Term>} value={num(s.rsi14, 0)} hint={s.rsi14 === null ? "" : s.rsi14 > 70 ? "Overbought" : s.rsi14 < 30 ? "Oversold" : "Neutral"} /><Stat label={<Term id="dma">50-day avg</Term>} value={`₹${num(s.dma50)}`} /><Stat label={<Term id="dma">200-day avg</Term>} value={`₹${num(s.dma200)}`} />
        <Stat label={<Term id="high52">52-week high</Term>} value={`₹${num(s.high52)}`} hint={`${pct(s.fromHigh52, 0)} away`} /><Stat label="52-week low" value={`₹${num(s.low52)}`} /><Stat label={<Term id="momentum">Momentum 12-1</Term>} value={<span className={tone(s.mom12_1)}>{signed(s.mom12_1)}</span>} />
      </div><p className="mt-3 text-xs text-white/45">Traded value ≈ ₹{num(s.valueCr20, 1)} Cr/day · {s.years} years of data{s.splitsAdjusted ? ` · adjusted for ${s.splitsAdjusted} split/bonus` : ""}</p></Card>
      <Card className="premium-card"><h2 className="font-display text-2xl">Business &amp; valuation</h2><Explain>Is this a good business, and is the price sensible for it? These matter most for a SIP you will hold for years.</Explain>{fu ? <div className="mt-4 grid grid-cols-3 gap-3">
        <Stat label={<Term id="pe">P/E</Term>} value={fu.pe ? num(fu.pe, 1) : "—"} hint={data.industryPe ? `Industry ${num(data.industryPe, 1)}` : data.indexPe ? `Nifty ${num(data.indexPe, 1)}` : undefined} /><Stat label={<Term id="pb">Price / book</Term>} value={fu.pb ? num(fu.pb, 1) : "—"} /><Stat label={<Term id="roe">ROE</Term>} value={pct(fu.roe)} />
        <Stat label={<Term id="de">Debt / equity</Term>} value={num(fu.de)} /><Stat label={<Term id="margin">Profit margin</Term>} value={pct(fu.margin)} /><Stat label={<Term id="epsgrowth">EPS growth</Term>} value={<span className={tone(fu.epsGrowth)}>{signed(fu.epsGrowth)}</span>} hint={`Revenue ${signed(fu.revGrowth)}`} />
        <Stat label={<Term id="divyield">Dividend yield</Term>} value={pct(fu.divYield)} /><Stat label={<Term id="mcap">Market cap</Term>} value={fu.mcapCr ? `₹${Math.round(fu.mcapCr).toLocaleString("en-IN")} Cr` : "—"} className="col-span-2" />
      </div> : <p className="mt-4 text-sm text-white/55">Fundamentals are not available right now; the checklist uses price data only. Check the latest results on the NSE or company website.</p>}</Card>
    </div>

    <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
      <Card className="premium-card"><h2 className="font-display text-2xl"><Term id="drawdown">Drawdowns</Term> (5 years)</h2><p className="mt-1 text-sm text-white/55">How far the stock was below its previous peak — the pain you would have sat through.</p><div className="mt-3"><DrawdownChart weekly={data.weekly} /></div></Card>
      <Card className="premium-card"><h2 className="font-display text-2xl"><Term id="sip">SIP</Term> back-test</h2><p className="mt-1 text-sm text-white/55">A monthly investment in this stock vs the Nifty 50 (price only, before dividends and costs).</p>
        <div className="mt-4 grid grid-cols-2 gap-3"><label className="text-sm text-white/75">Monthly amount<input type="number" min={500} step={500} value={sip} onChange={(e) => setSip(Math.max(500, Number(e.target.value) || 500))} className={cn(field, "mt-1.5")} /></label><label className="text-sm text-white/75">Years<select value={years} onChange={(e) => setYears(Number(e.target.value))} className={cn(field, "mt-1.5")}>{[1, 3, 5, 7, 10].map((y) => <option key={y} value={y}>{y}</option>)}</select></label></div>
        {bt?.stock ? <div className="mt-4 grid grid-cols-2 gap-3"><Stat label={`${data.symbol} SIP`} value={inr(bt.stock.value)} hint={<>Invested {inr(bt.stock.invested)} · <Term id="xirr">XIRR</Term> {pct(bt.stock.xirr)}</>} /><Stat label="Nifty 50 SIP" value={bt.nifty ? inr(bt.nifty.value) : "—"} hint={bt.nifty ? `XIRR ${pct(bt.nifty.xirr)}` : ""} /></div> : <p className="mt-4 text-sm text-white/50">Not enough history for {years} years.</p>}
      </Card>
    </div>
    <p className="mt-6 font-mono text-xs text-white/40">Data: {data.sources.join(" · ")}. Prices adjusted for detected splits and bonuses; returns exclude dividends. <a href="/tools/methodology#data-quality" className="underline">How data is checked</a></p>
  </>;
}
