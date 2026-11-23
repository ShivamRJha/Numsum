/** Short, plain-language guides. Each one links to the tool that does the work. */
export type Guide = { slug: string; area: "Inspection" | "Investing"; title: string; description: string; minutes: number; tool?: [string, string]; sections: [string, string[]][] };

export const GUIDES: Guide[] = [
  {
    slug: "what-is-risk-based-inspection-rbi", area: "Inspection", minutes: 5, tool: ["Screen damage mechanisms", "/engineering/damage-mechanism-screening"],
    title: "What is risk-based inspection (RBI)? A plain-language guide to API 580 and API 581",
    description: "Risk-based inspection explained simply: probability and consequence of failure, damage mechanisms, risk matrices and how RBI sets inspection intervals under API 580 and API 581.",
    sections: [
      ["The idea in one line", ["Inspect most where failure is most likely and would hurt most — and less where it would not. Risk = probability of failure × consequence of failure."]],
      ["Probability of failure", ["Starts with the damage mechanisms that can act on the equipment (API 571): thinning, cracking, external corrosion, high-temperature hydrogen attack, brittle fracture, fatigue.", "Each active mechanism adds a damage factor (API 581). The factor grows with the rate of damage and shrinks with how good your past inspections were at finding it."]],
      ["Consequence of failure", ["What happens if it leaks: how much fluid, whether it burns, explodes or is toxic, the area affected, the people exposed, and the cost of lost production and repairs."]],
      ["From risk to an inspection plan", ["Each item is placed on a risk matrix (for example 5 × 5). The plan picks the inspection method that finds the governing mechanism and a date before the risk reaches the target.", "RBI is not a way to inspect less everywhere: high-risk items often get more, and better-targeted, inspection."]],
      ["What you need to start", ["An equipment register with design data, materials and operating conditions; thickness history; a damage-mechanism review for each circuit; and the consequence data for each fluid. The first step — screening the mechanisms — can be done with the free tool linked below."]],
    ],
  },
  {
    slug: "api-510-vs-api-570-vs-api-653", area: "Inspection", minutes: 4, tool: ["Remaining life calculator", "/engineering/remaining-life-calculator"],
    title: "API 510 vs API 570 vs API 653 — which inspection code applies, and the interval rules",
    description: "The difference between API 510 (pressure vessels), API 570 (piping) and API 653 (storage tanks): scope, corrosion rate, remaining life and maximum inspection intervals.",
    sections: [
      ["Three codes, three kinds of equipment", ["API 510 covers pressure vessels in service, API 570 covers in-service process piping, and API 653 covers above-ground atmospheric storage tanks. All three are in-service codes: they decide how to inspect, repair and rerate equipment that was built to a construction code (ASME VIII, ASME B31.3, API 650)."]],
      ["Corrosion rate and remaining life", ["All three use the same arithmetic: corrosion rate = metal lost ÷ years, and remaining life = (thickness now − minimum required thickness) ÷ corrosion rate. API 510 and 570 ask for both the long-term and short-term rates; the inspector uses the one that best reflects the current process, normally the higher."]],
      ["Maximum intervals", ["API 510 internal or on-stream inspection: the lesser of half the remaining life or 10 years.", "API 570 thickness measurements: half the remaining life, capped at 5 years for Class 1 piping and 10 years for Classes 2 and 3.", "API 653 shell UT thickness: the lesser of half the remaining corrosion life or 15 years (5 years when the corrosion rate is not known); tank bottoms have their own remaining-life rules."]],
      ["When RBI changes the interval", ["All three codes allow intervals to be set by a documented risk-based inspection assessment (API 580/581) instead of the fixed caps, provided the RBI is reviewed regularly."]],
    ],
  },
  {
    slug: "how-to-calculate-corrosion-rate-and-remaining-life", area: "Inspection", minutes: 4, tool: ["Remaining life calculator", "/engineering/remaining-life-calculator"],
    title: "How to calculate corrosion rate and remaining life — with a worked example",
    description: "Step-by-step: long-term and short-term corrosion rates, choosing the governing rate, remaining life and the next inspection date, with a worked example.",
    sections: [
      ["What you need", ["The minimum required thickness t_required (from the design calculation, without corrosion allowance) and at least two dated thickness readings at the same location (CML / TML)."]],
      ["Worked example", ["Original thickness 12.0 mm in April 2014, previous reading 10.6 mm in April 2022, latest 10.0 mm in April 2024; t_required = 7.0 mm.", "Long-term rate = (12.0 − 10.0) ÷ 10 years = 0.20 mm/y. Short-term rate = (10.6 − 10.0) ÷ 2 years = 0.30 mm/y. The short-term rate is higher, so it governs.", "Remaining life = (10.0 − 7.0) ÷ 0.30 = 10 years. Under API 510 the next inspection is due within the lesser of half of that (5 years) or 10 years — so by April 2029."]],
      ["Common mistakes", ["Mixing readings from different points or instruments; a reading thicker than last time is usually measurement scatter, not growth.", "Using the long-term rate when the process has recently changed — a recent rise in rate is exactly what the short-term rate is for.", "Forgetting that remaining life is measured to t_required, not to zero."]],
    ],
  },
  {
    slug: "steam-trap-survey-guide", area: "Inspection", minutes: 3, tool: ["Steam trap loss calculator", "/engineering/steam-trap-loss-calculator"],
    title: "Steam trap survey: how to find failed traps and work out what they cost",
    description: "How to run a steam trap survey — ultrasonic and temperature testing, failure modes (blowing, leaking, blocked) — and how to estimate the steam, cost and CO₂ lost.",
    sections: [
      ["Why it pays", ["A single trap blowing through on a medium-pressure line can waste several tonnes of steam a month. In plants that have not surveyed for a few years, a large share of traps is often found failed open or blocked."]],
      ["How traps fail", ["Blowing through (failed open) wastes the most steam. Leaking passes part of it. Blocked or failed-closed traps waste no steam but back up condensate, causing water hammer and poor heating — they are a safety and reliability problem rather than an energy one."]],
      ["How to test", ["Ultrasonic listening tells the trap's cycle; surface temperature upstream and downstream shows whether it is passing steam or blocked; sight glasses help where fitted. Record pressure, trap type and size for each tag."]],
      ["Putting a number on it", ["Napier's formula gives the full-orifice steam flow from pressure and orifice size; a loss factor for the condition gives the loss. Multiply by operating hours and the cost of steam to get a yearly figure — the calculator below does this for one trap or a whole group."]],
    ],
  },
  {
    slug: "sip-for-beginners", area: "Investing", minutes: 4, tool: ["Goal planner", "/tools/investment-planner"],
    title: "SIP for beginners: how a monthly SIP works and how much to invest for a goal",
    description: "What a SIP is, why it suits long-term goals, how inflation and step-ups change the amount, and how to pick funds by expense ratio and consistency — in plain language.",
    sections: [
      ["What a SIP is", ["A systematic investment plan puts a fixed amount into a mutual fund every month. You buy more units when prices are low and fewer when they are high, and you never need to pick the right day."]],
      ["Start from the goal", ["Write down what the goal costs today and when you need it. Grow that cost by inflation (around 6% a year is a common assumption in India) to get the real target, then work out the monthly SIP that reaches it at a realistic return."]],
      ["Step it up", ["Raising the SIP by 5–10% each year, in line with your salary, makes a large difference over 10–20 years and lets you start with a smaller amount."]],
      ["Pick funds sensibly", ["For long horizons, low-cost index funds are a strong default. When comparing funds in the same category, the expense ratio is one of the few things known in advance — prefer direct plans and lower costs, then look at consistency (rolling returns) rather than last year's winner."]],
      ["Stay the course", ["Equity SIPs need years. Plan to keep going through market falls; move money to safer funds in the last two or three years before the goal."]],
    ],
  },
  {
    slug: "expense-ratio-direct-vs-regular", area: "Investing", minutes: 3, tool: ["Fund screener", "/tools/funds"],
    title: "Expense ratio explained: direct vs regular mutual fund plans",
    description: "What a mutual fund expense ratio (TER) is, how much a 1% difference costs over 20 years, and why direct plans cost less than regular plans.",
    sections: [
      ["What it is", ["The expense ratio (total expense ratio, TER) is the yearly fee a fund takes out of its assets. It is already deducted from the NAV, so you never see a bill — you only see lower returns."]],
      ["Why small numbers matter", ["On ₹10,000 a month for 20 years at a 12% gross return, a fund charging 1.0% more per year leaves you roughly 10–12% less money at the end. The gap compounds every year."]],
      ["Direct vs regular", ["Every fund has a direct plan, bought straight from the fund house or a direct platform, and a regular plan sold through a distributor who is paid a commission from the expense ratio. Same portfolio, same manager — the regular plan simply costs more."]],
      ["How to use it", ["Compare expense ratios only within the same category, and use them together with consistency and risk. Our fund screener gives the expense ratio the biggest weight within each category."]],
    ],
  },
];
export const guide = (slug: string) => GUIDES.find((g) => g.slug === slug);
