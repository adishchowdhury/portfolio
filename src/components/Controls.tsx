"use client";

import { useSyncExternalStore } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { accent, nextAccent } from "@/lib/accent";
import { sfx } from "@/lib/sfx";

const subscribe = (evt: string) => (cb: () => void) => {
  window.addEventListener(evt, cb);
  return () => window.removeEventListener(evt, cb);
};
const subSfx = subscribe("sfxchange");
const subAccent = subscribe("accentchange");

/** Sound on/off. Off by default; turning it on plays a key press so you hear what you opted into. */
export function SoundToggle({ className = "", label = true }: { className?: string; label?: boolean }) {
  const on = useSyncExternalStore(subSfx, () => sfx.enabled, () => false);
  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? "Turn click and key sounds off" : "Turn click and key sounds on"}
      title="Key and click sounds"
      data-cursor={on ? "Mute" : "Sound"}
      data-nosound
      onClick={() => {
        sfx.set(!on);
        if (!on) setTimeout(() => sfx.key("KeyK"), 70);
      }}
      className={`mono inline-flex items-center gap-2 border border-line px-2.5 py-1.5 text-mute transition-colors hover:text-paper aria-pressed:border-acc aria-pressed:text-acc ${className}`}
    >
      {on ? <Volume2 size={14} /> : <VolumeX size={14} />}
      {label && <span className="hidden lg:inline">{on ? "Sound on" : "Sound"}</span>}
    </button>
  );
}

/** Cycles the accent colour. Also bound to the C key. */
export function AccentSwitch({ className = "" }: { className?: string }) {
  const hex = useSyncExternalStore(subAccent, () => accent.hex, () => "#e8ff32");
  const name = useSyncExternalStore(subAccent, () => accent.name, () => "Volt");
  return (
    <button
      type="button"
      onClick={nextAccent}
      aria-label={`Accent colour: ${name}. Change colour`}
      title={`Accent: ${name} (press C)`}
      data-cursor="Colour"
      className={`inline-flex h-[30px] w-[30px] items-center justify-center border border-line transition-colors hover:border-paper ${className}`}
    >
      <span aria-hidden className="block h-3.5 w-3.5 rounded-full" style={{ background: hex }} />
    </button>
  );
}
