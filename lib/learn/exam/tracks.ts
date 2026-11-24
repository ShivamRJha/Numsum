/** Certification study tracks. Coverage reflects the documents available to NumSum; the effectivity sheet governs. */
export type BokItem = { doc: string; what: string; status: "covered" | "partial" | "gap"; link?: string };
export type Track = { key: "510" | "570"; slug: string; name: string; title: string; intro: string; modules: string[]; bok: BokItem[]; tips: string[] };

export const TRACKS: Track[] = [
  { key: "510", slug: "api-510", name: "API 510", title: "API 510 Pressure Vessel Inspector — exam preparation", modules: ["api-510-pressure-vessel-inspection", "api-571-damage-mechanisms", "asme-section-v-nde", "asme-section-ii-materials", "api-579-fitness-for-service", "api-580-risk-based-inspection"],
    intro: "A structured route through the documents the API 510 exam draws on: learn each module, drill the calculations until they are automatic, then sit timed mock exams and fix your weak topics.",
    bok: [
      { doc: "API 510", what: "Inspection plans, intervals, corrosion rate, remaining life, MAWP, corroded-area evaluation, repairs, alterations, rerating, PRDs", status: "covered", link: "/learn/codes/api-510-pressure-vessel-inspection" },
      { doc: "API RP 571", what: "The damage mechanisms named in the exam's body of knowledge — critical factors, appearance, inspection, prevention", status: "covered", link: "/learn/codes/api-571-damage-mechanisms" },
      { doc: "ASME Section V", what: "Articles 1, 2, 6, 7, 9, 10 (general, RT, PT, MT, VT, LT) and thickness measurement", status: "covered", link: "/learn/codes/asme-section-v-nde" },
      { doc: "ASME Section II", what: "Material specifications and allowable stresses as used in calculations", status: "covered", link: "/learn/codes/asme-section-ii-materials" },
      { doc: "API 579-1 / API 580", what: "Fitness-for-service and RBI concepts as referenced by API 510", status: "partial", link: "/learn/codes/api-579-fitness-for-service" },
      { doc: "ASME Section VIII Div 1", what: "UG-27/UG-32 thickness, joint efficiency (UW-11/12), RT (UW-51/52), PWHT (UCS-56), MDMT and impact tests (UCS-66, UG-84), hydrotest (UG-99), nozzle reinforcement", status: "partial" },
      { doc: "ASME Section IX", what: "WPS/PQR/WPQ review: essential variables, test coupons, P-numbers and F-numbers", status: "gap" },
      { doc: "API RP 572, 576, 577, 578", what: "Vessel inspection practices, relief devices, welding inspection, material verification (PMI)", status: "gap" },
    ],
    tips: ["Check API's current effectivity sheet for the editions in your exam window — clause numbers move between editions.", "Calculations are a large share of the marks: corrosion rate, remaining life, interval, UG-27 thickness and MAWP, hydrotest pressure, joint efficiency and impact-test exemption.", "Open-book questions reward fast navigation — practise finding clauses, not just knowing answers."] },
  { key: "570", slug: "api-570", name: "API 570", title: "API 570 Piping Inspector — exam preparation", modules: ["api-570-piping-inspection", "api-574-piping-inspection-practices", "api-571-damage-mechanisms", "asme-section-v-nde", "asme-section-ii-materials", "api-579-fitness-for-service"],
    intro: "A structured route through the documents the API 570 exam draws on: piping classes, intervals, CUI, injection points, buried piping, B31.3 calculations, NDE and welding.",
    bok: [
      { doc: "API 570", what: "Piping classes, intervals, CUI extent, injection points, deadlegs, SBP, corrosion rate, MAWP, repairs, buried piping", status: "covered", link: "/learn/codes/api-570-piping-inspection" },
      { doc: "API RP 574", what: "Inspection practices, components, retirement and structural minimum thickness", status: "covered", link: "/learn/codes/api-574-piping-inspection-practices" },
      { doc: "API RP 571", what: "Damage mechanisms named in the body of knowledge", status: "covered", link: "/learn/codes/api-571-damage-mechanisms" },
      { doc: "ASME Section V", what: "Articles 1, 2, 6, 7, 9, 10 and thickness measurement", status: "covered", link: "/learn/codes/asme-section-v-nde" },
      { doc: "ASME B31.3", what: "Pressure design (304), examination (341) and acceptance (Table 341.3.2), leak testing (345), PWHT (331), impact tests (323)", status: "partial" },
      { doc: "ASME B16.5", what: "Flange pressure–temperature ratings and classes", status: "gap" },
      { doc: "ASME Section IX", what: "WPS/PQR/WPQ review", status: "gap" },
      { doc: "API RP 577, 578", what: "Welding inspection and metallurgy, material verification (PMI)", status: "gap" },
    ],
    tips: ["Know Table 2 (intervals) and Table 3 (CUI extent) of API 570 cold.", "B31.3 thickness and hydrotest calculations appear often — drill them until they take under two minutes.", "Learn the injection-point zone, soil-to-air zone and buried-piping intervals by heart."] },
];
export const trackBySlug = (s: string) => TRACKS.find((t) => t.slug === s);
