export const homeLink = ["Home", "/"] as const;

export type MenuLink = { label: string; href: string; desc?: string };
export type MenuGroup = { label: string; links: MenuLink[] };

/** Main site menu (header dropdowns and mobile accordion). */
export const siteMenu: MenuGroup[] = [
  { label: "Platform", links: [
    { label: "For MSMEs", href: "/for-msmes", desc: "How NumSum structures and solves MSME problems" },
    { label: "Submit a problem", href: "/submit-problem", desc: "Private intake — reviewed before any public step" },
    { label: "MSME challenges", href: "/problem-statements", desc: "Approved public problem statements" },
    { label: "Innovation challenges", href: "/challenges", desc: "Open challenges for students, experts and startups" },
    { label: "Case studies", href: "/case-studies", desc: "Validated outcomes" },
    { label: "Community", href: "/community", desc: "Discussions across the ecosystem" },
  ] },
  { label: "Products", links: [
    { label: "IRIS inspection software", href: "/products/iris", desc: "Statutory & reliability inspections — office PC and offline tablet" },
    { label: "Book an IRIS demo", href: "/products/iris#demo", desc: "Walkthrough on your kind of equipment" },
  ] },
  { label: "Invest tools", links: [
    { label: "Goal planner", href: "/tools/investment-planner", desc: "Required SIP, allocation and fund picks" },
    { label: "Fund screener", href: "/tools/funds", desc: "Scores with expense ratios; compare funds" },
    { label: "Stock screener", href: "/tools/stocks", desc: "Nifty 500 scored vs industry peers" },
    { label: "Stock analyzer", href: "/tools/stock-analyzer", desc: "The checks investors run before buying" },
    { label: "Portfolio check", href: "/tools/portfolio", desc: "Correlation and diversification" },
  ] },
  { label: "Resources", links: [
    { label: "MSME intelligence", href: "/msme-intelligence", desc: "Sector, state and cluster data" },
    { label: "Knowledge & research", href: "/research", desc: "Approved research and knowledge assets" },
    { label: "SOP library", href: "/sops", desc: "Practical standard operating procedures" },
    { label: "Impact & pilots", href: "/pilots", desc: "Verified pilot outcomes" },
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
