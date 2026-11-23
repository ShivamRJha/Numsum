import type { Chapter, CodeModule, TopicKey } from "../codes-types";
import { API_510 } from "./api-510";
import { API_570 } from "./api-570";
import { API_571 } from "./api-571";
import { API_574 } from "./api-574";
import { API_579 } from "./api-579";
import { API_580 } from "./api-580";
import { API_581 } from "./api-581";
import { ASME_II } from "./asme-ii";
import { ASME_V } from "./asme-v";

export type { Chapter, CodeModule, TopicKey } from "../codes-types";

/** In learning order. */
export const CODES: CodeModule[] = [API_571, API_580, API_581, API_510, API_570, API_574, API_579, ASME_II, ASME_V].sort((a, b) => a.order - b.order);
export const codeBySlug = (s: string) => CODES.find((c) => c.slug === s);

export type Topic = { key: TopicKey; slug: string; name: string; group: string; intro: string };
export const TOPICS: Topic[] = [
  { key: "planning", slug: "inspection-planning", name: "Inspection planning", group: "Plan", intro: "How each code builds an inspection plan: what damage to look for, where, with which method and by when." },
  { key: "intervals", slug: "inspection-intervals", name: "Inspection intervals", group: "Plan", intro: "Maximum intervals and how they are set — half remaining life, class limits, relief devices and risk-based dates." },
  { key: "rbi-basics", slug: "risk-based-inspection", name: "Risk-based inspection", group: "Plan", intro: "The principles and the program behind RBI, from objectives and data to reassessment." },
  { key: "pof", slug: "probability-of-failure", name: "Probability of failure", group: "Plan", intro: "Generic failure frequencies, damage factors, management systems and inspection effectiveness." },
  { key: "cof", slug: "consequence-of-failure", name: "Consequence of failure", group: "Plan", intro: "Release, fire, explosion, toxic and financial consequences." },
  { key: "risk", slug: "risk-matrix-and-targets", name: "Risk matrix and targets", group: "Plan", intro: "Combining probability and consequence, presenting risk and planning to a target." },
  { key: "damage", slug: "damage-mechanisms", name: "Damage mechanisms", group: "Understand damage", intro: "How damage is identified, grouped and linked to inspection and RBI." },
  { key: "cui", slug: "corrosion-under-insulation", name: "Corrosion under insulation", group: "Understand damage", intro: "Where CUI happens, how much to inspect and how it feeds RBI." },
  { key: "high-temp", slug: "high-temperature-damage", name: "High-temperature damage", group: "Understand damage", intro: "Creep, fire damage and other high-temperature effects." },
  { key: "cracks", slug: "cracks-and-brittle-fracture", name: "Cracks and brittle fracture", group: "Understand damage", intro: "Crack-like flaws, blisters, fatigue and brittle fracture." },
  { key: "materials", slug: "material-selection", name: "Material selection & specifications", group: "Materials & NDE", intro: "How ASME Section II specifications are organised and how to pick the right spec for each product form and service." },
  { key: "material-tests", slug: "material-test-requirements", name: "Material test requirements", group: "Materials & NDE", intro: "Mandatory and supplementary tests, their frequency, and what the certificate must show." },
  { key: "consumables", slug: "welding-consumables", name: "Welding consumables", group: "Materials & NDE", intro: "SFA classifications, the tests behind them and matching filler to base metal." },
  { key: "allowable-stress", slug: "allowable-stress", name: "Allowable stress (Part D)", group: "Materials & NDE", intro: "How Part D tables are built and how allowable stresses are derived." },
  { key: "nde", slug: "nde-methods", name: "NDE methods", group: "Materials & NDE", intro: "RT, UT, PT, MT, ET, VT, leak testing and advanced methods — what each finds and the key requirements." },
  { key: "nde-procedure", slug: "nde-procedures-and-personnel", name: "NDE procedures & personnel", group: "Materials & NDE", intro: "Written procedures, essential variables, demonstrations, qualification and records." },
  { key: "qap", slug: "quality-assurance-plans", name: "Quality assurance plans (QAP)", group: "Materials & NDE", intro: "Writing material and NDE lines with references, frequency, acceptance and hold/witness points." },
  { key: "methods", slug: "inspection-methods", name: "Inspection methods", group: "Inspect", intro: "Internal, on-stream and external inspection, NDE choice and inspection effectiveness." },
  { key: "cml", slug: "condition-monitoring-locations", name: "CMLs and thickness measurement", group: "Inspect", intro: "Choosing, numbering and measuring condition monitoring locations." },
  { key: "piping-components", slug: "piping-components", name: "Piping components", group: "Inspect", intro: "Valves, fittings, flanges, joints, small-bore piping and supports." },
  { key: "buried", slug: "buried-piping", name: "Buried piping", group: "Inspect", intro: "Surveys, cathodic protection, soil resistivity and intervals for buried lines." },
  { key: "prd", slug: "pressure-relief-devices", name: "Pressure-relief devices", group: "Inspect", intro: "Testing, intervals and risk of relief devices." },
  { key: "corrosion-rate", slug: "corrosion-rate-and-remaining-life", name: "Corrosion rate and remaining life", group: "Evaluate", intro: "Long- and short-term rates, remaining life and how they set the next interval." },
  { key: "mawp", slug: "mawp-and-required-thickness", name: "MAWP and required thickness", group: "Evaluate", intro: "Required thickness, retirement thickness, MAWP for continued service and reduced MAWP." },
  { key: "metal-loss", slug: "metal-loss-assessment", name: "Metal loss assessment", group: "Evaluate", intro: "General and local metal loss, pitting, averaging and remaining strength." },
  { key: "ffs", slug: "fitness-for-service", name: "Fitness-for-service", group: "Evaluate", intro: "Levels, RSF, MAWPr and the parts of API 579-1." },
  { key: "pressure-test", slug: "pressure-testing", name: "Pressure testing", group: "Act", intro: "When to test, at what pressure, and the precautions." },
  { key: "repair", slug: "repairs-alterations-rerating", name: "Repairs, alterations and rerating", group: "Act", intro: "Authorization, welding, temporary repairs, PWHT alternatives and rerating." },
  { key: "records", slug: "records-and-documentation", name: "Records and documentation", group: "Act", intro: "What to record so the next inspection and assessment are possible." },
  { key: "organisation", slug: "roles-and-responsibilities", name: "Roles and responsibilities", group: "Act", intro: "Owner/user, inspector, engineer, examiner, repair organization and RBI team." },
  { key: "scope", slug: "scope-of-the-codes", name: "Scope of the codes", group: "Act", intro: "What each document covers and how they fit together." },
];
export const topicBySlug = (s: string) => TOPICS.find((t) => t.slug === s);
export const topicByKey = (k: TopicKey) => TOPICS.find((t) => t.key === k)!;
export const TOPIC_GROUPS = ["Plan", "Understand damage", "Inspect", "Evaluate", "Act", "Materials & NDE"];

export function chaptersForTopic(k: TopicKey): { code: CodeModule; ch: Chapter }[] {
  return CODES.flatMap((code) => code.chapters.filter((ch) => ch.tags.includes(k)).map((ch) => ({ code, ch })));
}

/** The integrity cycle — how the documents connect. */
export const FLOW: { step: string; title: string; text: string; codes: string[] }[] = [
  { step: "1", title: "Identify damage", text: "List the credible damage mechanisms for each circuit.", codes: ["api-571-damage-mechanisms"] },
  { step: "2", title: "Rank risk", text: "Estimate probability and consequence; decide where inspection matters most.", codes: ["api-580-risk-based-inspection", "api-581-rbi-methodology"] },
  { step: "3", title: "Plan & inspect", text: "Write the plan, choose methods and CMLs, inspect vessels and piping.", codes: ["api-510-pressure-vessel-inspection", "api-570-piping-inspection", "api-574-piping-inspection-practices", "asme-section-v-nde"] },
  { step: "4", title: "Evaluate", text: "Corrosion rate, remaining life, MAWP — and fitness-for-service when damage goes beyond the simple rules.", codes: ["api-510-pressure-vessel-inspection", "api-570-piping-inspection", "api-579-fitness-for-service"] },
  { step: "5", title: "Act & update", text: "Run, rerate, repair or replace; record it and update the RBI and the plan.", codes: ["api-510-pressure-vessel-inspection", "api-570-piping-inspection", "asme-section-ii-materials", "api-580-risk-based-inspection"] },
];
