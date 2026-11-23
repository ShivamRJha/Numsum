import { Card } from "@/components/ui";
import { EmptyState } from "@/components/data-states";
import { getPublicImpactMetrics } from "@/lib/repositories/firestore";

/** Shows only real, non-zero metrics computed from approved public records. */
export async function PublicImpactMetricCards() {
  const m = await getPublicImpactMetrics().catch(() => null);
  const all: [number | string | undefined, string][] = m ? [[m.totalProblemsSubmitted, "MSME problems submitted"], [m.totalProblemsSolved, "Problems solved"], [m.totalChallengesLaunched, "Challenges launched"], [m.totalChallengeParticipants, "Challenge participants"], [m.totalCaseStudiesPublished, "Case studies published"], [m.totalCommunityPosts, "Community posts"], [m.totalMonetarySavings, "Monetary savings"], [m.totalTimeSaved, "Time saved"], [m.totalWasteReduction, "Waste reduction"], [m.totalProductivityGain, "Productivity gain"], [m.totalClientsGained, "Clients gained"], [m.totalPublicReviews, "Public reviews"]] : [];
  const metrics = all.filter(([value]) => value !== undefined && value !== null && value !== "" && value !== 0 && value !== "0");
  if (!metrics.length) return <EmptyState message="Verified impact figures will be published here as engagements are completed and approved." />;
  return <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-4">{metrics.map(([value, label]) => <Card key={label} className="editorial-card"><p className="font-display text-4xl text-amber-100">{value}</p><p className="mt-2 text-sm uppercase tracking-[.16em] text-white/60">{label}</p></Card>)}</div>;
}
