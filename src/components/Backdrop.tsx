"use client";

import { useEffect, useRef } from "react";
import { accent } from "@/lib/accent";

/**
 * Fixed backdrop with two layers:
 *  1. a flow-field swarm — a few hundred particles ride an invisible vector field and leave
 *     fading trails; the pointer bends the field into a swirl around it
 *  2. a slow 3×3 wireframe cube (a nod to CubeVerse) that tumbles behind the hero, tilts toward
 *     the pointer, and drifts up and out as you scroll
 * One rAF loop, paused when the tab is hidden. Reduced motion gets a single static frame.
 */
export default function Backdrop() {
  const fieldRef = useRef<HTMLCanvasElement>(null);
  const cubeRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const fc = fieldRef.current;
    const cc = cubeRef.current;
    if (!fc || !cc) return;
    const f = fc.getContext("2d");
    const c = cc.getContext("2d");
    if (!f || !c) return;

    const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let w = 0;
    let h = 0;
    let dpr = 1;
    let raf = 0;
    let t = 0;
    const mouse = { x: -9999, y: -9999, sx: 0, sy: 0, active: false };

    type P = { x: number; y: number; px: number; py: number; life: number; hot: boolean; sp: number };
    let ps: P[] = [];

    const spawn = (p: P) => {
      p.x = p.px = Math.random() * w;
      p.y = p.py = Math.random() * h;
      p.life = 80 + Math.random() * 220;
      p.hot = Math.random() < 0.09;
      p.sp = 0.55 + Math.random() * 0.9;
    };

    const size = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      w = window.innerWidth;
      h = window.innerHeight;
      for (const cv of [fc, cc]) {
        cv.width = w * dpr;
        cv.height = h * dpr;
        cv.style.width = w + "px";
        cv.style.height = h + "px";
      }
      f.setTransform(dpr, 0, 0, dpr, 0, 0);
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(1100, Math.max(260, (w * h) / 1700)));
      ps = Array.from({ length: n }, () => {
        const p = {} as P;
        spawn(p);
        return p;
      });
    };

    /* smooth pseudo-noise angle field, cheap and loop-free */
    const angle = (x: number, y: number, tt: number) =>
      (Math.sin(x * 0.0021 + tt * 0.00021) * Math.cos(y * 0.0026 - tt * 0.00017) * 2 +
        Math.sin((x + y) * 0.0012 + tt * 0.00011)) *
      Math.PI;

    const stepField = (fade: boolean) => {
      if (fade) {
        f.globalCompositeOperation = "destination-out";
        f.fillStyle = "rgba(0,0,0,0.085)";
        f.fillRect(0, 0, w, h);
        f.globalCompositeOperation = "source-over";
      }
      f.lineWidth = 1;
      const cool = new Path2D();
      const warm = new Path2D();
      for (const p of ps) {
        let a = angle(p.x, p.y, t);
        let sp = p.sp;
        if (mouse.active) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const d = Math.hypot(dx, dy);
          if (d < 240 && d > 1) {
            const k = 1 - d / 240;
            // blend the flow into a swirl around the pointer
            const swirl = Math.atan2(dy, dx) + Math.PI / 2;
            a = a + (swirl - a) * k * 0.9;
            sp += k * 2.4;
          }
        }
        p.px = p.x;
        p.py = p.y;
        p.x += Math.cos(a) * sp;
        p.y += Math.sin(a) * sp;
        p.life -= 1;
        if (p.life <= 0 || p.x < -5 || p.x > w + 5 || p.y < -5 || p.y > h + 5) {
          spawn(p);
          continue;
        }
        const path = p.hot ? warm : cool;
        path.moveTo(p.px, p.py);
        path.lineTo(p.x, p.y);
      }
      f.strokeStyle = "rgba(245,243,238,0.2)";
      f.stroke(cool);
      f.strokeStyle = `rgba(${accent.rgb},0.62)`;
      f.stroke(warm);
    };

    /* ---- wireframe cube ---- */
    const V = (x: number, y: number, z: number) => [x, y, z] as const;
    const stepCube = () => {
      c.clearRect(0, 0, w, h);
      const sy = window.scrollY;
      const fadeOut = Math.max(0, 1 - sy / (h * 1.05));
      if (fadeOut <= 0.01) return;

      mouse.sx += (mouse.x - mouse.sx) * 0.05;
      mouse.sy += (mouse.y - mouse.sy) * 0.05;
      const nx = mouse.active ? (mouse.sx / w - 0.5) : 0;
      const ny = mouse.active ? (mouse.sy / h - 0.5) : 0;

      const ay = t * 0.00022 + nx * 0.9;
      const ax = -0.46 + Math.sin(t * 0.00017) * 0.18 + ny * 0.6;
      const az = Math.sin(t * 0.00011) * 0.14;
      const cos = Math.cos;
      const sin = Math.sin;

      const S = Math.min(w, h) * 0.235;
      const cx = w * 0.5 + nx * -24;
      const cy = h * 0.4 - sy * 0.22 + ny * -18;
      const D = 4.2;

      const proj = (v: readonly [number, number, number]) => {
        const [x, y, z] = v;
        // rotate Y, then X, then Z
        const x1 = x * cos(ay) + z * sin(ay);
        const z1 = -x * sin(ay) + z * cos(ay);
        const y1 = y * cos(ax) - z1 * sin(ax);
        const z2 = y * sin(ax) + z1 * cos(ax);
        const x2 = x1 * cos(az) - y1 * sin(az);
        const y2 = x1 * sin(az) + y1 * cos(az);
        const k = D / (D + z2);
        return { x: cx + x2 * S * k, y: cy + y2 * S * k, z: z2 };
      };

      c.lineCap = "square";
      const line = (a: readonly [number, number, number], b: readonly [number, number, number], alpha: number, col = "245,243,238") => {
        const p = proj(a);
        const q = proj(b);
        const depth = 0.55 + 0.45 * (1 - (p.z + q.z + 2) / 4); // nearer edges read brighter
        c.strokeStyle = `rgba(${col},${alpha * depth * fadeOut})`;
        c.beginPath();
        c.moveTo(p.x, p.y);
        c.lineTo(q.x, q.y);
        c.stroke();
      };

      // 3×3 grid on each of the six faces (internal lines at ±1/3), then the hard outline
      const th = 1 / 3;
      c.lineWidth = 1;
      for (const s of [-1, 1]) {
        for (const g of [-th, th]) {
          for (const u of [-1, 1]) {
            // z faces
            line(V(g, -1, s), V(g, 1, s), 0.14);
            line(V(-1, g, s), V(1, g, s), 0.18);
            // x faces
            line(V(s, g, -1), V(s, g, 1), 0.18);
            line(V(s, -1, g), V(s, 1, g), 0.18);
            // y faces
            line(V(g, s, -1), V(g, s, 1), 0.18);
            line(V(-1, s, g), V(1, s, g), 0.18);
            void u;
          }
        }
      }
      c.lineWidth = 1.4;
      for (const a of [-1, 1]) {
        for (const b of [-1, 1]) {
          line(V(-1, a, b), V(1, a, b), 0.55);
          line(V(a, -1, b), V(a, 1, b), 0.55);
          line(V(a, b, -1), V(a, b, 1), 0.55);
        }
      }
      // yellow corner marks
      for (const x of [-1, 1]) for (const y of [-1, 1]) for (const z of [-1, 1]) {
        const p = proj(V(x, y, z));
        c.fillStyle = `rgba(${accent.rgb},${0.9 * fadeOut})`;
        c.fillRect(p.x - 3, p.y - 3, 6, 6);
      }
    };

    const loop = () => {
      t += 16.7;
      stepField(true);
      stepCube();
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: PointerEvent) => {
      if (!mouse.active) {
        mouse.sx = e.clientX;
        mouse.sy = e.clientY;
      }
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onLeave = () => (mouse.active = false);
    const onVis = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !calm) raf = requestAnimationFrame(loop);
    };

    size();
    if (calm) {
      // one still frame: let the swarm run ahead without clearing so the field shows as flow lines
      for (let i = 0; i < 70; i++) {
        t += 40;
        stepField(false);
      }
      stepCube();
    } else {
      raf = requestAnimationFrame(loop);
      window.addEventListener("pointermove", onMove, { passive: true });
      document.documentElement.addEventListener("pointerleave", onLeave);
      document.addEventListener("visibilitychange", onVis);
    }
    window.addEventListener("resize", size);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("resize", size);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
      <canvas ref={fieldRef} className="absolute inset-0" />
      <canvas ref={cubeRef} className="absolute inset-0" />
    </div>
  );
}
