"use client";

import { useRef, type ReactNode } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { earlier, projects, work, type Project } from "@/content/site";
import { AgentsVisual, CrowderaVisual, CubeVisual, OssVisual, ToofanVisual } from "./visuals";

type CardProps = {
  p: Project;
  visual: ReactNode;
  className?: string;
  /** featured = bigger type and visual */
  featured?: boolean;
  visualClass?: string;
  /** bare = the illustration already draws its own frame */
  bare?: boolean;
};

function ProjectCard({ p, visual, className = "", featured, visualClass = "", bare }: CardProps) {
  const ref = useRef<HTMLElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 110, damping: 16, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 110, damping: 16, mass: 0.6 });
  const tx = useTransform(sx, [-0.5, 0.5], [-14, 14]);
  const ty = useTransform(sy, [-0.5, 0.5], [-10, 10]);

  const onMove = (e: React.PointerEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };
  const onLeave = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <article
      ref={ref}
      data-b="box"
      data-r="up"
      onPointerMove={onMove}
      onPointerLeave={onLeave}
      className={`group relative flex flex-col border border-line bg-ink-2 transition-colors duration-300 hover:border-acc ${className}`}
    >
      {/* visual */}
      <div className={`relative min-h-0 flex-1 overflow-hidden border-b border-line ${visualClass}`}>
        <motion.div style={{ x: tx, y: ty }} className={`absolute ${bare ? "inset-3" : "-inset-4"}`}>
          <div className="relative h-full w-full">{visual}</div>
        </motion.div>

        {p.badge && (
          <span className="mono absolute left-3 top-3 z-10 bg-acc px-2 py-1 font-medium text-ink">
            {p.badge}
          </span>
        )}
      </div>

      {/* body */}
      <div className={`flex flex-col gap-3 ${featured ? "p-5 lg:p-7" : "p-5"}`}>
        <p className="mono text-mute transition-colors group-hover:text-acc">{p.category}</p>
        <h3
          className={`display transition-colors duration-300 group-hover:text-acc ${
            featured ? "text-[clamp(3.2rem,6.4vw,6.4rem)]" : "text-[clamp(2.2rem,3.2vw,3.2rem)] leading-[0.95]"
          }`}
        >
          {p.title}
        </h3>
        <p className={`text-paper/75 ${featured ? "max-w-[58ch] text-[clamp(15px,1.15vw,18px)]" : "text-[15px]"}`}>
          {p.blurb}
        </p>

        <ul className="flex flex-wrap gap-1.5" aria-label={`${p.title} technologies`}>
          {p.tags.map((t) => (
            <li key={t} className="mono border border-line px-2 py-1 text-mute">
              {t}
            </li>
          ))}
        </ul>

        {(p.live || p.repo) && (
          <div className="mt-1 flex flex-wrap gap-x-6 gap-y-2">
            {p.live && (
              <a
                href={p.live}
                target="_blank"
                rel="noopener noreferrer"
                className="mono group/l inline-flex items-center gap-1.5 text-paper hover:text-acc"
                data-cursor="Live"
                aria-label={`Open ${p.title} live site (new tab)`}
              >
                Live site
                <ArrowUpRight size={14} className="transition-transform group-hover/l:-translate-y-0.5 group-hover/l:translate-x-0.5" />
              </a>
            )}
            {p.repo && (
              <a
                href={p.repo}
                target="_blank"
                rel="noopener noreferrer"
                className="mono group/l inline-flex items-center gap-1.5 text-paper hover:text-acc"
                data-cursor="GitHub"
                aria-label={`${p.title} on GitHub (new tab)`}
              >
                GitHub
                <ArrowUpRight size={14} className="transition-transform group-hover/l:-translate-y-0.5 group-hover/l:translate-x-0.5" />
              </a>
            )}
          </div>
        )}
      </div>
    </article>
  );
}

export default function Work() {
  const get = (id: Project["id"]) => projects.find((p) => p.id === id)!;

  return (
    <section id="work" data-block className="relative z-10 overflow-x-clip border-t border-line">
      <span aria-hidden data-ghost="-1" className="ghost left-[2vw] top-[2%] text-[clamp(14rem,40vw,52rem)]">SHIPPED</span>
      <div className="relative z-10 mx-auto px-pad pb-20 pt-20 lg:pt-28">
        {/* header: asymmetric — huge title left, note hanging right */}
        <header className="grid grid-cols-12 items-end gap-x-6 gap-y-6">
          <h2 className="display h-mega col-span-12 lg:col-span-9" data-r="clip" data-b="text">
            <span className="block">THINGS</span>
            <span className="outline-text block lg:pl-[14vw]">I&apos;VE SHIPPED</span>
          </h2>
          <div className="col-span-12 lg:col-span-3 lg:pb-3">
            <p className="max-w-[34ch] text-paper/75" data-b="text" data-r="up">
              {work.sub}
            </p>
          </div>
        </header>

        <div className="mt-12 grid grid-cols-12 gap-4 lg:mt-16 lg:gap-5">
          <ProjectCard
            p={get("toofanos")}
            featured
            bare
            visual={<ToofanVisual />}
            className="col-span-12 lg:col-span-8"
            visualClass="min-h-[300px] sm:min-h-[400px]"
          />
          <ProjectCard
            p={get("cubeverse")}
            visual={<CubeVisual />}
            className="col-span-12 md:col-span-6 lg:col-span-4"
            visualClass="min-h-[280px]"
          />
          <ProjectCard
            p={get("crowdera")}
            visual={<CrowderaVisual />}
            className="col-span-12 md:col-span-6 lg:col-span-5"
            visualClass="min-h-[280px]"
          />
          <ProjectCard
            p={get("agents")}
            visual={<AgentsVisual />}
            className="col-span-12 md:col-span-6 lg:col-span-4"
            visualClass="min-h-[240px]"
          />
          <ProjectCard
            p={get("oss")}
            visual={<OssVisual />}
            className="col-span-12 md:col-span-6 lg:col-span-3"
            visualClass="min-h-[240px]"
          />
        </div>

        {/* earlier builds — an index, not more cards */}
        <div className="mt-20 grid grid-cols-12 gap-x-6 gap-y-6" data-b="box">
          <div className="col-span-12 lg:col-span-3">
            <h3 className="display text-[clamp(2.2rem,3.6vw,3.6rem)]" data-r="up">
              EARLIER
              <br />
              BUILDS
            </h3>
            <p className="mono mt-3 text-mute">where it started</p>
          </div>
          <ol className="col-span-12 border-t border-line lg:col-span-9">
            {earlier.map((e, i) => (
              <li
                key={e.title}
                data-r="up"
                className="group grid grid-cols-[3rem_1fr] items-baseline gap-x-4 border-b border-line px-1 py-5 transition-colors duration-300 hover:bg-acc hover:text-ink md:grid-cols-[3rem_minmax(0,1fr)_minmax(0,1.2fr)]"
              >
                <span className="mono text-mute group-hover:text-ink">{String(i + 1).padStart(2, "0")}</span>
                <span className="display text-[clamp(1.6rem,2.6vw,2.6rem)]">{e.title}</span>
                <span className="col-start-2 mt-1 text-[15px] text-paper/70 group-hover:text-ink/80 md:col-start-auto md:mt-0">
                  {e.body}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
