"use client";

import { useRef, useState } from "react";
import { ArrowUpRight, Check, Copy, GitBranch, Mail } from "lucide-react";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { contact, site } from "@/content/site";
import { scrollToHash } from "@/lib/lenis";
import ParticleBorder from "./ParticleBorder";

/** lucide v1 ships no brand marks, so LinkedIn gets a minimal custom glyph. */
function InMark({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden>
      <rect x="3" y="3" width="18" height="18" />
      <path d="M8 10.5V16M8 7.6v.01M12 16v-5.5M12 12.8c0-1.4 1-2.4 2.3-2.4S16.6 11.3 16.6 13V16" />
    </svg>
  );
}

const socials = [
  { key: "github", label: "GitHub", handle: "adishchowdhury", href: site.links.github, Icon: GitBranch },
  { key: "linkedin", label: "LinkedIn", handle: "adrija-chowdhury", href: site.links.linkedin, Icon: InMark },
  { key: "codeforces", label: "Codeforces", handle: "profile", href: site.links.codeforces, Icon: ArrowUpRight },
  { key: "twitter", label: "X / Twitter", handle: "profile", href: site.links.twitter, Icon: ArrowUpRight },
].filter((s) => s.href);

export default function Contact() {
  const root = useRef<HTMLElement>(null);
  const [copied, setCopied] = useState(false);

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      // giant footer wordmark: outlined → filled as the end of the page arrives
      gsap.fromTo(
        ".foot-fill",
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)",
          ease: "none",
          scrollTrigger: { trigger: ".foot-word", start: "top 95%", end: "bottom 62%", scrub: 0.6 },
        },
      );
      ScrollTrigger.refresh();
    },
    { scope: root },
  );

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${site.email}`;
    }
  };

  return (
    <section ref={root} id="contact" data-block data-finale className="relative z-10 border-t border-line">
      <div className="relative">
        <ParticleBorder />

        <div className="mx-auto grid min-h-[100svh] grid-cols-12 content-center gap-x-6 gap-y-12 px-[calc(var(--pad)+14px)] py-28">
          <div className="col-span-12 lg:col-span-8">
            <h2 className="display h-mega" data-r="clip" data-b="text">
              <span className="block">{contact.heading[0]}</span>
              <span className="outline-acc block lg:pl-[8vw]">{contact.heading[1]}</span>
            </h2>
            <p className="mt-8 max-w-[46ch] text-[clamp(16px,1.3vw,20px)] text-paper/80" data-r="up" data-b="text">
              {contact.sub}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-3" data-b="box" data-cta>
              <a
                href={`mailto:${site.email}`}
                className="btn btn-acc px-7 py-5 text-[13px]"
                data-cursor="Write"
              >
                <Mail size={16} />
                {contact.cta}
                <ArrowUpRight size={16} />
              </a>
              <button type="button" onClick={copy} className="btn py-5" data-cursor="Copy" aria-live="polite">
                {copied ? <Check size={15} /> : <Copy size={15} />}
                {copied ? "Copied" : site.email}
              </button>
            </div>
          </div>

          <ul className="col-span-12 self-end lg:col-span-4" aria-label="Elsewhere">
            {socials.map(({ key, label, handle, href, Icon }) => (
              <li key={key} data-r="up" data-b="box" className="border-t border-line last:border-b">
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center justify-between gap-4 px-1 py-5 transition-colors duration-300 hover:bg-acc hover:px-4 hover:text-ink"
                  data-cursor={label}
                  aria-label={`${label} (new tab)`}
                >
                  <span className="flex items-center gap-4">
                    <Icon size={20} aria-hidden />
                    <span className="display text-[clamp(1.8rem,2.6vw,2.6rem)]">{label}</span>
                  </span>
                  <span className="mono hidden text-mute group-hover:text-ink sm:inline">{handle}</span>
                  <ArrowUpRight size={20} className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* footer — a deliberate ending */}
      <footer className="relative z-10 border-t border-line px-pad pb-8 pt-8">
        <div className="mono flex flex-wrap items-center justify-between gap-x-8 gap-y-3 text-mute">
          <span>
            {site.name.display} / {site.name.full}
          </span>
          <span className="hidden md:inline">Jadavpur University · IIT Madras · {site.location}</span>
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              scrollToHash("#top");
            }}
            className="inline-flex items-center gap-2 text-paper hover:text-acc"
            data-cursor="Top"
          >
            Back to top <ArrowUpRight size={13} className="-rotate-45" />
          </a>
        </div>

        <div className="foot-word relative mt-6 select-none overflow-hidden" aria-hidden>
          <p className="display outline-text text-center text-[clamp(8rem,31vw,40rem)] leading-[0.78]">ADISH</p>
          <p className="foot-fill display absolute inset-0 text-center text-[clamp(8rem,31vw,40rem)] leading-[0.78] text-acc">
            ADISH
          </p>
        </div>

        <p className="mono mt-6 text-center text-dim">
          Built by hand with Next.js, TypeScript, Tailwind, GSAP and Framer Motion.
        </p>
      </footer>
    </section>
  );
}
