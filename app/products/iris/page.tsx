import type { Metadata } from "next";
import { Activity, BadgeCheck, Boxes, ClipboardCheck, Cloud, Cog, FileSpreadsheet, Flame, Gauge, Layers, Lock, MonitorSmartphone, Pipette, Search, ShieldCheck, Tablet, Wrench } from "lucide-react";
import { EnquiryForm } from "@/components/enquiry-form";
import { Card } from "@/components/ui";
import { siteUrl } from "@/lib/site";

const title = "IRIS — Inspection & Reliability Software for Process Plants | NumSum Labs";
const description = "IRIS brings statutory inspection, thickness monitoring, RBI (API 581), damage mechanisms (API 571), IBR boilers, lifting equipment, steam traps and observations into one system — on the office PC and offline on site tablets.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/products/iris" },
  openGraph: { title: "IRIS — Integrity & Reliability Inspection System", description, url: "/products/iris" },
};

const modules = [
  { icon: Gauge, name: "Pressure vessels", text: "Factories Act external inspections on a six-monthly cycle, on-stream thickness and a four-yearly detailed internal inspection plan — each duty on its own card, never mixed." },
  { icon: Wrench, name: "Lifting equipment", text: "Lifts and other lifting gear counted separately, load-test cycles, certificates to generate, and automatic hold while a critical observation is open." },
  { icon: Flame, name: "IBR boilers", text: "Boiler register, renewal cases through all six steps, inspection history, technical data and RLA — with every letter, fee note and report generated from one menu." },
  { icon: Boxes, name: "SMPV", text: "Static & mobile pressure vessel list with due dates by rule, inspection gist and attached reports for each vessel." },
  { icon: Layers, name: "Thickness, tanks & FFS", text: "On-stream thickness surveys, storage tank integrity and fitness-for-service, with site survey packages that go to the tablet and come back for review." },
  { icon: Pipette, name: "Piping integrity", text: "Line-wise piping inspection with field reports from the tablet flowing straight into the piping register." },
  { icon: Activity, name: "Steam traps & surveys", text: "Trap register, defects and jobs, field surveys and steam-loss calculation, with status reports and survey summaries." },
  { icon: ShieldCheck, name: "RBI — API RP 581", text: "One risk register for every equipment class, each step referenced, with a “data needed” list you can fill for many items at once." },
  { icon: Cog, name: "Damage mechanisms — API 571", text: "Screen one asset or the whole plant for applicable damage mechanisms." },
  { icon: ClipboardCheck, name: "Observations & compliance", text: "Every module's observations in one list — e-mail them with photos, hand them over with a responsible person and target date, and track to closure." },
  { icon: BadgeCheck, name: "Review centre & certificates", text: "Everything waiting for a decision in one place. Approvals are e-signed with the reviewer's password; register dates change only when the certificate is generated." },
  { icon: FileSpreadsheet, name: "Reports, MB & DPR / MPR", text: "Excel and PDF for every page, measurement books by SOR item with each engineer signing their part, daily and monthly progress, and e-mail notices to plants." },
] as const;

const flow = [
  ["Plan", "Dashboards show what is overdue and due in the next 30 days for every inspection type. Plan the year's internal inspections in a few clicks."],
  ["Inspect at site", "Engineers start an inspection on the tablet — even with no network — fill checklists and surveys, take photos and correct equipment data."],
  ["Review & e-sign", "Returned work lands in the Review centre. The reviewer accepts or returns it, signing with their own password."],
  ["Certify", "Accepted checklists become certificates. Registers, due dates and reports update only at this point."],
  ["Close the loop", "Observations move to the Compliance monitor with owners and target dates, with reminder e-mails for late points."],
] as const;

const faqs = [
  ["Does IRIS need a server or internet connection?", "No dedicated server is needed. The office PCs work from a shared database folder on your LAN, and the tablets work fully offline. Tablets and office exchange work through a shared OneDrive folder whenever a connection is available."],
  ["Where is our data stored?", "On your own network and in your own OneDrive. NumSum Labs does not hold your plant data."],
  ["Can we bring our existing registers?", "Yes. IRIS has Import / Export and data-management tools, and our team helps migrate your existing Excel registers during implementation."],
  ["Which tablets are supported?", "Android 10 or newer. The app ships with the base data built in, so it works as soon as it is installed."],
  ["How is access controlled?", "An administrator ticks, per user, the applications and pages they may open. The same rights apply on the tablet, and approvals are signed with the user's own password."],
  ["How is IRIS licensed?", "Per site, with implementation, data migration, training and support options. Ask for a quotation sized to your equipment count and team."],
] as const;

const moduleOptions = ["Pressure vessels", "Lifting equipment", "IBR boilers", "SMPV", "Thickness & tanks", "Piping", "Steam traps", "RBI (API 581)", "Damage mechanisms (API 571)", "Observations & compliance", "Tablet field app"];

function MockDashboard() {
  const cards = [["Overdue", "bg-red-400/70"], ["Due in 30 days", "bg-amber-300/80"], ["Awaiting review", "bg-blue-300/80"], ["Certificates to generate", "bg-emerald-300/80"]] as const;
  return <div aria-hidden="true" className="relative rounded-[2rem] border border-white/10 bg-[#09111d]/90 p-4 shadow-[0_32px_120px_rgba(0,0,0,.42)]">
    <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.045] p-5">
      <div className="flex items-center justify-between text-xs uppercase tracking-[.22em] text-white/45"><span>IRIS · Pressure vessels</span><span className="rounded-full bg-blue-400/20 px-3 py-1 normal-case tracking-normal text-blue-100">New checklist</span></div>
      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/40"><Search size={14} /> Search any tag, line or certificate · Ctrl K</div>
      <div className="mt-4 grid grid-cols-2 gap-3">{cards.map(([label, color]) => <div key={label} className="rounded-2xl border border-white/10 bg-white/[0.04] p-3"><div className={`h-1.5 w-10 rounded-full ${color}`} /><p className="mt-3 text-sm text-white/75">{label}</p><div className="mt-2 h-2 w-16 rounded-full bg-white/10" /></div>)}</div>
      <div className="mt-4 space-y-2">{["F-23 external", "On-stream thickness", "Detailed internal plan"].map((t, i) => <div key={t} className="flex items-center justify-between rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-xs text-white/60"><span>{t}</span><span className="h-1.5 rounded-full bg-white/15" style={{ width: `${70 - i * 15}px` }} /></div>)}</div>
    </div>
    <div className="absolute -bottom-6 -left-6 hidden w-40 rounded-[1.4rem] border border-white/10 bg-[#0b1626] p-3 shadow-2xl sm:block"><p className="text-[10px] uppercase tracking-[.2em] text-white/45">Tablet · offline</p><div className="mt-2 space-y-1.5">{[0, 1, 2].map((i) => <div key={i} className="h-2 rounded-full bg-white/12" style={{ width: `${90 - i * 18}%` }} />)}</div><div className="mt-3 rounded-lg bg-amber-100/80 py-1 text-center text-[10px] font-semibold text-black">Submit checklist</div></div>
  </div>;
}

export default function IrisPage() {
  const jsonLd = { "@context": "https://schema.org", "@type": "SoftwareApplication", name: "IRIS — Integrity & Reliability Inspection System", applicationCategory: "BusinessApplication", operatingSystem: "Windows, Android", description, url: `${siteUrl}/products/iris`, publisher: { "@type": "Organization", name: "NumSum Labs", url: siteUrl } };
  return <main className="overflow-hidden bg-[#060504] text-[#fff8ea]">
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

    <section className="relative mx-auto grid max-w-7xl items-center gap-12 px-6 py-16 md:grid-cols-[1.05fr_.95fr] md:py-24">
      <div className="hero-orb hero-orb-a" /><div className="hero-orb hero-orb-b" />
      <div className="relative z-10">
        <p className="mb-5 inline-flex rounded-full border border-amber-200/20 bg-amber-200/10 px-4 py-2 text-xs font-semibold uppercase tracking-[.22em] text-amber-100/85">IRIS · by NumSum Labs</p>
        <h1 className="font-display text-4xl font-bold leading-[1.04] tracking-[-.05em] sm:text-5xl lg:text-6xl">Every statutory and reliability inspection. One system. Office and field.</h1>
        <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 md:text-lg">IRIS — the Integrity &amp; Reliability Inspection System — runs your inspection registers, checklists, certificates, thickness surveys, RBI and observations on the office PC, and lets engineers inspect offline on a tablet at site. Same data, one review, no re-typing.</p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row"><a href="#demo" className="rounded-full bg-amber-100 px-6 py-3 text-center text-sm font-semibold text-black shadow-[0_18px_60px_rgba(245,158,11,.22)] transition hover:bg-white">Book a demo</a><a href="#demo" className="glass rounded-full px-6 py-3 text-center text-sm font-semibold text-white hover:border-blue-300">Request pricing</a><a href="#modules" className="glass rounded-full px-6 py-3 text-center text-sm font-semibold text-white hover:border-blue-300">See modules</a></div>
        <p className="mt-6 text-sm text-white/50">Built by inspection and reliability engineers for refineries, petrochemical, gas-processing and fertiliser plants in India.</p>
      </div>
      <div className="relative z-10"><MockDashboard /></div>
    </section>

    <section className="mx-auto max-w-7xl px-6 py-14">
      <p className="section-eyebrow">Why IRIS</p><h2 className="section-title">Stop chasing due dates across spreadsheets.</h2>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[["Nothing falls through", "Each inspection duty — external, thickness, internal, load test, IBR renewal — has its own due date, dashboard card and overdue list."], ["Field work arrives ready to review", "Checklists, photos, surveys and equipment corrections come back from the tablet automatically and wait in one Review centre."], ["Audit-ready by design", "E-signed approvals, certificates that drive the registers, compliance tracking to closure and Excel / PDF for every page."]].map(([t, d]) => <Card key={t} className="premium-card"><h3 className="text-xl font-semibold">{t}</h3><p className="mt-3 text-sm leading-6 text-white/65">{d}</p></Card>)}
      </div>
    </section>

    <section id="modules" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-14">
      <p className="section-eyebrow">Modules</p><h2 className="section-title">Everything an inspection department runs.</h2>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{modules.map(({ icon: Icon, name, text }) => <Card key={name} className="premium-card h-full"><Icon className="text-amber-100" size={22} aria-hidden="true" /><h3 className="mt-4 text-lg font-semibold">{name}</h3><p className="mt-2 text-sm leading-6 text-white/65">{text}</p></Card>)}</div>
      <p className="mt-6 text-sm text-white/50">Also included: asset monitor, files, data management, import / export and settings. Standards referenced: API RP 581, API 571, Indian Boiler Regulations, Factories Act and SMPV (U) Rules.</p>
    </section>

    <section className="mx-auto max-w-7xl px-6 py-14">
      <p className="section-eyebrow">Office and field</p><h2 className="section-title">Two places, one set of data.</h2>
      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <Card className="premium-card"><MonitorSmartphone className="text-blue-200" aria-hidden="true" /><h3 className="mt-4 text-xl font-semibold">Office PC</h3><ul className="mt-3 space-y-2 text-sm text-white/65"><li>Portable — nothing to install; runs from the desktop or a LAN share.</li><li>Works on a shared database folder on your network.</li><li>Registers, reviews, certificates, reports, RBI and letters.</li></ul></Card>
        <Card className="premium-card"><Tablet className="text-blue-200" aria-hidden="true" /><h3 className="mt-4 text-xl font-semibold">Site tablet</h3><ul className="mt-3 space-y-2 text-sm text-white/65"><li>Android app that works fully offline.</li><li>Start an inspection by typing any tag; fill checklists, surveys and photos.</li><li>Add or correct equipment on the spot.</li></ul></Card>
        <Card className="premium-card"><Cloud className="text-blue-200" aria-hidden="true" /><h3 className="mt-4 text-xl font-semibold">Automatic exchange</h3><ul className="mt-3 space-y-2 text-sm text-white/65"><li>One update file for every tablet, re-published when data changes.</li><li>Return files read every two minutes; new work waits for review.</li><li>Unconfirmed work is never removed and is sent again.</li></ul></Card>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-6 py-14">
      <p className="section-eyebrow">How it works</p><h2 className="section-title">From due date to closed observation.</h2>
      <ol className="mt-8 grid gap-4 md:grid-cols-5">{flow.map(([t, d], i) => <li key={t}><Card className="premium-card h-full"><p className="text-sm font-semibold text-amber-100/80">0{i + 1}</p><h3 className="mt-4 text-lg font-semibold">{t}</h3><p className="mt-2 text-sm leading-6 text-white/60">{d}</p></Card></li>)}</ol>
    </section>

    <section className="mx-auto max-w-7xl px-6 py-14">
      <div className="grid gap-5 md:grid-cols-2">
        <Card className="premium-card"><p className="section-eyebrow">Easy to learn</p><h3 className="mt-3 font-display text-2xl">Every page works the same way.</h3><ul className="mt-4 space-y-2 text-sm text-white/65"><li>Count cards (Overdue, Due in 30 days…) double as one-click filters.</li><li>One search box and one Filters button, with removable filter chips.</li><li>One Reports menu with every report, Excel and PDF of the page.</li><li>Back returns to exactly the same list, tab and filters.</li><li>Global search (Ctrl K) finds any tag, line, page, file or certificate.</li></ul></Card>
        <Card className="premium-card"><Lock className="text-amber-100" aria-hidden="true" /><h3 className="mt-3 font-display text-2xl">Control and accountability.</h3><ul className="mt-4 space-y-2 text-sm text-white/65"><li>Per-user rights for every application and page — hidden pages cannot be opened or run.</li><li>Rights travel to the tablet with the update.</li><li>Approvals are e-signed with the user&apos;s own password.</li><li>Built-in diagnostics and error log; your data stays on your network.</li></ul></Card>
      </div>
    </section>

    <section className="mx-auto max-w-7xl px-6 py-14">
      <p className="section-eyebrow">Questions</p><h2 className="section-title">Frequently asked.</h2>
      <div className="mt-8 grid gap-3">{faqs.map(([q, a]) => <details key={q} className="glass group rounded-3xl p-5"><summary className="cursor-pointer list-none font-semibold text-white marker:hidden">{q}<span className="float-right text-white/40 transition group-open:rotate-45">+</span></summary><p className="mt-3 text-sm leading-6 text-white/65">{a}</p></details>)}</div>
    </section>

    <section id="demo" className="mx-auto max-w-7xl scroll-mt-24 px-6 py-16">
      <div className="grid gap-8 lg:grid-cols-[.8fr_1.2fr]">
        <div><p className="section-eyebrow">Get IRIS</p><h2 className="section-title">Book a demo or ask for a quotation.</h2><p className="mt-4 text-white/65">Tell us about your plant and which modules matter most. We will set up a walkthrough on your kind of equipment and send a proposal covering licence, implementation, data migration and training.</p><ul className="mt-6 space-y-2 text-sm text-white/60"><li>• Live walkthrough of the PC and tablet apps</li><li>• Help moving your existing registers into IRIS</li><li>• Training for engineers and reviewers</li></ul></div>
        <Card className="premium-card"><EnquiryForm defaultTopic="iris_demo" topics={["iris_demo", "iris_quote"]} moduleOptions={moduleOptions} showUsers submitLabel="Request demo / quotation" /></Card>
      </div>
    </section>
  </main>;
}
