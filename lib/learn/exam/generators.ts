/** Randomised calculation questions with worked answers — exam-style practice for API 510/570 topics. */
import type { Mcq } from "../codes-types";
export type GenQ = Mcq & { topic: string; gen: string };
export type Gen = { key: string; name: string; topic: string; tracks: ("510" | "570")[]; make: (r: () => number) => GenQ };

const pick = <T,>(r: () => number, a: T[]) => a[Math.floor(r() * a.length)];
const rnd = (r: () => number, lo: number, hi: number, step = 1) => Math.round((lo + r() * (hi - lo)) / step) * step;
const f = (n: number, d = 2) => n.toFixed(d);
/** Correct answer plus distractors, shuffled, de-duplicated. */
function opts(r: () => number, right: string, wrong: string[]): { options: string[]; answer: number } {
  const w = [...new Set(wrong.filter((x) => x !== right))].slice(0, 3);
  const m = right.match(/^([\d.\-]+)(.*)$/); const dec = m ? (m[1].split(".")[1] || "").length : 0;
  let k = 0; while (w.length < 3 && m && k < 10) { const v = `${(parseFloat(m[1]) * [1.25, 0.8, 1.5, 0.6, 2, 0.5, 1.1, 0.9, 3, 0.4][k]).toFixed(dec)}${m[2]}`; if (v !== right && !w.includes(v)) w.push(v); k++; }
  const all = [right, ...w]; for (let i = all.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [all[i], all[j]] = [all[j], all[i]]; }
  return { options: all, answer: all.indexOf(right) };
}

export const GENS: Gen[] = [
  { key: "cr-rl", name: "Corrosion rate & remaining life", topic: "Corrosion rate and remaining life", tracks: ["510", "570"], make: (r) => {
    const t0 = rnd(r, 10, 20, 0.5), y1 = rnd(r, 6, 12), y2 = rnd(r, 2, 5), lossL = rnd(r, 8, 30) / 10, lossS = rnd(r, 3, 12) / 10;
    const tp = +(t0 - lossL).toFixed(1), tn = +(tp - lossS).toFixed(1), treq = +(tn - rnd(r, 15, 50) / 10).toFixed(1);
    const lt = (t0 - tn) / (y1 + y2), st = (tp - tn) / y2, cr = Math.max(lt, st), rl = (tn - treq) / cr;
    const o = opts(r, `${f(rl, 1)} years`, [`${f((tn - treq) / Math.min(lt, st), 1)} years`, `${f(tn / cr, 1)} years`, `${f((t0 - treq) / cr, 1)} years`]);
    return { gen: "cr-rl", topic: "Corrosion rate and remaining life", q: `A CML read ${t0} mm originally, ${tp} mm ${y1} years later and ${tn} mm after another ${y2} years. t_required is ${treq} mm. Using the governing (higher) corrosion rate, what is the remaining life?`, ...o, why: `Long-term = (${t0} − ${tn}) ÷ ${y1 + y2} = ${f(lt, 3)} mm/y. Short-term = (${tp} − ${tn}) ÷ ${y2} = ${f(st, 3)} mm/y. Governing ${f(cr, 3)} mm/y. RL = (${tn} − ${treq}) ÷ ${f(cr, 3)} = ${f(rl, 1)} years.` }; } },
  { key: "i510", name: "API 510 inspection interval", topic: "Inspection intervals", tracks: ["510"], make: (r) => {
    const rl = pick(r, [1.5, 2.5, 3, 3.5, 6, 9, 14, 18, 24, 30]); const iv = rl < 4 ? Math.min(rl, 2) : Math.min(rl / 2, 10);
    const o = opts(r, `${f(iv, 1)} years`, [`${f(rl / 2, 1)} years`, `${f(Math.min(rl, 10), 1)} years`, "10.0 years", "5.0 years"]);
    return { gen: "i510", topic: "Inspection intervals", q: `A vessel has a remaining life of ${rl} years. Without RBI, what is the maximum internal/on-stream inspection interval under API 510?`, ...o, why: rl < 4 ? `Remaining life under 4 years: the interval may be the full remaining life up to 2 years → ${f(iv, 1)} years.` : `Lesser of half the remaining life (${f(rl / 2, 1)}) and 10 years → ${f(iv, 1)} years.` }; } },
  { key: "i570", name: "API 570 thickness interval by class", topic: "Inspection intervals", tracks: ["570"], make: (r) => {
    const cls = pick(r, [1, 2, 3]); const rl = pick(r, [4, 8, 12, 16, 22, 30]); const cap = cls === 1 ? 5 : 10; const iv = Math.min(rl / 2, cap);
    const o = opts(r, `${f(iv, 1)} years`, [`${f(rl / 2, 1)} years`, `${cap}.0 years`, `${f(Math.min(rl / 2, cls === 1 ? 10 : 5), 1)} years`, "3.0 years"]);
    return { gen: "i570", topic: "Inspection intervals", q: `A Class ${cls} piping circuit has a remaining life of ${rl} years. What is the maximum thickness-measurement interval (no RBI)?`, ...o, why: `Lesser of half the remaining life (${f(rl / 2, 1)}) and the Class ${cls} maximum of ${cap} years (API 570 Table 2) → ${f(iv, 1)} years.` }; } },
  { key: "ug27", name: "Shell required thickness (UG-27)", topic: "MAWP and required thickness", tracks: ["510"], make: (r) => {
    const P = rnd(r, 8, 40) / 10, D = rnd(r, 800, 3000, 50), S = pick(r, [118, 138, 149]), E = pick(r, [1, 0.85, 0.7]); const R = D / 2; const t = (P * R) / (S * E - 0.6 * P);
    const o = opts(r, `${f(t)} mm`, [`${f((P * D) / (S * E - 0.6 * P))} mm`, `${f((P * R) / (S - 0.6 * P))} mm`, `${f((P * R) / (2 * S * E + 0.4 * P))} mm`]);
    return { gen: "ug27", topic: "MAWP and required thickness", q: `Cylindrical shell: P = ${f(P, 1)} MPa, inside radius R = ${R} mm (corroded), S = ${S} MPa, E = ${E}. Required thickness for circumferential stress (ASME VIII-1 UG-27(c)(1))?`, ...o, why: `t = P·R ÷ (S·E − 0.6·P) = ${f(P, 1)} × ${R} ÷ (${S} × ${E} − 0.6 × ${f(P, 1)}) = ${f(t)} mm. Common mistakes: using the diameter instead of the radius, or forgetting E.` }; } },
  { key: "mawp", name: "MAWP for continued service", topic: "MAWP and required thickness", tracks: ["510"], make: (r) => {
    const tn = rnd(r, 10, 25, 0.5), cr = rnd(r, 5, 30) / 100, iv = pick(r, [4, 5, 6, 8]), R = rnd(r, 500, 1500, 25), S = pick(r, [118, 138]), E = pick(r, [1, 0.85]);
    const t = tn - 2 * cr * iv, P = (S * E * t) / (R + 0.6 * t);
    const o = opts(r, `${f(P, 2)} MPa`, [`${f((S * E * (tn - cr * iv)) / (R + 0.6 * (tn - cr * iv)), 2)} MPa`, `${f((S * E * tn) / (R + 0.6 * tn), 2)} MPa`, `${f((S * E * t) / (R - 0.6 * t), 2)} MPa`]);
    return { gen: "mawp", topic: "MAWP and required thickness", q: `Shell: measured thickness ${tn} mm, corrosion rate ${f(cr, 2)} mm/y, next inspection in ${iv} years, R = ${R} mm, S = ${S} MPa, E = ${E}. What MAWP can be used until the next inspection (API 510 §7.3 with UG-27)?`, ...o, why: `Thickness to use = ${tn} − 2 × ${f(cr, 2)} × ${iv} = ${f(t)} mm. MAWP = S·E·t ÷ (R + 0.6·t) = ${f(P, 2)} MPa.` }; } },
  { key: "hydro", name: "Hydrotest pressure (UG-99 / B31.3)", topic: "Pressure testing", tracks: ["510", "570"], make: (r) => {
    const v = r() < 0.5; const P = rnd(r, 5, 60) / 10, ST = pick(r, [138, 138, 118]), S = pick(r, [138, 121, 108, 96]);
    const pt = v ? 1.3 * P * (ST / S) : 1.5 * P * Math.min(ST / S, 6.5);
    const o = opts(r, `${f(pt, 2)} MPa`, [`${f((v ? 1.5 : 1.3) * P * (ST / S), 2)} MPa`, `${f((v ? 1.3 : 1.5) * P, 2)} MPa`, `${f((v ? 1.3 : 1.5) * P * (S / ST), 2)} MPa`]);
    return { gen: "hydro", topic: "Pressure testing", q: v ? `Vessel MAWP ${f(P, 1)} MPa. Allowable stress at test temperature ${ST} MPa, at design temperature ${S} MPa. Minimum hydrostatic test pressure per ASME VIII-1 UG-99(b)?` : `Piping design pressure ${f(P, 1)} MPa. S at test temperature ${ST} MPa, at design temperature ${S} MPa. Minimum hydrotest pressure per ASME B31.3 345.4.2?`, ...o, why: v ? `P_T = 1.3 × MAWP × (S_test ÷ S_design) = 1.3 × ${f(P, 1)} × ${ST}/${S} = ${f(pt, 2)} MPa.` : `P_T = 1.5 × P × (S_T ÷ S), ratio ≤ 6.5 = 1.5 × ${f(P, 1)} × ${ST}/${S} = ${f(pt, 2)} MPa.` }; } },
  { key: "b313", name: "Pipe pressure design thickness (B31.3)", topic: "MAWP and required thickness", tracks: ["570"], make: (r) => {
    const P = rnd(r, 10, 60) / 10, Dn = pick(r, [60.3, 88.9, 114.3, 168.3, 219.1, 273.1]), S = pick(r, [138, 118]), E = pick(r, [1, 0.85]), Y = 0.4;
    const t = (P * Dn) / (2 * (S * E + P * Y));
    const o = opts(r, `${f(t)} mm`, [`${f((P * Dn) / (2 * S * E), 2)} mm`, `${f((P * Dn) / (S * E + P * Y), 2)} mm`, `${f((P * (Dn / 2)) / (S * E - 0.6 * P), 2)} mm`]);
    return { gen: "b313", topic: "MAWP and required thickness", q: `Straight pipe, OD ${Dn} mm, P = ${f(P, 1)} MPa, S = ${S} MPa, E = ${E}, W = 1, Y = 0.4. Pressure design thickness t (B31.3 304.1.2)?`, ...o, why: `t = P·D ÷ [2(S·E·W + P·Y)] = ${f(P, 1)} × ${Dn} ÷ [2 × (${S} × ${E} + ${f(P, 1)} × 0.4)] = ${f(t)} mm (before corrosion allowance and mill tolerance).` }; } },
  { key: "rsf", name: "Reduced MAWP from RSF (API 579)", topic: "Fitness-for-service", tracks: ["510", "570"], make: (r) => {
    const rsf = rnd(r, 70, 89) / 100, M = rnd(r, 10, 60); const mr = (M * rsf) / 0.9;
    const o = opts(r, `${f(mr, 1)} bar`, [`${f(M * rsf, 1)} bar`, `${f(M * 0.9 / rsf, 1)} bar`, `${f(M, 1)} bar`]);
    return { gen: "rsf", topic: "Fitness-for-service", q: `An LTA assessment gives RSF = ${f(rsf)}. MAWP is ${M} bar and RSFa = 0.90. What is MAWPr?`, ...o, why: `RSF < RSFa, so MAWPr = MAWP × RSF ÷ RSFa = ${M} × ${f(rsf)} ÷ 0.90 = ${f(mr, 1)} bar.` }; } },
  { key: "avg", name: "API 510 averaging length", topic: "Metal loss assessment", tracks: ["510"], make: (r) => {
    const D = pick(r, [600, 900, 1200, 1500, 1800, 2400, 3600]); const L = D <= 1500 ? Math.min(D / 2, 500) : Math.min(D / 3, 1000);
    const o = opts(r, `${f(L, 0)} mm`, [`${f(D / 2, 0)} mm`, `${f(Math.min(D / 3, 1000), 0)} mm`, `${f(Math.min(D / 2, 1000), 0)} mm`]);
    return { gen: "avg", topic: "Metal loss assessment", q: `Vessel inside diameter ${D} mm. What is the maximum length over which corroded-area thickness may be averaged (API 510 §7.4)?`, ...o, why: D <= 1500 ? `ID ≤ 1,500 mm: lesser of D/2 (${D / 2}) and 500 mm → ${f(L, 0)} mm.` : `ID > 1,500 mm: lesser of D/3 (${f(D / 3, 0)}) and 1,000 mm → ${f(L, 0)} mm.` }; } },
  { key: "soil", name: "Buried piping interval", topic: "Buried piping", tracks: ["570"], make: (r) => {
    const s = pick(r, [800, 1500, 3000, 6000, 9000, 15000, 25000]); const y = s < 2000 ? 5 : s <= 10000 ? 10 : 15;
    const o = opts(r, `${y} years`, ["5 years", "10 years", "15 years", "3 years"]);
    return { gen: "soil", topic: "Buried piping", q: `Buried piping without effective cathodic protection; soil resistivity ${s.toLocaleString("en-IN")} Ω·cm. Inspection interval (API 570 Table 5)?`, ...o, why: "< 2,000 Ω·cm → 5 y; 2,000–10,000 → 10 y; > 10,000 → 15 y." }; } },
  { key: "ug", name: "Radiographic unsharpness", topic: "NDE methods", tracks: ["510", "570"], make: (r) => {
    const F = pick(r, [2, 2.5, 3, 3.5, 4]), D = rnd(r, 300, 900, 50), d = rnd(r, 10, 60); const ug = (F * d) / D;
    const o = opts(r, `${f(ug, 3)} mm`, [`${f((F * D) / d, 3)} mm`, `${f((d * D) / (F * 1000), 3)} mm`, `${f(F / D, 3)} mm`]);
    return { gen: "ug", topic: "NDE methods", q: `Source size ${F} mm, source-to-object distance ${D} mm, object-to-film distance ${d} mm. Geometric unsharpness Ug?`, ...o, why: `Ug = F·d ÷ D = ${F} × ${d} ÷ ${D} = ${f(ug, 3)} mm.` }; } },
  { key: "cr-units", name: "Corrosion rate in mpy", topic: "Corrosion rate and remaining life", tracks: ["510", "570"], make: (r) => {
    const loss = rnd(r, 5, 40) / 10, y = rnd(r, 3, 12); const mmy = loss / y, mpy = (mmy / 0.0254);
    const o = opts(r, `${f(mpy, 1)} mpy`, [`${f(mmy * 25.4, 1)} mpy`, `${f(mmy, 1)} mpy`, `${f(mpy / 10, 1)} mpy`]);
    return { gen: "cr-units", topic: "Corrosion rate and remaining life", q: `Wall loss of ${f(loss, 1)} mm over ${y} years. What is the corrosion rate in mils per year (1 mil = 0.0254 mm)?`, ...o, why: `${f(loss, 1)} ÷ ${y} = ${f(mmy, 3)} mm/y ÷ 0.0254 = ${f(mpy, 1)} mpy.` }; } },
];

/** Small seeded RNG so a mock exam can be reproduced. */
export function rng(seed: number) { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
