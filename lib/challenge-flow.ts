import type { Competition } from "@/lib/types";

export const publicChallengeStatuses = ["published", "open", "registration_closed", "submission_closed", "evaluation", "results_declared"] as const;
export const challengeStatusOptions = ["draft", ...publicChallengeStatuses, "archived"] as const;
export type PublicChallengeStatus = typeof publicChallengeStatuses[number];

export const challengeTypes = ["Problem solving", "Prototype", "Research", "Design sprint", "Pilot", "Ideation"];
export const challengeModes = ["online", "offline", "hybrid"];
export const challengeDifficulties = ["beginner", "intermediate", "advanced", "expert"];


export function challengeSlug(challenge: Competition) { return challenge.slug || challenge.id; }
export function challengeStatusLabel(status?: string) { return (status || "published").replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()); }
export function fmtDate(value: unknown) { if (!value) return "Not announced"; if (typeof value === "object" && value && "toDate" in value) return (value as { toDate: () => Date }).toDate().toLocaleDateString(); const d = new Date(value as string); return Number.isNaN(d.getTime()) ? "Not announced" : d.toLocaleDateString(); }
export function toDate(value: unknown) { if (!value) return null; if (typeof value === "object" && value && "toDate" in value) return (value as { toDate: () => Date }).toDate(); const d = new Date(value as string); return Number.isNaN(d.getTime()) ? null : d; }
export function deadlinePassed(value: unknown) { const d = toDate(value); return d ? d.getTime() < Date.now() : false; }
export function challengeClosed(challenge: Competition) { return ["archived", "closed", "results_declared"].includes(challenge.status || ""); }
export function actionBlockReason(challenge: Competition, action: "register" | "team" | "submit") {
  if (challengeClosed(challenge)) return "This challenge is closed or results have been declared.";
  if (action === "register" && deadlinePassed(challenge.registrationDeadline)) return "Registration deadline has passed.";
  if (action === "team" && deadlinePassed(challenge.startDate)) return "Team formation deadline has passed.";
  if (action === "submit" && deadlinePassed(challenge.submissionDeadline || challenge.deadline || challenge.endDate)) return "Submission deadline has passed.";
  if (action === "register" && ["registration_closed", "submission_closed", "evaluation"].includes(challenge.status || "")) return "Registration is closed for this challenge.";
  if (action === "submit" && ["submission_closed", "evaluation"].includes(challenge.status || "")) return "Solution submissions are closed for this challenge.";
  return "";
}
export function maxTeamSize(challenge: Competition) { return Math.max(1, Number(challenge.maxTeamSize || 1)); }
