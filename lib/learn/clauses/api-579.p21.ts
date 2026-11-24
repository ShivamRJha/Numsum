// API 579-1 clause guide, part 21: Annex 9E — Crack opening areas.
import type { ClauseRow } from "./types";

const TW = "For uniform and linear through-wall stress (σ0, σ1 per Annex 9B): COA = (H0σ0 + H1σ1)·π c²/E, also written in membrane and bending terms.";

export const P21: ClauseRow[] = [
  ["9E", "Annex 9E — Crack opening areas", ""],
  ["9E.1", "Introduction", ""],
  ["9E.1.1", "Scope", "Elastic and plastic crack opening area (COA) equations for cylinders and spheres under membrane and/or bending stress, based on WRC 478, with alternative methods referenced."],
  ["9E.1.2", "Overview of COA calculations", ""],
  ["9E.1.2.1", "Location assumption", "Solutions assume cracks in an infinite body away from discontinuities; near major discontinuities (e.g., nozzle intersections) local stresses matter, but the solutions may be used if membrane and bending stresses come from a model including the discontinuity."],
  ["9E.1.2.2", "Material properties", "Use mean properties for a best estimate, reflecting expected condition and time-dependent changes (degradation, relaxation, redistribution); weld property variation, preparation angle and residual stress may affect COA."],
  ["9E.1.2.3", "Through-wall bending", "Bending causes crack face rotation reducing COA; complete closure means LBB can't be justified. Thick shells and discontinuities or thermal gradients cause such bending; computing COA at inside and outside surfaces gives the crack taper, unlike mid-surface models."],
  ["9E.1.2.4", "Welding residual stress", "Evaluate their effect on crack face rotation."],
  ["9E.1.2.5", "Bending moment orientation", "In cylinders, the net-section moment direction can cause asymmetric opening, partial closure, or full closure if the crack lies wholly on the compressive side."],
  ["9E.2", "COA for cylinders and spheres", ""],
  ["9E.2.1", "Longitudinal cracks in cylinders", ""],
  ["9E.2.1.1", "Internal pressure", "COA = Hp·(pRo/t)·(2π c²/E), with Hp for inside and outside surfaces in Tables 9E.1 and 9E.2 and stated limiting values."],
  ["9E.2.1.2", "Through-wall stress distribution", TW],
  ["9E.2.2", "Circumferential cracks in cylinders", ""],
  ["9E.2.2.1", "Internal pressure", "COA = H0·(pRo²/(Ro² − Ri²))·(2π c²/E), parameters in Tables 9E.3 and 9E.4."],
  ["9E.2.2.2", "Through-wall stress distribution", TW],
  ["9E.2.2.3", "Global bending moment", "COA = H5·(Mx Ro/(π(Ro⁴ − Ri⁴)/4))·(2π c²/E), H5 in Tables 9E.3 and 9E.4."],
  ["9E.2.3", "Meridional cracks in spheres", ""],
  ["9E.2.3.1", "Internal pressure", "COA = Hp·(pRo²/(Ro² − Ri²))·(2π c²/E), parameters in Tables 9E.5 and 9E.6."],
  ["9E.2.3.2", "Through-wall stress distribution", TW],
  ["9E.2.4", "Plasticity correction", "Elastic COA is multiplied by γp, a polynomial in Lr (Equation 9E.32) valid for 0 ≤ Lr ≤ 1.2, with Lr from Part 9."],
  ["9E.2.5", "Nomenclature", "Symbols such as A1–A8, c (half crack length), COA, COAelastic, E, γp, Hp, H0, H1, H5, Mx, p, Ri, Ro, t."],
  ["9E.2.6", "References", "WRC 478 and reference stress, LBB and crack opening papers."],
  ["9E.2.7", "Tables", "Tables 9E.1–9E.6 fitting coefficients for non-dimensional COA by crack type and surface."],
];
