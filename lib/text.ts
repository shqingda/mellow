// Finds the text a page is mostly written in, for the popup to show how
// bright that text now is.

import { type OKLCH, parseColor } from './color';
import { KEEP_ATTR } from './keep';

/** How many text nodes a look at the text reads at most. */
const TEXT_NODES = 3000;

/**
 * The page's main bright text: of the text colors above lightness above,
 * the one the most characters show, leaving out text that keeps its color.
 * Null when no text is that bright, as on a light page.
 */
export function mainText(above: number): OKLCH | null {
  if (!document.body) return null;
  const counts = new Map<Element, number>();
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  for (let n = 0; n < TEXT_NODES && walker.nextNode(); n++) {
    const node = walker.currentNode;
    const el = node.parentElement;
    const len = node.textContent?.trim().length ?? 0;
    if (el && len > 0) counts.set(el, (counts.get(el) ?? 0) + len);
  }
  const byColor = new Map<string, number>();
  for (const [el, len] of counts) {
    if (el.closest(`[${KEEP_ATTR}]`)) continue;
    const color = getComputedStyle(el).color;
    byColor.set(color, (byColor.get(color) ?? 0) + len);
  }
  let best: OKLCH | null = null;
  let most = 0;
  for (const [color, len] of byColor) {
    const c = parseColor(color);
    if (c && c.l > above && len > most) {
      best = c;
      most = len;
    }
  }
  return best;
}
