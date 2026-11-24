export const homeLink = ["Home", "/"] as const;

export type MenuLink = { label: string; href: string; desc?: string };
export type MenuGroup = { label: string; links: MenuLink[] };

/** Main site menu (header dropdowns and mobile accordion). */
export const siteMenu: MenuGroup[] = [
  { label: "Engineering", links: [
    { label: "All engineering tools", href: "/engineering", desc: "Free calculators for inspection and plant engineers" },
    { label: "Inspection plan generator", href: "/engineering/inspection-plan-generator", desc: "Standard questions → API 510/570 plan as PDF" },
    { label: "Pressure vessel thickness", href: "/engineering/pressure-vessel-thickness-calculator", desc: "Shell and heads, MAWP — ASME VIII-1" },
    { label: "Pipe wall thickness", href: "/engineering/pipe-thickness-calculator", desc: "Required wall and schedule — ASME B31.3" },
    { label: "Remaining life", href: "/engineering/remaining-life-calculator", desc: "Corrosion rate and next inspection — API 510/570/653" },
    { label: "Damage mechanisms", href: "/engineering/damage-mechanism-screening", desc: "Screen all 69 API 571 mechanisms" },
    { label: "Material spec finder", href: "/engineering/material-spec-finder", desc: "Every ASME Section II spec, tests and options" },
    { label: "QAP builder", href: "/engineering/qap-builder", desc: "Material & NDE quality plan → Excel / PDF" },
  ] },
  { label: "Investing", links: [
    { label: "Goal planner", href: "/tools/investment-planner", desc: "Monthly SIP, allocation and fund picks for a goal" },
    { label: "Fund screener", href: "/tools/funds", desc: "Scores with expense ratios; compare funds" },
    { label: "Stock analyzer", href: "/tools/stock-analyzer", desc: "The checks investors run before buying" },
    { label: "All investing tools", href: "/tools", desc: "Stock screener, stock SIP builder, portfolio check" },
  ] },
  { label: "Learn", links: [
    { label: "Codes academy", href: "/learn/codes", desc: "API 510–581, ASME Section II & V study modules" },
    { label: "API 510 / 570 exam prep", href: "/learn/exam-prep", desc: "Study plan, calculation drills, mock exams" },
    { label: "All guides & search", href: "/learn", desc: "Search everything; short, plain-language guides" },
    { label: "Damage mechanisms library", href: "/learn/damage-mechanisms", desc: "All 69 API 571 mechanisms explained" },
    { label: "Investing terms", href: "/learn/investing", desc: "CAGR, XIRR, Sharpe, P/E and more" },
  ] },
  { label: "IRIS", links: [
    { label: "IRIS inspection software", href: "/products/iris", desc: "Statutory & reliability inspections — office PC and offline tablet" },
    { label: "Book an IRIS demo", href: "/products/iris#demo", desc: "Walkthrough on your kind of equipment" },
  ] },
  { label: "For MSMEs", links: [
    { label: "How it works", href: "/for-msmes", desc: "How NumSum structures and solves MSME problems" },
    { label: "Submit a problem", href: "/submit-problem", desc: "Private intake — reviewed before any public step" },
    { label: "Challenges", href: "/challenges", desc: "Open problems for students, experts and startups" },
    { label: "Case studies", href: "/case-studies", desc: "Validated outcomes" },
    { label: "Community", href: "/community", desc: "Discussions across the ecosystem" },
    { label: "MSME intelligence", href: "/msme-intelligence", desc: "Sector, state and cluster data" },
  ] },
];
export const siteMenuLinks: MenuLink[] = [{ label: "About", href: "/about" }, { label: "Contact", href: "/contact" }];
export type NavGroup = { label: string; adminOnly?: boolean; links?: readonly (readonly [string, string])[]; sections?: readonly { label: string; links: readonly (readonly [string, string])[] }[] };

export const phaseOnePublicLinks = [
  ["For MSMEs", "/for-msmes"],
  ["Challenges", "/challenges"],
  ["IRIS Software", "/products/iris"],
  ["Invest Planner", "/tools/investment-planner"],
  ["Community", "/community"],
  ["About", "/about"],
] as const;

export const secondaryPublicLinks = [
  ["Case Studies", "/case-studies"],
  ["Research & Knowledge", "/research"],
  ["Impact Metrics", "/pilots"],
  ["Contact", "/contact"],
] as const;

export const navGroups: NavGroup[] = [
  { label: "Explore", links: phaseOnePublicLinks },
  { label: "Resources", links: secondaryPublicLinks },
  { label: "Admin", adminOnly: true, sections: [
    { label: "Phase 2", links: [["Admin Dashboard", "/admin"], ["System Health", "/admin/system-health"], ["Users", "/admin/users"], ["MSME Owners", "/admin/msme-owners"], ["Problems", "/admin/problems"], ["Questionnaires", "/admin/questionnaires"], ["Challenges", "/admin/challenges"], ["Community Moderation", "/admin/community"], ["Enquiries", "/admin/enquiries"], ["Market Data", "/admin/market-data"]] },
  ] },
];
export function getVisibleNavLinks(isAdmin: boolean) {
  return [[homeLink[0], homeLink[1]] as const, ...navGroups.filter((group) => !group.adminOnly || isAdmin).flatMap((group) => group.sections ? group.sections.flatMap((section) => section.links) : (group.links || []))];
}
