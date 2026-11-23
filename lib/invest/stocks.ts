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
  /** Price vs 200-day average, e.g. 0.3 = 30% above. */
  ext200?: number | null;
  /** Price vs 52-week low, e.g. 1.0 = doubled from the low. */
  fromLow52?: number | null;
  /** Where today's 1-year return sits in this stock's own 5-year history of 1-year returns (0–1). */
  r1yPctile?: number | null;
  /** How the price history was verified: "2 sources agree", "single source" or "sources differ". */
  check?: string;
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
  const r1yPctile = rolls.length >= 52 && r1y !== null ? rolls.filter((x) => x < r1y).length / rolls.length : null;
  const d200 = sma(bars, 200);

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
    ext200: round(d200 ? last.c / d200 - 1 : null), fromLow52: round(low52 ? last.c / low52 - 1 : null), r1yPctile: round(r1yPctile, 2),
  };
}

/* ----------------------------------------------------------------- "risen too much" (heat) */

export type Heat = { score: number; label: "Calm" | "Warm" | "Hot" | "Overheated"; reasons: string[]; sip: string };

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/**
 * How stretched the price is after a recent run-up (0 = calm, 100 = overheated). Built for long-term SIP
 * investors: a great business bought after a near-vertical rise often gives poor returns for years.
 */
export function heat(s: StockStats, fu?: Fundamentals | null, industryPe?: number | null): Heat {
  const parts: [number, number, string | null][] = [];
  const pc = (x: number) => `${Math.round(x * 100)}%`;
  if (s.ext200 != null) parts.push([clamp01((s.ext200 - 0.1) / 0.4), 30, s.ext200 > 0.25 ? `${pc(s.ext200)} above its 200-day average` : null]);
  if (s.r6m != null) parts.push([clamp01((s.r6m - 0.15) / 0.45), 20, s.r6m > 0.35 ? `up ${pc(s.r6m)} in 6 months` : null]);
  if (s.r1yPctile != null && s.r1y != null) parts.push([s.r1y > 0.25 ? clamp01((s.r1yPctile - 0.6) / 0.4) : 0, 20, s.r1y > 0.25 && s.r1yPctile > 0.9 ? `1-year gain (${pc(s.r1y)}) is in the top 10% of its own history` : null]);
  if (s.rsi14 != null) parts.push([clamp01((s.rsi14 - 60) / 20), 15, s.rsi14 > 70 ? `RSI ${Math.round(s.rsi14)} (overbought)` : null]);
  if (s.fromLow52 != null) parts.push([clamp01((s.fromLow52 - 0.5) / 1.0), 15, s.fromLow52 > 1 ? `${pc(s.fromLow52)} above its 52-week low` : null]);
  const w = parts.reduce((a, x) => a + x[1], 0) || 1;
  let score = (parts.reduce((a, x) => a + x[0] * x[1], 0) / w) * 100;
  const reasons = parts.map((x) => x[2]).filter((x): x is string => Boolean(x));
  if (fu?.pe && industryPe && fu.pe > 2 * industryPe) { score += 10; reasons.push(`P/E ${fu.pe.toFixed(0)} is over twice its industry (${industryPe.toFixed(0)})`); }
  // A near-vertical run is "Hot" at least, whatever the other measures say
  if ((s.r6m != null && s.r6m > 0.6) || (s.r1y != null && s.r1y > 1)) score = Math.max(score, 55);
  if ((s.r6m != null && s.r6m > 1) || (s.ext200 != null && s.ext200 > 0.6)) score = Math.max(score, 75);
  score = Math.round(Math.min(100, score));
  const label: Heat["label"] = score >= 75 ? "Overheated" : score >= 55 ? "Hot" : score >= 30 ? "Warm" : "Calm";
  const sip = label === "Overheated" ? "Avoid lump sums. If you like the business, keep the SIP small and wait for the price to cool towards its 200-day average before adding more."
    : label === "Hot" ? "Prefer a slow start: spread purchases over 6–12 months instead of investing a large amount now."
      : label === "Warm" ? "A normal SIP is fine; avoid adding large one-time amounts after sharp jumps."
        : "No sign of a recent price spike — a regular SIP fits.";
  return { score, label, reasons, sip };
}

/* ----------------------------------------------------------------- investor checklist */

export type CheckGroup = "Business quality" | "Valuation" | "Risk" | "Long-term trend" | "Entry timing" | "Liquidity";
export type Check = { group: CheckGroup; label: string; value: string; pass: boolean | null; note: string; term?: string };

const p = (x: number | null | undefined, d = 1) => (x === null || x === undefined ? "—" : `${(x * 100).toFixed(d)}%`);
const f = (x: number | null | undefined, d = 2) => (x === null || x === undefined ? "—" : x.toFixed(d));

/**
 * The standard checks long-term (1 year +) SIP investors run before buying a stock, each with a plain reason.
 * `term` links to the glossary entry that explains the measure.
 */
export function investorChecks(s: StockStats, fu: Fundamentals | null, ctx: { indexPe?: number | null; industryPe?: number | null; financial?: boolean } = {}): Check[] {
  const pe = fu?.pe ?? null, benchPe = ctx.industryPe ?? ctx.indexPe ?? null;
  const peg = pe && fu?.epsGrowth && fu.epsGrowth > 0 ? pe / (fu.epsGrowth * 100) : null;
  return [
    { group: "Business quality", term: "roe", label: "Return on equity above 15%", value: fu?.roe != null ? p(fu.roe) : "—", pass: fu?.roe == null ? null : fu.roe > 0.15, note: "How much profit the company makes on shareholders' money. Consistently above 15% usually means a strong business." },
    { group: "Business quality", term: "de", label: ctx.financial ? "Debt / equity (not used for banks & lenders)" : "Debt / equity below 1", value: fu?.de != null ? f(fu.de) : "—", pass: ctx.financial || fu?.de == null ? null : fu.de < 1, note: "Borrowing magnifies bad years. Lenders borrow by design, so they are judged on asset quality instead." },
    { group: "Business quality", term: "margin", label: "Profitable, with earnings growing", value: fu?.margin != null ? `${p(fu.margin)} margin · EPS ${p(fu.epsGrowth)}` : "—", pass: fu?.margin == null ? null : fu.margin > 0 && (fu.epsGrowth == null || fu.epsGrowth > 0), note: "A business that earns money and is still growing its earnings." },
    { group: "Business quality", term: "revgrowth", label: "Revenue growing", value: p(fu?.revGrowth), pass: fu?.revGrowth == null ? null : fu.revGrowth > 0, note: "Sales growth is the engine of long-term earnings growth." },
    { group: "Valuation", term: "pe", label: benchPe ? `P/E below 1.5× ${ctx.industryPe ? "industry" : "Nifty"} P/E` : "P/E available", value: pe != null ? `${f(pe, 1)}${benchPe ? ` vs ${f(benchPe, 1)}` : ""}` : "—", pass: pe == null || !benchPe ? null : pe > 0 && pe < benchPe * 1.5, note: "Price paid for each ₹1 of yearly profit. Paying far above peers needs exceptional growth to work out." },
    { group: "Valuation", term: "peg", label: "PEG ratio below 2", value: peg != null ? f(peg, 1) : "—", pass: peg == null ? null : peg < 2, note: "P/E divided by earnings growth. Below 1–2 means the price is reasonable for the growth on offer." },
    { group: "Valuation", term: "pb", label: "Price / book below 6", value: fu?.pb != null ? f(fu.pb, 1) : "—", pass: fu?.pb == null ? null : fu.pb > 0 && fu.pb < 6, note: "A rough check against paying too much for the company's net assets." },
    { group: "Risk", term: "volatility", label: "Yearly volatility below 35%", value: p(s.vol1y), pass: s.vol1y === null ? null : s.vol1y < 0.35, note: "How much the price swings in a typical year. Higher swings test patience and call for a smaller share of your money." },
    { group: "Risk", term: "beta", label: "Beta below 1.2", value: f(s.beta1y), pass: s.beta1y === null ? null : s.beta1y < 1.2, note: "Beta 1.2 means the stock tends to move 1.2× as much as the Nifty, up and down." },
    { group: "Risk", term: "drawdown", label: "Worst fall in 3 years better than −40%", value: p(s.mdd3y, 0), pass: s.mdd3y === null ? null : s.mdd3y > -0.4, note: "The deepest peak-to-bottom fall you would have sat through recently." },
    { group: "Risk", term: "rolling", label: "Positive in at least 60% of 1-year periods", value: s.rolling1y ? p(s.rolling1y.positive, 0) : "—", pass: s.rolling1y ? s.rolling1y.positive >= 0.6 : null, note: "Over the last 5 years, how often a one-year holding would have made money." },
    { group: "Long-term trend", term: "cagr", label: "3-year return positive", value: p(s.cagr3), pass: s.cagr3 === null ? null : s.cagr3 > 0, note: "The share price has grown over a full market cycle, not just recently." },
    { group: "Long-term trend", term: "dma", label: "Price above its 200-day average", value: s.dma200 ? `${f(s.price)} vs ${f(s.dma200)}` : "—", pass: s.dma200 ? s.price > s.dma200 : null, note: "The long-term trend is up. Many long-term investors avoid starting while a stock is in a downtrend." },
    { group: "Entry timing", term: "heat", label: "Not stretched above its 200-day average (< 25%)", value: p(s.ext200, 0), pass: s.ext200 == null ? null : s.ext200 < 0.25, note: "Prices far above their long-term average tend to cool off. Buying then often means waiting years to make money." },
    { group: "Entry timing", term: "heat", label: "6-month gain below 40%", value: p(s.r6m, 0), pass: s.r6m == null ? null : s.r6m < 0.4, note: "A very sharp recent rise is a reason for caution, not excitement." },
    { group: "Entry timing", term: "rsi", label: "RSI below 70 (not overbought)", value: f(s.rsi14, 0), pass: s.rsi14 === null ? null : s.rsi14 < 70, note: "RSI above 70 means buyers have pushed the price up very fast; a pause or pullback is common." },
    { group: "Liquidity", term: "liquidity", label: "Traded value above ₹5 crore a day", value: s.valueCr20 != null ? `₹${f(s.valueCr20, 1)} Cr` : "—", pass: s.valueCr20 == null ? null : s.valueCr20 > 5, note: "Thinly traded stocks can be hard to buy or sell at a fair price." },
  ];
}

export type Verdict = { label: "Strong" | "Positive" | "Mixed" | "Weak"; score: number; summary: string; maxWeight: number; groups: Record<string, { pass: number; total: number }>; heat: Heat };

const GROUP_WEIGHTS: Record<CheckGroup, number> = { "Business quality": 30, Valuation: 20, Risk: 20, "Long-term trend": 15, "Entry timing": 10, Liquidity: 5 };

export function verdict(checks: Check[], s: StockStats, h: Heat = heat(s)): Verdict {
  const groups: Verdict["groups"] = {};
  for (const c of checks) { if (c.pass === null) continue; groups[c.group] ||= { pass: 0, total: 0 }; groups[c.group].total++; if (c.pass) groups[c.group].pass++; }
  const { score } = weighted(Object.entries(groups).map(([g, v]) => [v.total ? (v.pass / v.total) * 100 : null, GROUP_WEIGHTS[g as CheckGroup]]));
  let sc = Math.round(score ?? 50);
  if (h.score > 50) sc = Math.round(sc - (h.score - 50) * 0.3); // risen-too-much penalty
  let label: Verdict["label"] = sc >= 75 ? "Strong" : sc >= 60 ? "Positive" : sc >= 40 ? "Mixed" : "Weak";
  if (h.label === "Overheated" && (label === "Strong" || label === "Positive")) label = "Mixed";
  const quality = groups["Business quality"] ? groups["Business quality"].pass / groups["Business quality"].total : null;
  const base = label === "Strong" ? `Most long-term checks pass${quality !== null && quality >= 0.75 ? ", including business quality" : ""}. Suitable for a steady monthly SIP held for at least a year.`
    : label === "Positive" ? "More checks pass than fail. A modest SIP is reasonable; review the failing checks first."
      : label === "Mixed" ? (h.label === "Overheated" ? "The business may be fine, but the price has run up too far, too fast." : "Signals conflict. Keep any SIP small or wait until the failing checks improve.")
        : "Most long-term checks fail. Investors following these rules would wait.";
  const summary = `${base} ${h.label === "Calm" ? "" : h.sip}`.trim();
  // Volatility-based position cap: a two-standard-deviation bad year should cost ≤ ~5% of the equity portfolio
  const maxWeight = s.vol1y ? Math.max(0.02, Math.min(0.15, 0.05 / (2 * s.vol1y))) : 0.05;
  return { label, score: Math.max(0, sc), summary, maxWeight: Math.round(maxWeight * 100) / 100, groups, heat: h };
}

/* ----------------------------------------------------------------- screener scoring */

export type StockLite = {
  s: string; n: string; i: string; // symbol, name, industry
  px: number; d: string; // price, as-of date
  r1: number | null; r3m: number | null; r6?: number | null; c3: number | null; c5: number | null;
  v: number | null; b: number | null; dd: number | null; sh: number | null; m: number | null; h: number | null; rsi: number | null; tr: number | null; // tr: price vs 200-day average
  liq: number | null; pe: number | null; pb: number | null; roe: number | null; de: number | null; dy: number | null; eg: number | null; mc: number | null;
  rg?: number | null; mg?: number | null; pos?: number | null; // revenue growth, margin, share of positive 1-year periods
  sc: number | null; sig: string; cov: number;
  ht?: number; hl?: Heat["label"]; // heat score and label
  pl?: { q: number | null; v: number | null; r: number | null; t: number | null; g: number | null }; // pillar scores 0–100
  ck?: string; // price cross-check
};

const FIN = /financial|bank|nbfc|insurance/i;

/** Pillar weights for long-term (1 year +) SIP investing. */
export const STOCK_PILLARS = { q: ["Business quality", 30], v: ["Valuation", 25], r: ["Risk", 20], t: ["Long-term trend", 15], g: ["Growth", 10] } as const;

/**
 * Peer-relative stock score (0–100) for long-term SIP investors. Quality and valuation are compared within the
 * industry; a stock that has risen too far, too fast ("heat") loses points and cannot be rated above Neutral.
 */
export function scoreStocks(items: { stats: StockStats; fu: Fundamentals | null; name: string; industry: string }[], industryPe: Record<string, number | null> = {}): StockLite[] {
  const col = (fn: (x: (typeof items)[number]) => number | null | undefined) => items.map((x) => { const v = fn(x); return v === undefined || v === null || !Number.isFinite(v) ? null : v; });
  const byIndustry = (vals: (number | null)[], lower: boolean) => {
    const out: (number | null)[] = items.map(() => null);
    const groups = new Map<string, number[]>();
    items.forEach((x, i) => { const g = groups.get(x.industry) || []; g.push(i); groups.set(x.industry, g); });
    for (const idx of groups.values()) {
      const pc = idx.length >= 4 ? percentiles(idx.map((i) => vals[i]), lower) : idx.map(() => null);
      idx.forEach((i, k) => (out[i] = pc[k]));
    }
    const all = percentiles(vals, lower);
    return out.map((v, i) => (v === null ? all[i] : v));
  };
  const ext = col((x) => x.stats.ext200 ?? (x.stats.dma200 ? x.stats.price / x.stats.dma200 - 1 : null));
  // Long-term trend rewards being above the 200-day line up to +20%; beyond that there is no extra credit.
  const trendCapped = ext.map((e) => (e === null ? null : Math.min(e, 0.2)));
  const pc = {
    trend: percentiles(trendCapped), c3: percentiles(col((x) => x.stats.cagr3)), pos: percentiles(col((x) => x.stats.rolling1y?.positive)),
    vol: percentiles(col((x) => x.stats.vol1y), true), dd: percentiles(col((x) => x.stats.mdd3y)), beta: percentiles(col((x) => x.stats.beta1y), true),
    roe: byIndustry(col((x) => x.fu?.roe), false), de: byIndustry(col((x) => (FIN.test(x.industry) ? null : x.fu?.de)), true), margin: byIndustry(col((x) => x.fu?.margin), false),
    pe: byIndustry(col((x) => (x.fu?.pe && x.fu.pe > 0 ? x.fu.pe : null)), true), pb: byIndustry(col((x) => (x.fu?.pb && x.fu.pb > 0 ? x.fu.pb : null)), true),
    rg: percentiles(col((x) => x.fu?.revGrowth)), eg: percentiles(col((x) => x.fu?.epsGrowth)),
  };
  return items.map((x, i) => {
    const pillar = (parts: [number | null, number][]) => { const w = weighted(parts).score; return w === null ? null : Math.round(w); };
    const pl = {
      q: pillar([[pc.roe[i], 45], [pc.de[i], 25], [pc.margin[i], 30]]),
      v: pillar([[pc.pe[i], 65], [pc.pb[i], 35]]),
      r: pillar([[pc.vol[i], 35], [pc.dd[i], 35], [pc.beta[i], 30]]),
      t: pillar([[pc.c3[i], 40], [pc.trend[i], 30], [pc.pos[i], 30]]),
      g: pillar([[pc.rg[i], 50], [pc.eg[i], 50]]),
    };
    const { score, coverage } = weighted((Object.keys(STOCK_PILLARS) as (keyof typeof pl)[]).map((k) => [pl[k], STOCK_PILLARS[k][1]]));
    const st = x.stats, fu = x.fu;
    const h = heat(st, fu, industryPe[x.industry] ?? null);
    const liq = st.valueCr20;
    let sc = score === null ? null : 50 + (score - 50) * Math.min(1, coverage / 0.75);
    if (sc !== null && h.score > 50) sc -= (h.score - 50) * 0.4; // risen too much, too fast
    if (sc !== null && liq !== null && liq < 1) sc = Math.min(sc, 45); // illiquid names cannot rank as strong
    let sig = sc === null ? "—" : sc >= 70 ? "Strong" : sc >= 57 ? "Positive" : sc >= 43 ? "Neutral" : "Weak";
    if (h.label === "Overheated" && (sig === "Strong" || sig === "Positive")) sig = "Neutral";
    return {
      s: st.symbol, n: fu?.name || x.name, i: x.industry, px: st.price, d: st.asOf, r1: st.r1y, r3m: st.r3m, r6: st.r6m, c3: st.cagr3, c5: st.cagr5,
      v: st.vol1y, b: st.beta1y, dd: st.mdd3y, sh: st.sharpe1y, m: st.mom12_1, h: st.fromHigh52, rsi: st.rsi14, tr: ext[i], liq,
      pe: fu?.pe ?? null, pb: fu?.pb ?? null, roe: fu?.roe ?? null, de: fu?.de ?? null, dy: fu?.divYield ?? null, eg: fu?.epsGrowth ?? null, mc: fu?.mcapCr ?? null,
      rg: fu?.revGrowth ?? null, mg: fu?.margin ?? null, pos: st.rolling1y?.positive ?? null,
      sc: sc === null ? null : Math.max(0, Math.round(sc)), sig, cov: Math.round(coverage * 100) / 100, ht: h.score, hl: h.label, pl, ck: st.check,
    };
  });
}

export function industryMedians(rows: StockLite[]) {
  const out: Record<string, { pe: number | null; count: number }> = {};
  const groups = new Map<string, StockLite[]>();
  rows.forEach((r) => groups.set(r.i, [...(groups.get(r.i) || []), r]));
  for (const [k, v] of groups) out[k] = { pe: median(v.map((r) => r.pe).filter((x): x is number => x !== null && x > 0)), count: v.length };
  return out;
}

export const STOCK_METHODOLOGY = "Built for long-term (1 year +) SIP investing. Each stock is scored 0–100 against the Nifty 500 on five pillars: business quality 30 (ROE, debt/equity, margin — vs industry peers), valuation 25 (P/E and P/B vs industry peers), risk 20 (volatility, 3-year worst fall, beta), long-term trend 15 (3-year return, price vs 200-day average capped at +20%, share of positive 1-year periods) and growth 10 (revenue and earnings growth). Stocks that have risen too far, too fast lose up to 20 points and cannot be rated above Neutral. Thin data is pulled toward 50; stocks trading under ₹1 crore a day are capped at 45.";

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

/** Median positive P/E per industry from raw fundamentals (used before scoring). */
export function industryPeFrom(items: { fu: Fundamentals | null; industry: string }[]): Record<string, number | null> {
  const m = new Map<string, number[]>();
  for (const x of items) if (x.fu?.pe && x.fu.pe > 0) m.set(x.industry, [...(m.get(x.industry) || []), x.fu.pe]);
  return Object.fromEntries([...m].map(([k, v]) => [k, median(v)]));
}

/** Compare two price series on overlapping dates. */
export function crossCheck(a: Bar[], b: Bar[]): "2 sources agree" | "sources differ" | "single source" {
  const bm = new Map(b.map((x) => [x.t, x.c]));
  const diffs = a.filter((x) => bm.has(x.t)).slice(-10).map((x) => Math.abs(x.c / (bm.get(x.t) as number) - 1));
  if (diffs.length < 2) return "single source";
  return (median(diffs) as number) < 0.01 ? "2 sources agree" : "sources differ";
}
