/**
 * Stock statistics used by the stock analyzer, the screener and the nightly job. Pure functions only.
 * Prices: NSE daily closes (eod2 dataset), optionally topped up with recent Yahoo Finance closes.
 */
import { median, percentiles, weighted } from "./metrics";

export type Bar = { t: number; c: number; v: number }; // UTC ms, close, volume

export type Fundamentals = {
  name?: string;
  pe?: number | null; pb?: number | null; roe?: number | null; de?: number | null; divYield?: number | null;
  margin?: number | null; revGrowth?: number | null; epsGrowth?: number | null; mcapCr?: number | null; source?: string;
};

export type StockStats = {
  symbol: string;
  asOf: string;
  price: number;
  r1m: number | null; r3m: number | null; r6m: number | null; r1y: number | null; cagr3: number | null; cagr5: number | null;
  vol1y: number | null; downVol1y: number | null; sharpe1y: number | null; sortino1y: number | null;
  beta1y: number | null; corr1y: number | null; alpha1y: number | null;
  mdd3y: number | null; var95: number | null;
  dma50: number | null; dma200: number | null; rsi14: number | null;
  high52: number | null; low52: number | null; fromHigh52: number | null; mom12_1: number | null;
  valueCr20: number | null; // average daily traded value, ₹ crore (20 days)
  rolling1y: { min: number; median: number; max: number; positive: number } | null;
  years: number;
  splitsAdjusted: number;
};

const DAY = 864e5;
const RF = 0.065; // risk-free hurdle (approx. 1-year T-bill), per year

/* ----------------------------------------------------------------- parsing */

export function parseEodCsv(text: string): Bar[] {
  const lines = text.trim().split(/\r?\n/);
  const head = (lines.shift() || "").split(",").map((h) => h.trim().toLowerCase());
  const iD = head.indexOf("date"), iC = head.indexOf("close"), iV = head.indexOf("volume");
  const out: Bar[] = [];
  for (const line of lines) {
    const p = line.split(",");
    const t = Date.parse(`${(p[iD] || "").slice(0, 10)}T00:00:00Z`);
    const c = Number(p[iC]);
    if (!Number.isFinite(t) || !(c > 0)) continue;
    out.push({ t, c, v: Number(p[iV]) || 0 });
  }
  out.sort((a, b) => a.t - b.t);
  return out.filter((b, i) => i === 0 || b.t !== out[i - 1].t);
}

/** Back-adjusts prices for splits and bonuses the data source has not adjusted (one-day drops close to 1/k). */
export function adjustSplits(bars: Bar[]): { bars: Bar[]; count: number } {
  const out = bars.map((b) => ({ ...b }));
  let factor = 1, count = 0;
  for (let i = out.length - 1; i >= 0; i--) {
    out[i].c = bars[i].c * factor;
    out[i].v = bars[i].v / factor;
    if (i === 0) break;
    const ratio = bars[i].c / bars[i - 1].c;
    if (ratio < 0.62) {
      for (const k of [2, 3, 4, 5, 10, 1.5, 2.5]) {
        if (Math.abs(ratio * k - 1) < 0.06) { factor *= 1 / k; count++; break; }
      }
    }
  }
  return { bars: out, count };
}

/** Appends newer bars (e.g. Yahoo) after the last date of `base`. */
export function mergeRecent(base: Bar[], recent: Bar[]): Bar[] {
  if (!base.length) return recent;
  const last = base[base.length - 1].t;
  return [...base, ...recent.filter((b) => b.t > last + DAY / 2)];
}

/* ----------------------------------------------------------------- helpers */

function at(bars: Bar[], t: number) { let lo = 0, hi = bars.length - 1, best = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (bars[m].t <= t) { best = m; lo = m + 1; } else hi = m - 1; } return best; }
function backRet(bars: Bar[], days: number) { const n = bars.length - 1; const i = at(bars, bars[n].t - days * DAY); return i >= 0 && bars[0].t <= bars[n].t - days * DAY + 7 * DAY ? bars[n].c / bars[i].c - 1 : null; }
function cagrY(bars: Bar[], years: number) { const r = backRet(bars, years * 365.25); return r === null ? null : Math.pow(1 + r, 1 / years) - 1; }
function sma(bars: Bar[], n: number) { if (bars.length < n) return null; let s = 0; for (let i = bars.length - n; i < bars.length; i++) s += bars[i].c; return s / n; }
function dailyRets(bars: Bar[], fromT: number) { const out: { t: number; r: number }[] = []; for (let i = 1; i < bars.length; i++) if (bars[i].t >= fromT) out.push({ t: bars[i].t, r: bars[i].c / bars[i - 1].c - 1 }); return out; }
function sd(xs: number[]) { if (xs.length < 2) return null; const m = xs.reduce((a, b) => a + b, 0) / xs.length; return Math.sqrt(xs.reduce((a, x) => a + (x - m) ** 2, 0) / (xs.length - 1)); }

export function rsi(bars: Bar[], n = 14) {
  if (bars.length < n * 3) return null;
  let gain = 0, loss = 0;
  const start = bars.length - n * 3;
  for (let i = start + 1; i <= start + n; i++) { const d = bars[i].c - bars[i - 1].c; if (d > 0) gain += d; else loss -= d; }
  gain /= n; loss /= n;
  for (let i = start + n + 1; i < bars.length; i++) { const d = bars[i].c - bars[i - 1].c; gain = (gain * (n - 1) + Math.max(d, 0)) / n; loss = (loss * (n - 1) + Math.max(-d, 0)) / n; }
  return loss === 0 ? 100 : 100 - 100 / (1 + gain / loss);
}

/** Weekly closes (last bar of each ISO week). */
export function weekly(bars: Bar[]): [number, number][] {
  const out: [number, number][] = [];
  for (let i = 0; i < bars.length; i++) {
    const d = new Date(bars[i].t), next = bars[i + 1] ? new Date(bars[i + 1].t) : null;
    const wk = (x: Date) => Math.floor((x.getTime() / DAY + 3) / 7);
    if (!next || wk(next) !== wk(d)) out.push([bars[i].t, Math.round(bars[i].c * 100) / 100]);
  }
  return out;
}

/* ----------------------------------------------------------------- statistics */

export function computeStockStats(symbol: string, raw: Bar[], index: Bar[] | null): StockStats | null {
  if (raw.length < 60) return null;
  const { bars, count } = adjustSplits(raw);
  const n = bars.length - 1, last = bars[n];
  const yearAgo = last.t - 365.25 * DAY;
  const r1 = dailyRets(bars, yearAgo).map((x) => x.r);
  const vol = sd(r1); const vol1y = vol === null ? null : vol * Math.sqrt(252);
  const downside = r1.length > 50 ? Math.sqrt(r1.reduce((a, r) => a + Math.min(0, r - RF / 252) ** 2, 0) / r1.length) * Math.sqrt(252) : null;
  const r1y = backRet(bars, 365.25);

  // Beta / correlation / alpha vs the index on aligned daily returns
  let beta1y: number | null = null, corr1y: number | null = null, alpha1y: number | null = null;
  if (index && index.length > 60) {
    const im = new Map(dailyRets(index, yearAgo).map((x) => [x.t, x.r]));
    const pairs = dailyRets(bars, yearAgo).filter((x) => im.has(x.t)).map((x) => [x.r, im.get(x.t) as number]);
    if (pairs.length > 100) {
      const mx = pairs.reduce((a, p) => a + p[0], 0) / pairs.length, my = pairs.reduce((a, p) => a + p[1], 0) / pairs.length;
      let cov = 0, vx = 0, vy = 0;
      for (const [x, y] of pairs) { cov += (x - mx) * (y - my); vx += (x - mx) ** 2; vy += (y - my) ** 2; }
      beta1y = vy ? cov / vy : null; corr1y = vx && vy ? cov / Math.sqrt(vx * vy) : null;
      const idx1y = backRet(index, 365.25);
      if (beta1y !== null && r1y !== null && idx1y !== null) alpha1y = r1y - (RF + beta1y * (idx1y - RF));
    }
  }

  // Max drawdown over 3 years
  let peak = 0, mdd = 0;
  for (const b of bars) { if (b.t < last.t - 3 * 365.25 * DAY) continue; peak = Math.max(peak, b.c); mdd = Math.min(mdd, b.c / peak - 1); }

  // 1-day historical VaR (95%), as a positive loss
  const sorted = [...r1].sort((a, b) => a - b);
  const var95 = sorted.length > 100 ? -sorted[Math.floor(sorted.length * 0.05)] : null;

  // 52-week range
  const year = bars.filter((b) => b.t >= yearAgo);
  const high52 = year.length ? Math.max(...year.map((b) => b.c)) : null;
  const low52 = year.length ? Math.min(...year.map((b) => b.c)) : null;

  // 12-1 momentum: return from 12 months ago to 1 month ago
  const i12 = at(bars, last.t - 365.25 * DAY), i1 = at(bars, last.t - 30 * DAY);
  const mom12_1 = i12 >= 0 && i1 >= 0 && bars[0].t <= last.t - 360 * DAY ? bars[i1].c / bars[i12].c - 1 : null;

  // Rolling 1-year returns over the last 5 years (weekly steps)
  const wk = weekly(bars.filter((b) => b.t >= last.t - 6 * 365.25 * DAY));
  const rolls: number[] = [];
  for (let i = 52; i < wk.length; i++) rolls.push(wk[i][1] / wk[i - 52][1] - 1);
  const rolling1y = rolls.length >= 20 ? { min: Math.min(...rolls), median: median(rolls) as number, max: Math.max(...rolls), positive: rolls.filter((x) => x > 0).length / rolls.length } : null;

  const tail = bars.slice(-20);
  const valueCr20 = tail.length ? tail.reduce((a, b) => a + b.c * b.v, 0) / tail.length / 1e7 : null;
  const round = (x: number | null, d = 4) => (x === null || !Number.isFinite(x) ? null : Math.round(x * 10 ** d) / 10 ** d);

  return {
    symbol, asOf: new Date(last.t).toISOString().slice(0, 10), price: round(last.c, 2) as number,
    r1m: round(backRet(bars, 30)), r3m: round(backRet(bars, 91)), r6m: round(backRet(bars, 182)), r1y: round(r1y), cagr3: round(cagrY(bars, 3)), cagr5: round(cagrY(bars, 5)),
    vol1y: round(vol1y), downVol1y: round(downside),
    sharpe1y: round(r1y !== null && vol1y ? (r1y - RF) / vol1y : null, 2), sortino1y: round(r1y !== null && downside ? (r1y - RF) / downside : null, 2),
    beta1y: round(beta1y, 2), corr1y: round(corr1y, 2), alpha1y: round(alpha1y),
    mdd3y: round(mdd), var95: round(var95),
    dma50: round(sma(bars, 50), 2), dma200: round(sma(bars, 200), 2), rsi14: round(rsi(bars), 1),
    high52: round(high52, 2), low52: round(low52, 2), fromHigh52: round(high52 ? last.c / high52 - 1 : null), mom12_1: round(mom12_1),
    valueCr20: round(valueCr20, 1), rolling1y: rolling1y && { min: round(rolling1y.min) as number, median: round(rolling1y.median) as number, max: round(rolling1y.max) as number, positive: round(rolling1y.positive, 2) as number },
    years: Math.round(((last.t - bars[0].t) / (365.25 * DAY)) * 10) / 10, splitsAdjusted: count,
  };
}

/* ----------------------------------------------------------------- investor checklist */

export type Check = { group: "Trend" | "Risk" | "Quality" | "Valuation" | "Liquidity"; label: string; value: string; pass: boolean | null; note: string };

const p = (x: number | null | undefined, d = 1) => (x === null || x === undefined ? "—" : `${(x * 100).toFixed(d)}%`);
const f = (x: number | null | undefined, d = 2) => (x === null || x === undefined ? "—" : x.toFixed(d));

/** The standard pre-investment checks, each with a plain-language reason. `indexPe` = Nifty 50 P/E for context. */
export function investorChecks(s: StockStats, fu: Fundamentals | null, ctx: { indexPe?: number | null; industryPe?: number | null; financial?: boolean } = {}): Check[] {
  const pe = fu?.pe ?? null, benchPe = ctx.industryPe ?? ctx.indexPe ?? null;
  return [
    { group: "Trend", label: "Price above 200-day average", value: s.dma200 ? `${f(s.price)} vs ${f(s.dma200)}` : "—", pass: s.dma200 ? s.price > s.dma200 : null, note: "Long-term uptrend; most trend-following studies use the 200-day line." },
    { group: "Trend", label: "50-day average above 200-day", value: s.dma50 && s.dma200 ? `${f(s.dma50)} vs ${f(s.dma200)}` : "—", pass: s.dma50 && s.dma200 ? s.dma50 > s.dma200 : null, note: "A “golden cross” setup; below it is a “death cross”." },
    { group: "Trend", label: "12-month momentum (skip last month) positive", value: p(s.mom12_1), pass: s.mom12_1 === null ? null : s.mom12_1 > 0, note: "Stocks that rose over the past year tend to keep outperforming for a few months." },
    { group: "Trend", label: "RSI(14) between 30 and 70", value: f(s.rsi14, 0), pass: s.rsi14 === null ? null : s.rsi14 >= 30 && s.rsi14 <= 70, note: "Above 70 is overbought (wait for a pullback); below 30 is oversold." },
    { group: "Trend", label: "Within 25% of 52-week high", value: p(s.fromHigh52), pass: s.fromHigh52 === null ? null : s.fromHigh52 > -0.25, note: "Deep falls from the high often signal a broken story." },
    { group: "Risk", label: "Annual volatility below 35%", value: p(s.vol1y), pass: s.vol1y === null ? null : s.vol1y < 0.35, note: "Higher volatility means larger swings and smaller safe position sizes." },
    { group: "Risk", label: "Beta below 1.2", value: f(s.beta1y), pass: s.beta1y === null ? null : s.beta1y < 1.2, note: "Beta > 1 moves more than the Nifty in both directions." },
    { group: "Risk", label: "3-year max drawdown better than −40%", value: p(s.mdd3y, 0), pass: s.mdd3y === null ? null : s.mdd3y > -0.4, note: "The worst fall you would have sat through recently." },
    { group: "Risk", label: "Sharpe ratio (1y) above 0.5", value: f(s.sharpe1y), pass: s.sharpe1y === null ? null : s.sharpe1y > 0.5, note: "Return above the risk-free rate per unit of risk." },
    { group: "Quality", label: "Return on equity above 15%", value: fu?.roe != null ? p(fu.roe) : "—", pass: fu?.roe == null ? null : fu.roe > 0.15, note: "How efficiently the company turns shareholders' money into profit." },
    { group: "Quality", label: ctx.financial ? "Debt / equity (not used for lenders)" : "Debt / equity below 1", value: fu?.de != null ? f(fu.de) : "—", pass: ctx.financial || fu?.de == null ? null : fu.de < 1, note: "High leverage magnifies bad years. Banks and NBFCs are judged on asset quality instead." },
    { group: "Quality", label: "Profit margin positive and growing earnings", value: fu?.margin != null ? `${p(fu.margin)} margin · EPS ${p(fu.epsGrowth)}` : "—", pass: fu?.margin == null ? null : fu.margin > 0 && (fu.epsGrowth == null || fu.epsGrowth > 0), note: "Profitable and still growing." },
    { group: "Valuation", label: benchPe ? `P/E below 1.5× ${ctx.industryPe ? "industry" : "Nifty"} P/E` : "P/E available", value: pe != null ? `${f(pe, 1)}${benchPe ? ` vs ${f(benchPe, 1)}` : ""}` : "—", pass: pe == null || !benchPe ? null : pe > 0 && pe < benchPe * 1.5, note: "Paying far above the market or peers needs exceptional growth to justify it." },
    { group: "Valuation", label: "Price / book below 6", value: fu?.pb != null ? f(fu.pb, 1) : "—", pass: fu?.pb == null ? null : fu.pb > 0 && fu.pb < 6, note: "A rough check against paying too much for the balance sheet." },
    { group: "Liquidity", label: "Average traded value above ₹5 crore/day", value: s.valueCr20 != null ? `₹${f(s.valueCr20, 1)} Cr` : "—", pass: s.valueCr20 == null ? null : s.valueCr20 > 5, note: "Thinly traded stocks can be hard to sell at a fair price." },
  ];
}

export type Verdict = { label: "Strong" | "Positive" | "Mixed" | "Weak"; score: number; summary: string; maxWeight: number; groups: Record<string, { pass: number; total: number }> };

export function verdict(checks: Check[], s: StockStats): Verdict {
  const groups: Verdict["groups"] = {};
  for (const c of checks) { if (c.pass === null) continue; groups[c.group] ||= { pass: 0, total: 0 }; groups[c.group].total++; if (c.pass) groups[c.group].pass++; }
  const W: Record<string, number> = { Trend: 30, Risk: 25, Quality: 25, Valuation: 15, Liquidity: 5 };
  const { score } = weighted(Object.entries(groups).map(([g, v]) => [v.total ? (v.pass / v.total) * 100 : null, W[g]]));
  const sc = Math.round(score ?? 50);
  const label: Verdict["label"] = sc >= 75 ? "Strong" : sc >= 60 ? "Positive" : sc >= 40 ? "Mixed" : "Weak";
  const trend = groups.Trend ? groups.Trend.pass / groups.Trend.total : 0.5;
  const quality = groups.Quality ? groups.Quality.pass / groups.Quality.total : null;
  const summary = label === "Strong" ? "Most checks pass: an established uptrend with acceptable risk" + (quality !== null && quality >= 0.67 ? " and good business quality." : ".") + " If it fits your plan, staggered buying (SIP-style) limits timing risk."
    : label === "Positive" ? `More checks pass than fail. ${trend < 0.5 ? "The trend is weak — waiting for the price to reclaim its 200-day average is a common discipline." : "Watch the failing checks before adding a large position."}`
      : label === "Mixed" ? "Signals conflict. Study the failing checks; many investors would keep any position small or wait."
        : "Most checks fail. Investors following these rules would avoid or exit until trend and fundamentals improve.";
  // Volatility-based position cap: aim for a stock's 1-year 2-sigma fall to cost ≤ ~5% of the equity portfolio
  const maxWeight = s.vol1y ? Math.max(0.02, Math.min(0.15, 0.05 / (2 * s.vol1y) * 1.0)) : 0.05;
  return { label, score: sc, summary, maxWeight: Math.round(maxWeight * 100) / 100, groups };
}

/* ----------------------------------------------------------------- screener scoring */

export type StockLite = {
  s: string; n: string; i: string; // symbol, name, industry
  px: number; d: string; // price, as-of date
  r1: number | null; r3m: number | null; c3: number | null; c5: number | null;
  v: number | null; b: number | null; dd: number | null; sh: number | null; m: number | null; h: number | null; rsi: number | null; tr: number | null; // trend: price / 200-dma − 1
  liq: number | null; pe: number | null; pb: number | null; roe: number | null; de: number | null; dy: number | null; eg: number | null; mc: number | null;
  sc: number | null; sig: string; cov: number;
};

const FIN = /financial|bank|nbfc|insurance/i;

/** Peer-relative stock score (0–100) with five pillars; valuation and quality compare within the industry. */
export function scoreStocks(items: { stats: StockStats; fu: Fundamentals | null; name: string; industry: string }[]): StockLite[] {
  const col = (fn: (x: (typeof items)[number]) => number | null | undefined) => items.map((x) => { const v = fn(x); return v === undefined || v === null || !Number.isFinite(v) ? null : v; });
  const byIndustry = (vals: (number | null)[], lower: boolean) => {
    const out: (number | null)[] = items.map(() => null);
    const groups = new Map<string, number[]>();
    items.forEach((x, i) => { const g = groups.get(x.industry) || []; g.push(i); groups.set(x.industry, g); });
    for (const idx of groups.values()) {
      const pc = idx.length >= 4 ? percentiles(idx.map((i) => vals[i]), lower) : idx.map(() => null);
      idx.forEach((i, k) => (out[i] = pc[k]));
    }
    // Fall back to the whole universe for small industries
    const all = percentiles(vals, lower);
    return out.map((v, i) => (v === null ? all[i] : v));
  };
  const trend = col((x) => (x.stats.dma200 ? x.stats.price / x.stats.dma200 - 1 : null));
  const pc = {
    trend: percentiles(trend), mom: percentiles(col((x) => x.stats.mom12_1)), high: percentiles(col((x) => x.stats.fromHigh52)),
    vol: percentiles(col((x) => x.stats.vol1y), true), dd: percentiles(col((x) => x.stats.mdd3y)), beta: percentiles(col((x) => x.stats.beta1y), true),
    roe: byIndustry(col((x) => x.fu?.roe), false), de: byIndustry(col((x) => (FIN.test(x.industry) ? null : x.fu?.de)), true), margin: byIndustry(col((x) => x.fu?.margin), false),
    pe: byIndustry(col((x) => (x.fu?.pe && x.fu.pe > 0 ? x.fu.pe : null)), true), pb: byIndustry(col((x) => (x.fu?.pb && x.fu.pb > 0 ? x.fu.pb : null)), true),
    rg: percentiles(col((x) => x.fu?.revGrowth)), eg: percentiles(col((x) => x.fu?.epsGrowth)),
  };
  return items.map((x, i) => {
    const pillar = (parts: [number | null, number][]) => weighted(parts).score;
    const pillars: [number | null, number][] = [
      [pillar([[pc.trend[i], 40], [pc.mom[i], 35], [pc.high[i], 25]]), 25],
      [pillar([[pc.vol[i], 40], [pc.dd[i], 35], [pc.beta[i], 25]]), 20],
      [pillar([[pc.roe[i], 45], [pc.de[i], 25], [pc.margin[i], 30]]), 25],
      [pillar([[pc.pe[i], 65], [pc.pb[i], 35]]), 20],
      [pillar([[pc.rg[i], 50], [pc.eg[i], 50]]), 10],
    ];
    const { score, coverage } = weighted(pillars);
    const liq = x.stats.valueCr20;
    let sc = score === null ? null : 50 + (score - 50) * Math.min(1, coverage / 0.75);
    if (sc !== null && liq !== null && liq < 1) sc = Math.min(sc, 45); // illiquid names cannot rank as strong
    const sig = sc === null ? "—" : sc >= 70 ? "Strong" : sc >= 57 ? "Positive" : sc >= 43 ? "Neutral" : "Weak";
    const s = x.stats, fu = x.fu;
    return { s: s.symbol, n: fu?.name || x.name, i: x.industry, px: s.price, d: s.asOf, r1: s.r1y, r3m: s.r3m, c3: s.cagr3, c5: s.cagr5, v: s.vol1y, b: s.beta1y, dd: s.mdd3y, sh: s.sharpe1y, m: s.mom12_1, h: s.fromHigh52, rsi: s.rsi14, tr: trend[i], liq, pe: fu?.pe ?? null, pb: fu?.pb ?? null, roe: fu?.roe ?? null, de: fu?.de ?? null, dy: fu?.divYield ?? null, eg: fu?.epsGrowth ?? null, mc: fu?.mcapCr ?? null, sc: sc === null ? null : Math.round(sc), sig, cov: Math.round(coverage * 100) / 100 };
  });
}

export function industryMedians(rows: StockLite[]) {
  const out: Record<string, { pe: number | null; count: number }> = {};
  const groups = new Map<string, StockLite[]>();
  rows.forEach((r) => groups.set(r.i, [...(groups.get(r.i) || []), r]));
  for (const [k, v] of groups) out[k] = { pe: median(v.map((r) => r.pe).filter((x): x is number => x !== null && x > 0)), count: v.length };
  return out;
}

export const STOCK_METHODOLOGY = "Each stock is scored 0–100 against the Nifty 500: trend & momentum 25 (price vs 200-day average, 12-1 month momentum, distance from 52-week high), risk 20 (volatility, 3-year drawdown, beta), quality 25 (ROE, debt/equity, margin — vs industry peers), valuation 20 (P/E and P/B vs industry peers) and growth 10. Thin data is pulled toward 50 and stocks trading under ₹1 crore a day are capped at 45.";

export function isFinancial(industry: string) { return FIN.test(industry); }

/* ----------------------------------------------------------------- portfolio maths */

/** Correlation matrix and portfolio statistics from weekly closes. */
export function portfolioStats(series: { symbol: string; weekly: [number, number][] }[], weights?: number[]) {
  const sets = series.map((s) => new Map(s.weekly.map(([t, c]) => [Math.floor(t / (7 * DAY)), c])));
  const common = [...sets[0].keys()].filter((k) => sets.every((m) => m.has(k))).sort((a, b) => a - b).slice(-157); // ~3 years
  const rets = sets.map((m) => common.slice(1).map((k, i) => (m.get(k) as number) / (m.get(common[i]) as number) - 1));
  const n = series.length, T = rets[0]?.length || 0;
  const mean = rets.map((r) => r.reduce((a, b) => a + b, 0) / Math.max(1, r.length));
  const cov = rets.map((ri, i) => rets.map((rj, j) => (T > 1 ? ri.reduce((a, x, k) => a + (x - mean[i]) * (rj[k] - mean[j]), 0) / (T - 1) : 0)));
  const vol = cov.map((row, i) => Math.sqrt(row[i] * 52));
  const corr = cov.map((row, i) => row.map((c, j) => (cov[i][i] && cov[j][j] ? c / Math.sqrt(cov[i][i] * cov[j][j]) : 0)));
  const inv = vol.map((v) => (v ? 1 / v : 0)); const invSum = inv.reduce((a, b) => a + b, 0) || 1;
  const w = weights && weights.length === n ? weights : vol.map(() => 1 / n);
  const pv = (ws: number[]) => Math.sqrt(ws.reduce((a, wi, i) => a + ws.reduce((b, wj, j) => b + wi * wj * cov[i][j], 0), 0) * 52);
  const annRet = mean.map((m) => Math.pow(1 + m, 52) - 1);
  const invW = inv.map((x) => x / invSum);
  const pr = (ws: number[]) => ws.reduce((a, wi, i) => a + wi * annRet[i], 0);
  const wVol = w.reduce((a, wi, i) => a + wi * vol[i], 0);
  return { weeks: T, vol, corr, annRet, equal: { weights: w, vol: pv(w), ret: pr(w), diversification: wVol ? wVol / pv(w) : 1 }, inverseVol: { weights: invW, vol: pv(invW), ret: pr(invW) } };
}
