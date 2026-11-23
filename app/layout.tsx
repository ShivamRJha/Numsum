import type { Metadata, Viewport } from "next";
import { THEME_SCRIPT } from "@/components/theme-toggle";
import { AuthProvider } from "@/components/auth-provider";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { brand } from "@/lib/brand";
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "@fontsource-variable/jetbrains-mono";
import "./globals.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const viewport: Viewport = { themeColor: "#02050a", colorScheme: "dark light" };

export const metadata: Metadata = {
  manifest: "/manifest.webmanifest",
  applicationName: "NumSum Labs",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://www.numsum.in"),
  title: "NumSum Labs — MSME Industrial Innovation & Problem Solving Ecosystem",
  description: "NumSum Labs helps MSMEs identify, structure, and solve industrial challenges through engineering collaboration, research, SOPs, innovation challenges, and pilot validation.",
  icons: { icon: brand.favicon, shortcut: brand.favicon, apple: brand.logo },
  openGraph: { type: "website", siteName: "NumSum Labs", locale: "en_IN", title: "NumSum Labs — MSME Industrial Innovation & Problem Solving Ecosystem", description: "MSME-first industrial innovation through engineering collaboration, research, SOPs, challenges, and pilot validation.", images: [brand.ogImage] },
  twitter: { card: "summary", title: "NumSum Labs", description: "MSME-first industrial innovation, inspection software and practical engineering tools." },
};
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en" className="dark" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} /></head><body className="bg-navy font-sans antialiased"><AuthProvider><SiteHeader />{children}<SiteFooter /></AuthProvider></body></html>; }
