/**
 * The mark: an isometric 3×3 cube — a nod to the wireframe in the backdrop and to CubeVerse —
 * with one cell lit, the way a highlighter would. The same geometry lives in src/app/icon.svg.
 */
export default function Logo({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="Adish"
      fill="none"
      strokeLinejoin="miter"
    >
      <rect width="64" height="64" fill="#050505" />
      {/* lit top face */}
      <polygon points="32,11 51.05,22 32,33 12.95,22" fill="#e8ff32" />
      {/* the grid on the two side faces */}
      <g stroke="#e8ff32" strokeWidth="1.5" opacity="0.8">
        <path d="M38.35 29.33V51.33M44.7 25.67V47.67M25.65 29.33V51.33M19.3 25.67V47.67" />
        <path d="M32 40.33L51.05 29.33M32 47.67L51.05 36.67M32 40.33L12.95 29.33M32 47.67L12.95 36.67" />
      </g>
      {/* one highlighted cell */}
      <polygon points="44.7,25.67 51.05,22 51.05,29.33 44.7,33" fill="#f5f3ee" />
      {/* outline + inner edges */}
      <g stroke="#e8ff32" strokeWidth="2.4">
        <polygon points="32,11 51.05,22 51.05,44 32,55 12.95,44 12.95,22" />
        <path d="M12.95 22L32 33L51.05 22M32 33V55" />
      </g>
    </svg>
  );
}
