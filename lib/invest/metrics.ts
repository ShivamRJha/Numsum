/** Pure fund-metric maths shared by the refresh script and tests. All returns are decimals (0.12 = 12%). */
export type NavPoint = { t: number; nav: number }; // t = ms since epoch, ascending

const DAY = 864e5;
const YEAR = 365.25 * DAY;

/** mfapi.in history ("dd-mm-yyyy", newest first) → ascending, de-duplicated, positive NAVs. */
export function parseMfapiHistory(rows: { date: string; nav: string }[]): NavPoint[] {
  const out: NavPoint[] = [];
  for (const r of rows) {
    const [d, m, y] = r.date.split("-").map(Number);
    const nav = Number(r.nav);
    if (!d || !m || !y || !(nav > 0)) continue;
    out.push({ t: Date.UTC(y, m - 1, d), nav });
  }
  out.sort((a, b) => a.t - b.t);
  return out.filter((p, i) => i === 0 || p.t !== out[i - 1].t);
}

/** NAV on or before time t (binary search). */
export function navAt(series: NavPoint[], t: number): NavPoint | null {
  let lo = 0, hi = series.length - 1, best = -1;
  while (lo <= hi) { const mid = (lo + hi) >> 1; if (series[mid].t <= t) { best = mid; lo = mid + 1; } else hi = mid - 1; }
  return best >= 0 ? series[best] : null;
}

export function historyYears(series: NavPoint[]) {
  return series.length < 2 ? 0 : (series[series.length - 1].t - series[0].t) / YEAR;
}

export function cagr(series: NavPoint[], years: number): number | null {
  if (series.length < 2) return null;
  const last = series[series.length - 1];
  const start = last.t - years * YEAR;
  if (series[0].t > start + 7 * DAY) return null; // not enough history
  const past = navAt(series, start);
  if (!past || past.nav <= 0) return null;
  return Math.pow(last.nav / past.nav, 1 / years) - 1;
}

/** Month-end NAVs keyed "YYYY-MM" for the last `months` months. */
export function monthEnds(series: NavPoint[], months = 121): Map<string, number> {
  const map = new Map<string, number>();
  if (!series.length) return map;
  const cutoff = series[series.length - 1].t - (months + 1) * 31 * DAY;
  for (const p of series) {
    if (p.t < cutoff) continue;
    const d = new Date(p.t);
    map.set(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`, p.nav);
  }
  return map;
}

export function monthKeys(latestT: number, count: number): string[] {
  const d = new Date(latestT);
  const keys: string[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - i, 1));
    keys.push(`${x.getUTCFullYear()}-${String(x.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}

/** Monthly simple returns aligned to `keys` (null where missing). */
export function monthlyReturns(me: Map<string, number>, keys: string[]): (number | null)[] {
  return keys.map((k, i) => {
    if (i === 0) return null;
    const a = me.get(keys[i - 1]), b = me.get(k);
    return a && b ? b / a - 1 : null;
  });
}

export function std(xs: number[]) {
  if (xs.length < 2) return null;
  const m = xs.reduce((s, x) => s + x, 0) / xs.length;
  return Math.sqrt(xs.reduce((s, x) => s + (x - m) ** 2, 0) / (xs.length - 1));
}

export function median(xs: number[]) {
  const v = xs.filter((x) => Number.isFinite(x)).sort((a, b) => a - b);
  if (!v.length) return null;
  const mid = v.length >> 1;
  return v.length % 2 ? v[mid] : (v[mid - 1] + v[mid]) / 2;
}

/** Annualised volatility from monthly returns (needs ≥ 12 values). */
export function annualVol(rets: (number | null)[]) {
  const xs = rets.filter((x): x is number => x !== null);
  if (xs.length < 12) return null;
  const s = std(xs);
  return s === null ? null : s * Math.sqrt(12);
}

/** Sortino ratio from monthly returns with a yearly hurdle (default 6.5%). */
export function sortino(rets: (number | null)[], hurdle = 0.065) {
  const xs = rets.filter((x): x is number => x !== null);
  if (xs.length < 24) return null;
  const h = Math.pow(1 + hurdle, 1 / 12) - 1;
  const mean = xs.reduce((s, x) => s + x, 0) / xs.length;
  const dd = Math.sqrt(xs.reduce((s, x) => s + Math.min(0, x - h) ** 2, 0) / xs.length);
  if (dd === 0) return null;
  return ((mean - h) * 12) / (dd * Math.sqrt(12));
}

/** Maximum drawdown (negative decimal) over the last `years` of daily data. */
export function maxDrawdown(series: NavPoint[], years = 5) {
  if (series.length < 30) return null;
  const start = series[series.length - 1].t - years * YEAR;
  let peak = 0, mdd = 0;
  for (const p of series) {
    if (p.t < start) continue;
    peak = Math.max(peak, p.nav);
    mdd = Math.min(mdd, p.nav / peak - 1);
  }
  return mdd;
}

/** Percentile rank (0–100) of each value; higher is better unless `lowerIsBetter`. Nulls stay null. */
export function percentiles(values: (number | null)[], lowerIsBetter = false): (number | null)[] {
  const idx = values.map((v, i) => [v, i] as const).filter(([v]) => v !== null && Number.isFinite(v)) as [number, number][];
  const out: (number | null)[] = values.map(() => null);
  if (!idx.length) return out;
  if (idx.length === 1) { out[idx[0][1]] = 50; return out; }
  idx.sort((a, b) => (lowerIsBetter ? b[0] - a[0] : a[0] - b[0]));
  let i = 0;
  while (i < idx.length) {
    let j = i;
    while (j + 1 < idx.length && idx[j + 1][0] === idx[i][0]) j++;
    const rank = ((i + j) / 2) / (idx.length - 1) * 100;
    for (let k = i; k <= j; k++) out[idx[k][1]] = rank;
    i = j + 1;
  }
  return out;
}

/** Weighted average of available components, re-normalised over the weights that have data. */
export function weighted(parts: [number | null, number][]) {
  let sum = 0, w = 0, possible = 0;
  for (const [v, wt] of parts) { possible += wt; if (v !== null && Number.isFinite(v)) { sum += v * wt; w += wt; } }
  return { score: w ? sum / w : null, coverage: possible ? w / possible : 0 };
}
