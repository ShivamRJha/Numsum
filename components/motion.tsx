"use client";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Scroll reveal for the whole site. Marks [data-reveal] elements and the sections of <main>
 * and fades them in as they enter the viewport. Children of [data-stagger] get a small delay each.
 * Skipped entirely when the visitor prefers reduced motion.
 */
export function Motion() {
  const pathname = usePathname();
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return;
    const root = document.documentElement;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal], main section"));
    document.querySelectorAll<HTMLElement>("[data-stagger]").forEach((p) => Array.from(p.children).forEach((c, i) => { const el = c as HTMLElement; el.dataset.reveal ??= ""; el.style.setProperty("--rd", `${Math.min(i, 8) * 60}ms`); els.push(el); }));
    const vh = window.innerHeight;
    els.forEach((el) => {
      if (el.tagName === "SECTION" && !el.hasAttribute("data-reveal")) el.classList.add("reveal-auto");
      if (el.getBoundingClientRect().top < vh * 0.92) el.classList.add("in"); // already on screen: no flash
    });
    root.classList.add("motion");
    const io = new IntersectionObserver((entries) => entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px", threshold: 0.05 });
    els.forEach((el) => { if (!el.classList.contains("in")) io.observe(el); });
    // content added later (data loaded on the client) should never stay hidden
    const safety = setTimeout(() => els.forEach((el) => el.classList.add("in")), 4000);
    return () => { io.disconnect(); clearTimeout(safety); };
  }, [pathname]);
  return null;
}
