"use client";

import { useMemo, useState } from "react";
import { beyond, categories, interests, type Category } from "@/content/site";

/**
 * BEYOND THE CODE — a ledger, not a card grid. The big numerals are live counts and double as
 * filters: pick one and every other row recedes. Nothing is hidden, so it reads fine unfiltered.
 */
export default function Beyond() {
  const [active, setActive] = useState<Category | null>(null);

  const counts = useMemo(
    () => Object.fromEntries(categories.map((c) => [c, beyond.filter((b) => b.category === c).length])) as Record<Category, number>,
    [],
  );
  const rows = useMemo(
    () => [...beyond].sort((a, b) => categories.indexOf(a.category) - categories.indexOf(b.category)),
    [],
  );

  return (
    <section id="beyond" data-block className="relative z-10 overflow-x-clip border-t border-line">
      <span aria-hidden data-ghost="-1" className="ghost left-[-2vw] top-[1%] text-[clamp(14rem,40vw,52rem)]">RECORD</span>
      <div className="relative z-10 mx-auto px-pad pb-24 pt-20 lg:pt-28">
        <header className="grid grid-cols-12 items-end gap-x-6 gap-y-5">
          <h2 className="display h-mega col-span-12 lg:col-span-8" data-r="clip" data-b="text">
            <span className="block">BEYOND</span>
            <span className="outline-text block lg:pl-[10vw]">THE CODE</span>
          </h2>
          <div className="col-span-12 lg:col-span-4 lg:pb-3">
            <p className="max-w-[40ch] text-paper/75" data-b="text" data-r="up">
              Hackathons, open source, experiments, and the programmes that keep me improving.
            </p>
          </div>
        </header>

        {/* counters = filters */}
        <div
          role="group"
          aria-label="Filter entries by category"
          data-b="box"
          className="mt-12 grid grid-cols-2 border-l border-t border-line sm:grid-cols-3 lg:mt-16 lg:grid-cols-6"
        >
          {categories.map((c) => {
            const on = active === c;
            return (
              <button
                key={c}
                type="button"
                aria-pressed={on}
                onClick={() => setActive(on ? null : c)}
                data-cursor={on ? "Clear" : "Filter"}
                className={`group relative flex flex-col items-start gap-3 border-b border-r border-line p-4 text-left transition-colors duration-300 lg:p-5 ${
                  on ? "bg-acc text-ink" : "hover:bg-ink-2"
                }`}
              >
                <span
                  className={`display text-[clamp(3.6rem,6.4vw,6.8rem)] leading-[0.8] transition-colors ${
                    on ? "text-ink" : "outline-text group-hover:text-acc group-hover:[-webkit-text-stroke-color:var(--color-acc)]"
                  }`}
                >
                  {String(counts[c]).padStart(2, "0")}
                </span>
                <span className={`mono ${on ? "text-ink" : "text-mute"}`}>{c}</span>
              </button>
            );
          })}
        </div>

        {/* ledger */}
        <ol className="mt-2 border-t border-line">
          {rows.map((r, i) => {
            const dim = active !== null && active !== r.category;
            return (
              <li
                key={r.category + r.title}
                data-r="up"
                className={`grid grid-cols-[3.4rem_1fr] items-baseline gap-x-4 border-b border-line py-4 transition-opacity duration-500 md:grid-cols-[4.5rem_11rem_1fr_auto] lg:grid-cols-[5.5rem_12rem_1fr_auto] ${
                  dim ? "opacity-[0.22]" : ""
                }`}
              >
                <span className="display text-[clamp(1.8rem,3vw,3rem)] leading-none text-dim" aria-hidden>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="mono col-start-2 text-mute md:col-start-auto">{r.category}</span>
                <span className="col-start-2 md:col-start-auto">
                  <span className="display block text-[clamp(1.5rem,2.4vw,2.4rem)] leading-tight">{r.title}</span>
                  <span className="mt-1 block text-[14px] text-paper/60">{r.context}</span>
                </span>
                {r.result && (
                  <span className="mono col-start-2 mt-2 inline-block w-fit justify-self-start border border-acc px-2 py-1 text-acc md:col-start-auto md:mt-0 md:justify-self-end">
                    {r.result}
                  </span>
                )}
              </li>
            );
          })}
        </ol>

        {/* interests */}
        <div className="mt-14 grid grid-cols-12 gap-x-6 gap-y-4" data-b="box">
          <p className="mono col-span-12 text-mute lg:col-span-3">Where my attention goes</p>
          <ul className="col-span-12 grid gap-px bg-line sm:grid-cols-2 lg:col-span-9">
            {interests.map((t, i) => (
              <li key={t} className="flex items-baseline gap-4 bg-ink p-4">
                <span className="mono text-acc">{String(i + 1).padStart(2, "0")}</span>
                <span className="display text-[clamp(1.4rem,2vw,2rem)] leading-tight">{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
