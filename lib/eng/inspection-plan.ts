/**
 * End-to-end inspection plan for a pressure vessel or a piping circuit, built from the answers to
 * standard questions. Logic follows API 510 / 570 / 574 / 571 / 576 / 580 / 579-1 and ASME V as
 * summarised in NumSum's study modules. It drafts a plan for an inspector/engineer to review.
 */
import { DM_FFS, DM_GRP, DM_MAT, screenAll, type DmEntry, type DmX } from "./damage-mechanisms";
import { remainingLife, type Code, type Reading } from "./remaining-life";
import { vessel } from "./vessel";
import { pipeThickness } from "./pipe";

export type Kind = "vessel" | "piping";
export type Fluid = "light-hc" | "hc" | "h2" | "toxic" | "utility";
export type PlanInput = {
  tag: string; desc: string; site: string; preparedBy: string; date: string;
  kind: Kind; code: string; P: number; Tdes: number; D: number; tNom: number; CA: number; S: number; E: number;
  mat: string; year: number; tmax: number; tmin: number; answers: DmX;
  fluid: Fluid; inventory: "small" | "medium" | "large"; nearPeople: boolean; pipeClass: 0 | 1 | 2 | 3 | 4;
  injection: boolean; deadleg: boolean; sbp: boolean; buried: boolean; soilRes: number; cp: boolean;
  prd: boolean; prdService: "clean" | "typical" | "fouling";
  readings: Reading[]; tReqOverride: number | null;
  lastInternal: string; lastExternal: string; lastPrd: string; lastCui: string;
};

export type Task = { area: string; task: string; method: string; ref: string; coverage: string; interval: string; due: string; accept: string; why: string };
export type Plan = {
  input: PlanInput; tReq: number; tReqBasis: string; rl: ReturnType<typeof remainingLife> | null; intervalYears: number | null; mawpNext: number | null;
  likely: DmEntry[]; possible: DmEntry[]; open: number; pof: number; cof: string; risk: string; riskWhy: string[];
  onStreamOk: { ok: boolean; reasons: string[] } | null; pipeClass: number; tasks: Task[]; iows: string[]; ffs: string[]; docs: string[]; notes: string[];
};

const addYears = (iso: string, y: number) => { const t = Date.parse(iso); if (!Number.isFinite(t)) return "—"; return new Date(t + y * 365.25 * 864e5).toISOString().slice(0, 10); };
const today = () => new Date().toISOString().slice(0, 10);
export const suggestClass = (f: Fluid): 1 | 2 | 3 => (f === "light-hc" || f === "toxic" ? 1 : f === "hc" || f === "h2" ? 2 : 3);
const CRACK = new Set(["eac"]);

export function buildPlan(i: PlanInput): Plan {
  const notes: string[] = []; const tasks: Task[] = [];
  const isV = i.kind === "vessel"; const MPa = i.P / 10;
  // 1. Required thickness
  let tReq: number; let tReqBasis: string;
  if (i.tReqOverride && i.tReqOverride > 0) { tReq = i.tReqOverride; tReqBasis = "Entered by user (design calculation)"; }
  else if (isV) { tReq = vessel({ part: "shell", P: MPa, D: i.D, S: i.S, E: i.E, CA: 0 }).tReq; tReqBasis = "Cylindrical shell, ASME VIII-1 UG-27 (internal pressure only, uncorroded radius)"; }
  else { const austen = i.mat === "SS3" || i.mat === "DSS" || i.mat === "NI"; tReq = pipeThickness({ P: MPa, D: i.D, S: i.S, E: i.E, W: 1, T: i.Tdes, mat: austen ? "austenitic" : "ferritic", c: 0, millTol: 0 }).t; tReqBasis = "Pressure design thickness, ASME B31.3 304.1.2 — also check the structural minimum (API 574 §12)"; }
  // 2. Piping class
  const pipeClass = isV ? 0 : i.pipeClass || suggestClass(i.fluid);
  const code: Code = isV ? "api510" : pipeClass === 1 ? "api570c1" : pipeClass === 2 ? "api570c2" : "api570c3";
  // 3. Corrosion and remaining life
  const rs = [...i.readings].filter((r) => r.date && r.t > 0).sort((a, b) => a.date.localeCompare(b.date));
  let rl: Plan["rl"] = null; let intervalYears: number | null = null; let mawpNext: number | null = null;
  if (rs.length >= 2) {
    rl = remainingLife({ code, tReq, initial: rs[0], previous: rs.length > 2 ? rs[rs.length - 2] : null, latest: rs[rs.length - 1], extra: rs.slice(1, -2) });
    const r = rl.rl ?? 0; const cap = isV ? 10 : pipeClass === 1 ? 5 : 10;
    intervalYears = r <= 0 ? 0 : isV && r < 4 ? Math.min(r, 2) : Math.min(r / 2, cap);
    if (isV) { const tNext = rs[rs.length - 1].t - 2 * rl.cr * intervalYears; mawpNext = tNext > 0 ? (vessel({ part: "shell", P: MPa, D: i.D, S: i.S, E: i.E, CA: 0, tNom: tNext, underTol: 0 }).mawpCorroded ?? 0) * 10 : 0; }
    notes.push(...rl.notes);
  } else notes.push("Fewer than two dated thickness readings: corrosion rate cannot be calculated. Take baseline readings at all CMLs now and set a provisional interval from similar service (API 510 §7.1.2 / API 570 §7.1.2).");
  // 4. Damage mechanisms
  const sc = screenAll({ ...i.answers, mat: i.mat, tmax: i.tmax, tmin: i.tmin, year: i.year });
  const likely = sc.yes.map((r) => r.d); const possible = sc.maybe.map((r) => r.d);
  // 5. Qualitative risk (API 580 principles)
  const r = rl?.rl ?? null; let pof = r === null ? 3 : r <= 2 ? 5 : r < 5 ? 4 : r < 10 ? 3 : r < 20 ? 2 : 1;
  const riskWhy: string[] = [r === null ? "No corrosion rate yet — probability set to medium (3)." : `Remaining life ${r.toFixed(1)} years → base probability ${pof}.`];
  if (likely.some((d) => CRACK.has(d.g) || d.rbi === "scc" || d.rbi === "htha" || d.rbi === "brit")) { pof = Math.min(5, pof + 1); riskWhy.push("Cracking, HTHA or brittle-fracture mechanism likely → probability +1."); }
  let c = i.fluid === "light-hc" || i.fluid === "toxic" ? 3 : i.fluid === "hc" || i.fluid === "h2" ? 2 : 0;
  if (i.inventory === "large") c += 1; if (i.inventory === "small") c -= 1; if (i.nearPeople) c += 1; c = Math.max(0, Math.min(4, c));
  riskWhy.push(`Fluid ${i.fluid}, ${i.inventory} inventory${i.nearPeople ? ", near people/high-activity area" : ""} → consequence ${"ABCDE"[c]}.`);
  const s = pof + c; const risk = s <= 4 ? "Low" : s <= 6 ? "Medium" : s <= 8 ? "Medium-high" : "High";
  // 6. On-stream in lieu of internal (API 510 §6.5.2)
  const onStreamOk = isV ? (() => { const reasons: string[] = []; const crk = likely.some((d) => d.g === "eac" || d.rbi === "scc" || d.rbi === "htha");
    if (!rl) reasons.push("no corrosion rate yet"); else { if (rl.cr >= 0.125) reasons.push("general corrosion rate is 0.125 mm/y or more"); if ((rl.rl ?? 0) <= 10) reasons.push("remaining life is 10 years or less"); }
    if (crk) reasons.push("environmental cracking or hydrogen damage is credible"); if (new Date().getFullYear() - i.year < 5) reasons.push("less than 5 years of known service history");
    if (i.tmax > 370 && (i.mat === "CS" || i.mat === "LAS")) reasons.push("operating temperature may be in or near the creep range");
    return { ok: reasons.length === 0, reasons }; })() : null;
  // 7. Tasks
  const base = rs.length ? rs[rs.length - 1].date : today();
  const due = (last: string, y: number) => addYears(last || base, y);
  const ivTxt = intervalYears === null ? "Provisional — set after baseline" : intervalYears === 0 ? "Immediately" : `${intervalYears.toFixed(1)} y`;
  const ivDue = intervalYears === null ? "Baseline now" : due(isV ? i.lastInternal || base : base, intervalYears);
  if (isV) {
    const ext = Math.min(5, intervalYears || 5);
    tasks.push({ area: "Whole vessel", task: "External visual inspection", method: "VT — shell, heads, nozzles, supports, skirt, anchor bolts, insulation/jacketing, coating, grounding, ladders/platforms", ref: "API 510 §6.4; ASME V Art 9; API 572", coverage: "100% accessible external surface", interval: `${ext.toFixed(1)} y`, due: due(i.lastExternal, ext), accept: "No leaks, distortion, coating breakdown or damaged insulation; findings evaluated by the inspector", why: "API 510 requires an external visual inspection at least every 5 years, or at the internal interval if shorter." });
    tasks.push({ area: "Pressure boundary", task: onStreamOk?.ok ? "Internal or on-stream inspection (on-stream permitted)" : "Internal inspection", method: onStreamOk?.ok ? "On-stream: UT thickness grid / scanning at CMLs + targeted NDE for listed mechanisms" : "Internal VT of all surfaces + UT at CMLs + targeted NDE for listed mechanisms", ref: "API 510 §6.5; ASME V Art 4/5/9", coverage: "All CMLs; 100% internal visual; NDE coverage per mechanism below", interval: ivTxt, due: ivDue, accept: "t ≥ t_required at next inspection; MAWP maintained; flaws to API 579-1", why: onStreamOk?.ok ? "Conditions of API 510 §6.5.2 appear to be met, so on-stream inspection may replace internal inspection." : `Internal inspection required${onStreamOk?.reasons.length ? ` — on-stream not permitted because ${onStreamOk.reasons.join("; ")}` : ""}.` });
    tasks.push({ area: "CMLs", task: "Thickness measurement at condition monitoring locations", method: "UT thickness (A-scan with calibrated probe); scanning UT / grids where corrosion is local", ref: "API 510 §5.6–5.7; ASME V Art 5", coverage: "Each shell course and head, each nozzle, liquid level, inlet impingement, low points, stagnant zones", interval: ivTxt, due: ivDue, accept: `t ≥ ${tReq.toFixed(2)} mm (t_required) after projecting corrosion to the next inspection`, why: "Corrosion rates and remaining life come from repeat readings at the same CMLs." });
  } else {
    const extY = pipeClass === 3 ? 10 : pipeClass === 4 ? 10 : 5;
    tasks.push({ area: "Circuit", task: "External visual inspection", method: "VT — leaks, supports, coating, insulation, vibration, misalignment, S/A interface, bolting", ref: "API 570 §6.3 Table 2; ASME V Art 9; API 574 App A", coverage: "Whole circuit", interval: pipeClass === 4 ? "Optional" : `${extY} y`, due: pipeClass === 4 ? "—" : due(i.lastExternal, extY), accept: "No leaks, damaged insulation, failed supports or coating breakdown", why: `Class ${pipeClass} external visual interval per API 570 Table 2.` });
    tasks.push({ area: "CMLs", task: "Thickness measurement", method: "UT at CMLs; profile RT for small bore and insulated lines; UT grids on elbows (extrados)", ref: "API 570 §5.6–5.7, §6.3; API 574 §10; ASME V Art 2/5", coverage: `CMLs per circuit sketch; more for Class ${pipeClass === 1 ? "1 and" : ""} local corrosion`, interval: ivTxt, due: ivDue, accept: `t ≥ ${tReq.toFixed(2)} mm (pressure) and ≥ structural minimum`, why: `Half the remaining life, capped at ${pipeClass === 1 ? 5 : 10} years for Class ${pipeClass}.` });
    if (i.injection) tasks.push({ area: "Injection point", task: "Injection point circuit inspection", method: "UT grid / profile RT from ≥ 300 mm (3D) upstream to 2nd change of direction downstream (max 7.6 m past the first)", ref: "API 570 §5.5.9; Table 2", coverage: "Whole injection-point circuit", interval: "3 y", due: due(base, 3), accept: "t ≥ t_required; no local attack", why: "Injection points are separate circuits with a 3-year default thickness interval." });
    if (i.deadleg) tasks.push({ area: "Deadlegs", task: "Deadleg inspection", method: "UT / profile RT at the low point and at the connection to the active line", ref: "API 570 §5.4.2(b), §6.6; API 574 §7", coverage: "Each deadleg", interval: ivTxt, due: ivDue, accept: "t ≥ t_required", why: "Stagnant sections corrode differently from the main line." });
    if (i.sbp) tasks.push({ area: "Small-bore & threaded", task: "Small-bore piping and threaded connections", method: "VT for vibration/support; UT or profile RT; consider replacement of threaded joints in critical service", ref: "API 570 §6.6; API 574 §5", coverage: pipeClass === 1 ? "All primary SBP (Class 1)" : "Primary SBP as selected", interval: ivTxt, due: ivDue, accept: "No cracking, leaks or excessive thinning", why: "Vibration fatigue and thread corrosion often cause small-bore failures." });
    if (i.buried) { const y = i.cp ? 0 : i.soilRes < 2000 ? 5 : i.soilRes <= 10000 ? 10 : 15; tasks.push({ area: "Buried section", task: "Buried piping inspection", method: "Above-grade surveillance, CP survey, coating holiday survey, guided wave, excavation at selected points; S/A interface UT", ref: "API 570 §9; Table 5", coverage: "Buried length + soil-to-air interface (300 mm below to 150 mm above grade)", interval: y ? `${y} y` : "Per CP survey programme", due: y ? due(base, y) : "Per CP programme", accept: "Adequate CP potentials; no coating defects with metal loss below t_required", why: i.cp ? "With effective cathodic protection, intervals follow the CP monitoring programme." : `Without effective CP, soil resistivity ${i.soilRes} Ω·cm sets a ${y}-year interval.` }); }
  }
  const cuiSus = i.answers.insul && ((["CS", "LAS"].includes(i.mat) && i.tmax >= -12 && i.tmin <= 175) || (["SS3", "DSS"].includes(i.mat) && i.tmax >= 50 && i.tmin <= 175));
  if (cuiSus) tasks.push({ area: "Insulated surfaces", task: i.mat === "SS3" || i.mat === "DSS" ? "External chloride SCC under insulation" : "Corrosion under insulation (CUI)", method: i.mat === "SS3" || i.mat === "DSS" ? "Remove insulation at suspect areas; PT / ECT for cracking" : "Screen (PEC, profile RT, IR for wet insulation) then strip and UT at indications", ref: isV ? "API 510 §5.5.6; API 571 §3.22" : "API 570 §6.4 Table 3; API 571 §3.22", coverage: isV ? "Damaged jacketing, penetrations, support rings, low points, skirt" : pipeClass === 1 ? "≈75% of damaged-insulation areas, ≈50% of suspect areas" : pipeClass === 2 ? "≈50% / ≈33%" : "≈25% / ≈10%", interval: isV ? "With external inspection" : "With external inspection", due: isV ? due(i.lastCui || i.lastExternal, Math.min(5, intervalYears || 5)) : due(i.lastCui || i.lastExternal, pipeClass === 3 ? 10 : 5), accept: "No metal loss below t_required; repair insulation/coating", why: "Insulated equipment in the susceptible temperature range." });
  for (const d of [...likely, ...possible]) {
    if (cuiSus && d.api === "3.22") continue;
    const L = likely.includes(d);
    tasks.push({ area: DM_GRP[d.g] || "Damage mechanism", task: `${L ? "" : "(possible) "}${d.n} — API 571 §${d.api}`, method: d.find, ref: `API 571 §${d.api}; ASME V (method article)`, coverage: d.who, interval: d.rbi === "ext" ? "With external inspection" : "With internal / on-stream inspection", due: d.rbi === "ext" ? "As external" : ivDue, accept: `Evaluate findings to ${DM_FFS[d.ffs] || "API 579-1"}`, why: L ? "All critical factors present." : "Depends on details — confirm conditions, then keep or drop." });
  }
  if (i.prd) { const y = i.prdService === "clean" ? 10 : i.prdService === "fouling" ? 3 : 5; tasks.push({ area: "Overpressure protection", task: "Pressure-relief device test and inspection", method: "Bench test (pop / set pressure, seat tightness), visual of inlet/outlet lines, overhaul as needed", ref: `${isV ? "API 510 §6.6" : "API 570 §6.7"}; API 576`, coverage: "Each PRD protecting this item", interval: `${y} y`, due: due(i.lastPrd, y), accept: "Opens within set-pressure tolerance; tight; inlet/outlet clear", why: i.prdService === "fouling" ? "Fouling/corrosive service — shorter than the 5-year typical maximum; adjust from test history." : `Typical maximum ${y} years in ${i.prdService} service; shorten if found stuck or fouled.` }); }
  tasks.push({ area: "After repair / alteration", task: "Pressure test (when required)", method: "Hydrostatic test per construction code; pneumatic only with precautions", ref: isV ? "API 510 §5.8; ASME VIII-1 UG-99" : "API 570 §5.8; ASME B31.3 345", coverage: "Repaired/altered parts as decided by the inspector", interval: "Event-driven", due: "When triggered", accept: "No leakage or distortion", why: "Not a routine inspection — needed after certain repairs, alterations and reratings." });
  // 8. IOWs, FFS triggers, documents
  const iows = [...new Set([...likely, ...possible].map((d) => `${d.n}: ${d.stop}`))].slice(0, 12);
  const ffs = [`Wall below ${tReq.toFixed(2)} mm (t_required) → API 579-1 Part 4 (general) or Part 5 (local) before continued service.`, "Pitting → Part 6; blisters / HIC → Part 7; distortion → Part 8; crack-like indications → Part 9; fire exposure → Part 11; dents/gouges → Part 12."];
  if (rl && (rl.rl ?? 0) <= 0) ffs.unshift("Latest reading is already at or below t_required — FFS assessment or repair is required NOW.");
  const docs = [isV ? "API 510 (in-service inspection of pressure vessels)" : "API 570 (in-service inspection of piping)", ...(isV ? ["API 572 (vessel inspection practices)"] : ["API 574 (piping inspection practices)"]), "API 571 (damage mechanisms)", "API 580 / API 581 (risk-based inspection)", "API 579-1/ASME FFS-1 (fitness-for-service)", ...(i.prd ? ["API 576 (pressure-relieving devices)"] : []), "ASME Section V (NDE methods)", `${i.code} (construction code)`, "ASME Section II (materials, for repairs)", "Owner/user inspection procedures and IOW register"];
  if (likely.length + possible.length === 0) notes.push("No damage mechanism flagged — answer the service questions; ‘not sure’ answers leave mechanisms open.");
  if (sc.open.length) notes.push(`${sc.open.length} mechanisms could not be screened because some answers are ‘not sure’ — answer them to complete the review.`);
  return { input: i, tReq, tReqBasis, rl, intervalYears, mawpNext, likely, possible, open: sc.open.length, pof, cof: "ABCDE"[c], risk, riskWhy, onStreamOk, pipeClass, tasks, iows, ffs, docs, notes };
}
export const matName = (k: string) => DM_MAT[k] || k;
