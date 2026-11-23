/**
 * Hydrostatic / pneumatic test pressure.
 *  ASME VIII-1 UG-99(b): P_T = 1.3 · MAWP · (S_test / S_design)   ·  UG-100 pneumatic: 1.1 · MAWP · ratio
 *  ASME B31.3 345.4.2: P_T = 1.5 · P · (S_T / S), ratio ≤ 6.5   ·  345.5.4 pneumatic: 1.1 · P
 *  Static head of water adds ρ·g·h at the lowest point.
 */
export type TestCode = "asme8" | "b313";
export type TestInput = { code: TestCode; P: number; sTest: number; sDesign: number; height: number; pneumatic: boolean };
export type TestResult = { factor: number; ratio: number; pTop: number; pBottom: number; head: number; steps: { label: string; formula: string; value: string }[]; notes: string[] };

export function testPressure(i: TestInput): TestResult {
  const notes: string[] = [];
  let ratio = i.sDesign > 0 ? i.sTest / i.sDesign : 1;
  if (i.code === "b313" && ratio > 6.5) { ratio = 6.5; notes.push("B31.3 limits S_T/S to 6.5."); }
  const factor = i.pneumatic ? 1.1 : i.code === "asme8" ? 1.3 : 1.5;
  const useRatio = i.pneumatic && i.code === "b313" ? 1 : ratio;
  const pTop = factor * i.P * useRatio;
  const head = i.pneumatic ? 0 : 0.00980665 * Math.max(0, i.height); // MPa per m of water
  const pBottom = pTop + head;
  const steps = [
    { label: "Stress ratio", formula: i.code === "asme8" ? "S at test temp / S at design temp (lowest ratio of the parts)" : "S_T / S (≤ 6.5)", value: useRatio.toFixed(3) },
    { label: i.pneumatic ? "Pneumatic test pressure" : "Hydrostatic test pressure", formula: `${factor} × ${i.code === "asme8" ? "MAWP" : "P"}${useRatio !== 1 ? " × ratio" : ""}`, value: `${pTop.toFixed(3)} MPa` },
  ];
  if (!i.pneumatic && i.height > 0) steps.push({ label: "Static head of water", formula: `ρ·g·h = 0.00981 × ${i.height} m`, value: `${head.toFixed(3)} MPa` });
  if (i.pneumatic) notes.push("Pneumatic tests store much more energy than water tests: use only when a hydrotest is impracticable, with an exclusion zone and the code's additional requirements.");
  else notes.push("The test pressure applies at the top; the lowest point sees the static head as well. Check that no part exceeds the stress limit (e.g. 90% of yield for UG-99 / B31.3 345.2.1).");
  return { factor, ratio: useRatio, pTop, pBottom, head, steps, notes };
}
