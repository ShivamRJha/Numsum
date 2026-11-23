/**
 * Steam trap loss — Napier's formula (as used in UNFCCC methodology AM0017):
 *   full-orifice flow W [lb/h] = 24.24 × P [psia] × D² [in²]; × loss factor for the trap's condition.
 */
export const TRAP_STATES = [
  { k: "blow", label: "Blowing through (failed open)", f: 1.0 },
  { k: "leak", label: "Leaking", f: 0.25 },
  { k: "rapid", label: "Rapid cycling", f: 0.2 },
  { k: "passing", label: "Bypass / isolation valve passing", f: 0.25 },
  { k: "ok", label: "Working / plugged (no loss)", f: 0 },
] as const;
export const ORIFICES: Record<string, number> = { '1/4"': 2.5, '1/2"': 3.5, '3/4"': 4.5, '1"': 6, '1-1/2"': 8, '2"': 10 };

export type SteamInput = { pBarg: number; orificeMm: number; factor: number; hours: number; costPerTonne: number; co2PerTonne: number; count: number };
export function steamLoss(i: SteamInput) {
  const psia = (i.pBarg + 1.01325) * 14.5038, din = i.orificeMm / 25.4;
  const fullLbh = 24.24 * psia * din * din, fullKgh = fullLbh * 0.453592;
  const kgh = fullKgh * i.factor * i.count;
  const tpy = (kgh * i.hours) / 1000;
  return { psia, din, fullLbh, fullKgh, kgh, tpy, cost: tpy * i.costPerTonne, co2: tpy * i.co2PerTonne };
}
