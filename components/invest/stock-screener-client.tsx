"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Badge, ScoreBar, field, num, pct, selectCls, tone } from "@/components/invest/kit";
import { Explain, Term } from "@/components/invest/explain";
import { Card } from "@/components/ui";
import type { StockLite } from "@/lib/invest/stocks";
import { cn } from "@/lib/utils";
import { compileQuery, QUERY_EXAMPLES, QUERY_FIELDS } from "@/lib/invest/query";

type Screen = { key: string; label: string; help: string; test: (r: StockLite, ind: Record<string, { pe: number | null }>) => boolean };
const SCREENS: Screen[] = [
  { key: "custom", label: "Custom query ✦", help: "Write your own screen in plain words, joined with AND / OR. Percentages are typed as percent (ROE > 15 means 15%); market cap is in ₹ crore.", test: () => true },
  { key: "all", label: "All stocks", help: "The full Nifty 500 ranked by the long-term score.", test: () => true },
  { key: "compounders", label: "Steady compounders", help: "3-year return above 12% a year, positive in at least 70% of 1-year periods, and not overheated — the kind of stock long-term SIP investors look for.", test: (r) => (r.c3 ?? 0) > 0.12 && (r.pos ?? 0) >= 0.7 && r.hl !== "Hot" && r.hl !== "Overheated" },
  { key: "quality", label: "Quality at a fair price", help: "ROE above 15%, debt/equity below 1, P/E below its industry median and price above the 200-day average.", test: (r, ind) => (r.roe ?? 0) > 0.15 && (r.de === null || r.de < 1) && r.pe !== null && r.pe > 0 && ind[r.i]?.pe != null && r.pe < (ind[r.i].pe as number) && (r.tr ?? -1) > 0 },
  { key: "hot", label: "Risen too much", help: "Stocks flagged Hot or Overheated — they have risen too far, too fast. Long-term investors usually wait or start very small here.", test: (r) => r.hl === "Hot" || r.hl === "Overheated" },
  { key: "lowvol", label: "Low volatility", help: "Annual volatility under 22% and beta under 0.9 — steadier stocks.", test: (r) => (r.v ?? 1) < 0.22 && (r.b ?? 2) < 0.9 },
  { key: "dividend", label: "Dividend payers", help: "Dividend yield above 2% with positive return on equity.", test: (r) => (r.dy ?? 0) > 0.02 && (r.roe ?? 0) > 0 },
  { key: "value", label: "Value", help: "P/E and P/B in the cheaper part of the market with positive earnings.", test: (r) => r.pe !== null && r.pe > 0 && r.pe < 15 && (r.pb ?? 99) < 2.5 },
  { key: "dip", label: "Quality on a dip", help: "ROE above 15% with the price calm or below its 200-day average — good businesses that are not in favour right now. A closer look, not an automatic buy.", test: (r) => (r.roe ?? 0) > 0.15 && (r.tr ?? 1) < 0.05 && r.hl === "Calm" },
];
const SORTS: [string, string, (r: StockLite) => number | null, boolean][] = [
  ["sc", "Score", (r) => r.sc, false], ["c3", "3-year return", (r) => r.c3, false], ["r1", "1-year return", (r) => r.r1, false], ["ht", "Least heated", (r) => r.ht ?? null, true],
  ["v", "Lowest volatility", (r) => r.v, true], ["pe", "Lowest P/E", (r) => (r.pe && r.pe > 0 ? r.pe : null), true], ["roe", "Highest ROE", (r) => r.roe, false], ["dy", "Dividend yield", (r) => r.dy, false], ["mc", "Market cap", (r) => r.mc, false],
];

export function StockScreenerClient({ rows, asOf, indexPe, methodology, industries, withFundamentals }: { rows: StockLite[]; asOf: string | null; indexPe: number | null; methodology: string; industries: Record<string, { pe: number | null; count: number }>; withFundamentals: number }) {
  const [screen, setScreen] = useState("all");
  const [query, setQuery] = useState(QUERY_EXAMPLES[0]);
  const compiled = useMemo(() => compileQuery(query), [query]);
  const [q, setQ] = useState("");
  const [ind, setInd] = useState("all");
  const [sig, setSig] = useState("all");
  const [sort, setSort] = useState("sc");
  const [liquid, setLiquid] = useState(true);
  const [cool, setCool] = useState(false);
  const [limit, setLimit] = useState(50);
  const [picked, setPicked] = useState<string[]>([]);
  const sc = SCREENS.find((s) => s.key === screen) || SCREENS[0];
  const so = SORTS.find((s) => s[0] === sort) || SORTS[0];
  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return rows.filter((r) => (!t || r.s.toLowerCase().includes(t) || r.n.toLowerCase().includes(t)) && (ind === "all" || r.i === ind) && (sig === "all" || r.sig === sig) && (!liquid || (r.liq ?? 0) >= 5) && (!cool || (r.hl !== "Hot" && r.hl !== "Overheated")) && (screen === "custom" ? ("test" in compiled ? compiled.test(r) : false) : sc.test(r, industries)))
      .sort((a, b) => { const va = so[2](a), vb = so[2](b); if (va === null) return 1; if (vb === null) return -1; return so[3] ? va - vb : vb - va; });
  }, [rows, q, ind, sig, liquid, cool, sc, so, industries, screen, compiled]);

  if (!rows.length) return <Card><p className="text-white/60">Stock data is refreshed every night from NSE prices; scores will appear here after the first refresh. You can already analyse any stock in the <Link href="/tools/stock-analyzer" className="underline">stock analyzer</Link>.</p></Card>;

  return <div className="grid gap-6">
    <div className="flex gap-2 overflow-x-auto pb-1">{SCREENS.map((s) => <button key={s.key} type="button" onClick={() => { setScreen(s.key); setLimit(50); }} className={cn("whitespace-nowrap rounded-full border px-4 py-2 text-sm", screen === s.key ? "border-amber-100/70 bg-amber-100/15 text-amber-50" : "border-white/12 text-white/65 hover:text-white")}>{s.label}</button>)}</div>
    <Card className="premium-card">
      <p className="text-sm text-white/60">{sc.help}</p>
      {screen === "custom" && <div className="mt-4">
        <textarea aria-label="Screen query" value={query} onChange={(e) => setQuery(e.target.value)} rows={2} spellCheck={false} className={cn(field, "font-mono text-sm")} />
        {"error" in compiled ? <p className="mt-2 text-sm text-red-200">{compiled.error}</p> : <p className="mt-2 text-xs text-emerald-200/80">Query OK</p>}
        <div className="mt-2 flex flex-wrap gap-1.5">{QUERY_EXAMPLES.map((x) => <button key={x} type="button" onClick={() => setQuery(x)} className="rounded-full border border-white/12 px-3 py-1 font-mono text-[11px] text-white/60 hover:border-amber-100/50 hover:text-white">{x}</button>)}</div>
        <details className="mt-2 text-xs text-white/50"><summary className="cursor-pointer text-white/65">Fields you can use</summary><p className="mt-2 leading-6">{QUERY_FIELDS.map((f) => `${f.names[0]}${f.pct ? " (%)" : f.unit ? ` (${f.unit})` : ""}`).join(" · ")}</p></details>
      </div>}
      <Explain>Scores are built for holding at least a year through a SIP: business quality and fair price count most; risk and the long-term trend next. The <Term id="heat">heat</Term> column warns when a stock has already risen too much — those are down-rated. Tap any column name for what it means.</Explain>
      <div className="mt-4 grid gap-3 md:grid-cols-[1.2fr_1fr_.8fr_1fr]">
        <input aria-label="Search stocks" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or symbol…" className={field} />
        <select aria-label="Industry" value={ind} onChange={(e) => setInd(e.target.value)} className={selectCls}><option value="all">All industries</option>{Object.entries(industries).sort((a, b) => a[0].localeCompare(b[0])).map(([k, v]) => <option key={k} value={k}>{k} ({v.count})</option>)}</select>
        <select aria-label="Signal" value={sig} onChange={(e) => setSig(e.target.value)} className={selectCls}>{["all", "Strong", "Positive", "Neutral", "Weak"].map((s) => <option key={s} value={s}>{s === "all" ? "Any signal" : s}</option>)}</select>
        <select aria-label="Sort by" value={sort} onChange={(e) => setSort(e.target.value)} className={selectCls}>{SORTS.map(([k, l]) => <option key={k} value={k}>Sort: {l}</option>)}</select>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-white/50"><span className="flex flex-wrap gap-4"><label className="flex items-center gap-2"><input type="checkbox" checked={liquid} onChange={(e) => setLiquid(e.target.checked)} className="accent-amber-200" />Only stocks trading over ₹5 crore a day</label><label className="flex items-center gap-2"><input type="checkbox" checked={cool} onChange={(e) => setCool(e.target.checked)} className="accent-amber-200" />Hide stocks that have risen too much</label></span><span>{list.length} stocks · prices {asOf || "—"} · Nifty 50 P/E {indexPe ? indexPe.toFixed(1) : "—"} · fundamentals for {withFundamentals}</span></div>
      <div className="mt-4 overflow-x-auto"><table className="w-full min-w-[1040px] text-left text-sm">
        <thead className="text-xs uppercase tracking-[.12em] text-white/45"><tr><th className="py-2 pr-2" aria-label="Select" /><th className="py-2 pr-3">Stock</th><th className="py-2 pr-3"><Term id="score">Score</Term></th><th className="py-2 pr-3"><Term id="signal">Signal</Term></th><th className="py-2 pr-3"><Term id="heat">Heat</Term></th><th className="py-2 pr-3 text-right">Price</th><th className="py-2 pr-3 text-right">1y</th><th className="py-2 pr-3 text-right"><Term id="cagr">3y/yr</Term></th><th className="py-2 pr-3 text-right"><Term id="volatility">Vol</Term></th><th className="py-2 pr-3 text-right"><Term id="beta">Beta</Term></th><th className="py-2 pr-3 text-right"><Term id="pe">P/E</Term></th><th className="py-2 pr-3 text-right"><Term id="roe">ROE</Term></th><th className="py-2 text-right"><Term id="dma">vs 200-day</Term></th></tr></thead>
        <tbody>{list.slice(0, limit).map((r) => <tr key={r.s} className="border-t border-white/8">
          <td className="py-2 pr-2"><input type="checkbox" aria-label={`Add ${r.s} to portfolio check`} checked={picked.includes(r.s)} disabled={!picked.includes(r.s) && picked.length >= 8} onChange={() => setPicked((l) => (l.includes(r.s) ? l.filter((x) => x !== r.s) : [...l, r.s]))} className="h-4 w-4 accent-amber-200" /></td>
          <td className="py-2 pr-3"><Link href={`/tools/stock-analyzer/${encodeURIComponent(r.s)}`} className="font-medium text-blue-100 hover:text-white">{r.n}</Link><p className="text-xs text-white/40">{r.s} · {r.i}</p></td>
          <td className="py-2 pr-3"><ScoreBar score={r.sc} /></td><td className="py-2 pr-3"><Badge kind={r.sig}>{r.sig}</Badge></td><td className="py-2 pr-3">{r.hl ? <Badge kind={r.hl}>{r.hl}</Badge> : "—"}</td>
          <td className="py-2 pr-3 text-right tabular-nums">₹{num(r.px, 1)}</td><td className={cn("py-2 pr-3 text-right tabular-nums", tone(r.r1))}>{pct(r.r1)}</td><td className={cn("py-2 pr-3 text-right tabular-nums", tone(r.c3))}>{pct(r.c3)}</td>
          <td className="py-2 pr-3 text-right tabular-nums">{pct(r.v, 0)}</td><td className="py-2 pr-3 text-right tabular-nums">{num(r.b)}</td><td className="py-2 pr-3 text-right tabular-nums">{r.pe ? num(r.pe, 1) : "—"}</td><td className="py-2 pr-3 text-right tabular-nums">{pct(r.roe, 0)}</td>
          <td className={cn("py-2 text-right tabular-nums", r.tr === null ? "" : r.tr > 0.25 ? "text-orange-200" : r.tr > 0 ? "text-emerald-200" : "text-red-200")}>{r.tr === null ? "—" : `${r.tr > 0 ? "+" : ""}${Math.round(r.tr * 100)}%`}</td></tr>)}</tbody></table></div>
      {list.length > limit && <button type="button" onClick={() => setLimit((l) => l + 50)} className="mt-4 rounded-full border border-white/15 px-4 py-2 text-sm text-white/75 hover:text-white">Show more ({list.length - limit} left)</button>}
      {!list.length && <p className="mt-4 text-sm text-white/50">No stocks match this screen right now.</p>}
    </Card>
    {picked.length >= 2 && <Link href={`/tools/portfolio?s=${picked.map(encodeURIComponent).join(",")}`} className="fixed bottom-5 right-5 z-40 rounded-full bg-amber-100 px-5 py-3 text-sm font-semibold text-black shadow-2xl hover:bg-white">Check {picked.length} as a portfolio →</Link>}
    {methodology && <details className="text-sm text-white/55"><summary className="cursor-pointer font-semibold text-white/75">How stocks are scored</summary><p className="mt-2">{methodology}</p></details>}
  </div>;
}
