import type { ReactNode } from "react";

export function LegalPage({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return <main className="min-h-screen bg-navy px-6 py-14">
    <article className="legal mx-auto max-w-3xl text-white/72 [&_a]:text-amber-100 [&_a]:underline [&_h2]:mt-10 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-white [&_li]:mt-2 [&_p]:mt-4 [&_ul]:mt-3 [&_ul]:list-disc [&_ul]:pl-6">
      <p className="section-eyebrow">Legal</p>
      <h1 className="mt-3 font-display text-4xl font-bold tracking-[-.04em] text-white md:text-5xl">{title}</h1>
      <p className="mt-3 text-sm text-white/45">Last updated: {updated}</p>
      {children}
    </article>
  </main>;
}
