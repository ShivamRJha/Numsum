import type { Metadata } from "next";
import { ResearchShell } from "@/components/research/shell";
import { MemberOnly } from "@/components/research/member-only";
import { PeopleClient } from "@/components/research/people-client";

export const metadata: Metadata = { title: "Researchers — NumSum Research Commons", description: "Members who chose to be found, with what they work on and what they are looking for.", alternates: { canonical: "/research/people" } };

export default function Page() {
  return <ResearchShell active="/research/people" title="Researchers" intro={<p>Members who chose to be found, with what they work on and what they are looking for.</p>} wide>
    <MemberOnly what="Find researchers by field and interest, and list yourself."><PeopleClient /></MemberOnly>
  </ResearchShell>;
}
