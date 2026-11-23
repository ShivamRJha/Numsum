/** Goal-planning maths for the investment planner (runs in the browser). Rates are decimals. */
export type Risk = "conservative" | "balanced" | "growth" | "aggressive";

export type PlanInputs = {
  goal: string;
  targetToday: number; // ₹ in today's money
  years: number; // 1–40
  currentSavings: number; // ₹ already set aside for this goal
  monthlySip: number; // ₹ per month
  stepUp: number; // yearly SIP increase, e.g. 0.1
  inflation: number; // e.g. 0.06
  risk: Risk;
  returns: { equity: number; debt: number; gold: number };
};

export const RISK_LABELS: Record<Risk, string> = { conservative: "Conservative", balanced: "Balanced", growth: "Growth", aggressive: "Aggressive" };

export const DEFAULT_INPUTS: PlanInputs = {
  goal: "My goal",
  targetToday: 2500000,
  years: 10,
  currentSavings: 200000,
  monthlySip: 15000,
  stepUp: 0.1,
  inflation: 0.06,
  risk: "balanced",
  returns: { equity: 0.11, debt: 0.07, gold: 0.08 },
};

const EQUITY_BY_HORIZON: [number, Record<Risk, number>][] = [
  [3, { conservative: 0, balanced: 0, growth: 0.1, aggressive: 0.1 }],
  [5, { conservative: 0.2, balanced: 0.35, growth: 0.45, aggressive: 0.55 }],
  [7, { conservative: 0.35, balanced: 0.5, growth: 0.65, aggressive: 0.75 }],
  [10, { conservative: 0.45, balanced: 0.6, growth: 0.75, aggressive: 0.85 }],
  [Infinity, { conservative: 0.5, balanced: 0.65, growth: 0.8, aggressive: 0.9 }],
];
const GOLD: Record<Risk, number> = { conservative: 0.1, balanced: 0.1, growth: 0.08, aggressive: 0.05 };

/** Equity sleeve split (index-first: evidence favours low-cost index funds for large and mid caps). */
const EQUITY_SPLIT: Record<Risk, [string, number][]> = {
  conservative: [["idx_n50", 0.7], ["flexi", 0.3]],
  balanced: [["idx_n50", 0.5], ["flexi", 0.25], ["idx_mid150", 0.15], ["small", 0.1]],
  growth: [["idx_n50", 0.4], ["flexi", 0.2], ["idx_mid150", 0.2], ["small", 0.2]],
  aggressive: [["idx_n50", 0.3], ["idx_next50", 0.1], ["flexi", 0.2], ["idx_mid150", 0.2], ["small", 0.2]],
};

export type AllocationLine = { bucket: string; asset: "equity" | "debt" | "gold"; share: number; why: string };

export function suggestRisk(years: number): Risk {
  return years < 3 ? "conservative" : years < 5 ? "balanced" : years < 10 ? "growth" : "aggressive";
}

export function allocation(years: number, risk: Risk): AllocationLine[] {
  const equity = EQUITY_BY_HORIZON.find(([h]) => years < h)![1][risk];
  const gold = years < 3 ? 0 : GOLD[risk];
  const debt = Math.max(0, 1 - equity - gold);
  const lines: AllocationLine[] = [];
  for (const [bucket, s] of EQUITY_SPLIT[risk]) if (equity * s > 0) lines.push({ bucket, asset: "equity", share: equity * s, why: bucket.startsWith("idx_") ? "Low-cost index core" : bucket === "small" ? "Active small-cap — the one segment where managers have added value" : "Active flexi-cap for manager flexibility" });
  if (gold > 0) lines.push({ bucket: "gold", asset: "gold", share: gold, why: "Diversifier that often rises when equity falls" });
  if (debt > 0) {
    const split: [string, number, string][] = years <= 1 ? [["liquid", 1, "Money needed within a year — capital safety first"]]
      : years <= 3 ? [["arbitrage", 0.6, "Equity taxation with debt-like risk"], ["liquid", 0.4, "Liquidity and safety"]]
      : [["shortdur", 0.5, "Steady accrual, limited interest-rate risk"], ["corpbond", 0.5, "High-quality corporate bonds"]];
    for (const [bucket, s, why] of split) lines.push({ bucket, asset: "debt", share: debt * s, why });
  }
  return lines;
}

export function blendedReturn(lines: AllocationLine[], r: PlanInputs["returns"]) {
  return lines.reduce((sum, l) => sum + l.share * r[l.asset], 0);
}

const monthly = (annual: number) => Math.pow(1 + annual, 1 / 12) - 1;

/** Future value multiplier of ₹1/month for 12 months (paid at the start of each month), valued at year end. */
function yearOfSip(annual: number) {
  const m = monthly(annual);
  return m === 0 ? 12 : ((Math.pow(1 + m, 12) - 1) / m) * (1 + m);
}

/** Value of ₹1/month SIP with yearly step-up after n years. */
export function sipFactor(annual: number, years: number, stepUp: number) {
  const y = yearOfSip(annual);
  let f = 0;
  for (let k = 0; k < years; k++) f += Math.pow(1 + stepUp, k) * y * Math.pow(1 + annual, years - k - 1);
  return f;
}

export type YearPoint = { year: number; invested: number; low: number; expected: number; high: number };

export function project(inputs: PlanInputs, annual: number) {
  const points: YearPoint[] = [{ year: 0, invested: inputs.currentSavings, low: inputs.currentSavings, expected: inputs.currentSavings, high: inputs.currentSavings }];
  let invested = inputs.currentSavings;
  const at = (r: number, n: number) => inputs.currentSavings * Math.pow(1 + r, n) + inputs.monthlySip * sipFactor(r, n, inputs.stepUp);
  for (let n = 1; n <= inputs.years; n++) {
    invested += inputs.monthlySip * 12 * Math.pow(1 + inputs.stepUp, n - 1);
    points.push({ year: n, invested, low: at(Math.max(0, annual - 0.02), n), expected: at(annual, n), high: at(annual + 0.02, n) });
  }
  return points;
}

export function plan(inputs: PlanInputs) {
  const lines = allocation(inputs.years, inputs.risk);
  const r = blendedReturn(lines, inputs.returns);
  const target = inputs.targetToday * Math.pow(1 + inputs.inflation, inputs.years);
  const points = project(inputs, r);
  const end = points[points.length - 1];
  const fromSavings = inputs.currentSavings * Math.pow(1 + r, inputs.years);
  const factor = sipFactor(r, inputs.years, inputs.stepUp);
  const requiredSip = Math.max(0, (target - fromSavings) / factor);
  const lumpsumNeeded = Math.max(0, (target - end.expected) / Math.pow(1 + r, inputs.years));
  return { lines, annualReturn: r, target, points, projected: end.expected, invested: end.invested, gap: target - end.expected, requiredSip, lumpsumNeeded, onTrack: end.expected >= target, lowCase: end.low, highCase: end.high };
}

export function inr(value: number, compact = true) {
  if (!Number.isFinite(value)) return "—";
  const v = Math.round(value);
  if (compact && Math.abs(v) >= 1e7) return `₹${(v / 1e7).toFixed(2)} Cr`;
  if (compact && Math.abs(v) >= 1e5) return `₹${(v / 1e5).toFixed(2)} L`;
  return `₹${v.toLocaleString("en-IN")}`;
}

export const pct = (x: number | null | undefined, digits = 1) => (x === null || x === undefined || !Number.isFinite(x) ? "—" : `${(x * 100).toFixed(digits)}%`);
