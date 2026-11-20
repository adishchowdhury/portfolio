"use client";

import { useEffect, useRef } from "react";

/**
 * Particles circulate along the edge of the closing section, get shoved aside by the pointer,
 * and spring back. A fading cursor trail is drawn while the pointer is inside. Only runs while
 * the section is on screen; reduced-motion visitors get a single static frame.
 */
export default function ParticleBorder() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const host = cv?.parentElement;
    if (!cv || !host) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;

    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const INSET = 14;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let visible = false;
    const m = { x: -999, y: -999, in: false };

    type P = { s: number; v: number; off: number; r: number; a: number; dx: number; dy: number; vx: number; vy: number; hot: boolean };
    let ps: P[] = [];
    const trail: { x: number; y: number; t: number }[] = [];

    const perim = () => 2 * (w - INSET * 2) + 2 * (h - INSET * 2);
    const at = (s: number, off: number) => {
      const iw = w - INSET * 2;
      const ih = h - INSET * 2;
      let d = (((s % 1) + 1) % 1) * (2 * iw + 2 * ih);
      if (d < iw) return { x: INSET + d, y: INSET + off };
      d -= iw;
      if (d < ih) return { x: w - INSET - off, y: INSET + d };
      d -= ih;
      if (d < iw) return { x: w - INSET - d, y: h - INSET - off };
      d -= iw;
      return { x: INSET + off, y: h - INSET - d };
    };

    const size = () => {
      const r = host.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 1.75);
      w = r.width;
      h = r.height;
      cv.width = w * dpr;
      cv.height = h * dpr;
      cv.style.width = w + "px";
      cv.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(620, perim() / 5.5));
      ps = Array.from({ length: n }, () => ({
        s: Math.random(),
        v: (0.00005 + Math.random() * 0.00012) * (1400 / Math.max(900, perim() / 2)),
        off: (Math.random() - 0.5) * 7,
        r: 1 + Math.random() * 2.4,
        a: 0.25 + Math.random() * 0.75,
        dx: 0,
        dy: 0,
        vx: 0,
        vy: 0,
        hot: Math.random() < 0.34,
      }));
    };

    const frame = (now: number) => {
      ctx.clearRect(0, 0, w, h);

      // faint dashed frame
      ctx.strokeStyle = "rgba(245,243,238,0.14)";
      ctx.setLineDash([2, 7]);
      ctx.strokeRect(INSET, INSET, w - INSET * 2, h - INSET * 2);
      ctx.setLineDash([]);

      // corner brackets
      ctx.strokeStyle = "#e8ff32";
      ctx.lineWidth = 2;
      const L = 22;
      for (const [cx, cy, sx, sy] of [
        [INSET, INSET, 1, 1],
        [w - INSET, INSET, -1, 1],
        [INSET, h - INSET, 1, -1],
        [w - INSET, h - INSET, -1, -1],
      ] as const) {
        ctx.beginPath();
        ctx.moveTo(cx, cy + sy * L);
        ctx.lineTo(cx, cy);
        ctx.lineTo(cx + sx * L, cy);
        ctx.stroke();
      }
      ctx.lineWidth = 1;

      for (const p of ps) {
        if (!calm) p.s += p.v;
        const base = at(p.s, p.off);
        if (m.in) {
          const ex = base.x + p.dx - m.x;
          const ey = base.y + p.dy - m.y;
          const d = Math.hypot(ex, ey);
          if (d < 130 && d > 0.1) {
            const f = (1 - d / 130) * 2.2;
            p.vx += (ex / d) * f;
            p.vy += (ey / d) * f;
          }
        }
        p.vx += -p.dx * 0.045;
        p.vy += -p.dy * 0.045;
        p.vx *= 0.88;
        p.vy *= 0.88;
        p.dx += p.vx;
        p.dy += p.vy;

        const x = base.x + p.dx;
        const y = base.y + p.dy;
        ctx.fillStyle = p.hot ? `rgba(232,255,50,${p.a})` : `rgba(245,243,238,${p.a * 0.7})`;
        ctx.fillRect(x - p.r / 2, y - p.r / 2, p.r, p.r);
        if (p.hot) {
          // comet tail: the same particle a few steps back along the border
          for (let k = 1; k <= 4; k++) {
            const tail = at(p.s - p.v * k * 9, p.off);
            ctx.fillStyle = `rgba(232,255,50,${p.a * (1 - k / 5) * 0.55})`;
            ctx.fillRect(tail.x + p.dx - p.r / 2, tail.y + p.dy - p.r / 2, p.r, p.r);
          }
        }
      }

      // cursor trail
      while (trail.length && now - trail[0].t > 650) trail.shift();
      for (let i = 0; i < trail.length; i++) {
        const t = trail[i];
        const k = 1 - (now - t.t) / 650;
        ctx.fillStyle = `rgba(232,255,50,${k * 0.8})`;
        const r = 1 + k * 4;
        ctx.fillRect(t.x - r / 2, t.y - r / 2, r, r);
      }

      if (!calm && visible) raf = requestAnimationFrame(frame);
    };

    const onMove = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      m.x = e.clientX - r.left;
      m.y = e.clientY - r.top;
      m.in = m.x >= 0 && m.y >= 0 && m.x <= r.width && m.y <= r.height;
      if (m.in && !calm) trail.push({ x: m.x, y: m.y, t: performance.now() });
    };

    const io = new IntersectionObserver(
      ([e]) => {
        visible = e.isIntersecting;
        cancelAnimationFrame(raf);
        if (visible) raf = requestAnimationFrame(frame);
      },
      { threshold: 0.01 },
    );

    size();
    io.observe(host);
    if (!calm) window.addEventListener("pointermove", onMove, { passive: true });
    const ro = new ResizeObserver(size);
    ro.observe(host);
    if (calm) frame(performance.now());

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return <canvas ref={ref} aria-hidden className="pointer-events-none absolute inset-0 z-20" />;
}
