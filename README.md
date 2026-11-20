# Adish — portfolio

Next.js 16 · TypeScript · Tailwind v4 · GSAP + ScrollTrigger · Framer Motion · Lenis · Lucide

```bash
npm install
npm run dev     # http://localhost:3000
npm run build && npm start
npm run lint
```

## Edit the content

Everything on the page lives in **`src/content/site.ts`**: name, links, hero copy, timeline,
projects, toolbox, achievements, contact. Components never hold copy.

- Hero stats are *computed* from the lists below them, so they can't drift.
- Timeline `year` is optional — it only renders when set.
- Contact links (`codeforces`, `twitter`) are hidden while their value is empty.
- Set `NEXT_PUBLIC_SITE_URL` for correct Open Graph / canonical URLs in production.

## Swap the portrait

`public/img/portrait-cutout.png` is a transparent PNG (subject only). It sits on a yellow disc and
breaks out of it; a negative-image "lens" follows the pointer. Any transparent cutout works —
keep roughly a 5:7 portrait ratio and update `CUTOUT` in `src/components/Hero.tsx` if the name changes.

## The "assemble" replay

Press **Space** (or "Watch it get built"): 14 cursors build the page layer by layer.
`R` restart · `A` auto-scroll · `Esc` close. Hidden for `prefers-reduced-motion`.

- Tag a region with `data-block`, a layer with `data-b="text | box | mega"`.
- Engine: `src/lib/assemble.ts` (virtual clock, job queue, agents). UI: `src/components/Assembler.tsx`.
- Agent count: `site.agents`.

## Motion & accessibility

Reveals are driven by `data-r` (`Boot.tsx`). With `prefers-reduced-motion`, nothing is hidden, the
cursor/marquee/backdrop motion are off. If JS never runs, content stays visible.
