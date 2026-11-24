// Starter plans a member can adopt on their research dashboard. Due dates are months from the day the plan is adopted.
import type { ReadingItem, Target } from "./types";

type Tpl = { key: string; name: string; path: string; direction: string; interests: string[]; targets: (Omit<Target, "id" | "done" | "due"> & { month: number })[]; reading: { title: string; by: string }[] };

export const TEMPLATES: Tpl[] = [
  {
    key: "mech-sciml", name: "Mechanical → computational mechanics and scientific ML", path: "mechanical",
    direction: "Physics-informed and data-driven methods for fluid mechanics, heat transfer and structural integrity",
    interests: ["physics-informed neural networks", "neural operator", "computational fluid dynamics", "fitness-for-service", "corrosion prediction machine learning"],
    targets: [
      { phase: "1 · Read deeply", month: 2, title: "Refresh linear algebra and PDEs (Strang; Kreyszig PDE chapters) with all exercises" },
      { phase: "1 · Read deeply", month: 4, title: "Read Data-Driven Science and Engineering (Brunton & Kutz) and code its examples" },
      { phase: "1 · Read deeply", month: 6, title: "Read the four landmark SciML papers and write a one-page summary of each" },
      { phase: "1 · Read deeply", month: 6, title: "Read An Introduction to Continuum Mechanics (Gurtin)" },
      { phase: "1 · Read deeply", month: 8, title: "Read Computational Methods for Fluid Dynamics (Ferziger & Perić) and write a small finite-volume solver" },
      { phase: "1 · Read deeply", month: 9, title: "Read Deep Learning (Goodfellow et al.), parts I and II" },
      { phase: "1 · Read deeply", month: 10, title: "Shortlist 10 research groups working on physics-informed learning" },
      { phase: "1 · Read deeply", month: 12, title: "Read Turbulent Flows (Pope), chapters 1–7" },
      { phase: "2 · Research", month: 13, title: "Fix one research question (for example, a neural-operator surrogate for fitness-for-service or remaining life)" },
      { phase: "2 · Research", month: 15, title: "Reproduce one published PINN or neural-operator result in code" },
      { phase: "2 · Research", month: 16, title: "Write a literature review of about 40 papers in the chosen direction" },
      { phase: "2 · Research", month: 20, title: "Run the first original experiment and post a preprint" },
      { phase: "2 · Research", month: 24, title: "Submit a journal paper (e.g. Journal of Computational Physics or CMAME)" },
    ],
    reading: [
      { title: "Introduction to Linear Algebra", by: "G. Strang" }, { title: "Data-Driven Science and Engineering", by: "S.L. Brunton, J.N. Kutz" },
      { title: "An Introduction to Continuum Mechanics", by: "M.E. Gurtin" }, { title: "Computational Methods for Fluid Dynamics", by: "J.H. Ferziger, M. Perić" },
      { title: "Deep Learning", by: "I. Goodfellow, Y. Bengio, A. Courville" }, { title: "Turbulent Flows", by: "S.B. Pope" },
      { title: "Fracture Mechanics: Fundamentals and Applications", by: "T.L. Anderson" }, { title: "The Art of Doing Science and Engineering", by: "R.W. Hamming" },
    ],
  },
  {
    key: "chem-process", name: "Chemical → process systems and the energy transition", path: "chemical",
    direction: "Reaction engineering, process systems and decarbonisation",
    interests: ["reaction engineering", "process control", "green hydrogen", "carbon capture", "machine learning chemical process"],
    targets: [
      { phase: "1 · Read deeply", month: 3, title: "Work through Transport Phenomena (Bird, Stewart, Lightfoot), core chapters" },
      { phase: "1 · Read deeply", month: 5, title: "Read Elements of Chemical Reaction Engineering (Fogler) and solve its problems" },
      { phase: "1 · Read deeply", month: 8, title: "Read Process Dynamics and Control (Seborg et al.)" },
      { phase: "1 · Read deeply", month: 10, title: "Read the latest Annual Review of Chemical and Biomolecular Engineering volume" },
      { phase: "2 · Research", month: 12, title: "Fix one research question and write a two-page proposal" },
      { phase: "2 · Research", month: 16, title: "Literature review of about 40 papers" },
      { phase: "2 · Research", month: 22, title: "First result and a journal submission" },
    ],
    reading: [
      { title: "Transport Phenomena", by: "R.B. Bird, W.E. Stewart, E.N. Lightfoot" }, { title: "Elements of Chemical Reaction Engineering", by: "H.S. Fogler" },
      { title: "Process Dynamics and Control", by: "D.E. Seborg et al." }, { title: "The Craft of Research", by: "W.C. Booth et al." },
    ],
  },
  {
    key: "elec-power", name: "Electrical → power systems and power electronics", path: "electrical",
    direction: "Grid integration of renewables, power electronics and control",
    interests: ["power system stability", "renewable grid integration", "power electronics converter", "model predictive control", "battery management system"],
    targets: [
      { phase: "1 · Read deeply", month: 3, title: "Read Power System Stability and Control (Kundur), core chapters" },
      { phase: "1 · Read deeply", month: 5, title: "Read Fundamentals of Power Electronics (Erickson & Maksimović)" },
      { phase: "1 · Read deeply", month: 7, title: "Read Feedback Systems (Åström & Murray)" },
      { phase: "1 · Read deeply", month: 9, title: "Read one Proceedings of the IEEE special issue in your area" },
      { phase: "2 · Research", month: 12, title: "Fix one research question and write a two-page proposal" },
      { phase: "2 · Research", month: 16, title: "Reproduce one published result in simulation" },
      { phase: "2 · Research", month: 22, title: "First result and a journal submission" },
    ],
    reading: [
      { title: "Power System Stability and Control", by: "P. Kundur" }, { title: "Fundamentals of Power Electronics", by: "R.W. Erickson, D. Maksimović" },
      { title: "Feedback Systems", by: "K.J. Åström, R.M. Murray" }, { title: "Convex Optimization", by: "S. Boyd, L. Vandenberghe" },
    ],
  },
];

const addMonths = (base: Date, m: number) => { const d = new Date(base); d.setMonth(d.getMonth() + m); return d.toISOString().slice(0, 10); };
const rid = () => Math.random().toString(36).slice(2, 10);

export function adoptTemplate(key: string, from = new Date()) {
  const t = TEMPLATES.find((x) => x.key === key); if (!t) return null;
  const today = from.toISOString().slice(0, 10);
  return {
    template: t.key, path: t.path, direction: t.direction, interests: [...t.interests],
    targets: t.targets.map(({ month, ...x }) => ({ id: rid(), done: false, progress: 0, due: addMonths(from, month), ...x })) as Target[],
    reading: t.reading.map((b) => ({ id: rid(), title: b.title, by: b.by, status: "to_read", addedAt: today })) as ReadingItem[],
  };
}
export const newId = rid;
