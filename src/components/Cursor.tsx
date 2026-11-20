"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

/**
 * A Figma-style pointer for desktop: a real arrow in the accent colour, an I-beam over running
 * text and a crosshair over anything marked data-cursor-type="cross". Interactive things get a
 * name tag that trails the arrow, the way collaborators' cursors do in Figma
 * (data-cursor="Label"; links and buttons default to "Open"; data-cursor="" turns the tag off).
 * Touch devices and reduced-motion visitors keep the native cursor.
 */
type Kind = "arrow" | "ibeam" | "cross";

export default function Cursor() {
  const pointer = useRef<HTMLDivElement>(null);
  const tag = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const el = pointer.current;
    const tg = tag.current;
    if (!fine || calm || !el || !tg) return;

    const root = document.documentElement;
    root.classList.add("has-cursor");

    const px = gsap.quickTo(el, "x", { duration: 0.05, ease: "power2" });
    const py = gsap.quickTo(el, "y", { duration: 0.05, ease: "power2" });
    const tx = gsap.quickTo(tg, "x", { duration: 0.32, ease: "power3" });
    const ty = gsap.quickTo(tg, "y", { duration: 0.32, ease: "power3" });

    gsap.set([el, tg], { autoAlpha: 0 });
    let seen = false;

    const move = (e: PointerEvent) => {
      if (!seen) {
        seen = true;
        gsap.set([el, tg], { x: e.clientX, y: e.clientY });
        gsap.to(el, { autoAlpha: 1, duration: 0.25 });
      }
      px(e.clientX);
      py(e.clientY);
      tx(e.clientX);
      ty(e.clientY);
    };

    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      const typed = t.closest<HTMLElement>("[data-cursor-type]");
      const kind: Kind =
        (typed?.dataset.cursorType as Kind | undefined) ??
        (t.closest("p, blockquote") && !t.closest("a, button") ? "ibeam" : "arrow");
      el.dataset.kind = kind;

      const host = t.closest<HTMLElement>("[data-cursor], a, button, summary");
      const text = host ? (host.dataset.cursor ?? "Open") : "";
      tg.textContent = text;
      gsap.to(tg, { autoAlpha: text ? 1 : 0, duration: 0.15, overwrite: "auto" });
    };

    const leave = () => gsap.to([el, tg], { autoAlpha: 0, duration: 0.15 });
    const enter = () => seen && gsap.to(el, { autoAlpha: 1, duration: 0.15 });

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    root.addEventListener("pointerleave", leave);
    root.addEventListener("pointerenter", enter);
    return () => {
      root.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      root.removeEventListener("pointerleave", leave);
      root.removeEventListener("pointerenter", enter);
    };
  }, []);

  return (
    <>
      <div ref={pointer} className="fcursor" data-kind="arrow" aria-hidden>
        <svg className="fc-arrow" viewBox="0 0 17 22" width="17" height="22">
          <path
            d="M2 1.5v16l4.4-4 3 7 2.6-1.1-3-6.9h6z"
            style={{ fill: "var(--color-acc)" }}
            stroke="#fff"
            strokeWidth="1.3"
            strokeLinejoin="round"
          />
        </svg>
        <svg className="fc-ibeam" viewBox="0 0 18 18" width="18" height="18">
          <path d="M5.5 1.5h7M5.5 16.5h7M9 1.5v15" stroke="#050505" strokeWidth="4.2" strokeLinecap="round" />
          <path d="M5.5 1.5h7M5.5 16.5h7M9 1.5v15" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
        <svg className="fc-cross" viewBox="0 0 18 18" width="18" height="18">
          <path d="M9 1v16M1 9h16" stroke="#050505" strokeWidth="4.4" strokeLinecap="round" />
          <path d="M9 1v16M1 9h16" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </div>
      <div ref={tag} className="ftag" aria-hidden />
    </>
  );
}
