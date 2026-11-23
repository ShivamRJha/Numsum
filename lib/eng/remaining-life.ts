/**
 * Corrosion rate, remaining life and next inspection — API 510 (vessels), API 570 (piping), API 653 (tank shells).
 *   CR(long-term) = (t_initial − t_actual) / years between;  CR(short-term) = (t_previous − t_actual) / years between
 *   Remaining life = (t_actual − t_required) / governing CR
 */
export type Code = "api510" | "api570c1" | "api570c2" | "api570c3" | "api653";
export const CODE_RULES: Record<Code, { label: string; maxYears: number; rule: string }> = {
  api510: { label: "Pressure vessel — API 510", maxYears: 10, rule: "Internal / on-stream interval: the lesser of half the remaining life or 10 years (API 510 §6.5.1.1)." },
  api570c1: { label: "Piping Class 1 — API 570", maxYears: 5, rule: "Thickness interval: the lesser of half the remaining life or 5 years (API 570 Table 2)." },
  api570c2: { label: "Piping Class 2 — API 570", maxYears: 10, rule: "Thickness interval: the lesser of half the remaining life or 10 years (API 570 Table 2)." },
  api570c3: { label: "Piping Class 3 — API 570", maxYears: 10, rule: "Thickness interval: the lesser of half the remaining life or 10 years (API 570 Table 2)." },
  api653: { label: "Storage tank shell — API 653", maxYears: 15, rule: "Shell UT interval: the lesser of half the remaining corrosion life or 15 years (API 653 §6.3.3)." },
};

export type Reading = { date: string; t: number };
export type RlInput = { code: Code; tReq: number; initial: Reading; previous?: Reading | null; latest: Reading; extra?: Reading[] };
export type RlResult = { crLong: number | null; crShort: number | null; crTrend: number | null; cr: number; governs: string; rl: number | null; nextYears: number | null; nextDate: string | null; status: "ok" | "watch" | "act"; notes: string[] };

const years = (a: string, b: string) => (Date.parse(b) - Date.parse(a)) / (365.25 * 864e5);

/** Least-squares corrosion rate from several dated readings (mm/year, positive = metal loss). */
export function trendRate(rs: Reading[]): number | null {
  const pts = rs.filter((r) => r.date && Number.isFinite(r.t)).map((r) => [Date.parse(r.date) / (365.25 * 864e5), r.t] as const);
  if (pts.length < 3) return null;
  const mx = pts.reduce((a, p) => a + p[0], 0) / pts.length, my = pts.reduce((a, p) => a + p[1], 0) / pts.length;
  const sxx = pts.reduce((a, p) => a + (p[0] - mx) ** 2, 0), sxy = pts.reduce((a, p) => a + (p[0] - mx) * (p[1] - my), 0);
  return sxx ? -sxy / sxx : null;
}

export function remainingLife(i: RlInput): RlResult {
  const notes: string[] = [];
  const yl = years(i.initial.date, i.latest.date);
  const crLong = yl > 0 ? (i.initial.t - i.latest.t) / yl : null;
  let crShort: number | null = null;
  if (i.previous && i.previous.date) { const ys = years(i.previous.date, i.latest.date); crShort = ys > 0 ? (i.previous.t - i.latest.t) / ys : null; }
  const crTrend = i.extra?.length ? trendRate([i.initial, ...(i.previous ? [i.previous] : []), ...i.extra, i.latest]) : null;
  const cands: [string, number | null][] = [["long-term", crLong], ["short-term", crShort], ["trend", crTrend]];
  const valid = cands.filter((c): c is [string, number] => c[1] !== null && Number.isFinite(c[1]));
  const best = valid.reduce<[string, number]>((m, c) => (c[1] > m[1] ? c : m), ["none", 0]);
  let cr = best[1];
  if (cr <= 0) { notes.push("No measurable metal loss: readings are steady or increasing (check measurement points and instrument calibration). A nominal 0.025 mm/year is used so an interval can still be set."); cr = 0.025; }
  if (crShort !== null && crLong !== null && crShort > 2 * Math.max(crLong, 0.01)) notes.push("Short-term rate is more than twice the long-term rate — corrosion may be accelerating; confirm with repeat readings.");
  const rl = i.latest.t > i.tReq ? (i.latest.t - i.tReq) / cr : 0;
  if (i.latest.t <= i.tReq) notes.push("Measured thickness is at or below the required thickness — fitness-for-service (API 579) or repair/replacement is needed now.");
  const rule = CODE_RULES[i.code];
  const nextYears = rl > 0 ? Math.min(rl / 2, rule.maxYears) : 0;
  const next = new Date(Date.parse(i.latest.date) + nextYears * 365.25 * 864e5);
  const status: RlResult["status"] = rl <= 0 ? "act" : rl < 4 ? "watch" : "ok";
  return { crLong, crShort, crTrend, cr, governs: best[0], rl, nextYears, nextDate: Number.isFinite(next.getTime()) ? next.toISOString().slice(0, 10) : null, status, notes };
}
