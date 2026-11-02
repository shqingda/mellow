// Text on a colored or light background keeps its color: white on a blue
// button or a toast has far less contrast than white on the page, and
// softening it would make it hard to read. Such elements are marked, and
// the style restores the text fill below them.

import { parseColor } from './color';
import { afterLayout } from './frame';

export const KEEP_ATTR = 'data-mlw-keep';

/** Whether text on el's own background should keep its color. */
function keepsText(el: Element): boolean {
  const bg = parseColor(getComputedStyle(el).backgroundColor);
  if (!bg) return false;
  const { l, c: chroma } = bg;
  // Light: a button or a card of a light color. Colored: a brand blue, a
  // green badge, while a near-black tinted panel still counts as the page.
  return l >= 0.45 || (chroma >= 0.06 && l >= 0.3);
}

function mark(el: Element) {
  if (el === document.documentElement || el === document.body) return;
  const keep = keepsText(el);
  if (keep !== el.hasAttribute(KEEP_ATTR)) {
    if (keep) el.setAttribute(KEEP_ATTR, '');
    else el.removeAttribute(KEEP_ATTR);
  }
}

/**
 * Elements whose insides hold no text of their own to keep: an icon's paths,
 * scripts and the like. Skipping them leaves out most of what pages add, as
 * a feed's many icons.
 */
const SKIP = new Set(['svg', 'SCRIPT', 'STYLE', 'LINK', 'META', 'TEMPLATE', 'NOSCRIPT', 'IMG', 'VIDEO', 'CANVAS', 'IFRAME', 'BR']);

const skipped = (el: Element) => SKIP.has(el.tagName);

/** Marks root and the elements under it. */
export function markTree(root: Element) {
  if (skipped(root) || root.closest('svg')) return;
  mark(root);
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, {
    acceptNode: (n) => (skipped(n as Element) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
  });
  while (walker.nextNode()) mark(walker.currentNode as Element);
}

/**
 * Marks elements as they are added, once the browser has worked out their
 * styles for the frame they first show in: before that frame paints, so a
 * toast that pops up never flashes softened.
 */
export function watchAdded(): MutationObserver {
  const added = new Set<Element>();
  // An element under another added one is covered by that one's walk;
  // walking it too would go over its subtree again, once for each added
  // element above it.
  const markAdded = () => {
    for (const el of added) {
      if (!el.isConnected) continue;
      let p = el.parentElement;
      while (p && !added.has(p)) p = p.parentElement;
      if (!p) markTree(el);
    }
    added.clear();
  };
  const mo = new MutationObserver((records) => {
    for (const r of records) {
      for (const n of r.addedNodes) {
        if (n.nodeType === Node.ELEMENT_NODE) added.add(n as Element);
      }
    }
    if (added.size > 0) afterLayout(markAdded);
  });
  mo.observe(document, { childList: true, subtree: true });
  return mo;
}
