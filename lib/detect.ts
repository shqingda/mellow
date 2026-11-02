// Tells a dark page from a light one by the backgrounds actually showing:
// it samples points of the viewport, finds the background each lies on and
// weighs their lightness. Class names and color-scheme declarations lie or
// are missing; what is painted does not.

import { parseColor } from './color';

/**
 * The lightness of the background behind el: the first opaque enough
 * background of it or its ancestors, else the canvas. A background image
 * counts as unknown, as a photo behind text can be either.
 */
function backgroundLightness(el: Element | null, canvas: number): number | null {
  for (let e = el; e; e = e.parentElement) {
    const cs = getComputedStyle(e);
    const c = parseColor(cs.backgroundColor);
    if (c) return c.l;
    if (cs.backgroundImage !== 'none' && !cs.backgroundImage.startsWith('linear-gradient') && e !== document.body) {
      return null;
    }
  }
  return canvas;
}

/** The canvas: html's or body's background, else what color-scheme paints. */
function canvasLightness(): number {
  for (const e of [document.documentElement, document.body]) {
    if (!e) continue;
    const c = parseColor(getComputedStyle(e).backgroundColor);
    if (c) return c.l;
  }
  const scheme = getComputedStyle(document.documentElement).colorScheme;
  const dark = scheme.includes('dark') && (!scheme.includes('light') || matchMedia('(prefers-color-scheme: dark)').matches);
  return dark ? 0.2 : 1;
}

/** Lightness below which a background counts as dark. */
const DARK_BELOW = 0.5;

/** What a look at the page found. */
interface PageLook {
  dark: boolean;
  /** The lightness of the background most of the page shows. */
  bg: number;
}

/**
 * Looks at a 5×5 grid over the viewport; points in the middle weigh more,
 * where text is read. The page is dark when most weight lies on dark
 * backgrounds, and its background is the weighted median. Null when
 * nothing could be told, as before the body exists.
 */
export function lookAtPage(): PageLook | null {
  if (!document.body) return null;
  const w = innerWidth;
  const h = innerHeight;
  if (w === 0 || h === 0) return null;
  const canvas = canvasLightness();
  const samples: { l: number; weight: number }[] = [];
  for (let i = 0; i < 5; i++) {
    for (let j = 0; j < 5; j++) {
      const x = ((i + 0.5) / 5) * w;
      const y = ((j + 0.5) / 5) * h;
      const l = backgroundLightness(document.elementFromPoint(x, y), canvas);
      if (l === null) continue;
      samples.push({ l, weight: i > 0 && i < 4 && j > 0 && j < 4 ? 2 : 1 });
    }
  }
  if (samples.length === 0) return { dark: canvas < DARK_BELOW, bg: canvas };
  const total = samples.reduce((n, s) => n + s.weight, 0);
  const dark = samples.filter((s) => s.l < DARK_BELOW).reduce((n, s) => n + s.weight, 0);
  samples.sort((a, b) => a.l - b.l);
  let acc = 0;
  let bg = samples[samples.length - 1].l;
  for (const s of samples) {
    acc += s.weight;
    if (acc >= total / 2) {
      bg = s.l;
      break;
    }
  }
  return { dark: dark / total >= 0.5, bg };
}
