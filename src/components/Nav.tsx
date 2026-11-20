"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { nav, site } from "@/content/site";
import { scrollToHash } from "@/lib/lenis";
import Logo from "./Logo";
import { AccentSwitch, SoundToggle } from "./Controls";

export default function Nav() {
  const [active, setActive] = useState<string>("");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const ids = [...nav.map((n) => n.href.slice(1)), "beyond"];
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id);
      },
      { rootMargin: "-45% 0px -50% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setOpen(false);
    scrollToHash(href);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-[70] border-b border-line bg-ink/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 items-center gap-6 px-pad">
        <a
          href="#top"
          onClick={(e) => go(e, "#top")}
          className="group display flex items-center gap-2.5 text-[22px] tracking-wide"
          aria-label={`${site.name.display} — back to top`}
          data-cursor="Top"
        >
          <Logo size={28} className="transition-transform duration-500 group-hover:rotate-[60deg]" />
          ADISH
        </a>

        <nav aria-label="Primary" className="ml-auto hidden items-center gap-8 md:flex">
          {nav.map((n) => {
            const on = active === n.href.slice(1);
            return (
              <a
                key={n.href}
                href={n.href}
                onClick={(e) => go(e, n.href)}
                aria-current={on ? "location" : undefined}
                className={`mono relative py-1 transition-colors hover:text-paper ${on ? "text-acc" : "text-mute"}`}
                data-cursor="Go"
              >
                {n.label}
                <span
                  className={`absolute inset-x-0 -bottom-0.5 h-px origin-left bg-acc transition-transform duration-300 ${on ? "scale-x-100" : "scale-x-0"}`}
                />
              </a>
            );
          })}
        </nav>

        <p className="mono ml-auto flex items-center gap-2 text-mute md:ml-0">
          <span className="relative flex h-2 w-2" aria-hidden>
            <span
              className="absolute inset-0 rounded-full bg-acc"
              style={{ animation: "pulse-ring 1.8s ease-out infinite" }}
            />
            <span className="relative h-2 w-2 rounded-full bg-acc" />
          </span>
          <span className="hidden xl:inline">{site.availability}</span>
          <span className="xl:hidden">Open</span>
        </p>

        <div className="flex items-center gap-2">
          <AccentSwitch />
          <SoundToggle />
        </div>

        <button
          type="button"
          className="grid h-9 w-9 place-items-center border border-line md:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      <div
        id="mobile-menu"
        hidden={!open}
        className="border-t border-line bg-ink px-pad pb-6 pt-2 md:hidden"
      >
        <ul className="flex flex-col">
          {nav.map((n, i) => (
            <li key={n.href} className="border-b border-line">
              <a
                href={n.href}
                onClick={(e) => go(e, n.href)}
                className="display flex items-baseline justify-between py-4 text-5xl"
              >
                {n.label}
                <span className="mono text-mute">0{i + 1}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  );
}
