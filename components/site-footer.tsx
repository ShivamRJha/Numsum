import Image from "next/image";
import Link from "next/link";
import { brand } from "@/lib/brand";
import { contactEmail } from "@/lib/site";
import { CookieSettingsLink } from "@/components/analytics";

const platform = [["Engineering tools", "/engineering"], ["Vessel thickness", "/engineering/pressure-vessel-thickness-calculator"], ["Pipe thickness", "/engineering/pipe-thickness-calculator"], ["Remaining life", "/engineering/remaining-life-calculator"], ["Hydrotest pressure", "/engineering/hydrotest-pressure-calculator"], ["Steam trap loss", "/engineering/steam-trap-loss-calculator"], ["Damage mechanisms", "/engineering/damage-mechanism-screening"]] as const;
const resources = [["Learn", "/learn"], ["API 571 library", "/learn/damage-mechanisms"], ["Investing terms", "/learn/investing"], ["For MSMEs", "/for-msmes"], ["Challenges", "/challenges"], ["Case studies", "/case-studies"], ["Knowledge & research", "/research"]] as const;
const products = [["IRIS inspection software", "/products/iris"], ["Goal planner", "/tools/investment-planner"], ["Fund screener", "/tools/funds"], ["Stock screener", "/tools/stocks"], ["Stock analyzer", "/tools/stock-analyzer"], ["Portfolio check", "/tools/portfolio"]] as const;
const company = [["About", "/about"], ["Contact", "/contact"], ["Privacy policy", "/privacy"], ["Terms of use", "/terms"]] as const;

function Column({ title, links }: { title: string; links: readonly (readonly [string, string])[] }) {
  return <div><p className="font-semibold text-white">{title}</p><ul className="mt-3 grid gap-2">{links.map(([label, href]) => <li key={href}><Link href={href} className="hover:text-white">{label}</Link></li>)}</ul></div>;
}

export function SiteFooter() {
  const email = contactEmail();
  return <footer className="border-t border-white/10 bg-[#02050a] px-6 py-12 text-sm text-white/60 print:hidden">
    <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
      <div className="flex items-start gap-3"><Image src={brand.logo} alt="NumSum Labs logo" width={46} height={46} className="rounded-2xl bg-white p-1" /><div><p className="font-display text-xl font-bold text-white">NumSum Labs</p><p className="mt-2 max-w-sm text-blue-100/80">Industrial innovation for MSMEs, inspection and reliability software for process plants, and practical engineering tools.</p>{email && <a href={`mailto:${email}`} className="mt-3 inline-block text-amber-100 hover:text-white">{email}</a>}</div></div>
      <Column title="Engineering" links={platform} />
      <Column title="Learn & MSMEs" links={resources} />
      <Column title="Products & tools" links={products} />
      <Column title="Company" links={company} />
    </div>
    <div className="mx-auto mt-10 flex max-w-7xl flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-white/45 md:flex-row"><p>© {new Date().getFullYear()} NumSum Labs. All rights reserved.</p><CookieSettingsLink /></div>
  </footer>;
}
