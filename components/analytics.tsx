"use client";
import Script from "next/script";
import { useEffect, useState } from "react";

import { CONSENT_KEY as KEY, GTM_ID } from "@/lib/analytics";
const on = GTM_ID && GTM_ID !== "off";

type W = Window & { gtag?: (...a: unknown[]) => void };

export function Analytics() {
  if (!on) return null;
  return <>
    <Script id="gtm" strategy="afterInteractive">{`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_ID}');`}</Script>
    <ConsentBanner />
  </>;
}

export function ConsentBanner() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    try { setShow(!localStorage.getItem(KEY)); } catch { setShow(false); }
    const open = () => setShow(true);
    window.addEventListener("ns-open-consent", open);
    return () => window.removeEventListener("ns-open-consent", open);
  }, []);
  const choose = (v: "granted" | "denied") => {
    try { localStorage.setItem(KEY, v); } catch { /* private mode */ }
    (window as W).gtag?.("consent", "update", { analytics_storage: v });
    setShow(false);
  };
  if (!show) return null;
  return <div role="dialog" aria-label="Cookie choice" className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-2xl rounded-2xl border border-white/15 bg-[#0b1220]/95 p-4 text-sm text-white/80 shadow-2xl backdrop-blur md:inset-x-auto md:right-4 print:hidden">
    <p>We use privacy-friendly analytics cookies to see which pages and tools are useful, only if you agree. No advertising cookies. <a href="/privacy#cookies" className="text-amber-100 underline">Details</a></p>
    <div className="mt-3 flex gap-2"><button type="button" onClick={() => choose("granted")} className="rounded-full bg-amber-100 px-4 py-2 font-semibold text-black hover:bg-white">Accept</button><button type="button" onClick={() => choose("denied")} className="rounded-full border border-white/20 px-4 py-2 text-white/80 hover:text-white">Decline</button></div>
  </div>;
}

export function CookieSettingsLink() {
  if (!on) return null;
  return <button type="button" onClick={() => window.dispatchEvent(new Event("ns-open-consent"))} className="text-left hover:text-white">Cookie settings</button>;
}
