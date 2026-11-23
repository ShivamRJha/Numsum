/**
 * Process piping wall thickness — ASME B31.3 para. 304.1.2 (straight pipe under internal pressure):
 *   t = P·D / (2·(S·E·W + P·Y)),  valid for t < D/6;   t_m = t + c;   nominal ≥ t_m / (1 − mill tolerance)
 * Y from Table 304.1.1 (interpolated); pipe sizes from ASME B36.10M (OD and common schedules).
 */
export type MatClass = "ferritic" | "austenitic" | "other" | "castIron";
export const MAT_LABELS: Record<MatClass, string> = { ferritic: "Ferritic steel (carbon, Cr-Mo)", austenitic: "Austenitic stainless steel", other: "Other ductile metals", castIron: "Cast iron" };

/** Table 304.1.1 Y coefficient (t < D/6), linear interpolation between listed temperatures. */
export function yCoefficient(mat: MatClass, T: number): number {
  if (mat === "castIron") return 0;
  if (mat === "other") return 0.4;
  const pts: [number, number][] = mat === "ferritic" ? [[482, 0.4], [510, 0.5], [538, 0.7]] : [[566, 0.4], [593, 0.5], [621, 0.7]];
  if (T <= pts[0][0]) return pts[0][1];
  if (T >= pts[pts.length - 1][0]) return pts[pts.length - 1][1];
  for (let k = 1; k < pts.length; k++) if (T <= pts[k][0]) { const [t0, y0] = pts[k - 1], [t1, y1] = pts[k]; return y0 + ((T - t0) / (t1 - t0)) * (y1 - y0); }
  return 0.4;
}

/** NPS → OD (inches) and wall thickness (inches) per ASME B36.10M for common schedules. */
export const PIPES: { nps: string; od: number; w: Partial<Record<Sch, number>> }[] = [
  { nps: "1/2", od: 0.84, w: { "40": 0.109, "80": 0.147, "160": 0.188, STD: 0.109, XS: 0.147 } },
  { nps: "3/4", od: 1.05, w: { "40": 0.113, "80": 0.154, "160": 0.219, STD: 0.113, XS: 0.154 } },
  { nps: "1", od: 1.315, w: { "40": 0.133, "80": 0.179, "160": 0.25, STD: 0.133, XS: 0.179 } },
  { nps: "1-1/4", od: 1.66, w: { "40": 0.14, "80": 0.191, "160": 0.25, STD: 0.14, XS: 0.191 } },
  { nps: "1-1/2", od: 1.9, w: { "40": 0.145, "80": 0.2, "160": 0.281, STD: 0.145, XS: 0.2 } },
  { nps: "2", od: 2.375, w: { "40": 0.154, "80": 0.218, "160": 0.344, STD: 0.154, XS: 0.218 } },
  { nps: "2-1/2", od: 2.875, w: { "40": 0.203, "80": 0.276, "160": 0.375, STD: 0.203, XS: 0.276 } },
  { nps: "3", od: 3.5, w: { "40": 0.216, "80": 0.3, "160": 0.438, STD: 0.216, XS: 0.3 } },
  { nps: "4", od: 4.5, w: { "40": 0.237, "80": 0.337, "160": 0.531, STD: 0.237, XS: 0.337 } },
  { nps: "5", od: 5.563, w: { "40": 0.258, "80": 0.375, "160": 0.625, STD: 0.258, XS: 0.375 } },
  { nps: "6", od: 6.625, w: { "40": 0.28, "80": 0.432, "160": 0.719, STD: 0.28, XS: 0.432 } },
  { nps: "8", od: 8.625, w: { "40": 0.322, "80": 0.5, "160": 0.906, STD: 0.322, XS: 0.5 } },
  { nps: "10", od: 10.75, w: { "40": 0.365, "80": 0.594, "160": 1.125, STD: 0.365, XS: 0.5 } },
  { nps: "12", od: 12.75, w: { "40": 0.406, "80": 0.688, "160": 1.312, STD: 0.375, XS: 0.5 } },
  { nps: "14", od: 14, w: { "40": 0.438, "80": 0.75, "160": 1.406, STD: 0.375, XS: 0.5 } },
  { nps: "16", od: 16, w: { "40": 0.5, "80": 0.844, "160": 1.594, STD: 0.375, XS: 0.5 } },
  { nps: "18", od: 18, w: { "40": 0.562, "80": 0.938, "160": 1.781, STD: 0.375, XS: 0.5 } },
  { nps: "20", od: 20, w: { "40": 0.594, "80": 1.031, "160": 1.969, STD: 0.375, XS: 0.5 } },
  { nps: "24", od: 24, w: { "40": 0.688, "80": 1.219, "160": 2.344, STD: 0.375, XS: 0.5 } },
];
export type Sch = "STD" | "40" | "XS" | "80" | "160";
export const SCHEDULES: Sch[] = ["STD", "40", "XS", "80", "160"];

export type PipeInput = { P: number; D: number; S: number; E: number; W: number; T: number; mat: MatClass; c: number; millTol: number; tNom?: number | null; nps?: string | null };
export type PipeResult = { Y: number; t: number; tm: number; tNomMin: number; mawp: number | null; ok: boolean | null; suggested: { sch: Sch; w: number } | null; steps: { label: string; formula: string; value: string }[]; warnings: string[] };

export function pipeThickness(i: PipeInput): PipeResult {
  const Y = yCoefficient(i.mat, i.T);
  const t = (i.P * i.D) / (2 * (i.S * i.E * i.W + i.P * Y));
  const tm = t + i.c;
  const tNomMin = tm / (1 - i.millTol);
  const warnings: string[] = [];
  if (t >= i.D / 6) warnings.push("t ≥ D/6 or P/(S·E) > 0.385 — para. 304.1.2(b) requires special consideration (thick-wall).");
  if (i.P / (i.S * i.E) > 0.385) warnings.push("P/(S·E) exceeds 0.385 — thick-wall rules apply.");
  const steps = [
    { label: "Coefficient Y (Table 304.1.1)", formula: `${MAT_LABELS[i.mat]}, ${i.T} °C`, value: Y.toFixed(3) },
    { label: "Pressure design thickness", formula: "t = P·D / (2·(S·E·W + P·Y))", value: `${t.toFixed(3)} mm` },
    { label: "Minimum required thickness", formula: "t_m = t + c (corrosion, erosion, threads)", value: `${tm.toFixed(3)} mm` },
    { label: "Minimum nominal wall", formula: `t_m / (1 − ${(i.millTol * 100).toFixed(1)}% mill tolerance)`, value: `${tNomMin.toFixed(3)} mm` },
  ];
  let mawp: number | null = null, ok: boolean | null = null;
  if (i.tNom && i.tNom > 0) {
    const ta = i.tNom * (1 - i.millTol) - i.c;
    mawp = ta > 0 ? (2 * i.S * i.E * i.W * ta) / (i.D - 2 * Y * ta) : 0;
    ok = i.tNom >= tNomMin;
    steps.push({ label: "MAWP of the selected wall", formula: "P = 2·S·E·W·t / (D − 2·Y·t), t = t_nom·(1 − tol) − c", value: `${mawp.toFixed(3)} MPa` });
  }
  let suggested: PipeResult["suggested"] = null;
  const size = PIPES.find((p) => p.nps === i.nps);
  if (size) {
    const opts = SCHEDULES.map((s) => ({ sch: s, w: (size.w[s] || 0) * 25.4 })).filter((x) => x.w > 0).sort((a, b) => a.w - b.w);
    suggested = opts.find((x) => x.w >= tNomMin - 1e-9) || null;
    if (!suggested) warnings.push(`No listed schedule up to 160 is thick enough for NPS ${i.nps}; consider XXS or a higher material grade.`);
  }
  return { Y, t, tm, tNomMin, mawp, ok, suggested, steps, warnings };
}
