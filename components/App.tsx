import { useEffect, useRef, useState } from 'preact/hooks';
import { browser } from 'wxt/browser';
import { mapHex, mapLightness } from '@/lib/curve';
import { type LangSetting, resolveLang, type Strings, strings } from '@/lib/i18n';
import {
  DEFAULTS,
  PAGE_PROTOCOL,
  type PageState,
  type Settings,
  type SiteMode,
  loadSettings,
  saveSettings,
  siteMode,
  watchSettings,
  withSiteMode,
  withSiteWhite,
} from '@/lib/settings';

/** Text colors of a typical dark theme, to preview the curve on. */
const SAMPLES: { label: keyof Strings; hex: string }[] = [
  { label: 'sampleText', hex: '#f0f6fc' },
  { label: 'sampleMuted', hex: '#9198a1' },
  { label: 'sampleLink', hex: '#4493f8' },
  { label: 'sampleCode', hex: '#ffa657' },
];

const MODES: { value: SiteMode; label: keyof Strings }[] = [
  { value: 'auto', label: 'modeAuto' },
  { value: 'on', label: 'modeOn' },
  { value: 'off', label: 'modeOff' },
];

const LANGS: { value: LangSetting; label: (t: Strings) => string }[] = [
  { value: 'auto', label: (t) => t.langAuto },
  { value: 'zh', label: () => '中文' },
  { value: 'en', label: () => 'EN' },
];

const pct = (v: number) => `${Math.round(v * 100)}%`;

/** The tab in front, and what its content script reports. */
interface ActivePage {
  tabId?: number;
  /** A web page, where the content script runs once the page loads. */
  web: boolean;
  state: PageState | null;
  /** Its content script is older than the extension, or missing. */
  stale: boolean;
}

function useActivePage() {
  const [page, setPage] = useState<ActivePage | null>(null);
  const refresh = async () => {
    const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
    const web = /^(https?|file):/.test(tab?.url ?? '');
    let state: PageState | null = null;
    if (tab?.id) {
      try {
        state = await browser.tabs.sendMessage(tab.id, { type: 'mlw:state' }, { frameId: 0 });
      } catch {
        // None: the browser's own pages and the web store run no content
        // scripts, and pages opened before installing have none yet.
      }
    }
    const stale = web && state?.protocol !== PAGE_PROTOCOL;
    setPage({ tabId: tab?.id, web, state: stale ? null : state, stale });
  };
  return [page, refresh] as const;
}

export function App() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [page, refreshPage] = useActivePage();
  const writing = useRef<number | null>(null);
  const latest = useRef<Settings | null>(null);

  useEffect(() => {
    loadSettings().then(setSettings);
    refreshPage();
    return watchSettings(() => {
      // The page's state follows the settings; ask again once it has.
      setTimeout(refreshPage, 50);
    });
  }, []);

  if (!settings) return null;
  const lang = resolveLang(settings.lang);
  const t = strings(lang);
  // Picks the face for the language, as Chinese glyphs differ by region.
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';

  // Sliders write at most once a frame: the page follows as they move.
  const change = (next: Settings) => {
    setSettings(next);
    latest.current = next;
    if (writing.current !== null) return;
    writing.current = requestAnimationFrame(() => {
      writing.current = null;
      if (latest.current) saveSettings(latest.current);
    });
  };
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => change({ ...settings, [key]: value });

  const state = page?.state;
  const host = state?.host;
  // The page's white, as its background sets it, unless the site has its own.
  const params = {
    knee: settings.knee,
    color: settings.color,
    white: (host ? settings.whites[host] : undefined) ?? state?.white ?? settings.white,
  };
  const isDefault =
    !(host && host in settings.whites) && settings.knee === DEFAULTS.knee && settings.color === DEFAULTS.color;
  const mode = host ? siteMode(settings, host) : 'auto';
  let status = t.unavailable;
  if (page?.stale) {
    status = t.reloadToApply;
  } else if (state) {
    status = state.dark === null ? t.detecting : state.dark ? t.darkPage : t.lightPage;
    if (state.dark && !state.active) status += t.off;
  }
  // The slider is this site's own white, on a fixed range, and its number
  // the site's main text as it now is, so each site shows its own value.
  const found = state?.active ? state.text : null;
  const shown = found ? mapLightness(found.l, found.c, params) : params.white;
  const setWhite = (white: number) =>
    change(host ? withSiteWhite(settings, host, white) : { ...settings, white });
  const reset = () =>
    change({
      ...(host ? withSiteWhite(settings, host, null) : settings),
      knee: DEFAULTS.knee,
      color: DEFAULTS.color,
    });
  const reload = async () => {
    if (page?.tabId === undefined) return;
    await browser.tabs.reload(page.tabId);
    setTimeout(refreshPage, 800);
  };

  return (
    <main>
      <header>
        <Wordmark />
        <Switch checked={settings.enabled} onChange={(v) => change({ ...settings, enabled: v })} label={t.enable} />
      </header>

      <section className={`site ${settings.enabled ? '' : 'dim'}`}>
        <div className="row">
          <strong className="host">{host || t.thisPage}</strong>
          <span className={`badge ${state?.active ? 'on' : ''}`}>{status}</span>
        </div>
        {page?.stale && (
          <div className="row">
            <span className="muted small">{t.openedBefore}</span>
            <button className="primary" onClick={reload}>
              {t.reload}
            </button>
          </div>
        )}
        {host && (
          <div className="segmented" role="radiogroup" aria-label={t.thisSite}>
            {MODES.map((m) => (
              <button
                key={m.value}
                role="radio"
                aria-checked={mode === m.value}
                className={mode === m.value ? 'selected' : ''}
                onClick={() => change(withSiteMode(settings, host, m.value))}
              >
                {t[m.label]}
              </button>
            ))}
          </div>
        )}
        {mode === 'auto' && host && <p className="muted small">{t.autoHint}</p>}
      </section>

      <section className="preview" aria-label={t.preview}>
        <div className="preview-head muted small">
          <span>{t.before}</span>
          <span>{t.after}</span>
        </div>
        {SAMPLES.map((s) => (
          <div className="sample" key={s.hex}>
            <span style={{ color: s.hex }}>{t[s.label]}</span>
            <span style={{ color: settings.enabled ? mapHex(s.hex, params) : s.hex }}>{t[s.label]}</span>
          </div>
        ))}
      </section>

      <section className="controls">
        <div className="row">
          <h2>{t.adjust}</h2>
          <button
            className="link"
            disabled={isDefault}
            onClick={reset}
          >
            {t.reset}
          </button>
        </div>
        <Slider
          label={t.white}
          value={params.white}
          shown={shown}
          min={0.6}
          max={1}
          onChange={setWhite}
        />
        <Slider
          label={t.knee}
          hint={t.kneeHint}
          value={settings.knee}
          min={0.45}
          max={0.8}
          onChange={(v) => set('knee', Math.min(v, params.white - 0.02))}
        />
        <Slider
          label={t.color}
          hint={t.colorHint}
          value={settings.color}
          min={0}
          max={1}
          onChange={(v) => set('color', v)}
        />
      </section>

      <section className="prefs">
        <Choice
          label={t.language}
          value={settings.lang}
          options={LANGS.map((l) => ({ value: l.value, label: l.label(t) }))}
          onChange={(lang) => change({ ...settings, lang })}
        />
      </section>

      <footer className="muted small">
        <kbd>⌥</kbd>
        <kbd>⇧</kbd>
        <kbd>M</kbd> {t.shortcut}
      </footer>
    </main>
  );
}

/** The name, set in the system's rounded face beside the icon's disc. */
function Wordmark() {
  return (
    <h1 className="wordmark">
      <svg viewBox="0 0 128 128" aria-hidden="true">
        <defs>
          <linearGradient id="wm-a" x1="0.2" y1="0" x2="0.8" y2="1">
            <stop offset="0" stop-color="#ffcf8a" />
            <stop offset="1" stop-color="#e5832a" />
          </linearGradient>
          <clipPath id="wm-c">
            <circle cx="64" cy="64" r="58" />
          </clipPath>
        </defs>
        <g clip-path="url(#wm-c)">
          <rect width="128" height="128" fill="#f6e8d2" />
          <path d="M-5 132 L50 77 C70 57 92 48 122 44 L140 44 L140 140 L-5 140 Z" fill="url(#wm-a)" />
        </g>
        <circle cx="64" cy="64" r="56" fill="none" stroke="#d9802c" stroke-width="8" />
      </svg>
      <span>Mellow</span>
    </h1>
  );
}

function Choice<T extends string>(props: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="row choice">
      <span className="muted small">{props.label}</span>
      <div className="segmented small" role="radiogroup" aria-label={props.label}>
        {props.options.map((o) => (
          <button
            key={o.value}
            role="radio"
            aria-checked={props.value === o.value}
            className={props.value === o.value ? 'selected' : ''}
            onClick={() => props.onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button role="switch" aria-checked={checked} aria-label={label} className="switch" onClick={() => onChange(!checked)}>
      <span />
    </button>
  );
}

function Slider(props: {
  label: string;
  hint?: string;
  value: number;
  /** The number to show, when it is not the value itself. */
  shown?: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const fill = ((props.value - props.min) / (props.max - props.min)) * 100;
  return (
    <label className="slider">
      <div className="row">
        <span>{props.label}</span>
        <span className="muted">{pct(props.shown ?? props.value)}</span>
      </div>
      <input
        type="range"
        min={props.min}
        max={props.max}
        step={0.01}
        value={props.value}
        style={{ '--fill': `${fill}%` }}
        onInput={(e) => props.onChange(Number(e.currentTarget.value))}
      />
      {props.hint && <span className="muted small">{props.hint}</span>}
    </label>
  );
}
