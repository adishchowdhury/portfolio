import { stack } from "@/content/site";

/**
 * MY TOOLBOX — each group is a horizontal band. Tools are set as huge outlined words that
 * fill yellow on hover while their neighbours dim. A small annotation appears only where
 * a tool has real evidence behind it (a project or role from the content file).
 */
export default function Stack() {
  return (
    <section id="stack" data-block className="relative z-10 overflow-x-clip border-t border-line bg-ink/60">
      <span aria-hidden data-ghost="1" className="ghost right-[-6vw] top-[3%] text-[clamp(14rem,40vw,52rem)]">TOOLS</span>
      <div className="relative z-10 mx-auto px-pad pb-20 pt-20 lg:pt-28">
        <header className="grid grid-cols-12 items-end gap-x-6 gap-y-5">
          <h2 className="display col-span-12 lg:col-span-9" data-r="clip" data-b="text">
            <span className="outline-text block text-[clamp(2.2rem,5vw,5rem)]">MY</span>
            <span className="h-mega block -mt-[0.04em]">
              TOOLBOX<span className="text-acc">.</span>
            </span>
          </h2>
        </header>

        <div className="mt-12 border-t border-line lg:mt-16">
          {stack.map((g, gi) => (
            <div
              key={g.group}
              data-b="box"
              data-r="up"
              className="group/band grid grid-cols-12 gap-x-6 gap-y-3 border-b border-line py-7 transition-colors duration-300 hover:bg-ink-2 lg:py-9"
            >
              <div className="col-span-12 flex items-baseline gap-4 lg:col-span-3 lg:block">
                <span className="display text-[clamp(2.4rem,3.4vw,3.4rem)] leading-none text-dim transition-colors duration-300 group-hover/band:text-acc">
                  {String(gi + 1).padStart(2, "0")}
                </span>
                <div className="lg:mt-3">
                  <h3 className="mono text-paper">{g.group}</h3>
                  <p className="mono mt-1 text-mute normal-case">{g.blurb}</p>
                </div>
              </div>

              <ul className="words col-span-12 flex flex-wrap items-baseline gap-x-5 gap-y-1 lg:col-span-9" aria-label={g.group}>
                {g.items.map((it, i) => (
                  <li key={it.name} className="word flex items-baseline transition-opacity duration-300">
                    <span
                      className="display outline-text relative inline-block max-w-full cursor-default text-[clamp(2.6rem,6.4vw,6.6rem)] leading-[0.95] transition-[color,-webkit-text-stroke-color] duration-200 hover:text-acc hover:[-webkit-text-stroke-color:var(--color-acc)]"
                      data-cursor=""
                    >
                      {it.name}
                      {it.note && (
                        <sup className="mono ml-1.5 whitespace-nowrap border border-line bg-ink px-1.5 py-0.5 align-super text-[10px] normal-case text-mute">
                          {it.note}
                        </sup>
                      )}
                    </span>
                    {i < g.items.length - 1 && (
                      <span aria-hidden className="display ml-5 text-[clamp(1.8rem,3.6vw,3.6rem)] text-dim">
                        /
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
