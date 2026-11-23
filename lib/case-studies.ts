import { getPublicAdminCaseStudies, getPublicKnowledgeAssets, getPublicPilotTracks } from "@/lib/repositories/firestore";
import type { CaseStudy } from "@/lib/types";

export type PublicCaseStudy = {
  id: string;
  slug: string;
  title: string;
  sector: string;
  problemType: string;
  impactMetric: string;
  tags: string[];
  readTime: string;
  upvotes: number;
  comments: number;
  problem: string;
  context: string;
  solutionApproach: string;
  impact: string;
  lessonsLearned: string[];
};


function slugify(value: string) { return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 80); }
function lines(value?: string) { return (value || "Lessons will be updated after validation.").split("\n").map((v) => v.trim()).filter(Boolean); }
function fromAdminCaseStudy(c: CaseStudy): PublicCaseStudy { return { id: c.id, slug: c.slug || slugify(c.title || c.id), title: c.title, sector: c.sector || "MSME", problemType: c.linkedProblemId ? "Linked MSME problem" : c.linkedChallengeId ? "Linked challenge" : "Industrial case study", impactMetric: c.featuredMetric || "Impact approved for publication", tags: c.tags || [], readTime: c.readTime || "5 min read", upvotes: c.upvoteCount || 0, comments: c.commentCount || 0, problem: c.problemSection || c.summary || "Problem summary pending.", context: c.contextSection || c.summary || "Context pending.", solutionApproach: c.solutionSection || "Solution approach pending.", impact: c.impactSection || c.featuredMetric || "Impact pending.", lessonsLearned: lines(c.lessonsLearnedSection) }; }

export async function getPublicCaseStudies(): Promise<PublicCaseStudy[]> {
  const adminCases = await getPublicAdminCaseStudies().catch(() => []);
  if (adminCases.length) return adminCases.map(fromAdminCaseStudy);
  const [knowledge, pilots] = await Promise.all([getPublicKnowledgeAssets().catch(() => []), getPublicPilotTracks().catch(() => [])]);
  const live: PublicCaseStudy[] = [
    ...pilots.map((p) => ({ id: p.id, slug: slugify(p.title || p.id), title: p.title, sector: p.industrySegment || "MSME", problemType: p.interventionType || "Implementation pilot", impactMetric: String(p.finalResults || p.expectedImpact || "Impact pending approval"), tags: [p.industrySegment, p.interventionType].filter(Boolean) as string[], readTime: "6 min read", upvotes: 0, comments: 0, problem: p.problemSummary || p.publicSummary || "Problem summary will be published after approval.", context: p.partnerOrganization ? `Context from ${p.partnerOrganization} has been public-safe summarized.` : "Client context is summarized without confidential details.", solutionApproach: p.proposedSolution || p.pilotObjective || "Solution approach will be updated from approved pilot notes.", impact: String(p.finalResults || p.expectedImpact || "Impact metrics pending approval."), lessonsLearned: [p.lessonsLearned || "Lessons learned will be added after validation."], })),
    ...knowledge.filter((k) => String(k.category || "").toLowerCase().includes("case")).map((k) => ({ id: k.id, slug: slugify(k.title || k.id), title: k.title, sector: k.industrySegment || "Case study", problemType: k.problemCategory || String(k.category || "Industrial learning"), impactMetric: k.keyTakeaways?.[0] || "Public learning asset", tags: k.tags || [], readTime: "5 min read", upvotes: 0, comments: 0, problem: k.shortDescription || k.summary || "Problem summary pending.", context: k.description || k.detailedContent || "Context pending.", solutionApproach: k.relevanceToProblem || k.content || "Solution approach pending.", impact: k.keyTakeaways?.join(", ") || "Impact pending.", lessonsLearned: k.keyTakeaways?.length ? k.keyTakeaways : ["Lessons will be updated from approved admin publishing workflow."], })),
  ];
  return live;
}

export async function getPublicCaseStudyBySlug(slug: string) {
  return (await getPublicCaseStudies()).find((item) => item.slug === slug || item.id === slug) || null;
}
