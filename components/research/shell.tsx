export const COMMONS_TABS = [
  ["Overview", "/research"], ["Learning paths", "/research/paths"], ["Research radar", "/research/radar"], ["Discussions", "/research/discuss"],
  ["Positions", "/research/positions"], ["Researchers", "/research/people"], ["My dashboard", "/research/me"],
] as const;

/** Page frame for every Research Commons page: eyebrow, title, intro and the Commons tab row. */
/** The Research section bar in the site header provides the Commons navigation; `active` is kept for callers. */
export function ResearchShell({ active: _active, title, intro, children, wide }: { active: string; title: string; intro?: React.ReactNode; children: React.ReactNode; wide?: boolean }) {
  return <main className="tools-bg min-h-screen bg-navy px-6 pb-20 pt-8">
    <div className={wide ? "mx-auto max-w-7xl" : "mx-auto max-w-6xl"}>
      <header className="max-w-3xl"><p className="text-xs font-semibold uppercase tracking-[.18em] text-violet-200/80">Research Commons</p><h1 className="mt-2 font-display text-4xl font-bold tracking-[-.03em] text-white md:text-5xl">{title}</h1>{intro && <div className="mt-3 text-lg leading-8 text-white/65">{intro}</div>}</header>
      <div className="mt-8">{children}</div>
    </div>
  </main>;
}
