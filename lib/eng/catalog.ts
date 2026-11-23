/** The engineering tools: one place for names, URLs, search keywords, method text and FAQs. */
export type EngTool = { slug: string; name: string; short: string; title: string; description: string; h1: string; intro: string; method: string[]; faqs: [string, string][]; codes: string };

export const ENG_TOOLS: EngTool[] = [
  {
    slug: "pressure-vessel-thickness-calculator", name: "Pressure vessel thickness", short: "Shell and head thickness and MAWP to ASME VIII Div 1.",
    title: "Pressure Vessel Thickness Calculator — ASME VIII Div 1 (UG-27) Shell & Head, MAWP",
    description: "Free pressure vessel wall thickness calculator to ASME Section VIII Division 1: cylindrical shell (UG-27), 2:1 ellipsoidal, hemispherical and torispherical heads, corrosion allowance and MAWP, with step-by-step working.",
    h1: "Pressure vessel thickness calculator (ASME VIII-1)", codes: "ASME VIII-1 UG-27, UG-32, Appendix 1",
    intro: "Work out the minimum wall thickness of a cylindrical shell or a head for internal pressure, add the corrosion allowance, and check the MAWP of an actual plate.",
    method: ["Shell, circumferential stress: t = P·R / (S·E − 0.6·P); longitudinal stress: t = P·R / (2·S·E + 0.4·P); the larger governs (UG-27(c)). R is the inside radius in the corroded condition.", "Sphere / hemispherical head: t = P·R / (2·S·E − 0.2·P) (UG-27(d)). 2:1 ellipsoidal head: t = P·D / (2·S·E − 0.2·P). ASME F&D torispherical head: t = 0.885·P·L / (S·E − 0.1·P).", "Minimum thickness = t + corrosion allowance. MAWP is the same formula solved for P with the available thickness (nominal − under-tolerance − corrosion allowance).", "The formulas apply while P ≤ 0.385·S·E (cylinders) and t ≤ R/2; beyond that, Appendix 1-2/1-3 thick-wall formulas apply."],
    faqs: [["What allowable stress should I use?", "The maximum allowable stress S from ASME Section II Part D, Table 1A or 1B, for your material specification and grade at the design temperature."], ["What joint efficiency should I use?", "From UW-12: 1.0 for full radiography of Type 1 butt welds, 0.85 for spot radiography, 0.70 with no radiography. Seamless shells and heads use E = 1.0 subject to UW-11."], ["Does this include external pressure or other loads?", "No. It covers internal pressure only. Vacuum, wind, seismic, nozzle loads and local stresses need separate checks (UG-28, UG-22, WRC 107/537 and others)."], ["Is the result enough for fabrication?", "It is a design check to support engineering judgement. The final design must be done and approved by a qualified engineer to the full code."]],
  },
  {
    slug: "pipe-thickness-calculator", name: "Pipe wall thickness", short: "Required wall and schedule to ASME B31.3.",
    title: "Pipe Wall Thickness Calculator — ASME B31.3 with Schedule Selection & MAWP",
    description: "Free ASME B31.3 pipe thickness calculator: pressure design thickness (304.1.2), corrosion allowance, 12.5% mill tolerance, Y coefficient, and the lightest pipe schedule (STD, 40, XS, 80, 160) that meets it.",
    h1: "Pipe wall thickness calculator (ASME B31.3)", codes: "ASME B31.3 304.1.2, Table 304.1.1; ASME B36.10M",
    intro: "Find the minimum wall thickness for process piping under internal pressure and the lightest standard schedule that meets it — or check the MAWP of a schedule you already have.",
    method: ["Pressure design thickness: t = P·D / (2·(S·E·W + P·Y)), valid for t < D/6 (304.1.2).", "Y from Table 304.1.1: 0.4 for ferritic steel up to 482 °C rising to 0.7 at 538 °C; austenitic 0.4 up to 566 °C rising to 0.7 at 621 °C; interpolated in between.", "Minimum required thickness t_m = t + c (corrosion / erosion allowance plus thread or groove depth).", "Minimum nominal wall = t_m / (1 − mill tolerance), usually 12.5% for seamless pipe; the lightest listed schedule at or above it is suggested."],
    faqs: [["Why divide by (1 − 0.125)?", "Seamless pipe may be up to 12.5% thinner than its nominal wall, so the nominal wall must be large enough that the thinnest permitted pipe still has t_m."], ["What are E and W?", "E is the longitudinal weld joint quality factor (1.0 seamless, 0.85 ERW, Table A-1A/A-1B). W is the weld joint strength reduction factor (1.0 below the creep range, Table 302.3.5)."], ["Where do the schedule thicknesses come from?", "ASME B36.10M nominal wall thickness for welded and seamless wrought steel pipe. Always confirm against the pipe class / specification you buy to."], ["Does it cover external pressure or bends?", "No. Bends, branches, external pressure and sustained/thermal stresses need separate checks under B31.3."]],
  },
  {
    slug: "remaining-life-calculator", name: "Corrosion rate & remaining life", short: "Remaining life and next inspection date (API 510 / 570 / 653).",
    title: "Remaining Life & Corrosion Rate Calculator — API 510 / API 570 / API 653 Inspection Interval",
    description: "Free corrosion rate and remaining life calculator for pressure vessels, piping and tanks: long-term and short-term corrosion rates, trend from several readings, remaining life and the next inspection date per API 510, API 570 and API 653.",
    h1: "Corrosion rate & remaining life calculator", codes: "API 510 §7, API 570 §7, API 653 §4 & §6",
    intro: "Enter thickness readings over time and get the corrosion rate, the remaining life and the latest date for the next inspection.",
    method: ["Long-term corrosion rate = (t_initial − t_actual) / years between; short-term = (t_previous − t_actual) / years between. With three or more readings a least-squares trend is also shown.", "The governing (highest) rate is used, as API 510/570 require.", "Remaining life = (t_actual − t_required) / corrosion rate.", "Next inspection: API 510 — the lesser of half the remaining life or 10 years; API 570 — half the remaining life or 5 years (Class 1), 10 years (Class 2 and 3); API 653 shell — half the remaining life or 15 years."],
    faqs: [["Which corrosion rate should I use?", "API 510 and API 570 ask the inspector to choose the rate that best reflects the current process — normally the higher of the long-term and short-term rates, which this calculator uses."], ["What is t_required?", "The minimum thickness for pressure and structural loads, without corrosion allowance — use the vessel or pipe thickness calculators, or the original design calculation."], ["What if the rate comes out negative?", "Thickness can read higher than before because of measurement differences. The calculator then uses a small nominal rate and flags the readings for review."], ["What if thickness is already below t_required?", "The component needs a fitness-for-service assessment (API 579-1/ASME FFS-1) or repair / replacement before continued operation."]],
  },
  {
    slug: "hydrotest-pressure-calculator", name: "Hydrotest pressure", short: "Hydrostatic and pneumatic test pressure (ASME VIII / B31.3).",
    title: "Hydrotest Pressure Calculator — ASME VIII UG-99 & B31.3 345 Hydrostatic / Pneumatic Test",
    description: "Free hydrostatic test pressure calculator: ASME VIII-1 UG-99 (1.3 × MAWP × stress ratio), ASME B31.3 345.4.2 (1.5 × P × ST/S), pneumatic tests and water static head at the lowest point.",
    h1: "Hydrotest pressure calculator", codes: "ASME VIII-1 UG-99, UG-100; ASME B31.3 345.4.2, 345.5.4",
    intro: "Calculate the hydrostatic or pneumatic test pressure for a pressure vessel or a piping system, including the extra pressure from the water column.",
    method: ["ASME VIII-1 UG-99(b): P_T = 1.3 × MAWP × (S at test temperature / S at design temperature), using the lowest ratio of the materials in the vessel. Pneumatic (UG-100): 1.1 × MAWP × ratio.", "ASME B31.3 345.4.2: P_T = 1.5 × P × S_T / S, with S_T/S not more than 6.5. Pneumatic (345.5.4): 1.1 × P.", "Static head: water adds about 0.0981 bar per metre of height, so the lowest point sees more than the gauge at the top."],
    faqs: [["Why is the stress ratio used?", "Material is stronger at test (ambient) temperature than at a high design temperature; the ratio raises the test pressure so the test proves the design condition."], ["Is the test pressure measured at the top or bottom?", "The code test pressure is at the top (highest point). The lowest point sees the test pressure plus the static head — check that it does not overstress any part."], ["When is a pneumatic test allowed?", "Only when a hydrostatic test is impracticable (e.g. equipment that cannot be filled or dried). Pneumatic tests store much more energy and need extra precautions."]],
  },
  {
    slug: "steam-trap-loss-calculator", name: "Steam trap loss", short: "Steam, cost and CO₂ lost through failed traps (Napier).",
    title: "Steam Trap Loss Calculator — Napier Formula, Steam Cost & CO₂ per Year",
    description: "Free steam trap loss calculator using Napier's formula: steam lost through a leaking or blowing trap in kg/h and tonnes per year, its cost and CO₂ emissions, for one trap or a whole survey.",
    h1: "Steam trap loss calculator", codes: "Napier's formula (UNFCCC AM0017)",
    intro: "Estimate how much steam, money and CO₂ a failed steam trap wastes — the quickest way to justify a trap survey and repairs.",
    method: ["Full-orifice flow (Napier): W [lb/h] = 24.24 × P [psia] × D² [in²], converted to kg/h.", "Steam lost = full flow × a loss factor for the trap's condition (blowing through 1.0, leaking 0.25, rapid cycling 0.2, passing valve 0.25).", "Per year = kg/h × operating hours ÷ 1000; cost and CO₂ follow from the price and emission factor per tonne of steam."],
    faqs: [["Where do I get the orifice size?", "From the trap maker's data for the model. As a rough guide, typical orifices are 2.5 mm (1/4\") to 10 mm (2\")."], ["Why a loss factor?", "A trap that leaks loses only part of the full-orifice flow. The factors are common survey defaults; adjust them to your survey method."], ["How accurate is Napier's formula?", "It is the standard estimate for steam flow through a sharp orifice at choked flow and is widely used for trap surveys; actual losses vary with condensate load and back pressure."]],
  },
  {
    slug: "damage-mechanism-screening", name: "Damage mechanism screening", short: "Which API 571 damage mechanisms can act on your equipment.",
    title: "Damage Mechanism Screening Tool — API 571 (69 Mechanisms) for Vessels & Piping",
    description: "Free API RP 571 damage mechanism screening: choose the material, temperatures and service and see which of 69 damage mechanisms (CUI, sulfidation, HTHA, chloride SCC, wet H2S and more) are likely, with how to inspect for each.",
    h1: "Damage mechanism screening (API 571)", codes: "API RP 571 (2020)",
    intro: "Answer a few questions about the material, temperature and service. The tool screens all 69 damage mechanisms of API 571 and explains how to find the ones that apply.",
    method: ["Each mechanism has a screening rule built from the critical factors in API RP 571 (material, temperature window and the service conditions that drive it).", "Nothing is assumed: if a rule depends on something you have not answered, the mechanism is marked “needs answers” and that question is asked next — most useful question first.", "Results are grouped into likely (all conditions met) and possible (conditions met but the mechanism depends on details), each linked to a plain-language explanation."],
    faqs: [["Does a “likely” result mean the damage is present?", "No. It means the conditions for the mechanism exist, so inspection should look for it. The engineer decides on the inspection plan."], ["How is this used in RBI?", "Damage mechanism screening is the first step of risk-based inspection (API 580/581): each active mechanism maps to a damage factor (thinning, SCC, external damage, HTHA, brittle fracture, fatigue)."], ["Which edition of API 571 is used?", "API RP 571, third edition (2020), sections 3.1 to 3.67."]],
  },
];
export const engTool = (slug: string) => ENG_TOOLS.find((t) => t.slug === slug);
