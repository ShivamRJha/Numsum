"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Badge, Stat, num, pct, signed, tone } from "@/components/invest/kit";
import { Explain, Term } from "@/components/invest/explain";
import { StockSearch } from "@/components/invest/stock-search";
import { Card } from "@/components/ui";
import { portfolioStats, type StockStats, type Verdict } from "@/lib/invest/stocks";
import { cn } from "@/lib/utils";

type Item = { symbol: string; name: string; industry: string; stats: StockStats; verdict: Verdict; weekly: [number, number][] };

function heat(c: number) {
  const a = Math.min(1, Math.abs(c));
  return c >= 0 ? `rgba(248,113,113,${0.12 + a * 0.6})` : `rgba(96,165,250,${0.12 + a * 0.6})`;
}

export function PortfolioClient({ universe }: { universe: [string, string, string][] }) {
  const [symbols, setSymbols] = useState<string[]>([]);
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [items, setItems] = useState<Record<string, Item | "error" | "loading">>({});

  useEffect(() => { const s = new URLSearchParams(window.location.search).get("s"); if (s) setSymbols([...new Set(s.split(",").map((x) => decodeURIComponent(x).toUpperCase().trim()).filter(Boolean))].slice(0, 8)); }, []);
  useEffect(() => {
    for (const sym of symbols) {
      if (items[sym]) continue;
      setItems((m) => ({ ...m, [sym]: "loading" }));
      fetch(`/api/stocks/${encodeURIComponent(sym)}`).then(async (r) => { const j = await r.json(); setItems((m) => ({ ...m, [sym]: r.ok ? { symbol: j.symbol, name: j.name, industry: j.industry, stats: j.stats, verdict: j.verdict, weekly: j.weekly } : "error" })); }).catch(() => setItems((m) => ({ ...m, [sym]: "error" })));
    }
    const url = new URL(window.location.href); url.searchParams.set("s", symbols.join(",")); window.history.replaceState(null, "", url.toString());
  }, [symbols]); // eslint-disable-line react-hooks/exhaustive-deps

  const ready = symbols.map((s) => items[s]).filter((x): x is Item => typeof x === "object");
  const userW = useMemo(() => { const raw = ready.map((x) => Math.max(0, weights[x.symbol] ?? 1)); const sum = raw.reduce((a, b) => a + b, 0) || 1; return raw.map((w) => w / sum); }, [ready, weights]);
  const ps = useMemo(() => (ready.length >= 2 ? portfolioStats(ready.map((x) => ({ symbol: x.symbol, weekly: x.weekly })), userW) : null), [ready, userW]);

  const warnings: string[] = [];
  if (ps) {
    for (let i = 0; i < ready.length; i++) for (let j = i + 1; j < ready.length; j++) if (ps.corr[i][j] > 0.75) warnings.push(`${ready[i].symbol} and ${ready[j].symbol} move very closely together (correlation ${ps.corr[i][j].toFixed(2)}) — they add little diversification.`);
    ready.forEach((x, i) => { if (userW[i] > x.verdict.maxWeight * 1.5 && userW[i] > 0.15) warnings.push(`${x.symbol} is ${pct(userW[i], 0)} of the basket; its volatility suggests keeping it nearer ${pct(x.verdict.maxWeight, 0)} of a full equity portfolio.`); });
    const byInd = new Map<string, number>(); ready.forEach((x, i) => byInd.set(x.industry || "Other", (byInd.get(x.industry || "Other") || 0) + userW[i]));
    for (const [k, v] of byInd) if (v > 0.4 && ready.length > 2) warnings.push(`${pct(v, 0)} of the basket is in ${k} — one industry dominates.`);
    if (ready.length < 5) warnings.push("Fewer than five stocks: most of the risk is company-specific. Ten to twenty stocks across industries, or an index fund core, spreads it.");
    const weak = ready.filter((x) => x.verdict.label === "Weak").map((x) => x.symbol);
    if (weak.length) warnings.push(`${weak.join(", ")} fail${weak.length === 1 ? "s" : ""} most checklist items — review in the stock analyzer.`);
  }

  return <div className="grid gap-6">
    <Card className="premium-card">
      <Explain always={false}>Owning several stocks only reduces risk if they do not all move together. Add your stocks (and how much you hold of each) to see how much real diversification you have, and what weights would balance the risk.</Explain>
      <div className="mt-4" />
      <StockSearch universe={universe} onPick={(s) => setSymbols((l) => (l.includes(s) || l.length >= 8 ? l : [...l, s]))} placeholder="Add a stock (up to 8)…" />
      {symbols.length > 0 && <div className="mt-5 overflow-x-auto"><table className="w-full min-w-[760px] text-left text-sm">
        <thead className="text-xs uppercase tracking-[.12em] text-white/45"><tr><th className="py-2 pr-3">Stock</th><th className="py-2 pr-3">Signal</th><th className="py-2 pr-3 text-right">1y</th><th className="py-2 pr-3 text-right">Volatility</th><th className="py-2 pr-3 text-right">Beta</th><th className="py-2 pr-3 text-right">Your weight</th><th className="py-2 pr-3 text-right">Risk-balanced</th><th className="py-2" /></tr></thead>
        <tbody>{symbols.map((sym) => { const it = items[sym]; const idx = ready.findIndex((x) => x.symbol === sym); return <tr key={sym} className="border-t border-white/8">
          {typeof it === "object" ? <><td className="py-2 pr-3"><Link href={`/tools/stock-analyzer/${encodeURIComponent(sym)}`} className="text-blue-100 hover:text-white">{it.name}</Link><p className="text-xs text-white/40">{sym} · {it.industry || "—"}</p></td><td className="py-2 pr-3"><Badge kind={it.verdict.label}>{it.verdict.label}</Badge></td><td className={cn("py-2 pr-3 text-right", tone(it.stats.r1y))}>{signed(it.stats.r1y)}</td><td className="py-2 pr-3 text-right">{pct(it.stats.vol1y, 0)}</td><td className="py-2 pr-3 text-right">{num(it.stats.beta1y)}</td>
            <td className="py-2 pr-3 text-right"><input aria-label={`Weight for ${sym}`} type="number" min={0} step={1} value={Math.round((weights[sym] ?? 1) * 10) / 10} onChange={(e) => setWeights((w) => ({ ...w, [sym]: Math.max(0, Number(e.target.value) || 0) }))} className="w-16 rounded-lg border border-white/15 bg-transparent px-2 py-1 text-right" /><span className="ml-2 text-xs text-white/45">{idx >= 0 ? pct(userW[idx], 0) : ""}</span></td>
            <td className="py-2 pr-3 text-right text-amber-100">{ps && idx >= 0 ? pct(ps.inverseVol.weights[idx], 0) : "—"}</td></> : <td colSpan={7} className="py-2 pr-3 text-white/50">{sym} — {it === "error" ? "not found on NSE" : "loading…"}</td>}
          <td className="py-2 text-right"><button type="button" onClick={() => setSymbols((l) => l.filter((x) => x !== sym))} className="text-xs text-white/45 hover:text-red-200">Remove</button></td></tr>; })}</tbody></table></div>}
      {ready.length >= 2 && <button type="button" onClick={() => setWeights(Object.fromEntries(ready.map((x, i) => [x.symbol, Math.round((ps?.inverseVol.weights[i] || 0) * 1000) / 10])))} className="mt-4 rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 hover:border-white/40">Use risk-balanced weights</button>}
      {!symbols.length && <p className="mt-4 text-sm text-white/50">Add at least two stocks to see how they work together.</p>}
    </Card>

    {ps && <>
      <div className="grid gap-3 sm:grid-cols-4">
        <Stat label={<Term id="volatility">Basket volatility</Term>} value={pct(ps.equal.vol)} hint={`Average stock ${pct(ready.reduce((a, x, i) => a + userW[i] * (ps.vol[i] || 0), 0))}`} />
        <Stat label={<Term id="divratio">Diversification ratio</Term>} value={ps.equal.diversification.toFixed(2)} hint="1.0 = none; 1.4+ = good" />
        <Stat label={<Term id="riskbalanced">Risk-balanced volatility</Term>} value={pct(ps.inverseVol.vol)} hint="Weights ∝ 1 / volatility" />
        <Stat label="Return (3y, your weights)" value={<span className={tone(ps.equal.ret)}>{pct(ps.equal.ret)}</span>} hint={`${ps.weeks} weeks of common data`} />
      </div>
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Card className="premium-card"><h2 className="font-display text-2xl"><Term id="correlation">Correlation</Term> matrix</h2><p className="mt-1 text-sm text-white/55">Weekly returns, last three years. Red = move together, blue = move apart.</p>
          <div className="mt-4 overflow-x-auto"><table className="text-center text-xs"><thead><tr><th />{ready.map((x) => <th key={x.symbol} className="px-1 pb-2 font-medium text-white/60">{x.symbol}</th>)}</tr></thead><tbody>{ready.map((x, i) => <tr key={x.symbol}><th className="pr-2 text-right font-medium text-white/60">{x.symbol}</th>{ready.map((y, j) => <td key={y.symbol} className="h-10 w-14 rounded tabular-nums text-white" style={{ background: i === j ? "rgba(255,255,255,.06)" : heat(ps.corr[i][j]) }}>{i === j ? "—" : ps.corr[i][j].toFixed(2)}</td>)}</tr>)}</tbody></table></div></Card>
        <Card className="premium-card"><h2 className="font-display text-2xl">What to look at</h2>{warnings.length ? <ul className="mt-4 grid gap-2 text-sm text-white/75">{warnings.map((w) => <li key={w} className="rounded-2xl border border-amber-200/20 bg-amber-200/5 p-3">{w}</li>)}</ul> : <p className="mt-4 text-sm text-emerald-100">No red flags: correlations are moderate, weights are within volatility guides and no single industry dominates.</p>}</Card>
      </div>
    </>}
  </div>;
}
