import type { ClauseRow } from "./types";
import { API510_CLAUSES } from "./api-510";

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
];

export const clauseSet = (slug: string) => CLAUSE_SETS.find((s) => s.slug === slug);
export const clauseCount = (s: ClauseSet) => s.rows.filter((r) => r[2]).length;
