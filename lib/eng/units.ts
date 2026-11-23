/** Unit helpers for the engineering calculators. Internally: pressure MPa (gauge), length mm, temperature °C. */
export type PUnit = "barg" | "MPa" | "kgcm2" | "psig";
export const P_UNITS: Record<PUnit, { label: string; toMPa: number }> = {
  barg: { label: "bar g", toMPa: 0.1 },
  MPa: { label: "MPa g", toMPa: 1 },
  kgcm2: { label: "kg/cm² g", toMPa: 0.0980665 },
  psig: { label: "psi g", toMPa: 0.00689476 },
};
export const toMPa = (v: number, u: PUnit) => v * P_UNITS[u].toMPa;
export const fromMPa = (v: number, u: PUnit) => v / P_UNITS[u].toMPa;

export type SUnit = "MPa" | "psi" | "kgcm2";
export const S_UNITS: Record<SUnit, { label: string; toMPa: number }> = { MPa: { label: "MPa", toMPa: 1 }, psi: { label: "psi", toMPa: 0.00689476 }, kgcm2: { label: "kg/cm²", toMPa: 0.0980665 } };

export type LUnit = "mm" | "in";
export const toMm = (v: number, u: LUnit) => (u === "in" ? v * 25.4 : v);
export const fromMm = (v: number, u: LUnit) => (u === "in" ? v / 25.4 : v);

export const fmt = (x: number | null | undefined, d = 2) => (x === null || x === undefined || !Number.isFinite(x) ? "—" : x.toLocaleString("en-IN", { maximumFractionDigits: d, minimumFractionDigits: d }));
