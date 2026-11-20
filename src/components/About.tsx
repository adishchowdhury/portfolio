"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, SplitText, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { about, timeline } from "@/content/site";
import Rich from "./Rich";

export default function About() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const q = gsap.utils.selector(root);

      /* ---- timeline: the spine fills with scroll, each node lights up as it is passed ---- */
      const list = q(".tl-list")[0];
      if (list) {
        gsap.fromTo(
          q(".tl-fill"),
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: "none",
            transformOrigin: "top",
            scrollTrigger: { trigger: list, start: "top 62%", end: "bottom 62%", scrub: 0.4 },
          },
        );
      }
      q<HTMLElement>(".tl-item").forEach((item) => {
        ScrollTrigger.create({
          trigger: item,
          start: "top 62%",
          onEnter: () => (item.dataset.on = "true"),
          onLeaveBack: () => (item.dataset.on = "false"),
        });
      });

      /* ---- the statement: words fill in as it scrolls through ---- */
      const stmt = q<HTMLElement>(".statement")[0];
      let split: SplitText | undefined;
      if (stmt) {
        split = SplitText.create(stmt, { type: "words" });
        gsap.fromTo(
          split.words,
          { opacity: 0.16 },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.12,
            scrollTrigger: { trigger: stmt, start: "top 82%", end: "bottom 48%", scrub: 0.5 },
          },
        );
      }
      return () => split?.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} id="about" data-block className="relative z-10 overflow-x-clip border-t border-line bg-ink/60">
      <span aria-hidden data-ghost="1" className="ghost left-[-4vw] top-[8%] text-[clamp(14rem,40vw,52rem)]">IMPROVER</span>
      <div className="relative z-10 mx-auto grid grid-cols-12 gap-x-6 px-pad pb-10 pt-20 lg:pt-28">
        {/* left: sticky heading + story */}
        <div className="col-span-12 lg:col-span-5">
          <div className="lg:sticky lg:top-24">
            <h2 className="display h-sect leading-[0.94]" data-r="clip" data-b="text">
              <span className="block">{about.heading[0]}</span>
              <span className="outline-text block">{about.heading[1]}</span>
              <span className="block">
                {about.heading[2]}
                <span className="text-acc">.</span>
              </span>
            </h2>

            <div className="mt-8 max-w-[46ch] space-y-4 text-paper/80">
              {about.paragraphs.map((p, i) => (
                <p key={i} data-r="up" data-b="text" className={i === 0 ? "text-paper" : undefined}>
                  <Rich text={p} />
                </p>
              ))}
            </div>
          </div>
        </div>

        {/* right: timeline */}
        <div className="col-span-12 mt-14 lg:col-span-6 lg:col-start-7 lg:mt-3">
          <ol className="tl-list relative">
            <span aria-hidden className="absolute bottom-0 left-[11px] top-2 w-px bg-line" />
            <span aria-hidden className="tl-fill absolute bottom-0 left-[11px] top-2 w-px bg-acc" />

            {timeline.map((t, i) => (
              <li
                key={t.title}
                data-on="false"
                data-r="up"
                data-b="box"
                className="tl-item group relative grid grid-cols-[24px_1fr] gap-x-5 pb-14 last:pb-4 sm:gap-x-8"
              >
                <span
                  aria-hidden
                  className="relative z-10 mt-3 h-[23px] w-[23px] border border-line bg-ink transition-colors duration-500 group-data-[on=true]:border-acc group-data-[on=true]:bg-acc"
                />
                <div className="-mt-1">
                  <div className="flex items-end gap-4">
                    <span
                      className="display outline-text text-[clamp(4.5rem,9vw,8.5rem)] leading-[0.8] transition-[color,-webkit-text-stroke-color] duration-500 group-data-[on=true]:text-acc group-data-[on=true]:[-webkit-text-stroke-color:var(--color-acc)]"
                      aria-hidden
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {t.year && (
                      <span className="mono mb-1 border border-acc px-2 py-0.5 text-acc">{t.year}</span>
                    )}
                  </div>
                  <h3 className="display mt-4 text-[clamp(1.6rem,2.6vw,2.4rem)]">{t.title}</h3>
                  <p className="mt-2 max-w-[48ch] text-paper/70">{t.body}</p>
                  <p className="mono mt-3 text-dim">{`// ${t.note}`}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* statement */}
        <figure className="col-span-12 mt-12 border-t border-line pt-14 lg:mt-20">
          <div data-b="box" className="relative">
            <span aria-hidden className="display absolute -top-6 left-0 text-[clamp(6rem,14vw,14rem)] leading-none text-acc">
              &ldquo;
            </span>
            <blockquote>
              <p className="statement display max-w-[22ch] pl-2 pt-[min(11vw,8rem)] text-[clamp(2.6rem,7.2vw,7.6rem)] leading-[0.92] lg:max-w-[26ch] lg:pl-[8vw]">
                {about.statement}
              </p>
            </blockquote>
          </div>
        </figure>
      </div>
    </section>
  );
}
