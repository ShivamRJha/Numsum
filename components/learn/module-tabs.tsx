import Link from "next/link";
import { clauseSet, clauseCount } from "@/lib/learn/clauses";
import { cn } from "@/lib/utils";

export type ModuleTab = "overview" | "train" | "clauses" | "exam";

/** One bar for every view of a code module, so reading, training, looking up clauses and exam prep feel like one place. */
export function ModuleTabs({ slug, active, className }: { slug: string; active: ModuleTab; className?: string }) {
  const s = clauseSet(slug);
  const exam = /^api-5(10|70)/.test(slug) ? `/learn/exam-prep/${slug.slice(0, 7)}` : undefined;
  const tabs: [ModuleTab, string, string, string][] = [
    ["overview", "Read", `/learn/codes/${slug}`, "All lessons on one page"],
    ["train", "Train", `/learn/codes/${slug}/train`, "Step by step, flashcards, quiz"],
    ...(s ? [["clauses", "Clauses", `/learn/codes/${slug}/clauses`, `${clauseCount(s).toLocaleString("en-IN")} clauses explained`] as [ModuleTab, string, string, string]] : []),
    ...(exam ? [["exam", "Exam prep", exam, "Drills and mock exams"] as [ModuleTab, string, string, string]] : []),
  ];
  return <nav aria-label="Module views" className={cn("flex flex-wrap gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1.5", className)}>
    {tabs.map(([k, label, href, hint]) => <Link key={k} href={href} aria-current={k === active ? "page" : undefined}
      className={cn("min-w-[8.5rem] flex-1 rounded-xl px-4 py-2.5 transition", k === active ? "bg-amber-100 text-black" : "text-white/75 hover:bg-white/[0.06] hover:text-white")}>
      <span className="block text-sm font-semibold">{label}</span><span className={cn("block text-xs", k === active ? "text-black/65" : "text-white/45")}>{hint}</span>
    </Link>)}
  </nav>;
}
