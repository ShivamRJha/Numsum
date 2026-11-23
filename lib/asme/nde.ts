/** NDE and inspection activities for QAP lines, with the Section V article that governs "how". */
export type NdeActivity = { key: string; name: string; ref: string; record: string; finds: string; acceptHint: string };

export const NDE_ACTIVITIES: NdeActivity[] = [
  { key: "vt", name: "Visual examination (VT)", ref: "ASME V Art 9", record: "VT report", finds: "Surface defects, weld profile, undercut, misalignment", acceptHint: "Referencing code workmanship (e.g. VIII-1 UW-35, B31.3 Table 341.3.2)" },
  { key: "rt", name: "Radiography (RT)", ref: "ASME V Art 2", record: "RT report + films / digital images", finds: "Porosity, slag, lack of fusion/penetration, cracks (favourably oriented)", acceptHint: "VIII-1 UW-51 (full) / UW-52 (spot); B31.3 Table 341.3.2" },
  { key: "ut", name: "Ultrasonic examination of welds (UT)", ref: "ASME V Art 4", record: "UT report", finds: "Planar flaws, lack of fusion, cracks; sizing", acceptHint: "VIII-1 Appendix 12 / UW-53; B31.3 344.6" },
  { key: "paut", name: "Phased array UT (PAUT)", ref: "ASME V Art 4 App IV/V", record: "PAUT data files + report", finds: "Planar and volumetric flaws, sizing; RT replacement", acceptHint: "VIII-1 UW-51(a)(4) / Code Case 2235 or Appendix VII/VIII of Art 4" },
  { key: "tofd", name: "Time-of-flight diffraction (TOFD)", ref: "ASME V Art 4 App III", record: "TOFD data files + report", finds: "Flaw through-wall height sizing", acceptHint: "As above (fracture-mechanics or workmanship criteria)" },
  { key: "ut-plate", name: "UT of plate / forging (laminations)", ref: "ASME V Art 5 + SA-435/577/578/388", record: "UT report", finds: "Laminations, inclusions in base material", acceptHint: "Level ordered in the material spec supplementary requirement" },
  { key: "mt", name: "Magnetic particle examination (MT)", ref: "ASME V Art 7", record: "MT report", finds: "Surface and near-surface cracks (ferromagnetic only)", acceptHint: "VIII-1 Appendix 6; B31.3 344.3" },
  { key: "pt", name: "Liquid penetrant examination (PT)", ref: "ASME V Art 6", record: "PT report + consumable batch certs", finds: "Surface-open cracks and porosity (any non-porous material)", acceptHint: "VIII-1 Appendix 8; B31.3 344.4" },
  { key: "et", name: "Eddy current examination (ET)", ref: "ASME V Art 8", record: "ET report + data", finds: "Tube wall loss, pitting, cracks (non-ferromagnetic tubes)", acceptHint: "Owner/purchaser specification" },
  { key: "lt-bubble", name: "Leak test — bubble / vacuum box", ref: "ASME V Art 10 App I / II", record: "Leak test report", finds: "Through-wall leaks (pads, tank bottoms, linings)", acceptHint: "No continuous bubble formation" },
  { key: "lt-helium", name: "Leak test — helium", ref: "ASME V Art 10 App IV/V/IX", record: "Leak test report", finds: "Very small leaks", acceptHint: "Leak rate specified by the referencing code / owner" },
  { key: "hydro", name: "Hydrostatic test", ref: "Referencing code (VIII-1 UG-99 / B31.3 345.4)", record: "Hydro test report + gauge calibration", finds: "Strength and tightness", acceptHint: "No leakage or permanent distortion at test pressure" },
  { key: "pneu", name: "Pneumatic test", ref: "Referencing code (VIII-1 UG-100 / B31.3 345.5)", record: "Pneumatic test report", finds: "Strength and tightness", acceptHint: "No leakage; safety precautions in place" },
  { key: "pmi", name: "Positive material identification (PMI)", ref: "API RP 578 / owner spec", record: "PMI log", finds: "Wrong alloy", acceptHint: "Within the nominal composition limits of the spec" },
  { key: "hardness", name: "Hardness test (welds / HAZ)", ref: "Owner spec / NACE MR0175 / MR0103", record: "Hardness report", finds: "Hard zones (sour service, PWHT effectiveness)", acceptHint: "e.g. ≤ 200 HBW (P-No.1 sour service) or as specified" },
  { key: "ferrite", name: "Ferrite measurement", ref: "AWS A4.2 / owner spec", record: "Ferrite report", finds: "Ferrite content in austenitic / duplex welds", acceptHint: "Range specified (e.g. FN 3–10 austenitic, 30–65% duplex)" },
  { key: "pwht", name: "PWHT chart review", ref: "VIII-1 UCS-56 / B31.3 331", record: "Time-temperature charts + thermocouple layout", finds: "Heat-treatment compliance", acceptHint: "Holding temperature and time per code table" },
  { key: "dim", name: "Dimensional inspection", ref: "Drawing / VIII-1 UG-80, UG-81", record: "Dimensional report", finds: "Out-of-roundness, orientation, elevations", acceptHint: "Drawing tolerances and code limits" },
];
export const ndeByKey = (k: string) => NDE_ACTIVITIES.find((n) => n.key === k);
