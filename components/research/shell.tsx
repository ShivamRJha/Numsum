import Link from "next/link";

export const COMMONS_TABS = [
  ["Overview", "/research"], ["Learning paths", "/research/paths"], ["Research radar", "/research/radar"], ["Discussions", "/research/discuss"],
  ["Positions", "/research/positions"], ["Researchers", "/research/people"], ["My dashboard", "/research/me"],
] as const;

/** Page frame for every Research Commons page: eyebrow, title, intro and the Commons tab row. */
export function ResearchShell({ active, title, intro, children, wide }: { active: string; title: string; intro?: React.ReactNode; children: React.ReactNode; wide?: boolean }) {
  return <main className="tools-bg min-h-screen bg-navy px-6 pb-20 pt-8">
    <div className={wide ? "mx-auto max-w-7xl" : "mx-auto max-w-6xl"}>
      <nav aria-label="Research Commons" className="-mx-1 flex gap-1 overflow-x-auto pb-1 text-sm">{COMMONS_TABS.map(([l, h]) => <Link key={h} href={h} aria-current={h === active ? "page" : undefined} className={`shrink-0 rounded-full px-3.5 py-1.5 transition ${h === active ? "bg-violet-200 font-semibold text-black" : "text-white/60 hover:bg-white/[0.06] hover:text-white"}`}>{l}</Link>)}</nav>
      <header className="mt-6 max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[.18em] text-violet-200/80">Research Commons</p><h1 className="mt-2 font-display text-4xl font-bold tracking-[-.03em] text-white md:text-5xl">{title}</h1>{intro && <div className="mt-3 text-lg leading-8 text-white/65">{intro}</div>}</header>
      <div className="mt-8">{children}</div>
    </div>
  </main>;
}
