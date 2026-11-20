type Props = {
  items: readonly string[];
  /** "acc" = solid yellow band, "line" = outlined type on black. */
  variant?: "acc" | "line";
  reverse?: boolean;
};

/** A slow, pausable ticker used as a hard cut between sections. */
export default function Marquee({ items, variant = "line", reverse }: Props) {
  const row = (key: string) => (
    <ul key={key} className="flex shrink-0 items-center" aria-hidden={key === "b"}>
      {items.map((t) => (
        <li key={t} className="flex items-center">
          <span
            className={`display whitespace-nowrap px-6 text-[clamp(2.4rem,6vw,5.4rem)] ${
              variant === "acc" ? "text-ink" : "outline-text"
            }`}
          >
            {t}
          </span>
          <span
            aria-hidden
            className={`text-[clamp(1.4rem,3vw,2.6rem)] ${variant === "acc" ? "text-ink" : "text-acc"}`}
          >
            ✦
          </span>
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className={`marquee relative overflow-hidden border-y py-3 ${
        variant === "acc" ? "border-acc bg-acc" : "border-line"
      }`}
      role="presentation"
    >
      <div className="marquee-track" style={reverse ? { animationDirection: "reverse" } : undefined}>
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}
