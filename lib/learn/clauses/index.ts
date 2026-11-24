import type { ClauseRow } from "./types";
import { API510_CLAUSES } from "./api-510";
import { API570_CLAUSES } from "./api-570";
import { API574_CLAUSES } from "./api-574";
import { API580_CLAUSES } from "./api-580";
import { API571_CLAUSES } from "./api-571";
import { ASMEV_CLAUSES } from "./asme-v";

export type { ClauseRow };
export type ClauseSet = {
  slug: string;
  rows: ClauseRow[];
  /** clause number → training lesson id in the module, when one exists */
  lesson: (id: string) => string | undefined;
  /** set while a guide is still being written: what is covered so far */
  partial?: string;
};

/** first matching prefix wins; keys are clause-number prefixes */
function byPrefix(map: [string, string][]) {
  return (id: string) => map.find(([p]) => id === p || id.startsWith(p + "."))?.[1];
}

export const CLAUSE_SETS: ClauseSet[] = [
  {
    slug: "api-510-pressure-vessel-inspection",
    rows: API510_CLAUSES,
    lesson: byPrefix([
      ["1", "scope"], ["2", "scope"], ["4", "organisation"], ["B", "organisation"],
      ["5.1", "inspection-plan"], ["5.2", "inspection-plan"], ["5.3", "inspection-plan"],
      ["5.4", "types"], ["5.5", "types"], ["5.6", "cml"], ["5.7", "cml"], ["5.8", "pressure-test"],
      ["5.9", "pmi-welds"], ["5.10", "pmi-welds"], ["5.11", "pmi-welds"], ["5.12", "pmi-welds"],
      ["6.4", "external-interval"], ["6.1", "internal-interval"], ["6.2", "internal-interval"], ["6.3", "internal-interval"], ["6.5", "internal-interval"],
      ["6.6", "prd"], ["6.7", "deferral"], ["6.8", "deferral"], ["6.9", "deferral"],
      ["7.1", "corrosion-rate"], ["7.2", "corrosion-rate"], ["7.3", "mawp"], ["7.6", "mawp"], ["7.7", "mawp"],
      ["7.4", "corroded-areas"], ["7.5", "corroded-areas"], ["7.8", "records"],
      ["8.1", "repairs"], ["8.2", "rerating"],
    ]),
  },
  {
    slug: "api-570-piping-inspection",
    rows: API570_CLAUSES,
    lesson: byPrefix([
      ["1", "scope"], ["2", "scope"], ["3", "scope"], ["4", "organisation"], ["A", "organisation"],
      ["5.1", "plan"], ["5.2", "plan"], ["5.3", "plan"], ["5.4", "special-locations"], ["5.5", "special-locations"],
      ["5.6", "cml"], ["5.7", "cml"], ["5.8", "pressure-test"],
      ["5.9", "valves-welds-flanges"], ["5.10", "valves-welds-flanges"], ["5.11", "valves-welds-flanges"], ["5.12", "valves-welds-flanges"], ["5.13", "valves-welds-flanges"],
      ["6.3.4", "classes"], ["6.1", "intervals"], ["6.2", "intervals"], ["6.3", "intervals"], ["6.4", "cui-extent"],
      ["6.5", "sbp"], ["6.6", "sbp"], ["6.7", "prd"],
      ["7.1", "evaluation"], ["7.2", "evaluation"], ["7.3", "evaluation"], ["7.4", "evaluation"],
      ["7.5", "stress-records"], ["7.6", "stress-records"], ["7.7", "stress-records"], ["7.8", "stress-records"], ["7.9", "stress-records"], ["7.10", "stress-records"],
      ["8", "repairs"], ["C", "repairs"], ["9", "buried"],
    ]),
  },
  {
    slug: "api-574-piping-inspection-practices",
    rows: API574_CLAUSES,
    lesson: byPrefix([
      ["4", "components"], ["5", "joints"], ["6", "why"], ["7", "plans"], ["8", "frequency"], ["9", "safety"],
      ["10", "procedures"], ["11", "tests"], ["12", "retirement"], ["13", "records"], ["A", "procedures"],
    ]),
  },
  {
    slug: "api-580-risk-based-inspection",
    rows: API580_CLAUSES,
    lesson: byPrefix([
      ["1", "what-is-risk"], ["2", "what-is-risk"], ["3", "what-is-risk"], ["4", "what-is-risk"],
      ["5.1", "program-elements"], ["5.2", "program-elements"], ["5.3", "types"], ["5.4", "types"], ["5", "program-elements"],
      ["6", "planning"], ["7", "data"], ["8", "damage"], ["9", "pof"], ["10", "cof"], ["11", "risk"],
      ["12", "inspection-strategy"], ["13", "mitigation"], ["14", "reassessment"], ["15", "reassessment"], ["16", "reassessment"], ["17", "reassessment"],
    ]),
  },
  {
    slug: "api-571-damage-mechanisms",
    rows: API571_CLAUSES,
    // every mechanism has the same sub-clauses, so map by the last digit
    lesson: (id) => {
      if (id === "1" || id === "2" || id.startsWith("2.")) return "how-organised";
      if (id === "4" || id === "A" || id.startsWith("A.")) return "dmr";
      const m = /^3\.\d+\.(\d)$/.exec(id);
      if (m) return ({ "3": "critical-factors", "5": "appearance", "6": "mitigation", "7": "appearance" } as Record<string, string>)[m[1]] ?? "groups";
      if (id === "3" || /^3\.\d+$/.test(id)) return "groups";
      return undefined;
    },
  },
  {
    slug: "asme-section-v-nde",
    rows: ASMEV_CLAUSES,
    partial: "Subsection A, Articles 1, 2 and 4 to 10 (general requirements, RT, UT, PT, MT, ET, VT and leak testing, with all appendices). Articles 11 to 19 are being added.",
    lesson: (id) => {
      const m = /^(?:T|[IVX]+(?:-[A-Z])?|[A-Z])-(\d{3,4})/.exec(id);
      if (!m) return undefined;
      const n = m[1], art = n.length === 4 ? n.slice(0, 2) : n[0];
      if (art === "1") return id.startsWith("II-") || id.startsWith("T-12") ? "personnel-procedures" : id.startsWith("A-") ? "choose" : "how-it-works";
      return ({ "2": "rt", "4": "ut-welds", "5": "ut-materials", "6": "pt", "7": "mt", "8": "et", "9": "vt", "10": "lt" } as Record<string, string>)[art] ?? "ae-advanced";
    },
  },
];

export const clauseSet = (slug: string) => CLAUSE_SETS.find((s) => s.slug === slug);
export const clauseCount = (s: ClauseSet) => s.rows.filter((r) => r[2]).length;
