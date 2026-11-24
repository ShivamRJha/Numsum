import type { ClauseRow } from "./types";
import { API510_CLAUSES } from "./api-510";
import { API570_CLAUSES } from "./api-570";

export type { ClauseRow };
export type ClauseSet = {
  slug: string;
  rows: ClauseRow[];
  /** clause number → training lesson id in the module, when one exists */
  lesson: (id: string) => string | undefined;
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
];

export const clauseSet = (slug: string) => CLAUSE_SETS.find((s) => s.slug === slug);
export const clauseCount = (s: ClauseSet) => s.rows.filter((r) => r[2]).length;
