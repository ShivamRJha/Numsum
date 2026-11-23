/**
 * Pressure vessel wall thickness and MAWP — ASME BPVC Section VIII Division 1, internal pressure.
 * UG-27(c)(1) cylinder (circumferential stress), UG-27(c)(2) cylinder (longitudinal stress), UG-27(d) sphere /
 * hemispherical head, Appendix 1-4(c) 2:1 ellipsoidal head, Appendix 1-4(d) / UG-32 torispherical (ASME F&D, L = D, r = 6% L),
 * Appendix 1-1 cylinder by outside radius. All in MPa and mm. S is the allowable stress at design temperature from ASME II-D.
 */
export type Part = "shell" | "shellOD" | "sphere" | "ellipsoidal" | "torispherical";
export const PART_LABELS: Record<Part, string> = {
  shell: "Cylindrical shell (inside diameter)",
  shellOD: "Cylindrical shell (outside diameter)",
  sphere: "Spherical shell / hemispherical head",
  ellipsoidal: "2:1 ellipsoidal head",
  torispherical: "Torispherical head (ASME F&D)",
};

export type VesselInput = { part: Part; P: number; D: number; S: number; E: number; CA: number; tNom?: number | null; underTol?: number };
export type Step = { label: string; formula: string; value: string };
export type VesselResult = { tReq: number; tMin: number; mawpNew: number | null; mawpCorroded: number | null; ok: boolean | null; margin: number | null; steps: Step[]; warnings: string[]; clause: string };

const f = (x: number, d = 3) => x.toFixed(d);

export function vessel(i: VesselInput): VesselResult {
  const { part, P, D, S, E, CA } = i;
  const warnings: string[] = [];
  const steps: Step[] = [];
  const SE = S * E;
  let tReq = 0, clause = "", mawp: (t: number) => number;
  if (part === "shell") {
    const R = D / 2 + CA; // corroded inside radius
    const tc = (P * R) / (SE - 0.6 * P), tl = (P * R) / (2 * SE + 0.4 * P);
    tReq = Math.max(tc, tl); clause = "UG-27(c)";
    steps.push({ label: "Corroded inside radius", formula: "R = D/2 + CA", value: `${f(R, 1)} mm` });
    steps.push({ label: "Circumferential stress (long. joints)", formula: "t = P·R / (S·E − 0.6·P)", value: `${f(tc)} mm` });
    steps.push({ label: "Longitudinal stress (circ. joints)", formula: "t = P·R / (2·S·E + 0.4·P)", value: `${f(tl)} mm` });
    if (P > 0.385 * SE) warnings.push("P exceeds 0.385·S·E — thick-wall formulas of Appendix 1-2 apply instead.");
    if (tReq > R / 2) warnings.push("t exceeds R/2 — thick-wall formulas of Appendix 1-2 apply instead.");
    mawp = (t) => (SE * t) / (R + 0.6 * t);
  } else if (part === "shellOD") {
    const Ro = D / 2;
    tReq = (P * Ro) / (SE + 0.4 * P); clause = "Appendix 1-1(a)(1)";
    steps.push({ label: "Outside radius", formula: "Ro = D/2", value: `${f(Ro, 1)} mm` });
    steps.push({ label: "Required thickness", formula: "t = P·Ro / (S·E + 0.4·P)", value: `${f(tReq)} mm` });
    if (P > 0.385 * SE) warnings.push("P exceeds 0.385·S·E — see Appendix 1-2.");
    mawp = (t) => (SE * t) / (Ro - 0.4 * t);
  } else if (part === "sphere") {
    const R = D / 2 + CA;
    tReq = (P * R) / (2 * SE - 0.2 * P); clause = "UG-27(d)";
    steps.push({ label: "Corroded inside radius", formula: "R = D/2 + CA", value: `${f(R, 1)} mm` });
    steps.push({ label: "Required thickness", formula: "t = P·R / (2·S·E − 0.2·P)", value: `${f(tReq)} mm` });
    if (P > 0.665 * SE) warnings.push("P exceeds 0.665·S·E — see Appendix 1-3.");
    mawp = (t) => (2 * SE * t) / (R + 0.2 * t);
  } else if (part === "ellipsoidal") {
    const Dc = D + 2 * CA;
    tReq = (P * Dc) / (2 * SE - 0.2 * P); clause = "UG-32(d) / Appendix 1-4(c), K = 1";
    steps.push({ label: "Corroded inside diameter", formula: "D = D + 2·CA", value: `${f(Dc, 1)} mm` });
    steps.push({ label: "Required thickness", formula: "t = P·D / (2·S·E − 0.2·P)", value: `${f(tReq)} mm` });
    mawp = (t) => (2 * SE * t) / (Dc + 0.2 * t);
  } else {
    const L = D + 2 * CA; // crown radius = inside diameter (ASME F&D), knuckle 6%
    tReq = (0.885 * P * L) / (SE - 0.1 * P); clause = "UG-32(e) / Appendix 1-4(d), M = 1.77";
    steps.push({ label: "Crown radius (corroded)", formula: "L = D + 2·CA (knuckle r = 0.06·L)", value: `${f(L, 1)} mm` });
    steps.push({ label: "Required thickness", formula: "t = 0.885·P·L / (S·E − 0.1·P)", value: `${f(tReq)} mm` });
    mawp = (t) => (SE * t) / (0.885 * L + 0.1 * t);
  }
  const tMin = tReq + CA;
  steps.push({ label: "Add corrosion allowance", formula: "t_min = t + CA", value: `${f(tMin)} mm` });
  let mawpNew: number | null = null, mawpCorroded: number | null = null, ok: boolean | null = null, margin: number | null = null;
  if (i.tNom && i.tNom > 0) {
    const available = i.tNom - (i.underTol || 0);
    ok = available >= tMin;
    margin = available - tMin;
    mawpCorroded = mawp(available - CA);
    mawpNew = mawp(available);
    steps.push({ label: "Available thickness", formula: "t_nom − under-tolerance", value: `${f(available)} mm` });
    steps.push({ label: "MAWP in corroded condition", formula: "rearranged formula with t = available − CA", value: `${f(mawpCorroded, 3)} MPa` });
  }
  if (E < 0.7 || E > 1) warnings.push("Joint efficiency is normally between 0.70 and 1.00 (UW-12).");
  if (P <= 0) warnings.push("Enter a positive internal design pressure.");
  return { tReq, tMin, mawpNew, mawpCorroded, ok, margin, steps, warnings, clause };
}
