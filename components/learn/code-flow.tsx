import Link from "next/link";
import { CODES, FLOW } from "@/lib/learn/codes";

/** The integrity cycle: which code is used at which step. */
export function CodeFlow() {
  const short = (slug: string) => CODES.find((c) => c.slug === slug)!.short;
  return <ol className="grid gap-3 md:grid-cols-5" aria-label="How the API codes fit together">
    {FLOW.map((f, i) => <li key={f.step} className="relative flex">
      <div className="premium-card flex w-full flex-col rounded-2xl border p-4">
        <span className="font-mono text-xs text-amber-100/80">STEP {f.step}</span>
        <span className="mt-1 font-semibold text-white">{f.title}</span>
        <span className="mt-1 flex-1 text-sm text-white/60">{f.text}</span>
        <span className="mt-3 flex flex-wrap gap-1.5">{f.codes.map((c) => <Link key={c} href={`/learn/codes/${c}`} className="rounded-full border border-amber-100/30 bg-amber-100/10 px-2.5 py-1 font-mono text-[11px] text-amber-50 hover:bg-amber-100/20">{short(c)}</Link>)}</span>
      </div>
      {i < FLOW.length - 1 && <span aria-hidden className="absolute -right-2.5 top-1/2 z-10 hidden -translate-y-1/2 text-white/30 md:block">›</span>}
    </li>)}
    <li className="md:col-span-5"><p className="text-center text-xs text-white/40">↺ The cycle repeats: inspection results update the damage review and the risk ranking.</p></li>
  </ol>;
}
