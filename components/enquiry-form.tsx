"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type FormEvent } from "react";
import { submitEnquiry, topicLabels, type EnquiryTopic } from "@/lib/repositories/enquiries";
import { cn } from "@/lib/utils";

const field = "w-full rounded-2xl border border-white/12 bg-white/[0.04] px-4 py-3 text-white placeholder:text-white/35 focus:border-amber-100/60 focus:outline-none focus:ring-2 focus:ring-amber-100/30";
const label = "mb-1.5 block text-sm font-medium text-white/80";

type Props = {
  defaultTopic?: EnquiryTopic;
  topics?: EnquiryTopic[];
  moduleOptions?: string[];
  showUsers?: boolean;
  submitLabel?: string;
  className?: string;
};

export function EnquiryForm({ defaultTopic = "general", topics, moduleOptions, showUsers, submitLabel = "Send enquiry", className }: Props) {
  const pathname = usePathname();
  const topicList = topics || (Object.keys(topicLabels) as EnquiryTopic[]);
  const [topic, setTopic] = useState<EnquiryTopic>(defaultTopic);
  const [modules, setModules] = useState<string[]>([]);
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    if (String(form.get("website") || "")) { setState("sent"); return; } // spam trap
    const name = String(form.get("name") || "").trim();
    const email = String(form.get("email") || "").trim();
    const message = String(form.get("message") || "").trim();
    if (name.length < 2) return fail("Please enter your name.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Please enter a valid e-mail address.");
    if (message.length < 10) return fail("Please tell us a little more (at least 10 characters).");
    if (!form.get("consent")) return fail("Please agree to be contacted about your enquiry.");
    setState("sending"); setError("");
    try {
      await submitEnquiry({
        name, email, message, topic,
        phone: String(form.get("phone") || ""),
        company: String(form.get("company") || ""),
        designation: String(form.get("designation") || ""),
        city: String(form.get("city") || ""),
        users: String(form.get("users") || ""),
        modules,
        sourcePage: pathname || "/",
      });
      setState("sent");
    } catch {
      fail("We could not send your enquiry just now. Please try again in a minute.");
    }
  }
  function fail(message: string) { setError(message); setState("error"); }

  if (state === "sent") return <div className={cn("rounded-3xl border border-emerald-300/30 bg-emerald-400/10 p-8", className)} role="status"><h3 className="font-display text-2xl text-white">Thank you — we have your details.</h3><p className="mt-3 text-white/70">The NumSum Labs team will get back to you within two working days.</p></div>;

  return <form onSubmit={onSubmit} noValidate className={cn("grid gap-4", className)} aria-describedby={error ? "enquiry-error" : undefined}>
    <div className="grid gap-4 sm:grid-cols-2">
      <div><label className={label} htmlFor="enq-name">Full name *</label><input id="enq-name" name="name" required autoComplete="name" className={field} /></div>
      <div><label className={label} htmlFor="enq-email">Work e-mail *</label><input id="enq-email" name="email" type="email" required autoComplete="email" className={field} /></div>
      <div><label className={label} htmlFor="enq-phone">Phone</label><input id="enq-phone" name="phone" type="tel" autoComplete="tel" className={field} /></div>
      <div><label className={label} htmlFor="enq-company">Company / plant</label><input id="enq-company" name="company" autoComplete="organization" className={field} /></div>
      <div><label className={label} htmlFor="enq-designation">Designation</label><input id="enq-designation" name="designation" autoComplete="organization-title" className={field} /></div>
      <div><label className={label} htmlFor="enq-city">City / state</label><input id="enq-city" name="city" autoComplete="address-level2" className={field} /></div>
    </div>
    {topicList.length > 1 && <div><label className={label} htmlFor="enq-topic">I am interested in</label><select id="enq-topic" value={topic} onChange={(e) => setTopic(e.target.value as EnquiryTopic)} className={field}>{topicList.map((t) => <option key={t} value={t} className="bg-[#0b1220]">{topicLabels[t]}</option>)}</select></div>}
    {showUsers && <div><label className={label} htmlFor="enq-users">Approximate number of users / tablets</label><input id="enq-users" name="users" placeholder="e.g. 8 engineers, 4 tablets" className={field} /></div>}
    {moduleOptions?.length ? <fieldset><legend className={label}>Modules you need</legend><div className="flex flex-wrap gap-2">{moduleOptions.map((m) => { const on = modules.includes(m); return <button type="button" key={m} aria-pressed={on} onClick={() => setModules((list) => on ? list.filter((x) => x !== m) : [...list, m])} className={cn("rounded-full border px-3 py-1.5 text-sm transition", on ? "border-amber-100/70 bg-amber-100/15 text-amber-50" : "border-white/12 text-white/65 hover:text-white")}>{m}</button>; })}</div></fieldset> : null}
    <div><label className={label} htmlFor="enq-message">Message *</label><textarea id="enq-message" name="message" rows={5} required className={field} placeholder="Tell us about your plant, equipment count or what you would like to see." /></div>
    <div className="hidden" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <label className="flex items-start gap-3 text-sm text-white/65"><input type="checkbox" name="consent" className="mt-1 h-4 w-4 accent-amber-200" /><span>I agree that NumSum Labs may contact me about this enquiry, as described in the <Link href="/privacy" className="underline hover:text-white">privacy policy</Link>.</span></label>
    {error && <p id="enquiry-error" role="alert" className="rounded-2xl border border-red-400/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">{error}</p>}
    <div><button type="submit" disabled={state === "sending"} className="rounded-full bg-amber-100 px-6 py-3 text-sm font-semibold text-black shadow-[0_18px_60px_rgba(245,158,11,.22)] transition hover:bg-white disabled:opacity-60">{state === "sending" ? "Sending…" : submitLabel}</button></div>
  </form>;
}
