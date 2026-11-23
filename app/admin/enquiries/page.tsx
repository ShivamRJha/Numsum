"use client";

import { useEffect, useMemo, useState } from "react";
import { EmptyState, ErrorState, LoadingState } from "@/components/data-states";
import { Card } from "@/components/ui";
import { ENQUIRY_STATUSES, listEnquiries, topicLabels, updateEnquiry, type Enquiry, type EnquiryStatus } from "@/lib/repositories/enquiries";
import { cn } from "@/lib/utils";

function when(value: Enquiry["createdAt"]) {
  const d = value?.toDate?.();
  return d ? d.toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";
}

function toCsv(rows: Enquiry[]) {
  const cols = ["createdAt", "status", "topic", "name", "email", "phone", "company", "designation", "city", "users", "modules", "message", "sourcePage", "adminNote"] as const;
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [cols.join(","), ...rows.map((r) => cols.map((c) => esc(c === "createdAt" ? when(r.createdAt) : c === "modules" ? (r.modules || []).join("; ") : c === "topic" ? topicLabels[r.topic] || r.topic : r[c])).join(","))].join("\n");
}

export default function AdminEnquiriesPage() {
  const [rows, setRows] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<EnquiryStatus | "all">("new");
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState("");

  useEffect(() => { listEnquiries().then(setRows).catch((e) => setError(e instanceof Error ? e.message : "Could not load enquiries.")).finally(() => setLoading(false)); }, []);

  const counts = useMemo(() => Object.fromEntries(ENQUIRY_STATUSES.map((s) => [s, rows.filter((r) => (r.status || "new") === s).length])) as Record<EnquiryStatus, number>, [rows]);
  const shown = useMemo(() => rows.filter((r) => (status === "all" || (r.status || "new") === status) && (!q || [r.name, r.email, r.company, r.message, r.phone].join(" ").toLowerCase().includes(q.toLowerCase()))), [rows, status, q]);

  async function setRowStatus(row: Enquiry, next: EnquiryStatus) {
    setBusy(row.id);
    try { await updateEnquiry(row.id, { status: next }); setRows((list) => list.map((r) => r.id === row.id ? { ...r, status: next } : r)); }
    catch (e) { setError(e instanceof Error ? e.message : "Update failed."); }
    finally { setBusy(""); }
  }
  async function saveNote(row: Enquiry, note: string) {
    if (note === (row.adminNote || "")) return;
    try { await updateEnquiry(row.id, { adminNote: note.slice(0, 2000) }); setRows((list) => list.map((r) => r.id === row.id ? { ...r, adminNote: note } : r)); } catch { setError("Could not save the note."); }
  }
  function download() {
    const blob = new Blob([toCsv(shown)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `numsum-enquiries-${new Date().toISOString().slice(0, 10)}.csv`; a.click(); URL.revokeObjectURL(a.href);
  }

  return <div className="space-y-6">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm uppercase tracking-[.3em] text-blue-300">Sales</p><h1 className="mt-2 font-display text-4xl">Enquiries</h1><p className="mt-2 text-white/60">Leads from the IRIS page, the contact page and the investment planner.</p></div><button onClick={download} disabled={!shown.length} className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/80 hover:border-white/40 disabled:opacity-40">Download CSV</button></div>
    <div className="flex flex-wrap gap-2">{(["all", ...ENQUIRY_STATUSES] as const).map((s) => <button key={s} onClick={() => setStatus(s)} className={cn("rounded-full border px-4 py-2 text-sm capitalize", status === s ? "border-amber-100/60 bg-amber-100/10 text-white" : "border-white/10 text-white/60")}>{s} {s === "all" ? rows.length : counts[s]}</button>)}<input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, e-mail, company…" className="ml-auto min-w-[240px] rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm" /></div>
    {loading ? <LoadingState label="Loading enquiries" /> : error ? <ErrorState message={error} /> : !shown.length ? <EmptyState message="No enquiries in this view yet." /> :
      <div className="grid gap-4">{shown.map((r) => <Card key={r.id}>
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-[.18em] text-amber-100/80">{topicLabels[r.topic] || r.topic} · {when(r.createdAt)}</p><h2 className="mt-2 text-xl font-semibold text-white">{r.name}{r.company ? ` — ${r.company}` : ""}</h2><p className="mt-1 text-sm text-white/60">{[r.designation, r.city].filter(Boolean).join(" · ")}</p></div>
          <select value={r.status || "new"} disabled={busy === r.id} onChange={(e) => setRowStatus(r, e.target.value as EnquiryStatus)} className="rounded-full border border-white/15 bg-[#0b1220] px-3 py-2 text-sm capitalize">{ENQUIRY_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
        <div className="mt-3 flex flex-wrap gap-4 text-sm"><a className="text-blue-200 hover:text-white" href={`mailto:${r.email}`}>{r.email}</a>{r.phone && <a className="text-blue-200 hover:text-white" href={`tel:${r.phone}`}>{r.phone}</a>}{r.users && <span className="text-white/60">Users: {r.users}</span>}<span className="text-white/40">from {r.sourcePage}</span></div>
        {r.modules?.length ? <div className="mt-3 flex flex-wrap gap-2">{r.modules.map((m) => <span key={m} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/70">{m}</span>)}</div> : null}
        <p className="mt-4 whitespace-pre-wrap text-white/75">{r.message}</p>
        <textarea defaultValue={r.adminNote || ""} onBlur={(e) => saveNote(r, e.target.value)} placeholder="Internal note (saved when you leave the box)" rows={2} className="mt-4 w-full rounded-2xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm" />
      </Card>)}</div>}
  </div>;
}
