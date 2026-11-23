/** Engineering calculator checks against hand calculations: npx tsx tests/eng.test.ts */
import assert from "node:assert/strict";
import { vessel } from "../lib/eng/vessel";
import { pipeThickness, yCoefficient } from "../lib/eng/pipe";
import { remainingLife } from "../lib/eng/remaining-life";
import { testPressure } from "../lib/eng/hydrotest";
import { steamLoss } from "../lib/eng/steam";
import { DM_LIB, screenAll } from "../lib/eng/damage-mechanisms";

const near = (a: number, b: number, tol = 1e-3) => assert.ok(Math.abs(a - b) <= tol * Math.max(1, Math.abs(b)), `${a} vs ${b}`);

// UG-27(c)(1): P 1.5 MPa, ID 1500, S 138, E 0.85, CA 3 → R = 753; t = 1.5·753/(117.3 − 0.9) = 9.704 mm
const v = vessel({ part: "shell", P: 1.5, D: 1500, S: 138, E: 0.85, CA: 3, tNom: 14 });
near(v.tReq, (1.5 * 753) / (138 * 0.85 - 0.9));
near(v.tMin, v.tReq + 3);
assert.equal(v.ok, true);
// MAWP of the remaining 11 mm: S·E·t/(R + 0.6t)
near(v.mawpCorroded as number, (138 * 0.85 * 11) / (753 + 6.6));
// 2:1 head and F&D
near(vessel({ part: "ellipsoidal", P: 1, D: 1000, S: 138, E: 1, CA: 0 }).tReq, 1000 / (276 - 0.2));
near(vessel({ part: "torispherical", P: 1, D: 1000, S: 138, E: 1, CA: 0 }).tReq, (0.885 * 1000) / (138 - 0.1));

// B31.3: P 4 MPa, D 168.3, S 138, E 1, W 1, ferritic 200 °C → Y 0.4; t = 4·168.3/(2·(138 + 1.6)) = 2.411
assert.equal(yCoefficient("ferritic", 200), 0.4);
near(yCoefficient("ferritic", 524), 0.6);
const p = pipeThickness({ P: 4, D: 168.3, S: 138, E: 1, W: 1, T: 200, mat: "ferritic", c: 1.5, millTol: 0.125, nps: "6" });
near(p.t, (4 * 168.3) / (2 * (138 + 1.6)));
near(p.tNomMin, (p.t + 1.5) / 0.875);
assert.equal(p.suggested?.sch, "STD"); // 7.11 mm ≥ 4.47 mm

// Remaining life: 12 → 10 mm over 10 years (0.2 mm/y), 10.6 → 10 over 2 years (0.3 mm/y) governs; tReq 7 → RL 10 y → next 5 y
const rl = remainingLife({ code: "api510", tReq: 7, initial: { date: "2014-01-01", t: 12 }, previous: { date: "2022-01-01", t: 10.6 }, latest: { date: "2024-01-01", t: 10 } });
near(rl.cr, 0.3, 0.01);
near(rl.rl as number, 10, 0.02);
near(rl.nextYears as number, 5, 0.02);

// Test pressure: UG-99 1.3 × 2 MPa × (138/118) ; B31.3 1.5 × 2
near(testPressure({ code: "asme8", P: 2, sTest: 138, sDesign: 118, height: 0, pneumatic: false }).pTop, 1.3 * 2 * (138 / 118));
near(testPressure({ code: "b313", P: 2, sTest: 138, sDesign: 138, height: 10, pneumatic: false }).pBottom, 3 + 0.0980665);

// Napier: 10 bar g, 6 mm orifice, blowing through
const s = steamLoss({ pBarg: 10, orificeMm: 6, factor: 1, hours: 8000, costPerTonne: 2500, co2PerTonne: 0.18, count: 1 });
near(s.fullKgh, 24.24 * ((10 + 1.01325) * 14.5038) * (6 / 25.4) ** 2 * 0.453592);

// Damage mechanisms: carbon steel, insulated, 80 °C, water → CUI should be flagged; 69 mechanisms
assert.equal(DM_LIB.length, 69);
const dm = screenAll({ mat: "CS", tmax: 80, tmin: 20, insul: true, water: true });
assert.ok(dm.yes.concat(dm.maybe).some((r) => /insulation/i.test(r.d.n)), "CUI flagged");
console.log("engineering tests passed", { t: v.tReq.toFixed(3), pipe: p.suggested, rl: rl.rl?.toFixed(1), dmYes: dm.yes.length, dmMaybe: dm.maybe.length, open: dm.questions.length });
