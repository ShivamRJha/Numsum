import type { Metadata } from "next";
import { ResearchShell } from "@/components/research/shell";
import { MemberOnly } from "@/components/research/member-only";
import { RadarClient } from "@/components/research/radar-client";

export const metadata: Metadata = { title: "Research Radar — New Papers in Your Research Direction", description: "Daily preprints and notable journal papers matched to your research keywords, with alerts for standout work.", alternates: { canonical: "/research/radar" } };

export default function RadarPage() {
  return <ResearchShell active="/research/radar" title="Research radar" intro={<p>What the world published this week in your direction: the newest preprints and the journal papers people are already citing.</p>} wide>
    <MemberOnly what="Set your research keywords and get new preprints and notable journal papers every day, with alerts for standout work."><RadarClient /></MemberOnly>
  </ResearchShell>;
}
