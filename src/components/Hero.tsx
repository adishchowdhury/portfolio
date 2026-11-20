"use client";

import { useRef } from "react";
import Image from "next/image";
import { ArrowDownRight, ArrowUpRight, Play } from "lucide-react";
import { gsap, ScrollTrigger, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { hero, site, stats } from "@/content/site";
import { scrollToHash } from "@/lib/lenis";
import Workspace from "./Workspace";
import Rich from "./Rich";

const VB_W = 1000;
const VB_H = 236;
const FONT = 292;
const CUTOUT = "/img/portrait-cutout.png";

export default function Hero() {
  const root = useRef<HTMLElement>(null);
  const clipRect = useRef<SVGRectElement>(null);
  const megaWrap = useRef<HTMLDivElement>(null);
  const lensHost = useRef<HTMLDivElement>(null);
  const lens = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const calm = prefersReducedMotion();
      const q = gsap.utils.selector(root);

      /* ---- outlined → filled word: follows the pointer, then fills as the hero scrolls away ---- */
      const fill = { hover: 0, scroll: 0 };
      const paint = () => {
        clipRect.current?.setAttribute("width", String(Math.max(fill.hover, fill.scroll) * VB_W));
      };
      const hoverTo = gsap.quickTo(fill, "hover", { duration: 0.6, ease: "power3", onUpdate: paint });

      const wrap = megaWrap.current;
      const onMove = (e: PointerEvent) => {
        if (!wrap) return;
        const r = wrap.getBoundingClientRect();
        hoverTo(gsap.utils.clamp(0, 1, (e.clientX - r.left) / r.width));
      };
      const onLeave = () => hoverTo(0);
      wrap?.addEventListener("pointermove", onMove);
      wrap?.addEventListener("pointerleave", onLeave);

      /* ---- portrait lens: a negative-image circle that follows the pointer ---- */
      const host = lensHost.current;
      const lensEl = lens.current;
      const lensState = { r: 1 };
      const setLens = (x: number, y: number) => {
        lensEl?.style.setProperty("--mx", x + "px");
        lensEl?.style.setProperty("--my", y + "px");
      };
      const lensTo = gsap.to(lensState, {
        r: 1,
        duration: 0.35,
        ease: "power3.out",
        paused: true,
        onUpdate: () => lensEl?.style.setProperty("--r", lensState.r + "px"),
      });
      const onLensMove = (e: PointerEvent) => {
        if (!host) return;
        const b = host.getBoundingClientRect();
        setLens(e.clientX - b.left, e.clientY - b.top);
      };
      const onLensEnter = (e: PointerEvent) => {
        onLensMove(e);
        lensTo.vars.r = Math.max(90, (host?.clientWidth ?? 300) * 0.3);
        lensTo.invalidate().restart();
      };
      const onLensLeave = () => {
        lensTo.vars.r = 1;
        lensTo.invalidate().restart();
      };
      if (!calm) {
        host?.addEventListener("pointerenter", onLensEnter);
        host?.addEventListener("pointermove", onLensMove);
        host?.addEventListener("pointerleave", onLensLeave);
      }

      if (!calm) {
        ScrollTrigger.create({
          trigger: root.current,
          start: "top top",
          end: "bottom 30%",
          scrub: 0.6,
          onUpdate: (self) => {
            fill.scroll = gsap.utils.clamp(0, 1, self.progress * 1.25);
            paint();
          },
        });
        gsap.to(".hero-mega", {
          yPercent: -14,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
        gsap.to(".hero-portrait", {
          yPercent: 9,
          ease: "none",
          scrollTrigger: { trigger: root.current, start: "top top", end: "bottom top", scrub: true },
        });
      }

      /* ---- load sequence ---- */
      if (!calm) {
        const name = root.current?.querySelector<HTMLElement>(".adish");
        let split: SplitText | undefined;
        const tl = gsap.timeline({ defaults: { ease: "expo.out" }, delay: 0.1 });

        if (name) {
          split = SplitText.create(name, { type: "chars", mask: "chars" });
          tl.from(split.chars, { yPercent: 115, duration: 1.1, stagger: 0.06 }, 0.1);
        }
        tl.fromTo(".mega-stroke", { strokeDashoffset: 3000 }, { strokeDashoffset: 0, duration: 1.9, ease: "power2.inOut" }, 0.2)
          .to(q("[data-h]"), { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.07 }, 0.45)
          .fromTo(".hero-disc", { scale: 0, transformOrigin: "50% 50%" }, { scale: 1, duration: 1.1, ease: "back.out(1.4)" }, 0.5)
          .fromTo(".hero-cut", { yPercent: 14, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 1.2, ease: "power3.out" }, 0.75)
          .add(() => {
            split?.revert();
            gsap.set(".hero-disc", { clearProps: "transform" });
          });
      } else {
        gsap.set(q("[data-h]"), { autoAlpha: 1, y: 0 });
      }

      /* ---- count-up for numeric stats ---- */
      q<HTMLElement>("[data-count]").forEach((el) => {
        const target = Number(el.dataset.count);
        if (!Number.isFinite(target) || calm) return;
        const o = { v: 0 };
        gsap.to(o, {
          v: target,
          duration: 1.4,
          ease: "power2.out",
          delay: 1.1,
          onUpdate: () => (el.textContent = String(Math.round(o.v)).padStart(2, "0")),
        });
      });

      return () => {
        wrap?.removeEventListener("pointermove", onMove);
        wrap?.removeEventListener("pointerleave", onLeave);
        host?.removeEventListener("pointerenter", onLensEnter);
        host?.removeEventListener("pointermove", onLensMove);
        host?.removeEventListener("pointerleave", onLensLeave);
      };
    },
    { scope: root },
  );

  const go = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    scrollToHash(href);
  };

  return (
    <section ref={root} id="top" data-block className="relative z-10 flex min-h-[100svh] flex-col pt-14">
      <div className="relative mx-auto grid w-full flex-1 grid-cols-12 content-start gap-x-6 px-pad pt-8 lg:pt-12">
        {/* name */}
        <h1 className="display relative z-20 col-span-12 text-paper lg:col-span-8">
          <span
            data-b="text"
            data-h
            className="mono mb-4 flex items-center gap-3 text-mute"
            style={{ transform: "translateY(12px)" }}
          >
            <span className="h-px w-10 bg-acc" aria-hidden />
            {hero.kicker}
          </span>{" "}
          <span
            data-b="text"
            className="adish block text-[clamp(6.5rem,17vw,19.5rem)] leading-[0.8] tracking-[0.005em]"
          >
            {hero.headline}
            <span className="text-acc">.</span>
          </span>
          <span className="sr-only"> — {site.role}</span>
        </h1>

        {/* portrait — breaks out of its disc and overlaps the outlined word */}
        <figure
          data-h
          style={{ transform: "translateY(16px)" }}
          className="hero-portrait relative z-30 col-span-12 mx-auto mt-8 w-[min(78vw,360px)] lg:absolute lg:right-pad lg:top-5 lg:mx-0 lg:mt-0 lg:w-[min(24vw,370px)]"
        >
          <div ref={lensHost} data-b="box" data-cursor="" className="relative aspect-[771/1080] w-full">
            <div className="hero-disc absolute inset-x-[2%] bottom-[1%] aspect-square rounded-full bg-acc" />
            <div className="hero-cut portrait-fade absolute inset-0">
              <Image
                src={CUTOUT}
                alt={`Portrait of ${site.name.display}`}
                fill
                priority
                sizes="(min-width:1024px) 410px, 78vw"
                className="object-contain object-bottom contrast-[1.05]"
              />
              {/* pointer lens: the same photo as a negative */}
              <div ref={lens} className="lens pointer-events-none absolute inset-0" aria-hidden>
                <Image
                  src={CUTOUT}
                  alt=""
                  fill
                  loading="eager"
                  sizes="(min-width:1024px) 410px, 78vw"
                  className="object-contain object-bottom invert"
                />
              </div>
            </div>
          </div>
        </figure>

        {/* outlined headline */}
        <div
          ref={megaWrap}
          data-b="mega"
          data-cursor="Hover"
          className="hero-mega relative z-10 col-span-12 -mt-[3.5vw] select-none lg:-mt-[5.2vw]"
        >
          <svg viewBox={`0 0 ${VB_W} ${VB_H}`} className="block h-auto w-full overflow-visible" role="img" aria-label={hero.outline}>
            <defs>
              <clipPath id="mega-clip">
                <rect ref={clipRect} x="0" y="0" width="0" height={VB_H} />
              </clipPath>
            </defs>
            <text
              className="mega-stroke"
              x="0"
              y={VB_H - 4}
              textLength={VB_W}
              lengthAdjust="spacingAndGlyphs"
              fontFamily="var(--font-display)"
              fontSize={FONT}
              fill="transparent"
              stroke="#f5f3ee"
              strokeWidth="1.6"
              vectorEffect="non-scaling-stroke"
              style={{ strokeDasharray: 3000 }}
            >
              {hero.outline}
            </text>
            <text
              x="0"
              y={VB_H - 4}
              textLength={VB_W}
              lengthAdjust="spacingAndGlyphs"
              fontFamily="var(--font-display)"
              fontSize={FONT}
              fill="#e8ff32"
              clipPath="url(#mega-clip)"
              aria-hidden
            >
              {hero.outline}
            </text>
          </svg>
        </div>

        {/* intro + board */}
        <div className="relative z-20 col-span-12 mt-8 grid grid-cols-12 gap-x-6 gap-y-8 lg:mt-10">
          <div className="col-span-12 lg:col-span-6">
            <p
              data-h
              data-b="text"
              style={{ transform: "translateY(16px)" }}
              className="display mb-4 text-[clamp(1.6rem,2.6vw,2.6rem)] text-acc"
            >
              {site.role}
            </p>
            <p
              data-h
              data-b="text"
              style={{ transform: "translateY(16px)" }}
              className="max-w-[62ch] text-[clamp(15px,1.15vw,18px)] leading-relaxed text-paper/80"
            >
              <Rich text={hero.paragraph} />
            </p>
            <div data-h data-b="box" style={{ transform: "translateY(16px)" }} className="mt-7 flex flex-wrap gap-3">
              <a href="#work" onClick={(e) => go(e, "#work")} className="btn btn-acc" data-cursor="Work">
                Explore projects <ArrowDownRight size={15} />
              </a>
              <a href="#contact" onClick={(e) => go(e, "#contact")} className="btn" data-cursor="Talk">
                Let&apos;s connect <ArrowUpRight size={15} />
              </a>
              <button
                type="button"
                className="btn replay-cta"
                data-cursor="Play"
                onClick={() => window.dispatchEvent(new CustomEvent("asm:toggle"))}
              >
                <Play size={14} fill="currentColor" />
                Watch it get built
              </button>
            </div>
          </div>

          <div
            data-h
            data-b="box"
            style={{ transform: "translateY(16px)" }}
            className="col-span-12 lg:col-span-3 lg:col-start-10"
          >
            <Workspace />
          </div>
        </div>
      </div>

      {/* stats strip */}
      <div className="relative z-20 mt-10 border-y border-line bg-ink/70 backdrop-blur-sm">
        <dl className="mx-auto grid grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => {
            const numeric = /^\d+$/.test(s.value);
            return (
              <div
                key={s.label}
                data-b="box"
                data-h
                style={{ transform: "translateY(16px)" }}
                className={`flex flex-col gap-1 border-line px-pad py-5 ${i % 2 === 0 ? "border-r" : ""} ${i < 2 ? "border-b lg:border-b-0" : ""} ${i < 3 ? "lg:border-r" : "lg:border-r-0"}`}
              >
                <dt className="mono text-mute">{s.label}</dt>
                <dd className="display text-[clamp(2.6rem,5vw,4.6rem)] leading-none">
                  <span data-count={numeric ? s.value : undefined}>{numeric ? s.value.padStart(2, "0") : s.value}</span>
                </dd>
                <dd className="text-[13px] text-mute">{s.note}</dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
