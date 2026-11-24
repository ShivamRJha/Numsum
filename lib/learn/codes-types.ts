/** Types for the API codes learning module. All text is NumSum's own explanation; clause numbers point to the standard. */

export type TopicKey =
  | "scope" | "organisation" | "planning" | "intervals" | "cml" | "methods" | "corrosion-rate" | "mawp"
  | "pressure-test" | "repair" | "prd" | "cui" | "buried" | "damage" | "rbi-basics" | "pof" | "cof"
  | "risk" | "ffs" | "metal-loss" | "cracks" | "high-temp" | "records" | "piping-components"
  | "materials" | "material-tests" | "consumables" | "allowable-stress" | "nde" | "nde-procedure" | "qap";

export type Chapter = {
  id: string;
  /** Clause or Part reference in the standard, e.g. "§7.1" or "Part 5". */
  ref: string;
  title: string;
  summary: string;
  points: string[];
  formula?: string[];
  tags: TopicKey[];
  tool?: [string, string];
  /** Interactive diagram shown with the chapter. */
  visual?: VisualKey;
  /** Deeper explanation blocks: [heading, text]. */
  deep?: [string, string][];
};

export type VisualKey =
  | "corrosion-timeline" | "risk-matrix" | "pof-builder" | "lta-rsf" | "piping-circuit" | "ffs-part-map"
  | "spec-anatomy" | "parent-specs" | "heat-treatment" | "nde-selector" | "rt-geometry" | "ut-skip"
  | "pt-timeline" | "mt-directions" | "dm-families" | "interval-compare" | "code-flow" | "allowable-stress";

export type Mcq = { q: string; options: string[]; answer: number; why: string };

export type CodeModule = {
  slug: string;
  code: string;
  short: string;
  title: string;
  seoTitle: string;
  description: string;
  edition: string;
  covers: string;
  stage: string;
  audience: string;
  order: number;
  concepts: [string, string][];
  chapters: Chapter[];
  example?: { title: string; steps: string[] };
  pitfalls: string[];
  quiz: [string, string][];
  mcq?: Mcq[];
  related: string[];
};
