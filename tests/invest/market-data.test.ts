/** Offline checks for the market-data pipeline: npx tsx tests/invest/market-data.test.ts */
import assert from "node:assert/strict";
import { cagr, maxDrawdown, parseMfapiHistory, percentiles, type NavPoint } from "../../lib/invest/metrics";
import { computeFundStats, parseAmfi, parseTer, schemeKey, scoreFunds } from "../../lib/invest/funds-pipeline";
import { adjustSplits, computeStockStats, heat, investorChecks, verdict, type Bar } from "../../lib/invest/stocks";

const DAY = 864e5;
function series(years: number, annual: number, wobble: number, seed: number): NavPoint[] {
  const out: NavPoint[] = []; let nav = 10; let s = seed;
  const end = Date.UTC(2026, 10, 20);
  for (let t = end - years * 365.25 * DAY; t <= end; t += DAY) {
    s = (s * 9301 + 49297) % 233280; const noise = (s / 233280 - 0.5) * wobble;
    nav *= Math.pow(1 + annual, 1 / 365.25) * (1 + noise / 100);
    out.push({ t: Math.round(t / DAY) * DAY, nav });
  }
  return out;
}

// CAGR of a smooth 12% series is ~12%
const smooth = series(6, 0.12, 0, 1);
assert.ok(Math.abs((cagr(smooth, 3) as number) - 0.12) < 0.002, "cagr");
assert.equal(cagr(series(2, 0.1, 0, 1), 3), null, "no 3y cagr on 2y history");
assert.ok((maxDrawdown(series(6, 0.1, 3, 7), 5) as number) < 0, "drawdown negative");
assert.deepEqual(percentiles([1, 2, 3, null]), [0, 50, 100, null]);
assert.deepEqual(percentiles([1, 2, 3], true), [100, 50, 0]);
assert.equal(parseMfapiHistory([{ date: "02-01-2024", nav: "11" }, { date: "01-01-2024", nav: "10" }, { date: "x", nav: "0" }]).length, 2);

const amfi = `Scheme Code;ISIN Div Payout/ ISIN Growth;ISIN Div Reinvestment;Scheme Name;Net Asset Value;Date

Open Ended Schemes(Equity Scheme - Large Cap Fund)

Alpha Mutual Fund

1001;INF1;-;Alpha Large Cap Fund - Direct Plan - Growth;101.5;20-Nov-2026
1002;INF2;-;Alpha Large Cap Fund - Regular Plan - Growth;95.1;20-Nov-2026
1003;INF3;-;Alpha Large Cap Fund - Direct Plan - IDCW;20.1;20-Nov-2026

Open Ended Schemes(Other Scheme - Index Funds)

Beta Mutual Fund

2001;INF4;-;Beta Nifty 50 Index Fund - Direct Plan - Growth;30.2;20-Nov-2026
`;
const parsed = parseAmfi(amfi);
assert.deepEqual(parsed.map((p) => [p.code, p.bucket, p.amc, p.navDate]), [["1001", "large", "Alpha Mutual Fund", "2026-11-20"], ["2001", "idx_n50", "Beta Mutual Fund", "2026-11-20"]]);

// Scoring: a steadier, cheaper, higher-return fund ranks above a volatile, costly one
const base = { amc: "X", nav: 1, navDate: "", bucket: "large" };
const stats = [
  computeFundStats({ ...base, code: "a", name: "Steady", ter: 0.5 }, series(8, 0.14, 0.6, 3))!,
  computeFundStats({ ...base, code: "b", name: "Choppy", ter: 1.2 }, series(8, 0.09, 2.5, 5))!,
  computeFundStats({ ...base, code: "c", name: "Young", ter: null }, series(1.5, 0.2, 1, 9))!,
];
const { rows, buckets } = scoreFunds(stats);
const byName = Object.fromEntries(rows.map((r) => [r.name, r]));
assert.ok((byName.Steady.score as number) > (byName.Choppy.score as number), "steady beats choppy");
assert.equal(byName.Young.confidence, "Low");
assert.ok(Math.abs((byName.Young.score as number) - 50) < 30, "young fund shrunk toward 50");
assert.equal(buckets.large.count, 3);
assert.equal(byName.Steady.ter, 0.5);

// Expense ratios join on the base scheme name
const ter = parseTer('"NSDL Scheme Code","Scheme Name","Direct Plan - Base Expense Ratio (BER) (%)","Direct Plan - Total TER (%)"\n"X","Alpha Large Cap Fund",0.5,0.7\n');
assert.equal(ter.get(schemeKey("Alpha Large Cap Fund - Direct Plan - Growth")), 0.59);

// Stocks: split detection, statistics and checklist
const DAYMS = 864e5; const t0 = Date.UTC(2020, 0, 1);
const bars: Bar[] = Array.from({ length: 1500 }, (_, i) => ({ t: t0 + i * DAYMS, c: (100 + i * 0.1) * (i >= 700 ? 0.5 : 1), v: 1e5 }));
const adj = adjustSplits(bars);
assert.equal(adj.count, 1, "one 1:1 bonus detected");
assert.ok(Math.abs(adj.bars[699].c - (100 + 699 * 0.1) * 0.5) < 1e-6, "pre-split prices halved");
const st = computeStockStats("TEST", bars, bars)!;
assert.ok(st.dma200! < st.price && st.beta1y! > 0.99 && st.mdd3y! > -0.01, "uptrend stats");
const v = verdict(investorChecks(st, { roe: 0.2, de: 0.3, pe: 20, pb: 3, margin: 0.1, epsGrowth: 0.1 }, { indexPe: 22 }), st);
assert.ok(["Strong", "Positive"].includes(v.label), `verdict ${v.label}`);

console.log("market-data tests passed", rows.map((r) => `${r.name}:${r.score}/${r.confidence}`).join(" "), v.label);

// Newer pipe-separated layout with category and fund-house columns
const piped = `Scheme Code|Scheme Name|Fund House|Scheme Category|NAV|NAV Date
3001|Gamma Mid Cap Fund - Direct Plan - Growth|Gamma MF|Equity Scheme - Mid Cap Fund|55.1|20-Nov-2026
3002|Gamma Large & Mid Cap Fund - Direct Plan - Growth|Gamma MF|Large & Mid Cap Fund|44.0|20-Nov-2026
3003|Gamma Liquid Fund - Direct Plan - Growth|Gamma MF|Liquid Fund|2500.5|20-Nov-2026`;
assert.deepEqual(parseAmfi(piped).map((p) => [p.code, p.bucket, p.amc]), [["3001", "mid", "Gamma MF"], ["3002", "largemid", "Gamma MF"], ["3003", "liquid", "Gamma MF"]]);
console.log("pipe layout parsed");

// Heat: a stock that doubled in six months and sits far above its 200-day average is flagged
{
  const hotStats = { ...st, ext200: 0.6, r6m: 0.8, r1y: 1.2, r1yPctile: 0.98, rsi14: 82, fromLow52: 1.6 };
  const h = heat(hotStats);
  assert.equal(h.label, "Overheated", `heat ${h.score}`);
  const calm = heat({ ...st, ext200: 0.05, r6m: 0.05, r1y: 0.1, r1yPctile: 0.4, rsi14: 50, fromLow52: 0.2 });
  assert.equal(calm.label, "Calm");
  const vh = verdict(investorChecks(hotStats, { roe: 0.25, de: 0.2, pe: 20, pb: 3, margin: 0.2, epsGrowth: 0.2, revGrowth: 0.1 }, { indexPe: 22 }), hotStats, h);
  assert.ok(vh.label !== "Strong" && vh.label !== "Positive", "overheated cannot be Strong/Positive");
  console.log("heat tests passed", h.score, vh.label);
}
