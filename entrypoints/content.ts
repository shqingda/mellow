import { browser } from 'wxt/browser';
import { defineContentScript } from 'wxt/utils/define-content-script';
import { cssVars, FILL } from '@/lib/curve';
import { lookAtPage } from '@/lib/detect';
import { ease, fadeKeyframes } from '@/lib/fade';
import { afterLayout } from '@/lib/frame';
import { KEEP_ATTR, markTree, watchAdded } from '@/lib/keep';
import {
  DEFAULTS,
  PAGE_PROTOCOL,
  type PageState,
  type Settings,
  loadSettings,
  paramsFor,
  siteMode,
  watchSettings,
} from '@/lib/settings';
import { mainText } from '@/lib/text';

export default defineContentScript({
  matches: ['<all_urls>'],
  runAt: 'document_start',
  allFrames: true,
  matchAboutBlank: true,
  main() {
    start();
  },
});

/** How long turning on or off, or a page turning light or dark, eases. */
const FADE_MS = 700;
/** How often a visible page is looked at again, for themes switched in place. */
const RECHECK_MS = 1500;

/** How far the background must move before the text follows. */
const BG_STEP = 0.04;

function start() {
  const root = document.documentElement;
  if (!root) return;
  const host = location.hostname;

  let settings: Settings = DEFAULTS;
  let dark: boolean | null = null;
  // The page's background lightness, which sets how bright text may be.
  let bg: number | null = null;
  // The strength softening eases to: 1 on, 0 off.
  let on = 0;
  // The fade to it, while one runs, and the strength it set out from.
  let fade: { anim: Animation; from: number } | null = null;

  const style = document.createElement('style');
  style.id = 'mellow-style';

  /**
   * The style: the parameters as custom properties on the root, and the
   * fill on the root, which every element inherits as a relative color
   * resolved against its own text color. SVG icons fill with that color
   * rather than the text fill, so the children of each svg get it mapped
   * from the svg's own color, which icons set as often as they inherit it;
   * a shape with a fill of its own, as a colored logo, keeps it. Fully off,
   * the rules go away, so an off page is exactly as it was. They are
   * :where()'d to weigh nothing: a page's own fill, as the transparent fill
   * of gradient text, wins.
   */
  function render() {
    const vars = Object.entries(cssVars(paramsFor(settings, host, bg)))
      .map(([k, v]) => `${k}: ${v};`)
      .join(' ');
    const rules =
      on > 0 || fade
        ? [
            `:where(:root) { -webkit-text-fill-color: ${FILL}; }`,
            `:where(svg) > * { color: ${FILL}; }`,
            // Text on a colored or light background, as a button's, keeps
            // its color: these come last to win over the two above.
            `:where([${KEEP_ATTR}]) { -webkit-text-fill-color: currentColor; }`,
            `:where([${KEEP_ATTR}] svg) > * { color: inherit; }`,
          ]
        : [];
    const text = [
      "@property --mlw-on { syntax: '<number>'; inherits: true; initial-value: 0; }",
      `:root { ${vars} --mlw-on: ${on}; }`,
      ...rules,
    ].join('\n');
    // Writing the style makes the page recompute every element's style, so
    // it is written only when it changes, not on each look at the page.
    if (text !== style.textContent) style.textContent = text;
  }

  function active(): boolean {
    if (!settings.enabled) return false;
    const mode = siteMode(settings, host);
    if (mode !== 'auto') return mode === 'on';
    // Unknown yet: on, which changes nothing on a light page, where text
    // is dark and below the knee. Starting off would flash bright text on
    // a dark one before the first look.
    return dark !== false;
  }

  function painted(): boolean {
    return performance.getEntriesByType('paint').length > 0;
  }

  /** The strength the page shows now, partway through a fade too. */
  function shown(): number {
    if (!fade) return on;
    const p = fade.anim.effect?.getComputedTiming().progress ?? 1;
    return fade.from + (on - fade.from) * ease(p);
  }

  /**
   * Eases --mlw-on from the strength showing to on, unless the page has not
   * painted yet, when there is nothing to ease from. Once the fade is done,
   * the stylesheet's value shows.
   */
  function fadeTo(from: number) {
    fade?.anim.cancel();
    fade = null;
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!painted() || reduce || Math.abs(from - on) < 1e-4) return;
    const anim = root.animate(fadeKeyframes('--mlw-on', from, on), {
      duration: FADE_MS * Math.abs(on - from),
    });
    fade = { anim, from };
    anim.onfinish = () => {
      if (fade?.anim !== anim) return;
      fade = null;
      render();
    };
  }

  // Marks text on colored backgrounds while softening is on. It starts
  // once the document is parsed: marking during parsing would read styles
  // before the page's stylesheets apply, and slow the page's load.
  let keeper: MutationObserver | null = null;
  let parsed = false;
  const markAll = () => {
    if (on > 0) markTree(root);
  };
  function syncKeeper(rescan = false) {
    const want = on > 0 && parsed;
    if (want && (!keeper || rescan)) afterLayout(markAll);
    if (want && !keeper) keeper = watchAdded();
    if (!want && keeper) {
      keeper.disconnect();
      keeper = null;
    }
  }

  /** Eases the strength to that of active(). */
  function update() {
    const target = active() ? 1 : 0;
    if (target !== on) {
      const from = shown();
      on = target;
      fadeTo(from);
    }
    render();
    syncKeeper();
  }

  function check() {
    const look = lookAtPage();
    if (!look) return;
    const changed = look.dark !== dark;
    dark = look.dark;
    // Scrolling moves the sample points over panels and cards; only a real
    // change of background, as a theme switch, moves the text.
    if (bg === null || changed || Math.abs(look.bg - bg) > BG_STEP) bg = look.bg;
    update();
    // A theme switched in place recolors what is already there.
    if (changed) syncKeeper(true);
  }

  /** Looks at the page once the browser has laid out the next frame. */
  const look = () => afterLayout(check);

  // Throttled: a theme switch changes many attributes at once.
  let pending = 0;
  function checkSoon() {
    if (pending) return;
    pending = window.setTimeout(() => {
      pending = 0;
      look();
    }, 80);
  }

  on = active() ? 1 : 0;
  render();
  root.append(style);

  // Pages that replace the document's children, as document.write does,
  // would drop the style.
  new MutationObserver(() => {
    if (!style.isConnected) document.documentElement?.append(style);
  }).observe(root, { childList: true });

  const takeSettings = (s: Settings) => {
    settings = s;
    update();
  };
  loadSettings().then(takeSettings);
  watchSettings(takeSettings);

  // Theme switches show as attributes of html or body, or as the system's
  // appearance; anything else, as a page navigated in place, the regular
  // look catches.
  const watchAttrs = (el: Element) =>
    new MutationObserver(checkSoon).observe(el, {
      attributes: true,
      attributeFilter: ['class', 'style', 'data-theme', 'data-color-mode', 'data-mode'],
    });
  watchAttrs(root);
  const onParsed = () => {
    parsed = true;
    if (document.body) watchAttrs(document.body);
    look();
    syncKeeper(true);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', onParsed);
  else onParsed();
  addEventListener('load', () => {
    look();
    // Stylesheets and fonts that came late may have recolored buttons; a
    // second look at them can wait until the page is idle.
    requestIdleCallback(() => syncKeeper(true), { timeout: 1000 });
  });
  addEventListener('pageshow', look);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', checkSoon);
  // Frames in the page, as ads, look when they load and when their theme
  // attributes change; only the page itself looks again and again, and
  // answers the popup.
  if (window !== window.top) return;
  setInterval(() => {
    if (document.visibilityState === 'visible') look();
  }, RECHECK_MS);

  browser.runtime.onMessage.addListener((msg: unknown, _sender, reply) => {
    if ((msg as { type?: string })?.type !== 'mlw:state') return;
    // Answered once the frame is laid out, with a fallback in case no
    // frame comes soon.
    let replied = false;
    const answer = () => {
      if (replied) return;
      replied = true;
      if (dark === null) check();
      const state: PageState = {
        protocol: PAGE_PROTOCOL,
        host,
        dark,
        active: active(),
        mode: siteMode(settings, host),
        white: paramsFor(settings, host, bg).white,
        text: dark ? mainText(settings.knee) : null,
      };
      reply(state);
    };
    afterLayout(answer);
    setTimeout(answer, 300);
    return true;
  });
}
