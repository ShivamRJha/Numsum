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
