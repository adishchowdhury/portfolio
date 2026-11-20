"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * Desktop-only custom cursor: a precise dot plus a lagging ring that grows into a
 * labelled yellow disc over anything carrying data-cursor="LABEL" (links and buttons
 * fall back to "OPEN"). Touch devices and reduced-motion users keep the native cursor.
 */
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || calm || !dot.current || !ring.current) return;

    const root = document.documentElement;
    root.classList.add("has-cursor");

    const dx = gsap.quickTo(dot.current, "x", { duration: 0.08, ease: "power3" });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.08, ease: "power3" });
    const rx = gsap.quickTo(ring.current, "x", { duration: 0.45, ease: "power3" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.45, ease: "power3" });

    gsap.set([dot.current, ring.current], { autoAlpha: 0 });
    let seen = false;

    const move = (e: PointerEvent) => {
      if (!seen) {
        seen = true;
        gsap.set([dot.current, ring.current], { x: e.clientX, y: e.clientY });
        gsap.to([dot.current, ring.current], { autoAlpha: 1, duration: 0.3 });
      }
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };

    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      const host = t?.closest<HTMLElement>("[data-cursor], a, button, summary");
      const text = host ? (host.dataset.cursor ?? "Open") : "";
      if (label.current) label.current.textContent = text;
      ring.current?.setAttribute("data-on", host && host.dataset.cursor !== "" ? "true" : "false");
    };

    const leave = () => gsap.to([dot.current, ring.current], { autoAlpha: 0, duration: 0.2 });
    const enter = () => seen && gsap.to([dot.current, ring.current], { autoAlpha: 1, duration: 0.2 });

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    document.documentElement.addEventListener("pointerenter", enter);
    return () => {
      root.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.documentElement.removeEventListener("pointerenter", enter);
    };
  }, []);

  return (
    <>
      <div ref={ring} className="cursor-ring" data-on="false" aria-hidden>
        <span ref={label} className="cursor-label" />
      </div>
      <div ref={dot} className="cursor-dot" aria-hidden />
    </>
  );
}
