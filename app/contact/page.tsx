import type { Metadata } from "next";
import { EnquiryForm } from "@/components/enquiry-form";
import { Card } from "@/components/ui";
import { contactEmail } from "@/lib/site";
import type { EnquiryTopic } from "@/lib/repositories/enquiries";

export const metadata: Metadata = {
  title: "Contact NumSum Labs",
  description: "Talk to NumSum Labs about IRIS inspection software, an MSME problem, a partnership or the investment planner.",
  openGraph: { title: "Contact NumSum Labs", description: "Talk to NumSum Labs about IRIS inspection software, an MSME problem, a partnership or the investment planner." },
};

const topics = ["general", "iris_demo", "iris_quote", "msme_problem", "partnership", "investment_tool"] as const;

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ topic?: string }> }) {
  const { topic } = await searchParams;
  const preset = (topics as readonly string[]).includes(topic || "") ? (topic as EnquiryTopic) : "general";
  const email = contactEmail();
  return <main className="min-h-screen bg-navy px-6 py-14">
    <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[.9fr_1.1fr]">
      <section>
        <p className="section-eyebrow">Contact</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-[-.04em] md:text-5xl">Let&apos;s talk about your plant, your problem or your idea.</h1>
        <p className="mt-5 max-w-xl text-white/65">Leave your details and the NumSum Labs team will reply within two working days. For IRIS, tell us roughly how many pieces of equipment and engineers you have — we will tailor the demo to it.</p>
        <div className="mt-8 grid gap-4">
          <Card><h2 className="font-semibold text-white">What happens next</h2><ol className="mt-3 grid gap-2 text-sm text-white/65"><li>1. We read your enquiry and reply by e-mail or phone.</li><li>2. A short call to understand your requirement.</li><li>3. A demo, proposal or next step — no obligation.</li></ol></Card>
          {email && <Card><h2 className="font-semibold text-white">E-mail</h2><a className="mt-2 inline-block text-amber-100 hover:text-white" href={`mailto:${email}`}>{email}</a></Card>}
          <Card><h2 className="font-semibold text-white">Grievances and data requests</h2><p className="mt-2 text-sm text-white/65">To access, correct or delete your personal data, or to raise a grievance, choose “General enquiry” and start your message with “Data request” or “Grievance”. See the <a className="underline" href="/privacy">privacy policy</a>.</p></Card>
        </div>
      </section>
      <Card className="premium-card"><h2 className="mb-6 font-display text-2xl">Send us a message</h2><EnquiryForm defaultTopic={preset} /></Card>
    </div>
  </main>;
}

/** Reads live records on every request (data rules differ per collection). */
export const dynamic = "force-dynamic";
