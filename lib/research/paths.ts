// Research Commons learning paths: fundamentals → advanced → recent developments, per discipline.
// Titles and authors only (facts); links point to free lecture platforms or the publisher-neutral search.

export type ItemKind = "book" | "paper" | "course" | "skill";
export type PathItem = { id: string; kind: ItemKind; title: string; by?: string; note?: string; link?: string };
export type StageKey = "fundamentals" | "advanced" | "frontier";
export type Stage = { key: StageKey; name: string; goal: string; groups: { name: string; items: PathItem[] }[] };
export type Journal = { name: string; scope: string; kind: "flagship" | "review" | "applied" };
export type ResearchPath = {
  slug: string; name: string; short: string; tagline: string;
  directions: string[]; radarTopics: string[]; stages: Stage[]; journals: Journal[];
};

export const LEVELS = [
  { key: "btech", label: "B.Tech (1st–3rd year)", start: "fundamentals" as StageKey, advice: "Work through Fundamentals in order. Read one book per subject properly, solve its problems, and use the free lectures alongside. Skim one review journal a month to see where the field is going." },
  { key: "final", label: "B.Tech final year", start: "fundamentals" as StageKey, advice: "Close any gaps in Fundamentals, then start one Advanced subject linked to your project. Read 5–10 recent papers in that area and learn to summarise each on one page." },
  { key: "mtech", label: "M.Tech / MS", start: "advanced" as StageKey, advice: "Go deep in two or three Advanced books for your thesis area. Follow the flagship journals weekly and keep a structured reading log of the papers you read." },
  { key: "phd", label: "PhD scholar", start: "frontier" as StageKey, advice: "Use Advanced books as references, live in Recent developments, and set the research radar to your thesis keywords. Aim for one reproducible result and one written review of your niche in year one." },
  { key: "prof", label: "Faculty / professor", start: "frontier" as StageKey, advice: "Track the review journals and the radar for your group's directions, post PhD and postdoc positions, and open collaborations with industry problems from the community." },
] as const;
export type LevelKey = (typeof LEVELS)[number]["key"];

const ocw = "https://ocw.mit.edu/";
const nptel = "https://nptel.ac.in/";
const free = (subject: string): PathItem => ({ id: `free-${subject.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`, kind: "course", title: `Free lectures: ${subject}`, note: "MIT OpenCourseWare and NPTEL both carry full university courses on this subject.", link: ocw });

export const RESEARCH_SKILLS: PathItem[] = [
  { id: "rs-craft", kind: "book", title: "The Craft of Research", by: "W.C. Booth, G.G. Colomb, J.M. Williams et al.", note: "How to turn a topic into a question, an argument and a paper." },
  { id: "rs-hamming", kind: "book", title: "The Art of Doing Science and Engineering", by: "R.W. Hamming", note: "How great researchers choose problems and work on them." },
  { id: "rs-schimel", kind: "book", title: "Writing Science", by: "J. Schimel", note: "Writing papers and proposals that people read and cite." },
  { id: "rs-keshav", kind: "paper", title: "How to Read a Paper", by: "S. Keshav", note: "The three-pass method for reading papers quickly and well." },
  { id: "rs-log", kind: "skill", title: "Keep a reading log", note: "One page per paper: question, method, result, weakness, idea it gives you." },
];

export const PATHS: ResearchPath[] = [
  {
    slug: "mechanical", name: "Mechanical Engineering", short: "Mechanical",
    tagline: "From mechanics, thermodynamics and fluids to computational mechanics, integrity and scientific machine learning.",
    directions: ["Computational solid and fluid mechanics", "Scientific machine learning (PINNs, neural operators)", "Fracture, fatigue and fitness-for-service", "Heat transfer and energy systems", "Corrosion and asset integrity", "Robotics and design"],
    radarTopics: ["physics-informed neural networks", "neural operator", "computational fluid dynamics", "fracture mechanics", "fatigue crack growth", "heat transfer", "corrosion prediction machine learning", "fitness-for-service"],
    stages: [
      { key: "fundamentals", name: "Fundamentals", goal: "Solve standard problems in mechanics, thermo-fluids and materials without looking anything up.", groups: [
        { name: "Mathematics", items: [
          { id: "m-kreyszig", kind: "book", title: "Advanced Engineering Mathematics", by: "E. Kreyszig" },
          { id: "m-strang", kind: "book", title: "Introduction to Linear Algebra", by: "G. Strang" },
        ] },
        { name: "Mechanics and design", items: [
          { id: "m-meriam", kind: "book", title: "Engineering Mechanics: Statics and Dynamics", by: "J.L. Meriam, L.G. Kraige" },
          { id: "m-beer", kind: "book", title: "Mechanics of Materials", by: "F.P. Beer, E.R. Johnston, J.T. DeWolf, D.F. Mazurek" },
          { id: "m-shigley", kind: "book", title: "Shigley's Mechanical Engineering Design", by: "R.G. Budynas, J.K. Nisbett" },
          { id: "m-callister", kind: "book", title: "Materials Science and Engineering: An Introduction", by: "W.D. Callister, D.G. Rethwisch" },
        ] },
        { name: "Thermal and fluid sciences", items: [
          { id: "m-cengel", kind: "book", title: "Thermodynamics: An Engineering Approach", by: "Y.A. Çengel, M.A. Boles" },
          { id: "m-white", kind: "book", title: "Fluid Mechanics", by: "F.M. White" },
          { id: "m-incropera", kind: "book", title: "Fundamentals of Heat and Mass Transfer", by: "T.L. Bergman, A.S. Lavine, F.P. Incropera, D.P. DeWitt" },
        ] },
        { name: "Practice", items: [free("Mechanical engineering core"), { id: "m-calc", kind: "skill", title: "Programme what you learn", note: "Write small Python or MATLAB scripts for every topic: beam deflection, pipe flow, fin heat transfer." }] },
      ] },
      { key: "advanced", name: "Advanced", goal: "Read research papers in your area fluently and set up a numerical model from first principles.", groups: [
        { name: "Continuum and solid mechanics", items: [
          { id: "m-gurtin", kind: "book", title: "An Introduction to Continuum Mechanics", by: "M.E. Gurtin" },
          { id: "m-timoshenko", kind: "book", title: "Theory of Elasticity", by: "S.P. Timoshenko, J.N. Goodier" },
          { id: "m-holzapfel", kind: "book", title: "Nonlinear Solid Mechanics", by: "G.A. Holzapfel" },
          { id: "m-anderson", kind: "book", title: "Fracture Mechanics: Fundamentals and Applications", by: "T.L. Anderson" },
          { id: "m-dowling", kind: "book", title: "Mechanical Behavior of Materials", by: "N.E. Dowling" },
        ] },
        { name: "Fluids, turbulence and heat", items: [
          { id: "m-kundu", kind: "book", title: "Fluid Mechanics", by: "P.K. Kundu, I.M. Cohen, D.R. Dowling" },
          { id: "m-pope", kind: "book", title: "Turbulent Flows", by: "S.B. Pope" },
          { id: "m-kays", kind: "book", title: "Convective Heat and Mass Transfer", by: "W.M. Kays, M.E. Crawford" },
        ] },
        { name: "Computational methods", items: [
          { id: "m-hughes", kind: "book", title: "The Finite Element Method: Linear Static and Dynamic Finite Element Analysis", by: "T.J.R. Hughes" },
          { id: "m-ferziger", kind: "book", title: "Computational Methods for Fluid Dynamics", by: "J.H. Ferziger, M. Perić" },
          { id: "m-leveque", kind: "book", title: "Finite Volume Methods for Hyperbolic Problems", by: "R.J. LeVeque" },
        ] },
        { name: "Integrity", items: [
          { id: "m-fontana", kind: "book", title: "Corrosion Engineering", by: "M.G. Fontana" },
          { id: "m-codes", kind: "course", title: "API and ASME codes, clause by clause", note: "Our free academy: inspection, damage mechanisms, RBI and fitness-for-service.", link: "/learn/codes" },
        ] },
      ] },
      { key: "frontier", name: "Recent developments", goal: "Know the current state of your niche, reproduce a recent result, and find an open question.", groups: [
        { name: "Data-driven and scientific ML", items: [
          { id: "m-brunton", kind: "book", title: "Data-Driven Science and Engineering", by: "S.L. Brunton, J.N. Kutz" },
          { id: "m-goodfellow", kind: "book", title: "Deep Learning", by: "I. Goodfellow, Y. Bengio, A. Courville" },
          { id: "m-murphy", kind: "book", title: "Probabilistic Machine Learning: An Introduction", by: "K.P. Murphy" },
        ] },
        { name: "Landmark papers to start from", items: [
          { id: "m-pinn", kind: "paper", title: "Physics-informed neural networks: a deep learning framework for forward and inverse problems involving nonlinear PDEs", by: "M. Raissi, P. Perdikaris, G.E. Karniadakis — J. Comput. Phys. (2019)" },
          { id: "m-piml", kind: "paper", title: "Physics-informed machine learning", by: "G.E. Karniadakis et al. — Nature Reviews Physics (2021)" },
          { id: "m-deeponet", kind: "paper", title: "Learning nonlinear operators via DeepONet", by: "L. Lu, P. Jin, G. Pang, Z. Zhang, G.E. Karniadakis — Nature Machine Intelligence (2021)" },
          { id: "m-fno", kind: "paper", title: "Fourier Neural Operator for Parametric Partial Differential Equations", by: "Z. Li et al. — ICLR (2021)" },
        ] },
        { name: "Stay current", items: [
          { id: "m-radar", kind: "skill", title: "Set the research radar to your keywords", note: "New preprints and journal papers in your direction, every day.", link: "/research/radar" },
          { id: "m-annrev", kind: "skill", title: "Read the latest Annual Review of Fluid Mechanics volume", note: "Each year's reviews summarise where fluid mechanics research has moved." },
        ] },
      ] },
    ],
    journals: [
      { name: "Journal of Fluid Mechanics", scope: "The flagship journal for fluid mechanics", kind: "flagship" },
      { name: "Annual Review of Fluid Mechanics", scope: "Authoritative reviews of fluid mechanics topics", kind: "review" },
      { name: "Physical Review Fluids", scope: "Fundamental fluid dynamics", kind: "flagship" },
      { name: "Journal of the Mechanics and Physics of Solids", scope: "Leading solid mechanics journal", kind: "flagship" },
      { name: "International Journal of Solids and Structures", scope: "Solid and structural mechanics", kind: "flagship" },
      { name: "Computer Methods in Applied Mechanics and Engineering", scope: "Computational mechanics, FEM, SciML", kind: "flagship" },
      { name: "Journal of Computational Physics", scope: "Numerical methods, including physics-informed learning", kind: "flagship" },
      { name: "International Journal of Heat and Mass Transfer", scope: "Heat and mass transfer", kind: "applied" },
      { name: "Engineering Fracture Mechanics", scope: "Fracture and structural integrity", kind: "applied" },
      { name: "International Journal of Fatigue", scope: "Fatigue of materials and structures", kind: "applied" },
      { name: "International Journal of Pressure Vessels and Piping", scope: "Pressure equipment integrity", kind: "applied" },
      { name: "Corrosion Science", scope: "Corrosion mechanisms and protection", kind: "applied" },
      { name: "Nature Computational Science", scope: "High-impact computational science", kind: "flagship" },
    ],
  },
  {
    slug: "chemical", name: "Chemical Engineering", short: "Chemical",
    tagline: "From balances, thermodynamics and transport to reaction engineering, process systems and the energy transition.",
    directions: ["Reaction engineering and catalysis", "Separations and membranes", "Process systems, control and optimisation", "Process safety", "Electrification, hydrogen and carbon capture", "Machine learning for chemical processes"],
    radarTopics: ["catalysis", "reaction engineering", "membrane separation", "process control", "process safety", "green hydrogen", "carbon capture", "machine learning chemical process"],
    stages: [
      { key: "fundamentals", name: "Fundamentals", goal: "Set up and solve material and energy balances, phase equilibria and simple reactor problems with confidence.", groups: [
        { name: "Core", items: [
          { id: "c-felder", kind: "book", title: "Elementary Principles of Chemical Processes", by: "R.M. Felder, R.W. Rousseau, L.G. Bullard" },
          { id: "c-smith", kind: "book", title: "Introduction to Chemical Engineering Thermodynamics", by: "J.M. Smith, H.C. Van Ness, M.M. Abbott, M.T. Swihart" },
          { id: "c-atkins", kind: "book", title: "Physical Chemistry", by: "P. Atkins, J. de Paula" },
          { id: "c-mccabe", kind: "book", title: "Unit Operations of Chemical Engineering", by: "W.L. McCabe, J.C. Smith, P. Harriott" },
          { id: "c-bsl", kind: "book", title: "Transport Phenomena", by: "R.B. Bird, W.E. Stewart, E.N. Lightfoot" },
          { id: "c-fogler", kind: "book", title: "Elements of Chemical Reaction Engineering", by: "H.S. Fogler" },
        ] },
        { name: "Reference and practice", items: [
          { id: "c-perry", kind: "book", title: "Perry's Chemical Engineers' Handbook", by: "D.W. Green, M.Z. Southard (eds.)", note: "Reference, not cover-to-cover reading." },
          free("Chemical engineering core"),
        ] },
      ] },
      { key: "advanced", name: "Advanced", goal: "Design and analyse reactors, separations and control systems at research depth.", groups: [
        { name: "Reactors and catalysis", items: [
          { id: "c-froment", kind: "book", title: "Chemical Reactor Analysis and Design", by: "G.F. Froment, K.B. Bischoff, J. De Wilde" },
          { id: "c-chork", kind: "book", title: "Concepts of Modern Catalysis and Kinetics", by: "I. Chorkendorff, J.W. Niemantsverdriet" },
        ] },
        { name: "Thermodynamics and separations", items: [
          { id: "c-prausnitz", kind: "book", title: "Molecular Thermodynamics of Fluid-Phase Equilibria", by: "J.M. Prausnitz, R.N. Lichtenthaler, E.G. de Azevedo" },
          { id: "c-seader", kind: "book", title: "Separation Process Principles", by: "J.D. Seader, E.J. Henley, D.K. Roper" },
        ] },
        { name: "Process systems and safety", items: [
          { id: "c-seborg", kind: "book", title: "Process Dynamics and Control", by: "D.E. Seborg, T.F. Edgar, D.A. Mellichamp, F.J. Doyle" },
          { id: "c-biegler", kind: "book", title: "Nonlinear Programming: Concepts, Algorithms, and Applications to Chemical Processes", by: "L.T. Biegler" },
          { id: "c-turton", kind: "book", title: "Analysis, Synthesis and Design of Chemical Processes", by: "R. Turton et al." },
          { id: "c-crowl", kind: "book", title: "Chemical Process Safety: Fundamentals with Applications", by: "D.A. Crowl, J.F. Louvar" },
        ] },
      ] },
      { key: "frontier", name: "Recent developments", goal: "Follow decarbonisation, electrification and data-driven process engineering as it happens.", groups: [
        { name: "Where to read the frontier", items: [
          { id: "c-annrev", kind: "skill", title: "Read the latest Annual Review of Chemical and Biomolecular Engineering volume", note: "Yearly reviews of the fastest-moving topics." },
          { id: "c-natchem", kind: "skill", title: "Follow Nature Chemical Engineering", note: "Nature's chemical engineering journal (launched 2024): high-impact work across the field." },
          { id: "c-brunton", kind: "book", title: "Data-Driven Science and Engineering", by: "S.L. Brunton, J.N. Kutz", note: "The common language for ML in process modelling and control." },
          { id: "c-radar", kind: "skill", title: "Set the research radar to your keywords", link: "/research/radar" },
        ] },
      ] },
    ],
    journals: [
      { name: "AIChE Journal", scope: "Flagship journal of chemical engineering", kind: "flagship" },
      { name: "Chemical Engineering Science", scope: "Fundamental chemical engineering", kind: "flagship" },
      { name: "Annual Review of Chemical and Biomolecular Engineering", scope: "Authoritative reviews", kind: "review" },
      { name: "Nature Chemical Engineering", scope: "High-impact chemical engineering", kind: "flagship" },
      { name: "Chemical Engineering Journal", scope: "Broad applied chemical engineering", kind: "applied" },
      { name: "Industrial & Engineering Chemistry Research", scope: "Applied and industrial research", kind: "applied" },
      { name: "Computers & Chemical Engineering", scope: "Process systems engineering", kind: "applied" },
      { name: "Journal of Catalysis", scope: "Catalysis science", kind: "flagship" },
      { name: "ACS Catalysis", scope: "Catalysis across chemistry and engineering", kind: "flagship" },
      { name: "Journal of Membrane Science", scope: "Membranes and separations", kind: "applied" },
      { name: "Process Safety and Environmental Protection", scope: "Process safety and environment", kind: "applied" },
      { name: "Journal of Loss Prevention in the Process Industries", scope: "Loss prevention and safety", kind: "applied" },
    ],
  },
  {
    slug: "electrical", name: "Electrical Engineering", short: "Electrical",
    tagline: "From circuits, signals and machines to power systems, power electronics, control and electronics design.",
    directions: ["Power systems and grid integration of renewables", "Power electronics and drives", "Control systems", "Signal processing and communications", "Analog and digital IC design", "Batteries and energy storage"],
    radarTopics: ["power system stability", "renewable grid integration", "power electronics converter", "wide bandgap", "model predictive control", "battery management system", "signal processing", "analog integrated circuit"],
    stages: [
      { key: "fundamentals", name: "Fundamentals", goal: "Analyse circuits, signals, fields and machines and build simple systems from them.", groups: [
        { name: "Circuits and electronics", items: [
          { id: "e-hayt", kind: "book", title: "Engineering Circuit Analysis", by: "W.H. Hayt, J.E. Kemmerly, S.M. Durbin" },
          { id: "e-agarwal", kind: "book", title: "Foundations of Analog and Digital Electronic Circuits", by: "A. Agarwal, J.H. Lang" },
          { id: "e-sedra", kind: "book", title: "Microelectronic Circuits", by: "A.S. Sedra, K.C. Smith" },
          { id: "e-mano", kind: "book", title: "Digital Design", by: "M.M. Mano, M.D. Ciletti" },
        ] },
        { name: "Signals, fields, machines, control", items: [
          { id: "e-oppenheim", kind: "book", title: "Signals and Systems", by: "A.V. Oppenheim, A.S. Willsky, S.H. Nawab" },
          { id: "e-griffiths", kind: "book", title: "Introduction to Electrodynamics", by: "D.J. Griffiths" },
          { id: "e-chapman", kind: "book", title: "Electric Machinery Fundamentals", by: "S.J. Chapman" },
          { id: "e-ogata", kind: "book", title: "Modern Control Engineering", by: "K. Ogata" },
        ] },
        { name: "Practice", items: [free("Electrical engineering core"), { id: "e-lab", kind: "skill", title: "Simulate and build", note: "SPICE for circuits, Python or MATLAB for signals and control, a small hardware project each semester." }] },
      ] },
      { key: "advanced", name: "Advanced", goal: "Model and design power, control and electronic systems at research depth.", groups: [
        { name: "Power", items: [
          { id: "e-kundur", kind: "book", title: "Power System Stability and Control", by: "P. Kundur" },
          { id: "e-grainger", kind: "book", title: "Power System Analysis", by: "J.J. Grainger, W.D. Stevenson" },
          { id: "e-mohan", kind: "book", title: "Power Electronics: Converters, Applications, and Design", by: "N. Mohan, T.M. Undeland, W.P. Robbins" },
          { id: "e-erickson", kind: "book", title: "Fundamentals of Power Electronics", by: "R.W. Erickson, D. Maksimović" },
        ] },
        { name: "Control, signals and optimisation", items: [
          { id: "e-astrom", kind: "book", title: "Feedback Systems", by: "K.J. Åström, R.M. Murray", note: "Free online from the authors." },
          { id: "e-dtsp", kind: "book", title: "Discrete-Time Signal Processing", by: "A.V. Oppenheim, R.W. Schafer" },
          { id: "e-proakis", kind: "book", title: "Digital Communications", by: "J.G. Proakis, M. Salehi" },
          { id: "e-boyd", kind: "book", title: "Convex Optimization", by: "S. Boyd, L. Vandenberghe", note: "Free online from the authors." },
        ] },
        { name: "Electronics design", items: [
          { id: "e-razavi", kind: "book", title: "Design of Analog CMOS Integrated Circuits", by: "B. Razavi" },
          { id: "e-aoe", kind: "book", title: "The Art of Electronics", by: "P. Horowitz, W. Hill" },
        ] },
      ] },
      { key: "frontier", name: "Recent developments", goal: "Follow grid transition, wide-bandgap power electronics, storage and AI for power systems.", groups: [
        { name: "Where to read the frontier", items: [
          { id: "e-pieee", kind: "skill", title: "Read Proceedings of the IEEE special issues", note: "Each issue surveys one topic in depth." },
          { id: "e-natelec", kind: "skill", title: "Follow Nature Electronics", note: "High-impact electronics research." },
          { id: "e-radar", kind: "skill", title: "Set the research radar to your keywords", link: "/research/radar" },
        ] },
      ] },
    ],
    journals: [
      { name: "Proceedings of the IEEE", scope: "Tutorial and survey papers across electrical engineering", kind: "review" },
      { name: "IEEE Transactions on Power Systems", scope: "Power system analysis and operation", kind: "flagship" },
      { name: "IEEE Transactions on Smart Grid", scope: "Grid modernisation", kind: "flagship" },
      { name: "IEEE Transactions on Power Electronics", scope: "Power electronics", kind: "flagship" },
      { name: "IEEE Transactions on Industrial Electronics", scope: "Drives, control and industrial electronics", kind: "flagship" },
      { name: "IEEE Transactions on Energy Conversion", scope: "Machines and energy conversion", kind: "applied" },
      { name: "IEEE Transactions on Automatic Control", scope: "Control theory", kind: "flagship" },
      { name: "Automatica", scope: "Control systems", kind: "flagship" },
      { name: "IEEE Transactions on Signal Processing", scope: "Signal processing", kind: "flagship" },
      { name: "IEEE Journal of Solid-State Circuits", scope: "Integrated circuit design", kind: "flagship" },
      { name: "Nature Electronics", scope: "High-impact electronics", kind: "flagship" },
    ],
  },
];

export const pathBySlug = (slug: string) => PATHS.find((p) => p.slug === slug);
export const allItems = (p: ResearchPath) => p.stages.flatMap((s) => s.groups.flatMap((g) => g.items));
export const ITEM_KIND_LABEL: Record<ItemKind, string> = { book: "Book", paper: "Paper", course: "Course", skill: "Practice" };
export { nptel as NPTEL_URL, ocw as OCW_URL };
