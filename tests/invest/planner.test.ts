/** npx tsx tests/invest/planner.test.ts */
import assert from "node:assert/strict";
import { allocation, DEFAULT_INPUTS, plan, sipFactor } from "../../lib/invest/planner";

// ₹10,000/month for 10 years at 12% a year, no step-up ≈ ₹22.4–23.3 L
const fv = 10000 * sipFactor(0.12, 10, 0);
assert.ok(fv > 2.2e6 && fv < 2.35e6, `sip fv ${fv}`);
for (const years of [1, 2, 4, 6, 9, 15, 30]) for (const risk of ["conservative", "balanced", "growth", "aggressive"] as const) {
  const total = allocation(years, risk).reduce((s, l) => s + l.share, 0);
  assert.ok(Math.abs(total - 1) < 1e-9, `allocation sums to 1 (${years}/${risk})`);
}
assert.equal(allocation(2, "aggressive").filter((l) => l.asset === "gold").length, 0, "no gold under 3 years");
const p = plan(DEFAULT_INPUTS);
// Paying exactly the required SIP should reach the target
const check = plan({ ...DEFAULT_INPUTS, monthlySip: p.requiredSip });
assert.ok(Math.abs(check.projected - p.target) / p.target < 1e-6, "required SIP hits target");
console.log("planner tests passed", { target: Math.round(p.target), projected: Math.round(p.projected), requiredSip: Math.round(p.requiredSip), r: p.annualReturn.toFixed(4) });
// Exclusions and direct stocks keep the allocation at 100%
const ex = allocation(10, "growth", { exclude: ["gold", "smallmid"], stocksShare: 0.2, indexOnly: true });
assert.ok(Math.abs(ex.reduce((s, l) => s + l.share, 0) - 1) < 1e-9);
assert.equal(ex.some((l) => l.bucket === "gold" || l.bucket === "small" || l.bucket === "idx_mid150"), false);
assert.ok(ex.some((l) => l.bucket === "stocks") && ex.some((l) => l.bucket === "idx_n500"));
console.log("exclusion tests passed");

// Stock SIP builder: respects industry cap, keeps overheated stocks out, splits the full amount
import { buildStockSip, SIP_DEFAULTS } from "../../lib/invest/stock-sip";
import type { StockLite } from "../../lib/invest/stocks";
const mk = (s: string, i: string, sc: number, hl: StockLite["hl"], v = 0.25): StockLite => ({ s, n: s, i, px: 100, d: "2026-11-20", r1: 0.1, r3m: 0, c3: 0.15, c5: 0.12, v, b: 0.9, dd: -0.2, sh: 0.5, m: 0.1, h: -0.05, rsi: 50, tr: 0.05, liq: 50, pe: 20, pb: 3, roe: 0.2, de: 0.3, dy: 0.01, eg: 0.1, mc: 100000, sc, sig: sc >= 70 ? "Strong" : "Positive", cov: 1, ht: hl === "Overheated" ? 90 : 10, hl, pl: { q: sc, v: sc, r: sc, t: sc, g: sc }, pos: 0.8 });
const uni = [mk("A1", "IT", 90, "Calm"), mk("A2", "IT", 88, "Calm"), mk("A3", "IT", 86, "Calm"), mk("B1", "Bank", 85, "Calm"), mk("C1", "Auto", 95, "Overheated"), mk("D1", "FMCG", 70, "Warm", 0.15), mk("E1", "Pharma", 72, "Calm")];
const sip = buildStockSip(uni, { ...SIP_DEFAULTS, monthly: 10000, count: 5 }, {});
assert.equal(sip.picks.filter((p) => p.row.i === "IT").length, 2, "max 2 per industry");
assert.ok(!sip.picks.some((p) => p.row.s === "C1") && sip.waitlist.some((w) => w.row.s === "C1"), "overheated goes to wait list");
assert.ok(Math.abs(sip.picks.reduce((a, p) => a + p.weight, 0) - 1) < 1e-9, "weights sum to 1");
console.log("stock SIP builder tests passed", sip.picks.map((p) => `${p.row.s}:${p.monthly}`).join(" "));
