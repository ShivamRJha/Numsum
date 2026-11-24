export const homeLink = ["Home", "/"] as const;

export type MenuLink = { label: string; href: string; desc?: string };
export type MenuGroup = { label: string; home: string; blurb: string; base: string[]; links: MenuLink[]; cta?: MenuLink };

/** Main site menu: header mega-menus, the section bar under the header, and the mobile drawer. */
export const siteMenu: MenuGroup[] = [
  { label: "Learn", home: "/learn", blurb: "Plain-language study of API and ASME codes, clause by clause.", base: ["/learn"], cta: { label: "Search the library", href: "/learn/search" }, links: [
    { label: "Codes academy", href: "/learn/codes", desc: "API 510, 570, 571, 574, 579, 580, 581 · ASME II & V" },
    { label: "Clause library", href: "/learn/codes#clauses", desc: "Every clause explained, linked to its lesson" },
    { label: "API 510 / 570 exam prep", href: "/learn/exam-prep", desc: "Study plan, calculation drills, mock exams" },
    { label: "Damage mechanisms", href: "/learn/damage-mechanisms", desc: "All API 571 mechanisms explained" },
    { label: "Short guides", href: "/learn#guides", desc: "Five-minute reads on inspection topics" },
  ] },
  { label: "Engineering", home: "/engineering", blurb: "Free calculators and planners for inspection and plant engineers.", base: ["/engineering"], cta: { label: "All engineering tools", href: "/engineering" }, links: [
    { label: "Inspection plan generator", href: "/engineering/inspection-plan-generator", desc: "API 510/570 plan as PDF" },
    { label: "Damage mechanism screening", href: "/engineering/damage-mechanism-screening", desc: "Which API 571 mechanisms apply" },
    { label: "Remaining life", href: "/engineering/remaining-life-calculator", desc: "Corrosion rate and next inspection" },
    { label: "Vessel thickness", href: "/engineering/pressure-vessel-thickness-calculator", desc: "Shell, heads, MAWP — ASME VIII-1" },
    { label: "Pipe thickness", href: "/engineering/pipe-thickness-calculator", desc: "Required wall and schedule — B31.3" },
    { label: "Material spec finder", href: "/engineering/material-spec-finder", desc: "ASME Section II specs and tests" },
    { label: "QAP builder", href: "/engineering/qap-builder", desc: "Material & NDE quality plan" },
  ] },
  { label: "IRIS", home: "/products/iris", blurb: "Inspection and reliability software for process plants.", base: ["/products"], cta: { label: "Book a demo", href: "/products/iris#demo" }, links: [
    { label: "IRIS inspection software", href: "/products/iris", desc: "Statutory and RBI inspections, offline tablet" },
  ] },
  { label: "Community", home: "/for-msmes", blurb: "MSME problems, open challenges and discussion.", base: ["/for-msmes", "/submit-problem", "/challenges", "/case-studies", "/community", "/msme-intelligence", "/research"], cta: { label: "Submit a problem", href: "/submit-problem" }, links: [
    { label: "For MSMEs", href: "/for-msmes", desc: "How NumSum structures and solves problems" },
    { label: "Challenges", href: "/challenges", desc: "Open problems for students and experts" },
    { label: "Discussions", href: "/community", desc: "Questions and answers" },
    { label: "Case studies", href: "/case-studies", desc: "Validated outcomes" },
    { label: "MSME intelligence", href: "/msme-intelligence", desc: "Sector, state and cluster data" },
  ] },
  { label: "Money Lab", home: "/tools", blurb: "Our after-hours side project, just for fun: stock and fund research toys. Not advice.", base: ["/tools"], cta: { label: "Enter the Money Lab", href: "/tools" }, links: [
    { label: "Stock screener", href: "/tools/stocks", desc: "Filter listed companies by fundamentals" },
    { label: "Stock analyzer", href: "/tools/stock-analyzer", desc: "Checks before you buy, with news signals" },
    { label: "Fund screener", href: "/tools/funds", desc: "Compare mutual funds and costs" },
    { label: "Goal planner", href: "/tools/investment-planner", desc: "Monthly SIP and allocation for a goal" },
    { label: "Stock SIP builder", href: "/tools/stock-sip", desc: "Plan a basket of stocks" },
    { label: "Portfolio check", href: "/tools/portfolio", desc: "Diversification and overlap" },
    { label: "How scores work", href: "/tools/methodology", desc: "Data sources, checks and methodology" },
    { label: "Money terms", href: "/learn/investing", desc: "CAGR, XIRR, Sharpe, P/E and more" },
  ] },
];
/** Company links (shown in the menus' footer row, mobile drawer and site footer). */
export const siteMenuLinks: MenuLink[] = [{ label: "About", href: "/about" }, { label: "Contact", href: "/contact" }];

/** Section that owns a path, if any. */
export function sectionFor(path: string) {
  return siteMenu.find((g) => g.base.some((b) => path === b || path.startsWith(b + "/")));
}
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
