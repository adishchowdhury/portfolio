"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { setLenis } from "@/lib/lenis";

/**
 * Page-level motion plumbing, rendered once:
 *  - Lenis smooth scroll wired into GSAP's ticker and ScrollTrigger
 *  - the shared scroll-reveal system for every [data-r] element
 *  - a ScrollTrigger refresh once fonts have loaded (layout shifts otherwise)
 */
export default function Boot() {
  // Smooth scroll
  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({ lerp: 0.095, wheelMultiplier: 0.95, smoothWheel: true });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // Scroll reveals
  useGSAP(() => {
    const root = document.documentElement;
    if (prefersReducedMotion()) {
      root.classList.add("rm");
      return;
    }

    const targets = gsap.utils.toArray<HTMLElement>("[data-r]");
    if (!targets.length) return;

    const reveal = (els: Element[]) => {
      els.forEach((e) => e.classList.add("is-in"));
      const clip = els.filter((e) => (e as HTMLElement).dataset.r === "clip");
      const rest = els.filter((e) => (e as HTMLElement).dataset.r !== "clip");
      if (rest.length)
        gsap.fromTo(
          rest,
          { opacity: 0, y: 36 },
          {
            opacity: 1,
            y: 0,
            duration: 0.95,
            ease: "power3.out",
            stagger: 0.09,
            overwrite: "auto",
            clearProps: "transform,opacity",
          },
        );
      if (clip.length)
        gsap.fromTo(
          clip,
          { clipPath: "inset(0 0 100% 0)", y: 40, opacity: 1 },
          {
            clipPath: "inset(0 0 0% 0)",
            y: 0,
            duration: 1.1,
            ease: "expo.out",
            stagger: 0.12,
            overwrite: "auto",
            clearProps: "clipPath,transform",
          },
        );
    };

    ScrollTrigger.batch(targets, {
      start: "top 92%",
      once: true,
      interval: 0.08,
      batchMax: 8,
      onEnter: reveal,
    });

    // ghost words travel sideways at their own pace, giving the page layers
    gsap.utils.toArray<HTMLElement>("[data-ghost]").forEach((el) => {
      const dir = Number(el.dataset.ghost) || 1;
      gsap.fromTo(
        el,
        { xPercent: -9 * dir },
        {
          xPercent: 9 * dir,
          ease: "none",
          scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
        },
      );
    });

    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener("load", refresh);
    return () => window.removeEventListener("load", refresh);
  });

  return null;
}
