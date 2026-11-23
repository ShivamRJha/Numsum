import Link from "next/link";
export function IrisCta({ line = "Do this for every vessel, line and tank in the plant — with history, reminders and reports." }: { line?: string }) {
  return <aside className="premium-card mt-12 flex flex-col items-start justify-between gap-4 rounded-3xl border p-6 md:flex-row md:items-center">
    <div><p className="text-xs font-semibold uppercase tracking-[.18em] text-amber-100/80">IRIS by NumSum</p><p className="mt-2 max-w-2xl text-white/80">{line}</p></div>
    <div className="flex gap-3"><Link href="/products/iris" className="rounded-full bg-amber-100 px-5 py-2.5 text-sm font-semibold text-black hover:bg-white">See IRIS</Link><Link href="/products/iris#demo" className="rounded-full border border-white/15 px-5 py-2.5 text-sm text-white/80 hover:text-white">Book a demo</Link></div>
  </aside>;
}
