"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/components/auth-provider";
import { LoadingState } from "@/components/data-states";
import { LEVELS, PATHS, RESEARCH_SKILLS, allItems, pathBySlug, type LevelKey } from "@/lib/research/paths";
import { getMyCard, listAlerts, markAlertRead, removeCard, saveCard, type Alert } from "@/lib/research/store";
import { TEMPLATES, adoptTemplate, newId } from "@/lib/research/templates";
import type { ReadingStatus, ResearchProfile, ResearcherCard } from "@/lib/research/types";
import { useResearchProfile } from "./use-profile";

const today = () => new Date().toISOString().slice(0, 10);
const input = "rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/35";
const STATUS: [ReadingStatus, string][] = [["to_read", "To read"], ["reading", "Reading"], ["done", "Finished"]];

export function ResearchDashboard() {
  const { p, ready, error, update, uid } = useResearchProfile();
  const { profile: account } = useAuth();
  if (!ready) return <LoadingState label="Loading your research dashboard" />;
  if (!p) return <Onboarding onStart={(tpl, level) => update((x) => ({ ...x, level, ...(tpl ? adoptTemplate(tpl)! : {}) }))} />;
  return <div className="grid gap-6">
    {error && <p className="rounded-2xl border border-red-300/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</p>}
    <Header p={p} update={update} superAdmin={account?.role === "super_admin"} />
    <Stats p={p} />
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="grid content-start gap-6"><Targets p={p} update={update} /><Reading p={p} update={update} /></div>
      <div className="grid content-start gap-6"><Alerts uid={uid!} /><PathCard p={p} /><DirectoryCard uid={uid!} name={account?.fullName || account?.displayName || account?.name || "Member"} p={p} /></div>
    </div>
  </div>;
}

function Onboarding({ onStart }: { onStart: (tpl: string | null, level?: LevelKey) => void }) {
  const [level, setLevel] = useState<LevelKey | "">("");
  return <div className="grid gap-6">
    <div className="rounded-3xl border border-violet-200/25 bg-violet-300/[0.05] p-6"><p className="font-display text-2xl text-white">Set up your research plan</p><p className="mt-1 text-white/65">Pick a starting plan — books first, then research — or start blank. Everything here is private to you and fully editable.</p>
      <label className="mt-4 flex flex-wrap items-center gap-2 text-sm text-white/70">My level<select value={level} onChange={(e) => setLevel(e.target.value as LevelKey)} className={input}><option value="">choose…</option>{LEVELS.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}</select></label></div>
    <div className="grid gap-4 md:grid-cols-2">{TEMPLATES.map((t) => <button key={t.key} type="button" onClick={() => onStart(t.key, level || undefined)} className="premium-card rounded-3xl border p-6 text-left hover:border-violet-200/50"><p className="font-semibold text-white">{t.name}</p><p className="mt-1 text-sm text-white/60">{t.direction}</p><p className="mt-3 font-mono text-xs text-white/45">{t.targets.length} targets · {t.reading.length} books</p></button>)}
      <button type="button" onClick={() => onStart(null, level || undefined)} className="rounded-3xl border border-dashed border-white/20 p-6 text-left hover:border-white/40"><p className="font-semibold text-white">Start blank</p><p className="mt-1 text-sm text-white/60">Add your own targets and books.</p></button></div>
  </div>;
}

type Upd = (fn: (x: ResearchProfile) => ResearchProfile) => void;

function Header({ p, update, superAdmin }: { p: ResearchProfile; update: Upd; superAdmin: boolean }) {
  const [edit, setEdit] = useState(false); const [dir, setDir] = useState(p.direction || "");
  return <div className="rounded-3xl border border-white/10 p-6">
    <div className="flex flex-wrap items-center gap-3 text-xs"><span className="rounded-full bg-violet-200/15 px-2.5 py-0.5 font-semibold text-violet-100">Private — only you see this</span>{superAdmin && <span className="rounded-full bg-amber-200/15 px-2.5 py-0.5 font-semibold text-amber-100">Super admin</span>}
      <select aria-label="Discipline" value={p.path || ""} onChange={(e) => update((x) => ({ ...x, path: e.target.value }))} className="rounded-lg border border-white/15 bg-black/40 px-2 py-1 text-white"><option value="">Discipline…</option>{PATHS.map((x) => <option key={x.slug} value={x.slug}>{x.name}</option>)}</select>
      <select aria-label="Level" value={p.level || ""} onChange={(e) => update((x) => ({ ...x, level: e.target.value as LevelKey }))} className="rounded-lg border border-white/15 bg-black/40 px-2 py-1 text-white"><option value="">Level…</option>{LEVELS.map((l) => <option key={l.key} value={l.key}>{l.label}</option>)}</select></div>
    {edit ? <form onSubmit={(e) => { e.preventDefault(); update((x) => ({ ...x, direction: dir.trim() })); setEdit(false); }} className="mt-3 flex flex-wrap gap-2"><input value={dir} onChange={(e) => setDir(e.target.value)} className={`${input} min-w-0 flex-1`} placeholder="Your research direction in one line" /><button className="rounded-xl bg-violet-200 px-4 text-sm font-semibold text-black">Save</button></form>
      : <p className="mt-3 font-display text-2xl text-white">{p.direction || "Add your research direction"} <button type="button" onClick={() => setEdit(true)} className="ml-2 align-middle text-sm font-sans text-violet-100 hover:text-white">edit</button></p>}
  </div>;
}

function Stats({ p }: { p: ResearchProfile }) {
  const path = pathBySlug(p.path || "");
  const total = path ? allItems(path).length + RESEARCH_SKILLS.length : 0;
  const pathDone = path ? (p.pathDone?.[path.slug] || []).length : 0;
  const overdue = p.targets.filter((t) => !t.done && t.due && t.due < today()).length;
  const cards: [string, string, string][] = [
    ["Targets", `${p.targets.filter((t) => t.done).length}/${p.targets.length}`, overdue ? `${overdue} overdue` : "on track"],
    ["Books finished", `${p.reading.filter((r) => r.status === "done").length}`, `${p.reading.filter((r) => r.status === "reading").length} in progress`],
    ["Path progress", total ? `${Math.round((pathDone / total) * 100)}%` : "—", path ? path.short : "choose a discipline"],
    ["Radar keywords", `${p.interests.length}`, p.alerts ? "daily alerts on" : "alerts off"],
  ];
  return <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{cards.map(([l, v, s]) => <div key={l} className="rounded-2xl border border-white/10 bg-white/[0.03] p-4"><p className="text-xs text-white/45">{l}</p><p className="mt-1 font-mono text-2xl text-white">{v}</p><p className={`text-xs ${s.includes("overdue") ? "text-red-200" : "text-white/45"}`}>{s}</p></div>)}</div>;
}

function Targets({ p, update }: { p: ResearchProfile; update: Upd }) {
  const [title, setTitle] = useState(""); const [phase, setPhase] = useState(""); const [due, setDue] = useState("");
  const phases = useMemo(() => [...new Set(p.targets.map((t) => t.phase || "Targets"))], [p.targets]);
  const set = (id: string, patch: Partial<ResearchProfile["targets"][number]>) => update((x) => ({ ...x, targets: x.targets.map((t) => t.id === id ? { ...t, ...patch } : t) }));
  return <section className="rounded-3xl border border-white/10 p-6"><div className="flex items-baseline justify-between"><h2 className="font-display text-xl font-semibold text-white">Targets</h2><span className="text-xs text-white/45">Tick when done · edit dates as plans change</span></div>
    {phases.map((ph) => <div key={ph} className="mt-5"><h3 className="text-xs font-semibold uppercase tracking-[.14em] text-violet-100/70">{ph}</h3>
      <ul className="mt-2 grid gap-1.5">{p.targets.filter((t) => (t.phase || "Targets") === ph).sort((a, b) => (a.due || "9").localeCompare(b.due || "9")).map((t) => { const late = !t.done && t.due && t.due < today(); return <li key={t.id} className={`flex flex-wrap items-center gap-3 rounded-xl border p-3 ${t.done ? "border-emerald-300/20 bg-emerald-300/[0.04]" : late ? "border-red-300/30 bg-red-500/[0.05]" : "border-white/10"}`}>
        <input type="checkbox" checked={t.done} onChange={(e) => set(t.id, { done: e.target.checked, progress: e.target.checked ? 100 : t.progress })} aria-label={`Done: ${t.title}`} className="h-4 w-4" />
        <span className={`min-w-0 flex-1 text-sm ${t.done ? "text-white/45 line-through" : "text-white/85"}`}>{t.title}</span>
        <input type="date" value={t.due || ""} onChange={(e) => set(t.id, { due: e.target.value })} aria-label="Due date" className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs text-white/75" />
        <button type="button" onClick={() => update((x) => ({ ...x, targets: x.targets.filter((y) => y.id !== t.id) }))} aria-label={`Delete ${t.title}`} className="text-white/35 hover:text-red-200">✕</button>
      </li>; })}</ul></div>)}
    {!p.targets.length && <p className="mt-4 text-sm text-white/55">No targets yet. Add the first one below.</p>}
    <form onSubmit={(e) => { e.preventDefault(); if (!title.trim()) return; update((x) => ({ ...x, targets: [...x.targets, { id: newId(), title: title.trim(), phase: phase.trim() || undefined, due: due || undefined, done: false }] })); setTitle(""); setDue(""); }} className="mt-5 grid gap-2 md:grid-cols-[minmax(0,1fr)_10rem_9rem_auto]">
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New target, e.g. Read Pope chapters 1–3" className={input} />
      <input value={phase} onChange={(e) => setPhase(e.target.value)} placeholder="Phase (optional)" list="phases" className={input} /><datalist id="phases">{phases.map((x) => <option key={x} value={x} />)}</datalist>
      <input type="date" value={due} onChange={(e) => setDue(e.target.value)} className={input} />
      <button className="rounded-xl bg-violet-200 px-4 py-2 text-sm font-semibold text-black">Add</button>
    </form>
  </section>;
}

function Reading({ p, update }: { p: ResearchProfile; update: Upd }) {
  const [tab, setTab] = useState<ReadingStatus>("reading"); const [title, setTitle] = useState(""); const [by, setBy] = useState("");
  const path = pathBySlug(p.path || "");
  const have = new Set(p.reading.map((r) => r.title.toLowerCase()));
  const suggestions = path ? allItems(path).filter((i) => i.kind === "book" && !have.has(i.title.toLowerCase())).slice(0, 6) : [];
  const move = (id: string, status: ReadingStatus) => update((x) => ({ ...x, reading: x.reading.map((r) => r.id === id ? { ...r, status, finishedAt: status === "done" ? today() : undefined } : r) }));
  const add = (t: string, b?: string) => update((x) => ({ ...x, reading: [{ id: newId(), title: t, by: b, status: "to_read", addedAt: today() }, ...x.reading] }));
  const shown = p.reading.filter((r) => r.status === tab);
  return <section className="rounded-3xl border border-white/10 p-6"><h2 className="font-display text-xl font-semibold text-white">Reading list</h2>
    <div className="mt-3 flex flex-wrap gap-2">{STATUS.map(([k, l]) => <button key={k} type="button" onClick={() => setTab(k)} aria-pressed={tab === k} className={`rounded-full px-3 py-1.5 text-sm ${tab === k ? "bg-white text-black" : "border border-white/15 text-white/70"}`}>{l} <span className="font-mono text-xs opacity-60">{p.reading.filter((r) => r.status === k).length}</span></button>)}</div>
    <ul className="mt-4 grid gap-2">{shown.map((r) => <li key={r.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-white/10 p-3"><div className="min-w-0 flex-1"><p className="text-sm font-semibold text-white">{r.note?.startsWith("http") ? <a href={r.note} target="_blank" rel="noreferrer" className="hover:text-violet-100">{r.title} ↗</a> : r.title}</p>{r.by && <p className="text-xs text-white/50">{r.by}</p>}</div>
      <select aria-label="Status" value={r.status} onChange={(e) => move(r.id, e.target.value as ReadingStatus)} className="rounded-lg border border-white/10 bg-black/30 px-2 py-1 text-xs text-white">{STATUS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
      <button type="button" onClick={() => update((x) => ({ ...x, reading: x.reading.filter((y) => y.id !== r.id) }))} aria-label={`Remove ${r.title}`} className="text-white/35 hover:text-red-200">✕</button></li>)}
      {!shown.length && <li className="text-sm text-white/50">Nothing here yet.</li>}</ul>
    <form onSubmit={(e) => { e.preventDefault(); if (!title.trim()) return; add(title.trim(), by.trim() || undefined); setTitle(""); setBy(""); }} className="mt-4 grid gap-2 md:grid-cols-[minmax(0,1fr)_12rem_auto]"><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Book or paper title" className={input} /><input value={by} onChange={(e) => setBy(e.target.value)} placeholder="Author(s)" className={input} /><button className="rounded-xl bg-violet-200 px-4 py-2 text-sm font-semibold text-black">Add</button></form>
    {suggestions.length > 0 && <div className="mt-4"><p className="text-xs text-white/45">Suggested from the {path!.short} path:</p><div className="mt-2 flex flex-wrap gap-2">{suggestions.map((s) => <button key={s.id} type="button" onClick={() => add(s.title, s.by)} className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/75 hover:border-violet-200/50 hover:text-white">+ {s.title}</button>)}</div></div>}
  </section>;
}

function Alerts({ uid }: { uid: string }) {
  const [alerts, setAlerts] = useState<Alert[] | null>(null);
  useEffect(() => { listAlerts(uid).then(setAlerts).catch(() => setAlerts([])); }, [uid]);
  const research = (alerts || []).filter((a) => a.title.startsWith("Research radar")).slice(0, 8);
  return <section className="rounded-3xl border border-white/10 p-5"><div className="flex items-baseline justify-between"><h2 className="font-semibold text-white">Alerts</h2><Link href="/research/radar" className="text-xs text-violet-100 hover:text-white">Radar →</Link></div>
    {alerts === null ? <p className="mt-3 text-sm text-white/50">Loading…</p> : research.length ? <ul className="mt-3 grid gap-2">{research.map((a) => <li key={a.id} className={`rounded-xl border p-3 text-sm ${a.read ? "border-white/10 text-white/55" : "border-violet-200/30 bg-violet-300/[0.06] text-white/85"}`}><p>{a.message}</p><div className="mt-1 flex gap-3 text-xs">{a.link && <a href={a.link} target="_blank" rel="noreferrer" onClick={() => markAlertRead(a.id)} className="text-violet-100 hover:text-white">Open paper ↗</a>}{!a.read && <button type="button" onClick={() => markAlertRead(a.id).then(() => setAlerts((x) => x?.map((y) => y.id === a.id ? { ...y, read: true } : y) || null))} className="text-white/50 hover:text-white">Mark read</button>}</div></li>)}</ul>
      : <p className="mt-3 text-sm text-white/55">Standout papers in your keywords will appear here each morning.</p>}
  </section>;
}

function PathCard({ p }: { p: ResearchProfile }) {
  const path = pathBySlug(p.path || "");
  if (!path) return <section className="rounded-3xl border border-white/10 p-5"><h2 className="font-semibold text-white">Learning path</h2><p className="mt-2 text-sm text-white/55">Choose a discipline above to track a path.</p><Link href="/research/paths" className="mt-3 inline-block text-sm text-violet-100">Browse paths →</Link></section>;
  const done = new Set(p.pathDone?.[path.slug] || []);
  return <section className="rounded-3xl border border-white/10 p-5"><div className="flex items-baseline justify-between"><h2 className="font-semibold text-white">{path.name}</h2><Link href={`/research/paths/${path.slug}`} className="text-xs text-violet-100 hover:text-white">Open path →</Link></div>
    <ul className="mt-3 grid gap-3">{path.stages.map((s) => { const items = s.groups.flatMap((g) => g.items); const n = items.filter((i) => done.has(i.id)).length; return <li key={s.key}><div className="flex justify-between text-sm"><span className="text-white/80">{s.name}</span><span className="font-mono text-xs text-white/50">{n}/{items.length}</span></div><span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-white/10"><span className="block h-full rounded-full bg-gradient-to-r from-violet-300 to-emerald-300" style={{ width: `${items.length ? (n / items.length) * 100 : 0}%` }} /></span></li>; })}</ul>
  </section>;
}

function DirectoryCard({ uid, name, p }: { uid: string; name: string; p: ResearchProfile }) {
  const [card, setCard] = useState<ResearcherCard | null | undefined>(undefined);
  const [headline, setHeadline] = useState(""); const [link, setLink] = useState(""); const [looking, setLooking] = useState<string[]>([]);
  useEffect(() => { getMyCard(uid).then((c) => { setCard(c); setHeadline(c?.headline || ""); setLink(c?.link || ""); setLooking(c?.lookingFor || []); }).catch(() => setCard(null)); }, [uid]);
  const opts = ["Collaborators", "PhD position", "Postdoc position", "PhD students", "Industry problems", "Study partners"];
  const publish = async () => { const c: ResearcherCard = { uid, name, headline: headline.trim(), field: pathBySlug(p.path || "")?.name, level: p.level, interests: p.interests, lookingFor: looking, link: link.trim() || undefined }; await saveCard(c); setCard(c); };
  if (card === undefined) return null;
  return <section className="rounded-3xl border border-white/10 p-5"><h2 className="font-semibold text-white">Researcher directory</h2><p className="mt-1 text-xs text-white/50">{card ? "You are listed. Members can see your card." : "Off by default. Publish a card so other members can find you."}</p>
    <div className="mt-3 grid gap-2"><input value={headline} onChange={(e) => setHeadline(e.target.value)} placeholder="One-line headline" className={input} /><input value={link} onChange={(e) => setLink(e.target.value)} placeholder="Profile link (Scholar, LinkedIn…)" className={input} />
      <div className="flex flex-wrap gap-1.5">{opts.map((o) => <button key={o} type="button" aria-pressed={looking.includes(o)} onClick={() => setLooking((x) => x.includes(o) ? x.filter((y) => y !== o) : [...x, o])} className={`rounded-full px-2.5 py-1 text-xs ${looking.includes(o) ? "bg-violet-200 text-black" : "border border-white/15 text-white/70"}`}>{o}</button>)}</div>
      <div className="flex gap-2"><button type="button" onClick={publish} className="rounded-xl bg-violet-200 px-4 py-2 text-sm font-semibold text-black">{card ? "Update card" : "Publish card"}</button>{card && <button type="button" onClick={() => removeCard(uid).then(() => setCard(null))} className="rounded-xl border border-white/15 px-4 py-2 text-sm text-white/70">Remove</button>}</div></div>
  </section>;
}
