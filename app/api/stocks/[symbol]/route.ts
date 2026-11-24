import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { fetchBarsChecked, fetchIndex, UNIVERSE_BY_SYMBOL, YahooSession } from "@/lib/invest/sources";
import { adjustSplits, computeStockStats, heat, investorChecks, isFinancial, verdict, weekly } from "@/lib/invest/stocks";
import { META_COLLECTION, STOCK_SUMMARY_DOC, type StockSummaryDoc } from "@/lib/invest/types";
import { json } from "@/lib/invest/server-auth";

export const runtime = "nodejs";
export const maxDuration = 30;

const CACHE = "public, s-maxage=3600, stale-while-revalidate=43200";

/** Public stock analysis for any NSE symbol. Cached at the edge for an hour. */
export async function GET(_req: Request, { params }: { params: Promise<{ symbol: string }> }) {
  const symbol = decodeURIComponent((await params).symbol || "").toUpperCase().trim();
  if (!/^[A-Z0-9&\-]{1,20}$/.test(symbol)) return json({ error: "Enter an NSE symbol such as RELIANCE or TCS." }, { status: 400 });

  const [barsRes, indexRes, summaryRes] = await Promise.allSettled([
    fetchBarsChecked(symbol),
    fetchIndex(),
    getDoc(doc(db, META_COLLECTION, STOCK_SUMMARY_DOC)),
  ]);
  if (barsRes.status !== "fulfilled" || barsRes.value.bars.length < 60) return json({ error: `No NSE price history found for “${symbol}”. Check the symbol (e.g. HDFCBANK, M&M).` }, { status: 404, cache: "public, s-maxage=600" });
  const index = indexRes.status === "fulfilled" ? indexRes.value : null;
  const summary = summaryRes.status === "fulfilled" && summaryRes.value.exists() ? (summaryRes.value.data() as StockSummaryDoc) : null;

  const priced = barsRes.value;
  const base = computeStockStats(symbol, priced.bars, index?.bars || null);
  const stats = base ? { ...base, check: priced.check } : null;
  if (!stats) return json({ error: "Not enough price history to analyse this stock." }, { status: 404 });

  const uni = UNIVERSE_BY_SYMBOL.get(symbol);
  const row = summary?.rows.find((r) => r.s === symbol);
  const industry = uni?.[2] || row?.i || "";
  const yahoo = new YahooSession();
  const fu = (await yahoo.init()) ? await yahoo.fundamentals(symbol) : null;
  const fundamentals = fu || (row ? { name: row.n, pe: row.pe, pb: row.pb, roe: row.roe, de: row.de, divYield: row.dy, epsGrowth: row.eg, mcapCr: row.mc, source: "Last nightly refresh" } : null);
  const industryPe = industry ? summary?.industries?.[industry]?.pe ?? null : null;
  const checks = investorChecks(stats, fundamentals, { indexPe: index?.pe ?? summary?.indexPe ?? null, industryPe, financial: isFinancial(industry) });
  const h = heat(stats, fundamentals, industryPe);
  const v = verdict(checks, stats, h);

  const peerRows = industry && summary ? summary.rows.filter((r) => r.i === industry) : [];
  const peers = [...peerRows].sort((a, b) => (b.mc ?? 0) - (a.mc ?? 0)).slice(0, 10).concat(row && !peerRows.sort((a, b) => (b.mc ?? 0) - (a.mc ?? 0)).slice(0, 10).some((r) => r.s === symbol) ? [row] : []).map((r) => ({ s: r.s, n: r.n, px: r.px, pe: r.pe, pb: r.pb, roe: r.roe, de: r.de, dy: r.dy, mc: r.mc, r1: r.r1, c3: r.c3, sc: r.sc, sig: r.sig }));
  const adj = adjustSplits(priced.bars).bars;
  const daily = adj.slice(-520);
  const sma = (n: number, i: number) => { const a = adj.length - daily.length + i; if (a < n - 1) return null; let s = 0; for (let k = a - n + 1; k <= a; k++) s += adj[k].c; return Math.round((s / n) * 100) / 100; };
  const chart = daily.map((b, i) => [b.t, Math.round(b.c * 100) / 100, sma(50, i), sma(200, i)]);
  const idxWeekly = index ? weekly(index.bars.filter((b) => b.t >= adj[0].t)) : [];

  return json({
    symbol, name: fundamentals?.name || uni?.[1] || row?.n || symbol, industry, inNifty500: Boolean(uni),
    stats, fundamentals, checks, verdict: v, peers, indexPe: index?.pe ?? null, industryPe,
    screen: row ? { score: row.sc, signal: row.sig, rankOf: summary?.count } : null,
    chart, weekly: weekly(adj).slice(-530), indexWeekly: idxWeekly.slice(-530),
    dataCheck: { prices: priced.source, priceCheck: priced.check, fundamentals: fu ? "Yahoo Finance (live)" : row ? "Last nightly refresh" : "unavailable" },
    sources: [`Prices: ${priced.source} (${priced.check})`, fu ? "Fundamentals: Yahoo Finance" : row ? "Fundamentals: NumSum nightly refresh" : "Fundamentals unavailable right now"],
  }, { cache: CACHE });
}
