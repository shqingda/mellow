import { browser } from 'wxt/browser';
import type { OKLCH } from './color';
import { autoWhite, type CurveParams } from './curve';
import type { LangSetting } from './i18n';

/** How a site is treated: by what it shows, or always on or off. */
export type SiteMode = 'auto' | 'on' | 'off';

export interface Settings extends CurveParams {
  enabled: boolean;
  sites: Record<string, SiteMode>;
  /** Sites' own white, set from the popup; the others take white. */
  whites: Record<string, number>;
  lang: LangSetting;
}

export const DEFAULTS: Settings = {
  enabled: true,
  // White text comes down most and the brighter grays some, while gray
  // text, as Claude Code docs' #9e9e9e or GitHub's #9198a1, barely moves.
  knee: 0.65,
  // Only until the page's background is known, which then sets it.
  white: 0.84,
  color: 0.5,
  sites: {},
  whites: {},
  lang: 'auto',
};

const KEY = 'settings';

// Local storage answers in a few milliseconds, before most pages paint. It
// is used as it is rather than through a wrapper library, which every page's
// content script would load.

/** Saved settings, with defaults for what was never saved. */
const withDefaults = (saved: unknown): Settings => ({ ...DEFAULTS, ...(saved as Partial<Settings> | undefined) });

export async function loadSettings(): Promise<Settings> {
  return withDefaults((await browser.storage.local.get(KEY))[KEY]);
}

export function saveSettings(s: Settings): Promise<void> {
  return browser.storage.local.set({ [KEY]: s });
}

/** Calls fn with the settings whenever they change; returns the unwatch. */
export function watchSettings(fn: (s: Settings) => void): () => void {
  const listener = (changes: Record<string, { newValue?: unknown }>, area: string) => {
    if (area === 'local' && KEY in changes) fn(withDefaults(changes[KEY].newValue));
  };
  browser.storage.onChanged.addListener(listener);
  return () => browser.storage.onChanged.removeListener(listener);
}

export async function updateSettings(fn: (s: Settings) => Settings): Promise<void> {
  await saveSettings(fn(await loadSettings()));
}

export function siteMode(s: Settings, host: string): SiteMode {
  return s.sites[host] ?? 'auto';
}

/**
 * The curve on host: its own white, if it has one, else the one its
 * background bg calls for, else the shared one.
 */
export function paramsFor(s: Settings, host: string, bg: number | null = null): CurveParams {
  const auto = bg === null ? s.white : autoWhite(bg, s);
  return { knee: s.knee, white: s.whites[host] ?? auto, color: s.color };
}

/** Sets host's own white, or drops it for null. */
export function withSiteWhite(s: Settings, host: string, white: number | null): Settings {
  const whites = { ...s.whites };
  if (white === null) delete whites[host];
  else whites[host] = white;
  return { ...s, whites };
}

/** Sets host's mode, dropping the entry for auto. */
export function withSiteMode(s: Settings, host: string, mode: SiteMode): Settings {
  const sites = { ...s.sites };
  if (mode === 'auto') delete sites[host];
  else sites[host] = mode;
  return { ...s, sites };
}

/**
 * The version of PageState. A page opened before the extension was
 * installed or updated keeps the old content script, which reports an
 * older one, or none.
 */
export const PAGE_PROTOCOL = 6;

/** What a content script reports to the popup. */
export interface PageState {
  protocol: number;
  host: string;
  /** The page's background, as detected: null before the first look. */
  dark: boolean | null;
  /** Whether softening is on for the page. */
  active: boolean;
  mode: SiteMode;
  /** The white the page's text is softened with now. */
  white: number;
  /** The page's main bright text color, as it was: null when there is none. */
  text: OKLCH | null;
}
