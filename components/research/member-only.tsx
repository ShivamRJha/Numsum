"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "@/components/auth-provider";
import { LoadingState } from "@/components/data-states";

/** Shows children only to signed-in members; everyone else sees what the space is and a sign-in button. */
export function MemberOnly({ children, what, needComplete = false }: { children: ReactNode; what: string; needComplete?: boolean }) {
  const { user, loading, profileComplete, requestAuth } = useAuth();
  if (loading) return <LoadingState label="Checking your account" />;
  if (!user) return <div className="rounded-3xl border border-violet-200/25 bg-violet-300/[0.05] p-8 text-center">
    <p className="font-display text-2xl text-white">Members only</p>
    <p className="mx-auto mt-2 max-w-xl text-white/65">{what} Membership is free.</p>
    <button type="button" onClick={() => requestAuth({ message: "Sign in to join the Research Commons", returnTo: window.location.pathname })} className="mt-5 rounded-full bg-violet-200 px-5 py-2.5 text-sm font-semibold text-black hover:bg-white">Sign in or join free</button>
  </div>;
  if (needComplete && !profileComplete) return <div className="rounded-3xl border border-amber-200/25 bg-amber-200/[0.05] p-6"><p className="font-semibold text-white">Complete your profile to take part</p><p className="mt-1 text-sm text-white/65">Reading is open to every member; posting needs a completed profile so people know who they are talking to.</p><Link href={`/profile/complete?returnTo=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname : "/research")}`} className="mt-4 inline-block rounded-full bg-amber-100 px-4 py-2 text-sm font-semibold text-black">Complete profile →</Link><div className="mt-6">{children}</div></div>;
  return <>{children}</>;
}

export function JoinButton({ className = "" }: { className?: string }) {
  const { user, requestAuth } = useAuth();
  if (user) return <Link href="/research/me" className={`rounded-full bg-violet-200 px-5 py-2.5 text-sm font-semibold text-black hover:bg-white ${className}`}>Open my research dashboard →</Link>;
  return <button type="button" onClick={() => requestAuth({ message: "Sign in to join the Research Commons", returnTo: "/research/me" })} className={`rounded-full bg-violet-200 px-5 py-2.5 text-sm font-semibold text-black hover:bg-white ${className}`}>Join the Commons — free</button>;
}
