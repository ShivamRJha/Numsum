import type { Metadata } from "next";
import { ResearchShell } from "@/components/research/shell";
import { MemberOnly } from "@/components/research/member-only";
import { DiscussClient } from "@/components/research/discuss-client";

export const metadata: Metadata = { title: "Discussions — NumSum Research Commons", description: "Talk through methods, papers and ideas with students, scholars and faculty.", alternates: { canonical: "/research/discuss" } };

export default function Page() {
  return <ResearchShell active="/research/discuss" title="Discussions" intro={<p>Talk through methods, papers and ideas with students, scholars and faculty.</p>} wide>
    <MemberOnly what="Read and join research discussions with other members." needComplete><DiscussClient /></MemberOnly>
  </ResearchShell>;
}
