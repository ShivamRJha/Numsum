"use client";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { loadProfile, saveProfile } from "@/lib/research/store";
import { adoptTemplate } from "@/lib/research/templates";
import type { ResearchProfile } from "@/lib/research/types";

const blank = (uid: string): ResearchProfile => ({ uid, interests: [], alerts: true, targets: [], reading: [], pathDone: {} });

/** The signed-in member's private research profile. A super admin with no profile yet starts on the mechanical → scientific-ML plan. */
export function useResearchProfile() {
  const { user, profile: account } = useAuth();
  const [p, setP] = useState<ResearchProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!user) { setP(null); setReady(true); return; }
    let live = true; setReady(false);
    loadProfile(user.uid).then(async (got) => {
      let next = got;
      if (!next && account?.role === "super_admin") { next = { ...blank(user.uid), ...adoptTemplate("mech-sciml")! }; await saveProfile(next); }
      if (live) { setP(next); setReady(true); }
    }).catch(() => { if (live) { setError("Could not load your research profile. Refresh to try again."); setReady(true); } });
    return () => { live = false; };
  }, [user, account?.role]);
  const update = useCallback(async (fn: (x: ResearchProfile) => ResearchProfile) => {
    if (!user) return;
    const next = fn(p ?? blank(user.uid));
    setP(next);
    try { await saveProfile(next); setError(""); } catch { setError("Couldn't save — check your connection and try again."); }
  }, [p, user]);
  return { p, ready, error, update, signedIn: Boolean(user), uid: user?.uid };
}
