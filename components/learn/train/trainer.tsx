"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CodeModule } from "@/lib/learn/codes-types";
import { Visual } from "@/components/learn/visuals";
import { cn } from "@/lib/utils";
import { useProgress } from "./progress";

type Tab = "lessons" | "cards" | "quiz";
const shuffle = <T,>(a: T[]) => { const b = [...a]; for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };

export function Trainer({ m, next, clauses = {} }: { m: CodeModule; next?: { slug: string; short: string }; clauses?: Record<string, number> }) {
  const { p, update } = useProgress(m.slug);
  const [tab, setTab] = useState<Tab>("lessons");
  const [i, setI] = useState(0);
  useEffect(() => {
    const h = typeof window !== "undefined" ? decodeURIComponent(window.location.hash.slice(1)) : "";
    const byHash = h ? m.chapters.findIndex((c) => c.id === h) : -1;
    const k = byHash >= 0 ? byHash : m.chapters.findIndex((c) => c.id === p.last);
    if (k >= 0) setI(k);
  }, [m.chapters, p.last]);
  const ch = m.chapters[i]; const done = new Set(p.done); const pct = Math.round((done.size / m.chapters.length) * 100);
  const go = (k: number) => { const n = Math.max(0, Math.min(m.chapters.length - 1, k)); setI(n); update((x) => ({ ...x, last: m.chapters[n].id })); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const complete = () => { update((x) => ({ ...x, done: [...new Set([...x.done, ch.id])], last: ch.id })); if (i < m.chapters.length - 1) go(i + 1); else { setTab("quiz"); document.getElementById("trainer-top")?.scrollIntoView({ behavior: "smooth" }); } };
  useEffect(() => { if (tab !== "lessons") return; const h = (e: KeyboardEvent) => { if ((e.target as HTMLElement)?.closest("input,select,textarea")) return; if (e.key === "ArrowRight") go(i + 1); if (e.key === "ArrowLeft") go(i - 1); }; window.addEventListener("keydown", h); return () => window.removeEventListener("keydown", h); });
  const tabBtn = (t: Tab, label: string) => <button type="button" onClick={() => { setTab(t); document.getElementById("trainer-top")?.scrollIntoView({ behavior: "smooth", block: "start" }); }} aria-pressed={tab === t} className={cn("rounded-full px-4 py-2 text-sm", tab === t ? "bg-amber-100 font-semibold text-black" : "border border-white/15 text-white/70 hover:text-white")}>{label}</button>;

  return <div id="trainer-top" className="scroll-mt-24">
    <div className="sticky top-[4.5rem] z-20 -mx-2 rounded-2xl border border-white/10 bg-[#070c16]/95 px-4 py-3 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">{tabBtn("lessons", `Lessons ${done.size}/${m.chapters.length}`)}{tabBtn("cards", "Flashcards")}{tabBtn("quiz", `Quiz${p.best !== undefined ? ` · best ${p.best}%` : ""}`)}</div>
        <div className="flex items-center gap-2 text-xs text-white/55"><span className="h-2 w-40 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-gradient-to-r from-emerald-300 to-amber-200 transition-all" style={{ width: `${pct}%` }} /></span>{pct}%</div>
      </div>
    </div>

    {tab === "lessons" && <div className="mt-6 grid gap-6 lg:grid-cols-[16rem_minmax(0,1fr)]">
      <nav aria-label="Lessons" className="h-fit rounded-2xl border border-white/10 p-3 lg:sticky lg:top-40"><ol className="grid gap-1 text-sm">{m.chapters.map((c, k) => <li key={c.id}><button type="button" onClick={() => go(k)} className={cn("flex w-full items-start gap-2 rounded-lg px-2 py-1.5 text-left", k === i ? "bg-amber-100/15 text-amber-50" : "text-white/65 hover:text-white")}><span className={cn("mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border text-[10px]", done.has(c.id) ? "border-emerald-300 bg-emerald-300 text-black" : "border-white/25")}>{done.has(c.id) ? "✓" : ""}</span><span>{c.title}</span></button></li>)}</ol></nav>
      <article className="min-w-0">
        <p className="font-mono text-xs text-amber-100/80">LESSON {i + 1} OF {m.chapters.length} · {m.short} {ch.ref}</p>
        <h2 className="mt-1 font-display text-3xl font-semibold tracking-[-.02em] text-white">{ch.title}</h2>
        <p className="mt-4 text-lg leading-8 text-white/85">{ch.summary}</p>
        {ch.visual && <Visual k={ch.visual} />}
        {ch.formula && <div className="mt-4 rounded-2xl border border-amber-100/25 bg-amber-100/[0.05] p-4"><p className="text-xs font-semibold uppercase tracking-[.14em] text-amber-100/80">Formula</p>{ch.formula.map((f) => <p key={f} className="mt-1 font-mono text-sm text-white">{f}</p>)}</div>}
        <h3 className="mt-6 text-sm font-semibold uppercase tracking-[.14em] text-white/50">Key points</h3>
        <ol className="mt-3 grid gap-2">{ch.points.map((pt, k) => <li key={pt} className="flex gap-3 rounded-xl border border-white/10 bg-white/[0.02] p-3 leading-7 text-white/80"><span className="font-mono text-sm text-amber-100/70">{k + 1}</span><span>{pt}</span></li>)}</ol>
        {ch.deep && ch.deep.length > 0 && <div className="mt-5 grid gap-2">{ch.deep.map(([h, t]) => <details key={h} className="rounded-2xl border border-violet-200/20 bg-violet-300/[0.04] p-4"><summary className="cursor-pointer text-sm font-semibold text-violet-100">Deep dive — {h}</summary><p className="mt-2 text-sm leading-7 text-white/75">{t}</p></details>)}</div>}
        {(ch.tool || clauses[ch.id]) && <div className="mt-5 flex flex-wrap gap-3 text-sm">
          {clauses[ch.id] ? <Link href={`/learn/codes/${m.slug}/clauses?lesson=${ch.id}`} className="rounded-full border border-emerald-300/30 px-3.5 py-1.5 text-emerald-100 hover:border-emerald-300/60">§ Read the {clauses[ch.id]} clauses behind this lesson →</Link> : null}
          {ch.tool && <Link href={ch.tool[1]} className="rounded-full border border-amber-100/30 px-3.5 py-1.5 text-amber-100 hover:text-white">Practise: {ch.tool[0]} →</Link>}
        </div>}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5">
          <button type="button" onClick={() => go(i - 1)} disabled={i === 0} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/75 disabled:opacity-30">← Previous</button>
          <span className="hidden text-xs text-white/35 sm:inline">Tip: use ← → keys</span>
          <button type="button" onClick={complete} className="rounded-full bg-emerald-300 px-5 py-2.5 text-sm font-semibold text-black hover:bg-emerald-200">{done.has(ch.id) ? "Next" : "Mark learned"} {i < m.chapters.length - 1 ? "→" : "→ take the quiz"}</button>
        </div>
      </article>
    </div>}

    {tab === "cards" && <Flashcards m={m} />}
    {tab === "quiz" && <Quiz m={m} onScore={(s) => update((x) => ({ ...x, best: Math.max(x.best ?? 0, s), completedAt: s >= 70 && x.done.length >= m.chapters.length ? new Date().toISOString().slice(0, 10) : x.completedAt }))} next={next} allDone={done.size >= m.chapters.length} />}
  </div>;
}

function Flashcards({ m }: { m: CodeModule }) {
  const base = useMemo(() => [...m.concepts.map(([a, b]) => ({ f: a, b })), ...m.quiz.map(([a, b]) => ({ f: a, b }))], [m]);
  const [cards, setCards] = useState(base); const [k, setK] = useState(0); const [flip, setFlip] = useState(false); const [known, setKnown] = useState(0);
  const c = cards[k];
  const nxt = (knew: boolean) => { if (knew) setKnown((n) => n + 1); else setCards((x) => [...x, x[k]]); setFlip(false); setK((n) => Math.min(n + 1, cards.length)); };
  if (!c) return <div className="mt-8 rounded-3xl border border-emerald-300/30 bg-emerald-400/[0.06] p-8 text-center"><p className="font-display text-2xl text-white">Deck finished</p><p className="mt-2 text-white/65">{known} cards known first time out of {base.length}.</p><button type="button" onClick={() => { setCards(shuffle(base)); setK(0); setKnown(0); }} className="mt-4 rounded-full bg-amber-100 px-5 py-2 text-sm font-semibold text-black">Shuffle and restart</button></div>;
  return <div className="mx-auto mt-8 max-w-2xl">
    <p className="text-center text-xs text-white/45">Card {k + 1} of {cards.length} · tap the card to flip</p>
    <button type="button" onClick={() => setFlip((f) => !f)} className={cn("mt-3 flex min-h-[16rem] w-full items-center justify-center rounded-3xl border p-8 text-center transition", flip ? "border-emerald-300/40 bg-emerald-400/[0.06]" : "border-amber-100/30 bg-amber-100/[0.05]")}>
      <span><span className="block text-xs uppercase tracking-[.16em] text-white/40">{flip ? "Answer" : "Term / question"}</span><span className={cn("mt-3 block text-white", flip ? "text-lg leading-8" : "font-display text-2xl font-semibold")}>{flip ? c.b : c.f}</span></span>
    </button>
    <div className="mt-4 flex justify-center gap-3">{flip ? <><button type="button" onClick={() => nxt(false)} className="rounded-full border border-red-300/40 px-5 py-2 text-sm text-red-100">Review again</button><button type="button" onClick={() => nxt(true)} className="rounded-full bg-emerald-300 px-5 py-2 text-sm font-semibold text-black">I knew it</button></> : <button type="button" onClick={() => setFlip(true)} className="rounded-full bg-amber-100 px-5 py-2 text-sm font-semibold text-black">Show answer</button>}</div>
  </div>;
}

function Quiz({ m, onScore, next, allDone }: { m: CodeModule; onScore: (s: number) => void; next?: { slug: string; short: string }; allDone: boolean }) {
  const mk = () => shuffle(m.mcq || []);
  const [qs, setQs] = useState(mk); const [k, setK] = useState(0); const [pick, setPick] = useState<number | null>(null); const [score, setScore] = useState(0); const [doneQ, setDoneQ] = useState(false);
  if (!qs.length) return <p className="mt-8 text-white/60">No quiz for this module yet.</p>;
  if (doneQ) { const pct = Math.round((score / qs.length) * 100); return <div className="mt-8 rounded-3xl border border-white/10 p-8 text-center">
    <p className="font-mono text-6xl text-amber-100">{pct}%</p><p className="mt-2 text-white/70">{score} of {qs.length} correct</p>
    <p className="mt-3 text-white/60">{pct >= 70 ? (allDone ? "Module complete — well done." : "Pass mark reached. Finish the remaining lessons to complete the module.") : "Below 70% — review the lessons you missed and try again."}</p>
    <div className="mt-5 flex flex-wrap justify-center gap-3"><button type="button" onClick={() => { setQs(mk()); setK(0); setPick(null); setScore(0); setDoneQ(false); }} className="rounded-full border border-white/15 px-5 py-2 text-sm text-white/80">Try again</button>{next && <Link href={`/learn/codes/${next.slug}/train`} className="rounded-full bg-amber-100 px-5 py-2 text-sm font-semibold text-black">Next module: {next.short} →</Link>}</div>
  </div>; }
  const q = qs[k]; const answered = pick !== null;
  return <div className="mx-auto mt-8 max-w-2xl">
    <div className="flex justify-between text-xs text-white/45"><span>Question {k + 1} of {qs.length}</span><span>Score {score}</span></div>
    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-amber-200" style={{ width: `${(k / qs.length) * 100}%` }} /></div>
    <h2 className="mt-6 text-xl font-semibold leading-8 text-white">{q.q}</h2>
    <div className="mt-4 grid gap-2">{q.options.map((o, n) => { const right = n === q.answer; const chosen = n === pick; return <button key={o} type="button" disabled={answered} onClick={() => { setPick(n); if (right) setScore((s) => s + 1); }} className={cn("rounded-2xl border px-4 py-3 text-left text-sm transition", !answered && "border-white/12 text-white/85 hover:border-amber-100/50", answered && right && "border-emerald-300/60 bg-emerald-400/10 text-emerald-50", answered && chosen && !right && "border-red-300/60 bg-red-500/10 text-red-50", answered && !right && !chosen && "border-white/8 text-white/40")}><span className="mr-2 font-mono text-white/40">{"ABCD"[n]}</span>{o}</button>; })}</div>
    {answered && <div className={cn("mt-4 rounded-2xl border p-4 text-sm leading-7", pick === q.answer ? "border-emerald-300/30 text-emerald-50" : "border-amber-200/30 text-amber-50")}><strong>{pick === q.answer ? "Correct." : "Not quite."}</strong> {q.why}</div>}
    {answered && <div className="mt-4 text-right"><button type="button" onClick={() => { if (k + 1 >= qs.length) { const s = Math.round((score / qs.length) * 100); onScore(s); setDoneQ(true); } else { setK(k + 1); setPick(null); } }} className="rounded-full bg-amber-100 px-5 py-2 text-sm font-semibold text-black">{k + 1 >= qs.length ? "See result" : "Next question →"}</button></div>}
  </div>;
}
