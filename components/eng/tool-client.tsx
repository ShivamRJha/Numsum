"use client";
import dynamic from "next/dynamic";
const Skeleton = () => <div className="h-96 animate-pulse rounded-3xl border border-white/10 bg-white/[0.02]" />;
const MAP = {
  "pressure-vessel-thickness-calculator": dynamic(() => import("./vessel-calc").then((m) => m.VesselCalc), { loading: Skeleton }),
  "pipe-thickness-calculator": dynamic(() => import("./pipe-calc").then((m) => m.PipeCalc), { loading: Skeleton }),
  "remaining-life-calculator": dynamic(() => import("./remaining-life-calc").then((m) => m.RemainingLifeCalc), { loading: Skeleton }),
  "hydrotest-pressure-calculator": dynamic(() => import("./hydrotest-calc").then((m) => m.HydrotestCalc), { loading: Skeleton }),
  "steam-trap-loss-calculator": dynamic(() => import("./steam-calc").then((m) => m.SteamCalc), { loading: Skeleton }),
  "damage-mechanism-screening": dynamic(() => import("./dm-screen").then((m) => m.DmScreen), { loading: Skeleton }),
} as const;
export function ToolClient({ slug }: { slug: string }) {
  const C = MAP[slug as keyof typeof MAP];
  return C ? <C /> : null;
}
