/**
 * Tiny synthesized sound kit (Web Audio, no files). Off by default and only unlocked by a real
 * user gesture. Sounds: a mechanical-keyboard key, a mouse click, replay typing ticks, and two
 * small rewards for the assemble replay.
 */
type Ctor = typeof AudioContext;

let ctx: AudioContext | null = null;
let out: GainNode | null = null;
let noise: AudioBuffer | null = null;
let on = false;
let lastTick = 0;

export const SOUND_KEY = "adish:sound";

const rnd = (a: number, b: number) => a + Math.random() * (b - a);

function ready() {
  return !!(on && ctx && out && ctx.state === "running");
}

function burst(opts: { when?: number; dur: number; type: BiquadFilterType; freq: number; q?: number; vol: number }) {
  if (!ctx || !out || !noise) return;
  const t = ctx.currentTime + (opts.when ?? 0);
  const src = ctx.createBufferSource();
  src.buffer = noise;
  const f = ctx.createBiquadFilter();
  f.type = opts.type;
  f.frequency.value = opts.freq;
  f.Q.value = opts.q ?? 0.9;
  const g = ctx.createGain();
  g.gain.setValueAtTime(opts.vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + opts.dur);
  src.connect(f);
  f.connect(g);
  g.connect(out);
  src.start(t, rnd(0, 0.3));
  src.stop(t + opts.dur + 0.02);
}

function tone(freq: number, dur: number, type: OscillatorType, vol: number, when = 0, slideTo?: number) {
  if (!ctx || !out) return;
  const t = ctx.currentTime + when;
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.006);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g);
  g.connect(out);
  o.start(t);
  o.stop(t + dur + 0.03);
}

export const sfx = {
  get enabled() {
    return on;
  },

  /** Create / resume the audio context. Must be called from a user gesture. */
  unlock() {
    if (!ctx) {
      try {
        const C: Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: Ctor }).webkitAudioContext;
        ctx = new C();
        out = ctx.createGain();
        out.gain.value = 0.6;
        out.connect(ctx.destination);
        const len = Math.floor(ctx.sampleRate * 0.4);
        noise = ctx.createBuffer(1, len, ctx.sampleRate);
        const d = noise.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      } catch {
        ctx = null;
      }
    }
    void ctx?.resume();
  },

  set(v: boolean) {
    on = v;
    if (v) this.unlock();
    try {
      localStorage.setItem(SOUND_KEY, v ? "1" : "0");
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new CustomEvent("sfxchange"));
  },

  /** Restore a saved "on" without creating audio (that waits for the first gesture). */
  restore() {
    try {
      on = localStorage.getItem(SOUND_KEY) === "1";
    } catch {
      on = false;
    }
    window.dispatchEvent(new CustomEvent("sfxchange"));
  },

  /** A mechanical key: a dry click plus a low "thock". Space and Enter sit deeper. */
  key(code = "") {
    if (!ready()) return;
    const big = code === "Space" || code === "Enter" || code === "Backspace";
    burst({ dur: 0.022, type: "highpass", freq: rnd(2200, 3400), vol: 0.34 });
    burst({ when: 0.004, dur: 0.05, type: "bandpass", freq: big ? 520 : rnd(780, 1100), q: 1.4, vol: 0.2 });
    tone(big ? rnd(88, 104) : rnd(150, 190), big ? 0.11 : 0.07, "sine", big ? 0.4 : 0.3, 0.002, big ? 60 : 110);
  },

  /** A trackpad / mouse click: press, then a lighter release. */
  click() {
    if (!ready()) return;
    burst({ dur: 0.014, type: "bandpass", freq: 2700, q: 1.2, vol: 0.34 });
    tone(rnd(210, 250), 0.05, "sine", 0.18, 0.001, 150);
    burst({ when: 0.055, dur: 0.01, type: "bandpass", freq: 3400, q: 1.2, vol: 0.14 });
  },

  /** Tiny tick used while the replay types. Rate-limited so fast typing stays gentle. */
  tick() {
    if (!ready()) return;
    const n = performance.now();
    if (n - lastTick < 34) return;
    lastTick = n;
    tone(rnd(1700, 2300), 0.025, "square", 0.012);
  },

  /** A layer lands: pentatonic step climbing with progress. */
  pop(progress: number) {
    if (!ready()) return;
    const scale = [0, 2, 4, 7, 9];
    const step = Math.floor(progress * 12) + Math.floor(rnd(0, 3));
    const semis = scale[step % 5] + 12 * Math.floor(step / 5);
    tone(220 * Math.pow(2, semis / 12), 0.16, "triangle", 0.06);
  },

  /** The replay finished. */
  chord() {
    if (!ready()) return;
    [0, 4, 7, 12, 16].forEach((s, i) => tone(330 * Math.pow(2, s / 12), 0.9, "triangle", 0.05, i * 0.07));
  },

  whoosh() {
    if (!ready()) return;
    tone(180, 0.5, "sawtooth", 0.02, 0, 60);
    tone(90, 0.6, "sine", 0.06);
  },
};
