"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Pause, Play, RotateCcw, X } from "lucide-react";
import { createEngine } from "@/lib/assemble";
import { getLenis } from "@/lib/lenis";
import { site } from "@/content/site";

type Engine = ReturnType<typeof createEngine>;
type Phase = "idle" | "running" | "paused" | "done";
const SPEEDS = [1, 2, 4, 0.5];

const RM = "(prefers-reduced-motion: reduce)";
const subscribeRM = (cb: () => void) => {
  const m = matchMedia(RM);
  m.addEventListener("change", cb);
  return () => m.removeEventListener("change", cb);
};
/** Server and first paint assume "reduced" so the HUD never flashes in for those who opt out. */
const useReducedMotion = () => useSyncExternalStore(subscribeRM, () => matchMedia(RM).matches, () => true);

/**
 * HUD + stage for the "assemble" replay (see lib/assemble.ts).
 * Space starts / pauses, R restarts, A toggles auto-scroll, Esc closes.
 * Hidden entirely for visitors who prefer reduced motion.
 */
export default function Assembler() {
  const stage = useRef<HTMLDivElement>(null);
  const engine = useRef<Engine | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [status, setStatus] = useState("Ready");
  const [progress, setProgress] = useState<[number, number]>([0, 0]);
  const [auto, setAuto] = useState(true);
  const [speedIx, setSpeedIx] = useState(0);
  const calm = useReducedMotion();

  const ensure = useCallback(() => {
    if (engine.current || !stage.current) return engine.current;
    engine.current = createEngine(
      stage.current,
      {
        count: site.agents,
        scrollTo: (y) => {
          const l = getLenis();
          if (l) l.scrollTo(y, { immediate: true, force: true });
          else window.scrollTo(0, y);
        },
      },
      { status: setStatus, progress: (d, t) => setProgress([d, t]), state: setPhase },
    );
    return engine.current;
  }, []);

  const start = useCallback(() => {
    setAuto(true);
    setSpeedIx(0);
    ensure()?.setSpeed(1);
    ensure()?.setAuto(true);
    ensure()?.start();
  }, [ensure]);

  const toggle = useCallback(() => {
    const e = ensure();
    if (!e) return;
    if (e.state === "idle" || e.state === "done") start();
    else e.toggle();
  }, [ensure, start]);

  const close = useCallback(() => engine.current?.stop(), []);

  useEffect(() => {
    if (calm) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (/^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName) || t.isContentEditable)) return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const typing = t && /^(BUTTON|A|SUMMARY)$/.test(t.tagName);
      if (e.code === "Space" && !typing) {
        e.preventDefault();
        toggle();
      } else if (e.key === "r" || e.key === "R") start();
      else if (e.key === "a" || e.key === "A") {
        setAuto((v) => {
          engine.current?.setAuto(!v);
          return !v;
        });
      } else if (e.key === "Escape" && engine.current?.state !== "idle") close();
    };
    const onToggle = () => toggle();
    window.addEventListener("keydown", onKey);
    window.addEventListener("asm:toggle", onToggle);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("asm:toggle", onToggle);
      engine.current?.stop();
      engine.current = null;
    };
  }, [calm, toggle, start, close]);

  const [done, total] = progress;
  const pct = total ? (done / total) * 100 : 0;
  const active = phase !== "idle";

  return (
    <>
      <div ref={stage} className="asm-stage" aria-hidden />
      {!calm && (
        <div className="hud" role="region" aria-label="Page assembly replay">
          {!active ? (
            <button type="button" onClick={start} data-cursor="Play" aria-pressed={false}>
              <Play size={13} fill="currentColor" />
              <span className="sm:hidden">Build this page</span>
              <span className="hidden sm:inline">Watch {site.agents} agents build this page</span>
              <kbd className="hidden border border-line px-1.5 text-mute sm:inline">Space</kbd>
            </button>
          ) : (
            <>
              <button type="button" onClick={toggle} aria-label={phase === "running" ? "Pause" : phase === "done" ? "Replay" : "Resume"}>
                {phase === "running" ? <Pause size={13} fill="currentColor" /> : phase === "done" ? <RotateCcw size={13} /> : <Play size={13} fill="currentColor" />}
              </button>
              <span className="min-w-[78px] text-paper" role="status" aria-live="polite">
                {status}
              </span>
              <span className="bar" aria-hidden>
                <i style={{ width: pct + "%" }} />
              </span>
              <span className="hidden tabular-nums text-mute sm:inline">
                {done}/{total}
              </span>
              <button
                type="button"
                aria-pressed={auto}
                onClick={() => {
                  setAuto(!auto);
                  engine.current?.setAuto(!auto);
                }}
              >
                Auto
              </button>
              <button
                type="button"
                aria-label="Change speed"
                onClick={() => {
                  const n = (speedIx + 1) % SPEEDS.length;
                  setSpeedIx(n);
                  engine.current?.setSpeed(SPEEDS[n]);
                }}
              >
                {SPEEDS[speedIx]}x
              </button>
              <button type="button" onClick={close} aria-label="Close replay">
                <X size={13} />
              </button>
            </>
          )}
        </div>
      )}
    </>
  );
}
