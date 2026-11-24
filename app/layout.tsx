import type { Metadata, Viewport } from "next";
import { THEME_SCRIPT } from "@/components/theme-toggle";
import { AuthProvider } from "@/components/auth-provider";
import { SiteHeader } from "@/components/site-header";
import { Motion } from "@/components/motion";
import { SiteFooter } from "@/components/site-footer";
import { brand } from "@/lib/brand";
import { Analytics } from "@/components/analytics";
import { CONSENT_SCRIPT, GTM_ID } from "@/lib/analytics";
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";

/** Pages are cached at the edge and rebuilt at most every 5 minutes (public data); signed-in data loads in the browser. */
export const revalidate = 300;
export const viewport: Viewport = { themeColor: "#02050a", colorScheme: "dark light" };

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  applicationName: "NumSum Labs",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.numsum.in"),
  title: "NumSum Labs — Inspection Engineering: API & ASME Academy, Calculators, IRIS Software",
  description: "Learn API 510, 570, 571, 574, 579, 580, 581 and ASME Section II & V clause by clause, train for API 510/570 exams, run free inspection calculators, and manage plant inspection with IRIS software.",
  icons: { icon: brand.favicon, shortcut: brand.favicon, apple: brand.logo },
  openGraph: { type: "website", siteName: "NumSum Labs", locale: "en_IN", title: "NumSum Labs — Inspection engineering academy, calculators & IRIS software", description: "API and ASME codes clause by clause, free inspection calculators and IRIS inspection software.", images: [brand.ogImage] },
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } : undefined,
  twitter: { card: "summary_large_image", title: "NumSum Labs — API & ASME academy and inspection calculators", description: "Learn API and ASME codes clause by clause, train for API 510/570 exams and run inspection calculators. Free." },
};
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en" className="dark" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} /><script dangerouslySetInnerHTML={{ __html: CONSENT_SCRIPT }} /></head><body className="bg-navy font-sans antialiased">{GTM_ID && GTM_ID !== "off" && <noscript><iframe src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`} height="0" width="0" style={{ display: "none", visibility: "hidden" }} title="gtm" /></noscript>}<AuthProvider><SiteHeader />{children}<SiteFooter /><Motion /><Analytics /></AuthProvider></body></html>; }
