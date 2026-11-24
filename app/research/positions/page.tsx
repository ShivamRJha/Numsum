import type { Metadata } from "next";
import { ResearchShell } from "@/components/research/shell";
import { MemberOnly } from "@/components/research/member-only";
import { PositionsClient } from "@/components/research/positions-client";

export const metadata: Metadata = { title: "PhD, postdoc and collaboration positions — NumSum Research Commons", description: "Openings posted by the people offering them. Always apply through the official link where one is given.", alternates: { canonical: "/research/positions" } };

export default function Page() {
  return <ResearchShell active="/research/positions" title="PhD, postdoc and collaboration positions" intro={<p>Openings posted by the people offering them. Always apply through the official link where one is given.</p>} wide>
    <MemberOnly what="See and post PhD, postdoc, internship and collaboration openings."><PositionsClient /></MemberOnly>
  </ResearchShell>;
}
