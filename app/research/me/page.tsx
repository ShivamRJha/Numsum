import type { Metadata } from "next";
import { ResearchShell } from "@/components/research/shell";
import { MemberOnly } from "@/components/research/member-only";
import { ResearchDashboard } from "@/components/research/dashboard";

export const metadata: Metadata = { title: "My Research Dashboard — NumSum Research Commons", robots: { index: false } };

export default function MyResearch() {
  return <ResearchShell active="/research/me" title="My research dashboard" intro={<p>Your private plan: targets with dates, what you are reading, how far along your path you are, and alerts from the radar.</p>} wide>
    <MemberOnly what="Set private targets, keep a reading list, track your learning path and get research alerts."><ResearchDashboard /></MemberOnly>
  </ResearchShell>;
}
