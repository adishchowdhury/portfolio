import type { ReactNode } from "react";

/* Custom illustrations for the project cards. Pure SVG / CSS, no images.
   Every label in here is lifted from the project's own description. */

const ACC = "var(--color-acc)";
const PAPER = "#f5f3ee";

/** Minimal browser chrome: square, hairline, mono URL. */
export function Browser({ url, children, bg }: { url: string; children: ReactNode; bg?: string }) {
  return (
    <div className="flex h-full w-full flex-col border border-line bg-ink">
      <div className="flex items-center gap-3 border-b border-line px-3 py-2">
        <span className="flex gap-1.5" aria-hidden>
          <i className="h-2 w-2 border border-mute" />
          <i className="h-2 w-2 border border-mute" />
          <i className="h-2 w-2 bg-acc" />
        </span>
        <span className="mono truncate border border-line px-2 py-0.5 text-mute">{url}</span>
      </div>
      <div className="relative min-h-0 flex-1" style={bg ? { background: bg } : undefined}>
        {children}
      </div>
    </div>
  );
}

/** ToofanOS — forecast → trigger → action, drawn as a storm track hitting a coastline. */
export function ToofanVisual() {
  const grid = [];
  for (let x = 0; x <= 640; x += 40) grid.push(<path key={"x" + x} d={`M${x} 0V360`} />);
  for (let y = 0; y <= 360; y += 40) grid.push(<path key={"y" + y} d={`M0 ${y}H640`} />);

  return (
    <Browser url="toofan-os.vercel.app" bg="#171330">
      <svg viewBox="0 0 640 330" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full" aria-hidden>
        <rect width="640" height="330" fill="#171330" />
        <g stroke="#ffffff" strokeOpacity="0.06">{grid}</g>

        {/* coastline + land */}
        <path
          d="M640 70 C 600 82 566 104 548 138 C 528 176 486 190 452 220 C 418 250 376 262 350 330 L640 330 Z"
          fill="#241d4a"
          stroke={ACC}
          strokeWidth="1.5"
        />
        <path d="M640 96 C 612 108 586 124 572 150" fill="none" stroke={ACC} strokeOpacity="0.35" strokeDasharray="3 5" />

        {/* storm */}
        <g transform="translate(138 96)">
          {[26, 52, 82, 116].map((r, i) => (
            <circle key={r} r={r} fill="none" stroke={PAPER} strokeOpacity={0.5 - i * 0.1} strokeDasharray={i % 2 ? "2 6" : undefined} />
          ))}
          <circle r="26" className="svg-pulse" fill={ACC} fillOpacity="0.18" stroke={ACC} />
          <circle r="5" fill={ACC} />
        </g>

        {/* forecast track */}
        <path
          className="svg-flow"
          d="M138 96 C 230 110 300 170 420 214"
          fill="none"
          stroke={ACC}
          strokeWidth="2"
          strokeDasharray="7 7"
        />
        {[
          [196, 112, "NOW"],
          [302, 166, ""],
          [420, 214, "IMPACT"],
        ].map(([x, y, t]) => (
          <g key={String(x)}>
            <circle cx={x as number} cy={y as number} r="5" fill="#171330" stroke={ACC} strokeWidth="2" />
            {t && (
              <text x={(x as number) + 10} y={(y as number) - 10} fill={PAPER} fontSize="10" fontFamily="var(--font-mono)" letterSpacing="1">
                {t}
              </text>
            )}
          </g>
        ))}

        {/* trigger line */}
        <path d="M348 60V260" stroke={ACC} strokeWidth="1.5" strokeDasharray="4 4" />
        <rect x="348" y="60" width="158" height="20" fill={ACC} />
        <text x="356" y="74" fill="#050505" fontSize="10" fontFamily="var(--font-mono)" fontWeight="500" letterSpacing="1">
          PARAMETRIC TRIGGER
        </text>

        {/* pipeline: forecast → decision → action */}
        {[
          ["FORECAST", 22],
          ["TRIGGER", 168],
          ["ACTION", 314],
        ].map(([t, x], i) => (
          <g key={String(t)} transform={`translate(${x} 270)`}>
            <rect width="124" height="34" fill={i === 2 ? ACC : "#171330"} stroke={i === 2 ? ACC : PAPER} strokeOpacity={i === 2 ? 1 : 0.5} />
            <text x="12" y="21" fill={i === 2 ? "#050505" : PAPER} fontSize="11" fontFamily="var(--font-mono)" fontWeight="500" letterSpacing="1.2">
              {t}
            </text>
            {i < 2 && <path d="M130 17H146M141 12L146 17L141 22" stroke={ACC} fill="none" strokeWidth="1.5" />}
          </g>
        ))}
        <text x="22" y="258" fill={PAPER} fillOpacity="0.55" fontSize="9.5" fontFamily="var(--font-mono)" letterSpacing="1">
          TIME-BOUND · ROLE-SPECIFIC DECISIONS
        </text>
      </svg>
    </Browser>
  );
}

/** CubeVerse — a real CSS-3D 3×3 cube, slowly turning. */
export function CubeVisual() {
  const faces = [
    "rotateY(0deg)",
    "rotateY(90deg)",
    "rotateY(180deg)",
    "rotateY(-90deg)",
    "rotateX(90deg)",
    "rotateX(-90deg)",
  ];
  const tone = (f: number, i: number) => {
    const seed = (f * 7 + i * 5) % 9;
    if (f === 0 && i === 4) return ACC;
    if (seed === 0 || seed === 5) return "#f5f3ee";
    if (seed === 1 || seed === 7) return "#8d8c86";
    if (seed === 3) return ACC;
    return "#232320";
  };
  return (
    <div className="absolute inset-0 grid place-items-center [perspective:800px]" aria-hidden>
      <div className="cube-spin relative" style={{ ["--s" as string]: "clamp(120px, 11vw, 168px)" }}>
        {faces.map((t, f) => (
          <div
            key={f}
            className="absolute inset-0 grid grid-cols-3 grid-rows-3 gap-[3px] border border-ink bg-ink p-[3px]"
            style={{ transform: `${t} translateZ(calc(var(--s) / 2))` }}
          >
            {Array.from({ length: 9 }, (_, i) => (
              <i key={i} style={{ background: tone(f, i) }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Crowdera — an editorial journal page, light on a dark grid. */
export function CrowderaVisual() {
  return (
    <div className="absolute inset-0 grid place-items-center p-5" aria-hidden>
      <div className="relative w-full max-w-[290px] -rotate-[2.5deg] bg-[#fafaf7] p-4 text-[#1d1d1f] shadow-[10px_10px_0_0_var(--color-acc)]">
        <div className="flex items-center justify-between border-b border-[#1d1d1f]/25 pb-2">
          <span className="font-serif text-[13px] font-semibold tracking-wide">Impact Journal</span>
          <span className="font-mono text-[9px] tracking-widest opacity-60">NO. 01</span>
        </div>
        <div className="mt-3 grid grid-cols-[1fr_72px] gap-3">
          <div className="space-y-1.5">
            <i className="block h-3 w-[92%] bg-[#1d1d1f]" />
            <i className="block h-3 w-[70%] bg-[#1d1d1f]" />
            <i className="mt-2 block h-1.5 w-full bg-[#1d1d1f]/25" />
            <i className="block h-1.5 w-[95%] bg-[#1d1d1f]/25" />
            <i className="block h-1.5 w-[88%] bg-[#1d1d1f]/25" />
            <i className="block h-1.5 w-[60%] bg-[#1d1d1f]/25" />
          </div>
          <svg viewBox="0 0 72 88" className="h-full w-full">
            <rect width="72" height="88" fill="#1d1d1f" />
            <circle cx="36" cy="34" r="14" style={{ fill: "var(--color-acc)" }} />
            <path d="M0 88C6 62 24 54 36 54S66 62 72 88Z" fill="#fafaf7" />
          </svg>
        </div>
        <div className="mt-3 flex items-end gap-3 border-t border-[#1d1d1f]/25 pt-3">
          <span className="font-serif text-4xl leading-none">&ldquo;</span>
          <div className="flex-1 space-y-1.5">
            <i className="block h-1.5 w-full bg-[#1d1d1f]/60" />
            <i className="block h-1.5 w-[64%] bg-[#1d1d1f]/60" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** AI / Agent experiments — a small agent loop with data moving along the edges. */
export function AgentsVisual() {
  const nodes: [string, number, number][] = [
    ["PROMPT", 54, 56],
    ["PLANNER", 54, 176],
    ["TOOLS", 306, 56],
    ["MEMORY", 306, 176],
  ];
  const edges = ["M54 56L180 116", "M54 176L180 116", "M306 56L180 116", "M306 176L180 116"];
  return (
    <svg viewBox="0 0 360 232" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full p-3" aria-hidden>
      {edges.map((d, i) => (
        <g key={i}>
          <path d={d} stroke={PAPER} strokeOpacity="0.25" fill="none" />
          <path d={d} className="svg-flow" style={{ animationDelay: `${i * -0.6}s` }} stroke={ACC} strokeWidth="2" strokeDasharray="3 12" fill="none" />
        </g>
      ))}
      <g transform="translate(180 116)">
        <circle r="44" className="svg-pulse" fill="none" stroke={ACC} strokeOpacity="0.5" />
        <circle r="36" fill="#050505" stroke={ACC} strokeWidth="1.5" />
        <text textAnchor="middle" y="5" fill={ACC} fontSize="16" fontFamily="var(--font-display)" letterSpacing="1">
          LLM
        </text>
      </g>
      {nodes.map(([t, x, y]) => (
        <g key={t} transform={`translate(${x} ${y})`}>
          <rect x="-34" y="-12" width="68" height="24" fill="#0d0d0c" stroke={PAPER} strokeOpacity="0.5" />
          <text textAnchor="middle" y="4" fill={PAPER} fontSize="9.5" fontFamily="var(--font-mono)" letterSpacing="1.2">
            {t}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** Open source — two feature branches merging into main. */
export function OssVisual() {
  return (
    <svg viewBox="0 0 280 232" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full p-3" aria-hidden>
      {/* main */}
      <path d="M20 116H260" stroke={PAPER} strokeOpacity="0.55" strokeWidth="1.5" />
      {[20, 80, 140, 200, 260].map((x) => (
        <rect key={x} x={x - 4} y="112" width="8" height="8" fill="#0d0d0c" stroke={PAPER} />
      ))}
      {/* branch 1: kestra */}
      <path d="M80 116C80 84 98 64 128 64H150C176 64 200 84 200 116" fill="none" stroke={ACC} strokeWidth="1.8" />
      <circle cx="128" cy="64" r="4.5" fill={ACC} />
      <circle cx="150" cy="64" r="4.5" fill={ACC} />
      <rect x="196" y="112" width="8" height="8" fill={ACC} stroke={ACC} />
      <text x="116" y="50" fill={ACC} fontSize="10" fontFamily="var(--font-mono)" letterSpacing="1">
        kestra
      </text>
      {/* branch 2: kubernetes */}
      <path d="M20 116C20 152 44 172 76 172H150C180 172 200 152 200 120" fill="none" stroke={PAPER} strokeOpacity="0.8" strokeWidth="1.8" />
      <circle cx="76" cy="172" r="4.5" fill={PAPER} />
      <circle cx="112" cy="172" r="4.5" fill={PAPER} />
      <circle cx="148" cy="172" r="4.5" fill={PAPER} />
      <text x="60" y="198" fill={PAPER} fontSize="10" fontFamily="var(--font-mono)" letterSpacing="1">
        kubernetes
      </text>
      <g transform="translate(206 88)">
        <rect width="64" height="18" fill={ACC} />
        <text x="8" y="12.5" fill="#050505" fontSize="9.5" fontFamily="var(--font-mono)" fontWeight="500" letterSpacing="1">
          MERGED
        </text>
      </g>
    </svg>
  );
}
