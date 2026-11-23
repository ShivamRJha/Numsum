import { TeamManager } from "@/components/team-manager";
import { getTeamMembers } from "@/lib/repositories/firestore";


export default async function TeamPage() {
  const members = await getTeamMembers().catch(() => []);
  return <main className="min-h-screen bg-navy px-6 py-10"><p className="text-sm uppercase tracking-[.35em] text-blue-300">Our Team</p><h1 className="mt-3 font-display text-5xl">NumSum Team</h1><p className="mt-3 max-w-3xl text-white/60">A multidisciplinary founding team focused on converting industrial and societal problem statements into validated solutions.</p><TeamManager initialMembers={members} /></main>;
}
