import type Lenis from "lenis";

/** Shared handle so nav links and the replay can drive the smooth scroller. */
let instance: Lenis | null = null;

export const setLenis = (l: Lenis | null) => {
  instance = l;
};
export const getLenis = () => instance;

/** Scroll to a hash target, using Lenis when it is running and native scroll otherwise. */
export function scrollToHash(hash: string) {
  const el = hash === "#top" ? document.body : document.querySelector<HTMLElement>(hash);
  if (!el) return;
  const l = instance;
  if (l) l.scrollTo(hash === "#top" ? 0 : el, { duration: 1.4, offset: -56 });
  else el.scrollIntoView({ behavior: "auto", block: "start" });
  history.replaceState(null, "", hash === "#top" ? location.pathname : hash);
}
