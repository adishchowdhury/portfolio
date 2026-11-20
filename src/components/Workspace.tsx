"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { workspace } from "@/content/site";

const TABS = [
  { id: "now", label: "Now" },
  { id: "built", label: "Live" },
  { id: "oss", label: "Open source" },
] as const;
type Tab = (typeof TABS)[number]["id"];

type Row = { k: string; v: string; href?: string };

/**
 * A plain "what I'm on" board — three short lists, every line from the resume or the live sites.
 * No fake terminal, no clock: just the facts, switchable.
 */
export default function Workspace() {
  const [tab, setTab] = useState<Tab>("now");
  const rows = workspace[tab] as readonly Row[];

  return (
    <aside aria-label="What I'm working on" className="border border-line bg-ink-2/90 backdrop-blur-sm">
      <div role="tablist" aria-label="Views" className="flex border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            id={`ws-tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="ws-panel"
            onClick={() => setTab(t.id)}
            data-cursor=""
            className={`mono relative flex-1 px-3 py-2.5 text-left transition-colors ${
              tab === t.id ? "text-ink" : "text-mute hover:text-paper"
            }`}
          >
            {tab === t.id && (
              <motion.span
                layoutId="ws-tab-bg"
                className="absolute inset-0 bg-acc"
                transition={{ type: "spring", stiffness: 500, damping: 40 }}
              />
            )}
            <span className="relative">{t.label}</span>
          </button>
        ))}
      </div>

      <div id="ws-panel" role="tabpanel" aria-labelledby={`ws-tab-${tab}`} className="min-h-[150px] p-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.ul
            key={tab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            className="space-y-3"
          >
            {rows.map((r) => (
              <li key={r.k + r.v} className="grid grid-cols-[3rem_1fr] gap-2 text-[14px] leading-snug">
                <span className="mono pt-0.5 text-acc">{r.k}</span>
                {r.href ? (
                  <a
                    href={r.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex w-fit items-center gap-1 text-paper hover:text-acc"
                    data-cursor="Visit"
                  >
                    {r.v}
                    <ArrowUpRight size={13} className="transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </a>
                ) : (
                  <span className="text-paper/85">{r.v}</span>
                )}
              </li>
            ))}
          </motion.ul>
        </AnimatePresence>
      </div>
    </aside>
  );
}
