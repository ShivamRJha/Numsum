"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CodeModule, Mcq } from "@/lib/learn/codes-types";
import { GENS, rng, type GenQ } from "@/lib/learn/exam/generators";
import type { Track } from "@/lib/learn/exam/tracks";
import { cn } from "@/lib/utils";
import { ModuleProgress } from "./train/module-progress";

type Q = Mcq & { topic: string };
type Mod = Pick<CodeModule, "slug" | "short" | "title" | "chapters" | "mcq">;
const KEY = "ns-exam-v1";
const STATUS = { covered: ["Covered", "border-emerald-300/40 text-emerald-100"], partial: ["Partly covered", "border-amber-200/40 text-amber-100"], gap: ["Not yet on NumSum", "border-white/15 text-white/50"] } as const;

export function ExamPrep({ track, mods }: { track: Track; mods: Mod[] }) {
  const [tab, setTab] = useState<"plan" | "drill" | "mock">("plan");
  const t = (k: typeof tab, l: string) => <button type="button" onClick={() => setTab(k)} aria-pressed={tab === k} className={cn("rounded-full px-4 py-2 text-sm", tab === k ? "bg-amber-100 font-semibold text-black" : "border border-white/15 text-white/70")}>{l}</button>;
  return <div>
    <div className="flex flex-wrap gap-2">{t("plan", "1 · Study plan")}{t("drill", "2 · Calculation drills")}{t("mock", "3 · Mock exam")}</div>
    {tab === "plan" && <StudyPlan track={track} mods={mods} />}
    {tab === "drill" && <Drills track={track} />}
    {tab === "mock" && <Mock track={track} mods={mods} />}
  </div>;
}

function StudyPlan({ track, mods }: { track: Track; mods: Mod[] }) {
  return <div className="mt-6 grid gap-8">
    <section><h2 className="font-display text-2xl font-semibold text-white">Modules to complete</h2><p className="mt-1 text-sm text-white/55">Train each module to 100% lessons and at least 70% on its quiz.</p>
      <ol className="mt-4 grid gap-2 md:grid-cols-2">{mods.map((m, i) => <li key={m.slug} className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 p-4"><span><span className="font-mono text-xs text-white/40">{i + 1}</span> <Link href={`/learn/codes/${m.slug}/train`} className="font-semibold text-white hover:text-amber-50">{m.short}</Link><span className="block text-xs text-white/50">{m.title.split(" — ")[1]}</span><span className="mt-1 block"><ModuleProgress slug={m.slug} total={m.chapters.length} compact /></span></span><Link href={`/learn/codes/${m.slug}/train`} className="rounded-full bg-amber-100 px-3 py-1.5 text-xs font-semibold text-black">Train</Link></li>)}</ol></section>
    <section><h2 className="font-display text-2xl font-semibold text-white">Body of knowledge coverage</h2><p className="mt-1 text-sm text-white/55">Typical documents for this exam. Confirm the list and editions on API&apos;s current effectivity sheet.</p>
      <div className="mt-4 grid gap-2">{track.bok.map((b) => <div key={b.doc} className="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-white/10 p-4"><span className="min-w-0 flex-1"><span className="font-semibold text-white">{b.link ? <Link href={b.link} className="hover:text-amber-50">{b.doc}</Link> : b.doc}</span><span className="block text-sm text-white/60">{b.what}</span></span><span className={cn("rounded-full border px-2.5 py-1 text-xs", STATUS[b.status][1])}>{STATUS[b.status][0]}</span></div>)}</div></section>
    <section className="rounded-2xl border border-white/10 p-5"><h2 className="font-semibold text-white">Exam tips</h2><ul className="mt-2 grid gap-1.5 text-sm text-white/70">{track.tips.map((x) => <li key={x}>→ {x}</li>)}</ul></section>
  </div>;
}

function Drills({ track }: { track: Track }) {
  const gens = GENS.filter((g) => g.tracks.includes(track.key));
  const [g, setG] = useState(gens[0].key); const [seed, setSeed] = useState(() => Date.now()); const [pick, setPick] = useState<number | null>(null); const [stats, setStats] = useState({ n: 0, ok: 0 });
  const q: GenQ = useMemo(() => (gens.find((x) => x.key === g) || gens[0]).make(rng(seed)), [g, seed, gens]);
  const next = () => { setSeed(Date.now() + Math.floor(Math.random() * 1e6)); setPick(null); };
  return <div className="mt-6 grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
    <div className="grid h-fit gap-1.5">{gens.map((x) => <button key={x.key} type="button" onClick={() => { setG(x.key); next(); }} aria-pressed={g === x.key} className={cn("rounded-xl border px-3 py-2 text-left text-sm", g === x.key ? "border-amber-100/70 bg-amber-100/15 text-amber-50" : "border-white/10 text-white/70")}>{x.name}</button>)}<p className="mt-2 text-xs text-white/45">Score this session: {stats.ok}/{stats.n}</p></div>
    <div className="rounded-3xl border border-white/10 p-6">
      <p className="text-xs uppercase tracking-[.14em] text-amber-100/80">{q.topic}</p><h2 className="mt-2 text-lg leading-8 text-white">{q.q}</h2>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">{q.options.map((o, n) => <button key={o + n} type="button" disabled={pick !== null} onClick={() => { setPick(n); setStats((s) => ({ n: s.n + 1, ok: s.ok + (n === q.answer ? 1 : 0) })); }} className={cn("rounded-2xl border px-4 py-3 text-left font-mono text-sm", pick === null && "border-white/12 text-white hover:border-amber-100/50", pick !== null && n === q.answer && "border-emerald-300/60 bg-emerald-400/10 text-emerald-50", pick === n && n !== q.answer && "border-red-300/60 bg-red-500/10 text-red-50", pick !== null && n !== q.answer && pick !== n && "border-white/8 text-white/35")}>{o}</button>)}</div>
      {pick !== null && <div className="mt-4 rounded-2xl border border-sky-200/25 bg-sky-300/[0.05] p-4 text-sm leading-7 text-white/80"><b className="text-white">Worked answer:</b> {q.why}</div>}
      <div className="mt-4 text-right"><button type="button" onClick={next} className="rounded-full bg-amber-100 px-5 py-2 text-sm font-semibold text-black">{pick === null ? "Skip" : "Next problem →"}</button></div>
    </div>
  </div>;
}

function Mock({ track, mods }: { track: Track; mods: Mod[] }) {
  const [size, setSize] = useState(30); const [timed, setTimed] = useState(true); const [qs, setQs] = useState<Q[] | null>(null); const [ans, setAns] = useState<Record<number, number>>({}); const [k, setK] = useState(0); const [end, setEnd] = useState(false); const [left, setLeft] = useState(0); const [best, setBest] = useState<number | null>(null);
  useEffect(() => { try { const b = JSON.parse(localStorage.getItem(KEY) || "{}")[track.key]; if (typeof b === "number") setBest(b); } catch { /* ignore */ } }, [track.key]);
  useEffect(() => { if (!qs || end || !timed) return; const id = setInterval(() => setLeft((s) => { if (s <= 1) { setEnd(true); return 0; } return s - 1; }), 1000); return () => clearInterval(id); }, [qs, end, timed]);
  const start = () => {
    const r = rng(Date.now()); const pool: Q[] = mods.flatMap((m) => (m.mcq || []).map((q) => ({ ...q, topic: m.short })));
    for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; }
    const nCalc = Math.round(size * 0.4); const gens = GENS.filter((g) => g.tracks.includes(track.key)); const calc: Q[] = Array.from({ length: nCalc }, (_, i) => gens[i % gens.length].make(r));
    const mix = [...pool.slice(0, size - nCalc), ...calc]; for (let i = mix.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [mix[i], mix[j]] = [mix[j], mix[i]]; }
    setQs(mix); setAns({}); setK(0); setEnd(false); setLeft(size * 90);
  };
  const finish = () => { setEnd(true); };
  useEffect(() => { if (!end || !qs) return; const sc = Math.round((qs.filter((q, i) => ans[i] === q.answer).length / qs.length) * 100); try { const all = JSON.parse(localStorage.getItem(KEY) || "{}"); all[track.key] = Math.max(all[track.key] ?? 0, sc); localStorage.setItem(KEY, JSON.stringify(all)); setBest(all[track.key]); } catch { /* ignore */ } }, [end]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!qs) return <div className="mt-6 max-w-xl rounded-3xl border border-white/10 p-6">
    <h2 className="font-display text-2xl font-semibold text-white">Mock exam</h2><p className="mt-2 text-sm text-white/65">A mix of concept questions from the {track.name} modules and freshly generated calculations (about 40%). New questions every attempt. 90 seconds per question when timed.</p>
    <div className="mt-4 flex flex-wrap gap-2">{[20, 30, 50].map((n) => <button key={n} type="button" onClick={() => setSize(n)} aria-pressed={size === n} className={cn("rounded-full border px-3 py-1.5 text-sm", size === n ? "border-amber-100/70 bg-amber-100/15 text-amber-50" : "border-white/12 text-white/60")}>{n} questions</button>)}<label className="ml-2 flex items-center gap-2 text-sm text-white/70"><input type="checkbox" checked={timed} onChange={(e) => setTimed(e.target.checked)} /> Timed</label></div>
    <button type="button" onClick={start} className="mt-5 rounded-full bg-amber-100 px-6 py-2.5 text-sm font-semibold text-black">Start mock exam</button>{best !== null && <p className="mt-3 text-sm text-white/50">Your best score: {best}%</p>}
  </div>;
  if (end) { const right = qs.filter((q, i) => ans[i] === q.answer).length; const pct = Math.round((right / qs.length) * 100);
    const byTopic = new Map<string, [number, number]>(); qs.forEach((q, i) => { const v = byTopic.get(q.topic) || [0, 0]; byTopic.set(q.topic, [v[0] + (ans[i] === q.answer ? 1 : 0), v[1] + 1]); });
    return <div className="mt-6 grid gap-6"><div className="rounded-3xl border border-white/10 p-6 text-center"><p className="font-mono text-6xl text-amber-100">{pct}%</p><p className="mt-1 text-white/65">{right} of {qs.length} correct · {pct >= 70 ? "at or above a typical pass mark — keep it there across several attempts" : "below 70% — focus on the weak topics below"}</p><button type="button" onClick={() => setQs(null)} className="mt-4 rounded-full bg-amber-100 px-5 py-2 text-sm font-semibold text-black">New mock exam</button></div>
      <div className="rounded-3xl border border-white/10 p-6"><h3 className="font-semibold text-white">By topic</h3><div className="mt-3 grid gap-2">{[...byTopic.entries()].sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1]).map(([tp, [a, b]]) => <div key={tp} className="grid grid-cols-[12rem_1fr_4rem] items-center gap-3 text-sm"><span className="text-white/75">{tp}</span><span className="h-2 rounded-full bg-white/10"><span className={cn("block h-2 rounded-full", a / b >= 0.7 ? "bg-emerald-300" : "bg-red-300")} style={{ width: `${(a / b) * 100}%` }} /></span><span className="text-right font-mono text-white/70">{a}/{b}</span></div>)}</div></div>
      <div className="grid gap-2">{qs.map((q, i) => ans[i] === q.answer ? null : <details key={i} className="rounded-2xl border border-red-300/20 p-4"><summary className="cursor-pointer text-sm text-white">{i + 1}. {q.q}</summary><p className="mt-2 text-sm text-emerald-100">Answer: {q.options[q.answer]}</p><p className="mt-1 text-sm text-white/65">{q.why}</p></details>)}</div>
    </div>; }
  const q = qs[k]; const mm = Math.floor(left / 60), ss = left % 60;
  return <div className="mx-auto mt-6 max-w-2xl">
    <div className="flex items-center justify-between text-sm text-white/55"><span>Question {k + 1} / {qs.length} · {q.topic}</span>{timed && <span className={cn("font-mono", left < 120 ? "text-red-200" : "text-white")}>{mm}:{String(ss).padStart(2, "0")}</span>}</div>
    <div className="mt-2 flex flex-wrap gap-1">{qs.map((_, i) => <button key={i} type="button" onClick={() => setK(i)} aria-label={`Question ${i + 1}`} className={cn("h-2.5 w-2.5 rounded-full", i === k ? "bg-amber-200" : ans[i] !== undefined ? "bg-sky-300/70" : "bg-white/15")} />)}</div>
    <h2 className="mt-5 text-lg leading-8 text-white">{q.q}</h2>
    <div className="mt-4 grid gap-2">{q.options.map((o, n) => <button key={o + n} type="button" onClick={() => setAns((a) => ({ ...a, [k]: n }))} className={cn("rounded-2xl border px-4 py-3 text-left text-sm", ans[k] === n ? "border-sky-300/70 bg-sky-300/10 text-white" : "border-white/12 text-white/80 hover:border-white/30")}><span className="mr-2 font-mono text-white/40">{"ABCD"[n]}</span>{o}</button>)}</div>
    <div className="mt-5 flex justify-between"><button type="button" onClick={() => setK(Math.max(0, k - 1))} disabled={k === 0} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 disabled:opacity-30">← Back</button>{k < qs.length - 1 ? <button type="button" onClick={() => setK(k + 1)} className="rounded-full bg-amber-100 px-5 py-2 text-sm font-semibold text-black">Next →</button> : <button type="button" onClick={finish} className="rounded-full bg-emerald-300 px-5 py-2 text-sm font-semibold text-black">Finish & score</button>}</div>
    <p className="mt-3 text-xs text-white/40">Answered {Object.keys(ans).length} of {qs.length}. Feedback is shown at the end, like the real exam.</p>
  </div>;
}
