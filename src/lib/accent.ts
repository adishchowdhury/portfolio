/**
 * Accent colour. The whole site reads one CSS variable (--color-acc); canvases read the mirrored
 * `accent` object because they can't use CSS variables. Default stays electric yellow.
 */
export const ACCENTS = [
  { name: "Volt", hex: "#e8ff32" },
  { name: "Signal", hex: "#ff5a3c" },
  { name: "Mint", hex: "#3dffb0" },
  { name: "Violet", hex: "#a58bff" },
  { name: "Sky", hex: "#4db8ff" },
  { name: "Pink", hex: "#ff7ac8" },
] as const;

export const ACCENT_KEY = "adish:accent";

const toRgb = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
};

/** Live values for canvas drawing. Mutated by setAccent. */
export const accent = { hex: "#e8ff32", rgb: "232,255,50", name: "Volt" as string };

export function setAccent(hex: string) {
  const found = ACCENTS.find((a) => a.hex === hex) ?? ACCENTS[0];
  accent.hex = found.hex;
  accent.rgb = toRgb(found.hex);
  accent.name = found.name;
  document.documentElement.style.setProperty("--color-acc", found.hex);
  try {
    localStorage.setItem(ACCENT_KEY, found.hex);
  } catch {
    /* private mode: the choice just isn't remembered */
  }
  window.dispatchEvent(new CustomEvent("accentchange"));
}

/** Pick up whatever the boot script already applied before first paint. */
export function syncAccent() {
  const v = getComputedStyle(document.documentElement).getPropertyValue("--color-acc").trim().toLowerCase();
  const found = ACCENTS.find((a) => a.hex === v);
  if (found) {
    accent.hex = found.hex;
    accent.rgb = toRgb(found.hex);
    accent.name = found.name;
  }
}

export function nextAccent() {
  const i = ACCENTS.findIndex((a) => a.hex === accent.hex);
  setAccent(ACCENTS[(i + 1) % ACCENTS.length].hex);
}
