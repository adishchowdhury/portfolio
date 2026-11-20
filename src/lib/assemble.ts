import { sfx } from "./sfx";

/**
 * The "assemble" replay: a swarm of cursors builds the page in front of you.
 *
 * How it works (reverse-engineered idea, written from scratch):
 *  - Authors tag the DOM:  [data-block] = a region,  [data-b="text|box|mega"] = a layer inside it.
 *  - While the replay runs, every layer is hidden (CSS: html.asm [data-b]:not(.on)).
 *  - A virtual clock drives everything, so pause and speed changes affect all motion at once.
 *  - Cursors ("agents") pull jobs from a shared queue. Each layer needs two jobs:
 *      1. wire:    drag out a blue selection box labelled with its W × H
 *      2. resolve: type the text in / click the box into existence / draw the outline
 *  - An autopilot scrolls block by block; touching the wheel hands control back to the visitor.
 *  - When the last layer lands, the cursors circle the call-to-action.
 */

type State = "idle" | "running" | "paused" | "done";
export type EngineEvents = {
  status: (s: string) => void;
  progress: (done: number, total: number) => void;
  state: (s: State) => void;
};

type Kind = "text" | "box" | "mega";
type Item = {
  el: HTMLElement;
  kind: Kind;
  wire: HTMLElement | null;
  parent: Item | null;
  done: Promise<void>;
  finish: () => void;
};
type Block = { el: HTMLElement; items: Item[]; promise: Promise<void> | null; fin: boolean };

// 14 distinct hues so every agent is recognisable; the first eight also carry a role tag
const HUES = [
  "#ff6b5e", "#ffb02e", "#ffe14d", "#7dff8f", "#35e0c2", "#4db8ff", "#8f93ff",
  "#d07bff", "#ff7ac8", "#ff4d8d", "#a3e635", "#22d3ee", "#fb923c", "#c084fc",
];
const ROLES = ["layout", "type", "copy", "motion", "pixels", "a11y", "data", "perf"];
/** 1x in the HUD is this fraction of raw speed: a touch slower so each move can be followed. */
const BASE = 0.78;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const rnd = (a = 1, b?: number) => (b === undefined ? Math.random() * a : a + Math.random() * (b - a));
const ease = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);

const ARROW = (c: string) =>
  `<svg class="a-arrow" viewBox="0 0 17 22"><path d="M2 1.5v16l4.4-4 3 7 2.6-1.1-3-6.9h6z" fill="${c}" stroke="#fff" stroke-width="1.3" stroke-linejoin="round"/></svg>`;
const CROSS = `<svg class="a-cross" viewBox="0 0 18 18"><path d="M9 1v16M1 9h16" stroke="#050505" stroke-width="4.4" stroke-linecap="round"/><path d="M9 1v16M1 9h16" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg>`;
const IBEAM = `<svg class="a-ibeam" viewBox="0 0 18 18"><path d="M5.5 1.5h7M5.5 16.5h7M9 1.5v15" stroke="#050505" stroke-width="4.2" stroke-linecap="round"/><path d="M5.5 1.5h7M5.5 16.5h7M9 1.5v15" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>`;

const rectOf = (el: Element) => {
  const r = el.getBoundingClientRect();
  return { x: r.left + scrollX, y: r.top + scrollY, w: r.width, h: r.height };
};

export function createEngine(stage: HTMLElement, opts: { count: number; scrollTo: (y: number) => void }, ev: EngineEvents) {
  /* ---------------- virtual clock ---------------- */
  let vt = 0;
  let speed = 1;
  let paused = false;
  const timers = new Set<{ t: number; res: () => void }>();
  const tweens = new Set<{ t0: number; dur: number; fn: (k: number) => void; res: () => void }>();
  const wait = (ms: number) => new Promise<void>((res) => timers.add({ t: vt + ms, res }));
  const tween = (dur: number, fn: (k: number) => void) =>
    new Promise<void>((res) => tweens.add({ t0: vt, dur: Math.max(1, dur), fn, res }));
  const advance = (dt: number) => {
    vt += dt * speed * BASE;
    for (const x of [...timers]) {
      if (x.t <= vt) {
        timers.delete(x);
        x.res();
      }
    }
    for (const tw of [...tweens]) {
      const k = clamp((vt - tw.t0) / tw.dur, 0, 1);
      tw.fn(k);
      if (k >= 1) {
        tweens.delete(tw);
        tw.res();
      }
    }
  };

  /* ---------------- agents ---------------- */
  type Mode = "arrow" | "cross" | "ibeam";
  let idleMode: "orbit" | "ring" = "orbit";
  const orbitCenter = () => ({ x: scrollX + innerWidth / 2, y: scrollY + innerHeight / 2 });

  class Agent {
    el: HTMLElement;
    x: number;
    y: number;
    vx = 0;
    vy = 0;
    idle = true;
    phase = rnd(Math.PI * 2);
    rad = rnd(0.75, 1.25);
    w = rnd(0.9, 1.5) * (Math.random() < 0.5 ? 1 : -1);
    constructor(public i: number, public n: number) {
      const color = HUES[i % HUES.length];
      this.x = innerWidth / 2 + rnd(-40, 40) + scrollX;
      this.y = innerHeight / 2 + rnd(-40, 40) + scrollY;
      const el = (this.el = document.createElement("div"));
      el.className = "agent";
      el.dataset.mode = "arrow";
      el.style.color = color;
      el.innerHTML =
        ARROW(color) + CROSS + IBEAM + '<span class="ring"></span>' + (ROLES[i] ? `<label style="background:${color}">${ROLES[i]}</label>` : "");
      stage.appendChild(el);
    }
    mode(m: Mode) {
      this.el.dataset.mode = m;
    }
    click() {
      this.el.classList.remove("click");
      void this.el.offsetWidth;
      this.el.classList.add("click");
    }
    moveTo(x: number, y: number, o: { dur?: number } = {}) {
      const sx = this.x;
      const sy = this.y;
      const dx = x - sx;
      const dy = y - sy;
      const d = Math.hypot(dx, dy) || 1;
      const dur = o.dur ?? clamp(170 + d * 0.5, 210, 760);
      const bend = rnd(-1, 1) * Math.min(140, d * 0.3);
      const cx = (sx + x) / 2 - (dy / d) * bend;
      const cy = (sy + y) / 2 + (dx / d) * bend;
      this.vx = this.vy = 0;
      return tween(dur, (k) => {
        const e = ease(k);
        const u = 1 - e;
        this.x = u * u * sx + 2 * u * e * cx + e * e * x;
        this.y = u * u * sy + 2 * u * e * cy + e * e * y;
      });
    }
    drift(dt: number, t: number) {
      let tx: number;
      let ty: number;
      if (idleMode === "ring") {
        const cta = document.querySelector("[data-cta]") ?? document.querySelector("#contact h2");
        const r = rectOf(cta!);
        const a = (this.i / this.n) * Math.PI * 2 + t * 0.00035;
        tx = r.x + r.w / 2 + Math.cos(a) * (r.w / 2 + 52);
        ty = r.y + r.h / 2 + Math.sin(a) * (r.h / 2 + 34);
      } else {
        const c = orbitCenter();
        const R = Math.min(innerWidth, innerHeight) * 0.14 * this.rad + 26;
        const a = this.phase + t * 0.0011 * this.w;
        tx = c.x + Math.cos(a) * R * (1 + 0.18 * Math.sin(t * 0.002 + this.i));
        ty = c.y + Math.sin(a) * R;
      }
      const k = 5;
      const max = idleMode === "ring" ? 900 : 2200;
      let dvx = (tx - this.x) * k;
      let dvy = (ty - this.y) * k;
      const m = Math.hypot(dvx, dvy);
      if (m > max) {
        dvx *= max / m;
        dvy *= max / m;
      }
      const s = Math.min(1, dt * 0.006);
      this.vx += (dvx - this.vx) * s;
      this.vy += (dvy - this.vy) * s;
      this.x += (this.vx * dt) / 1000;
      this.y += (this.vy * dt) / 1000;
    }
    render() {
      this.el.style.transform = `translate3d(${this.x.toFixed(1)}px,${this.y.toFixed(1)}px,0)`;
    }
  }

  const agents: Agent[] = [];

  /* ---------------- job queue ---------------- */
  type Job = (a: Agent) => Promise<void>;
  let queue: Job[] = [];
  let waiters: { a: Agent; res: (j: Job) => void }[] = [];
  const enqueue = (job: Job, at?: { x: number; y: number }) => {
    if (waiters.length) {
      let bi = 0;
      let bd = Infinity;
      waiters.forEach((w, i) => {
        const d = at ? Math.hypot(w.a.x - at.x, w.a.y - at.y) : 0;
        if (d < bd) {
          bd = d;
          bi = i;
        }
      });
      waiters.splice(bi, 1)[0].res(job);
    } else queue.push(job);
  };
  const dispatch = (fn: Job, at?: { x: number; y: number }) =>
    new Promise<void>((res) =>
      enqueue(async (a) => {
        try {
          await fn(a);
        } catch (e) {
          console.error(e);
        }
        res();
      }, at),
    );
  let gen = 0; // bumped on stop so orphaned agent loops quit
  async function live(a: Agent, myGen: number) {
    while (myGen === gen) {
      const job = queue.shift() ?? (await new Promise<Job>((res) => waiters.push({ a, res })));
      if (myGen !== gen) return;
      a.idle = false;
      await job(a);
      a.mode("arrow");
      a.idle = true;
    }
  }

  /* ---------------- blocks and layers ---------------- */
  let blocks: Block[] = [];
  let total = 0;
  let done = 0;
  const itemOf = new Map<Element, Item>();

  const collect = () => {
    itemOf.clear();
    blocks = Array.from(document.querySelectorAll<HTMLElement>("[data-block]")).map((el) => {
      const els = Array.from(el.querySelectorAll<HTMLElement>("[data-b]")).filter((x) => x.closest("[data-block]") === el);
      if (el.hasAttribute("data-b")) els.unshift(el);
      const items = els.map((e) => {
        const it = { el: e, kind: (e.dataset.b as Kind) ?? "box", wire: null, parent: null } as Item;
        it.done = new Promise<void>((r) => (it.finish = r));
        itemOf.set(e, it);
        return it;
      });
      return { el, items, promise: null, fin: false };
    });
    for (const it of itemOf.values()) {
      const p = it.el.parentElement?.closest("[data-b]");
      it.parent = p ? (itemOf.get(p) ?? null) : null;
    }
    total = itemOf.size;
  };

  const mkWire = (r: { x: number; y: number; w: number }) => {
    const w = document.createElement("div");
    w.className = "wire" + (r.w < 46 ? " sm" : "");
    w.innerHTML = "<u></u><u></u><u></u><u></u><em></em>";
    w.style.cssText = `left:${r.x}px;top:${r.y}px;width:0;height:0`;
    stage.appendChild(w);
    return w;
  };

  async function wireJob(a: Agent, it: Item) {
    const r = rectOf(it.el);
    await a.moveTo(r.x, r.y);
    a.mode("cross");
    const w = (it.wire = mkWire(r));
    const dim = w.lastChild as HTMLElement;
    const sx = a.x;
    const sy = a.y;
    await tween(clamp(150 + Math.hypot(r.w, r.h) * 0.3, 190, 560), (k) => {
      const e = ease(k);
      a.x = sx + r.w * e;
      a.y = sy + r.h * e;
      w.style.width = r.w * e + "px";
      w.style.height = r.h * e + "px";
      dim.textContent = `${Math.round(r.w * e)} × ${Math.round(r.h * e)}`;
    });
    a.mode("arrow");
    sfx.tick();
  }

  function splitChars(el: HTMLElement) {
    const orig = el.innerHTML;
    const spans: HTMLElement[] = [];
    const tw = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const nodes: Text[] = [];
    while (tw.nextNode()) nodes.push(tw.currentNode as Text);
    for (const n of nodes) {
      if (!n.textContent?.trim() && !n.textContent?.includes(" ")) continue;
      const f = document.createDocumentFragment();
      for (const ch of n.textContent ?? "") {
        const s = document.createElement("span");
        s.className = "asm-ch";
        s.textContent = ch;
        f.appendChild(s);
        spans.push(s);
      }
      n.replaceWith(f);
    }
    return { orig, spans };
  }

  async function typeIn(el: HTMLElement, a: Agent) {
    const { orig, spans } = splitChars(el);
    const n = spans.length;
    el.classList.add("on");
    let shown = 0;
    await tween(clamp(n * 15, 170, 980), (k) => {
      const upto = Math.round(k * n);
      if (upto <= shown) return;
      for (let i = shown; i < upto; i++) spans[i].classList.add("v");
      shown = upto;
      sfx.tick();
      const r = spans[upto - 1].getBoundingClientRect();
      if (r.height) {
        a.x = r.right + scrollX + 2;
        a.y = r.top + r.height / 2 + scrollY;
      }
    });
    el.innerHTML = orig;
  }

  async function resolveJob(a: Agent, it: Item) {
    if (it.parent) await it.parent.done;
    const el = it.el;
    const r = rectOf(el);
    if (it.kind === "text") {
      await a.moveTo(r.x + 3, r.y + Math.min(r.h / 2, 14));
      a.mode("ibeam");
      it.wire?.classList.add("edit");
      await typeIn(el, a);
    } else if (it.kind === "mega") {
      await a.moveTo(r.x + r.w * rnd(0.2, 0.8), r.y + r.h * 0.5);
      a.click();
      sfx.whoosh();
      el.classList.add("on");
      const t = el.querySelector<SVGElement>(".mega-stroke");
      tween(1500, (k) => t && (t.style.strokeDashoffset = String(3000 * (1 - ease(k)))));
      await wait(260);
    } else {
      await a.moveTo(r.x + r.w * rnd(0.25, 0.75), r.y + r.h * rnd(0.3, 0.7));
      a.click();
      sfx.click();
      el.classList.add("on");
      await wait(110);
    }
    if (it.wire) {
      const w = it.wire;
      w.classList.add("out");
      setTimeout(() => w.remove(), 200);
      it.wire = null;
    }
    done++;
    ev.progress(done, total);
    sfx.pop(done / total);
    it.finish();
  }

  let autoOn = true;
  let finished = false;
  const buildBlock = (b: Block): Promise<void> => {
    if (b.promise) return b.promise;
    return (b.promise = (async () => {
      const at = (it: Item) => {
        const r = rectOf(it.el);
        return { x: r.x, y: r.y };
      };
      const p1: Promise<void>[] = [];
      for (const it of b.items) {
        p1.push(dispatch((a) => wireJob(a, it), at(it)));
        await wait(42);
      }
      await Promise.all(p1);
      await wait(240);
      const p2: Promise<void>[] = [];
      for (const it of b.items) {
        p2.push(dispatch((a) => resolveJob(a, it), at(it)));
        await wait(64);
      }
      await Promise.all(p2);
      b.fin = true;
      if (b.el.hasAttribute("data-finale")) idleMode = "ring";
      if (!autoOn && blocks.every((x) => x.fin)) complete();
    })());
  };

  /* ---------------- autopilot tour ---------------- */
  let touring = false;
  let tourGen = 0;
  let manualUntil = 0;
  const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);
  const scrollToY = (y: number, dur: number, g: number) => {
    const from = scrollY;
    const to = clamp(y, 0, maxScroll());
    if (Math.abs(to - from) < 2) return Promise.resolve();
    return tween(dur, (k) => g === tourGen && opts.scrollTo(from + (to - from) * ease(k)));
  };

  async function tour() {
    const my = ++tourGen;
    const alive = () => my === tourGen;
    touring = true;
    for (let i = 0; i < blocks.length; ) {
      const vh = innerHeight;
      const top = rectOf(blocks[i].el).y;
      let j = i;
      let bottom = top + rectOf(blocks[i].el).h;
      while (j + 1 < blocks.length) {
        const r = rectOf(blocks[j + 1].el);
        if (r.y + r.h > top + vh - 62) break;
        j++;
        bottom = Math.max(bottom, r.y + r.h);
      }
      const gh = bottom - top;
      const first = i === 0;
      const target = first ? 0 : gh < vh - 120 ? top - Math.min((vh - 96 - gh) / 2, vh * 0.16) : top - 24;
      const group = blocks.slice(i, j + 1).filter((b) => !b.fin);
      if (group.length) {
        ev.status(first ? "Building" : "Touring");
        const sc = scrollToY(target, clamp(Math.abs(target - scrollY) * 1.5, 500, 1500), my);
        await wait(first ? 0 : 320);
        if (!alive()) return;
        const builds = group.map((b, k) => wait(k * 130).then(() => buildBlock(b)));
        // a tall block is scrolled through while it builds
        const tall = gh > vh - 40 ? sc.then(() => wait(900)).then(() => scrollToY(bottom - vh + 110, 2600, my)) : null;
        await Promise.all([sc, tall, ...builds]);
        if (!alive()) return;
        await wait(first ? 900 : 560);
        if (!alive()) return;
      }
      i = j + 1;
    }
    if (scrollY < maxScroll() - 60) {
      await scrollToY(maxScroll(), 1300, my);
      if (!alive()) return;
    }
    touring = false;
    complete();
  }

  const visible = new Set<Block>();
  let io: IntersectionObserver | null = null;
  const handsOn = (e?: Event) => {
    if (state !== "running" || paused) return;
    if (e && e.type === "wheel" && Math.abs((e as WheelEvent).deltaY) < 4) return;
    manualUntil = performance.now() + 1700;
    if (touring) {
      touring = false;
      tourGen++;
      ev.status("Manual");
      for (const b of visible) buildBlock(b);
    }
  };

  /* ---------------- lifecycle ---------------- */
  let state: State = "idle";
  const setState = (s: State) => {
    state = s;
    ev.state(s);
  };
  let raf = 0;
  let last = 0;

  const frame = (now: number) => {
    const dt = Math.min(50, now - last || 16);
    last = now;
    if (!paused) {
      advance(dt);
      for (const a of agents) if (a.idle) a.drift(dt * speed * BASE, vt);
    }
    for (const a of agents) a.render();
    // resume the tour after the visitor stops scrolling
    if (state === "running" && autoOn && !touring && manualUntil && performance.now() > manualUntil && !finished) {
      manualUntil = 0;
      tour();
    }
    raf = requestAnimationFrame(frame);
  };

  function complete() {
    if (finished) return;
    finished = true;
    idleMode = "ring";
    sfx.chord();
    ev.status("Done");
    setState("done");
  }

  /** Put the page back to normal: drop the hiding class, finish any half-drawn outline. */
  const restore = () => {
    document.documentElement.classList.remove("asm");
    document.querySelectorAll<SVGElement>(".mega-stroke").forEach((t) => t.style.setProperty("stroke-dashoffset", "0"));
    stage.querySelectorAll(".wire").forEach((w) => w.remove());
  };

  const prep = () => {
    const root = document.documentElement;
    collect();
    root.classList.add("asm");
    done = 0;
    finished = false;
    touring = false;
    manualUntil = 0;
    idleMode = "orbit";
    vt = 0;
    paused = false;
    timers.clear();
    tweens.clear();
    queue = [];
    waiters = [];
    gen++;
    stage.style.height = document.documentElement.scrollHeight + "px";
    stage.innerHTML = "";
    for (const it of itemOf.values()) {
      it.el.classList.remove("on");
      if (it.kind === "mega") it.el.querySelector<SVGElement>(".mega-stroke")?.style.setProperty("stroke-dashoffset", "3000");
    }
    ev.progress(0, total);
  };

  const onIO = (es: IntersectionObserverEntry[]) => {
    for (const e of es) {
      const b = blocks.find((x) => x.el === e.target);
      if (!b) continue;
      if (e.isIntersecting) {
        visible.add(b);
        if (state === "running" && !touring) buildBlock(b);
      } else visible.delete(b);
    }
  };

  return {
    start() {
      stop(true);
      prep();
      opts.scrollTo(0);
      for (let i = 0; i < opts.count; i++) agents.push(new Agent(i, opts.count));
      const g = gen;
      agents.forEach((a) => live(a, g));
      io = new IntersectionObserver(onIO, { threshold: 0.12 });
      blocks.forEach((b) => io!.observe(b.el));
      addEventListener("wheel", handsOn, { passive: true });
      addEventListener("touchmove", handsOn, { passive: true });
      setState("running");
      ev.status("Building");
      last = performance.now();
      raf = requestAnimationFrame(frame);
      tour();
    },
    toggle() {
      if (state === "running") {
        paused = true;
        setState("paused");
        ev.status("Paused");
      } else if (state === "paused") {
        paused = false;
        setState("running");
        ev.status(touring ? "Touring" : "Building");
      }
    },
    setSpeed(s: number) {
      speed = s;
    },
    setAuto(on: boolean) {
      autoOn = on;
      manualUntil = 0;
      if (!on && touring) {
        touring = false;
        tourGen++;
        for (const b of visible) buildBlock(b);
        ev.status("Auto-scroll off");
      } else if (on && state === "running" && !touring && !finished) {
        tour();
      }
    },
    stop: () => stop(false),
    get state() {
      return state;
    },
  };

  function stop(silent: boolean) {
    cancelAnimationFrame(raf);
    gen++;
    tourGen++;
    touring = false;
    removeEventListener("wheel", handsOn);
    removeEventListener("touchmove", handsOn);
    io?.disconnect();
    io = null;
    if (itemOf.size) restore();
    stage.innerHTML = "";
    agents.length = 0;
    timers.clear();
    tweens.clear();
    if (!silent) {
      setState("idle");
      ev.status("Ready");
    }
  }
}
