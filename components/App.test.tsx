// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { browser } from 'wxt/browser';
import { fakeBrowser } from 'wxt/testing/fake-browser';
import { DEFAULTS, loadSettings, PAGE_PROTOCOL } from '@/lib/settings';
import { App } from './App';

let container: HTMLDivElement;
let root: Root;

beforeEach(async () => {
  fakeBrowser.reset();
  vi.useFakeTimers();
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
  vi.spyOn(browser.i18n, 'getUILanguage').mockReturnValue('en');
  await browser.windows.create({ focused: true });
  await browser.tabs.create({ url: 'https://example.com', active: true });
  vi.spyOn(browser.tabs, 'sendMessage').mockImplementation(async () => ({
    protocol: PAGE_PROTOCOL,
    host: 'example.com',
    dark: true,
    active: true,
    mode: 'auto',
    white: 0.82,
    text: null,
  }));
  await browser.storage.local.set({ settings: { ...DEFAULTS, whites: { 'other.com': 0.75 } } });
  container = document.createElement('div');
  document.body.append(container);
  root = createRoot(container);
  await act(async () => root.render(<App />));
});

afterEach(async () => {
  await act(async () => root.unmount());
  container.remove();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

async function slide(index: number, value: number) {
  const input = container.querySelectorAll('input')[index];
  // Use the browser's setter so React sees a user edit, not a tracked assignment.
  await act(async () => {
    Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!.call(input, String(value));
    input.dispatchEvent(new Event('input', { bubbles: true }));
  });
}

async function click(selector: string) {
  await act(async () => container.querySelector<HTMLButtonElement>(selector)!.click());
}

async function nextFrame() {
  await act(async () => vi.advanceTimersToNextFrame());
}

it('updates sliders immediately and saves only the latest settings once per frame', async () => {
  const save = vi.spyOn(browser.storage.local, 'set');
  const frame = vi.spyOn(globalThis, 'requestAnimationFrame');
  expect(container.querySelector('.host')?.textContent).toBe('example.com');

  await slide(0, 0.9);
  await slide(1, 0.7);
  await slide(2, 0.6);
  expect(Array.from(container.querySelectorAll('input'), (input) => input.value)).toEqual(['0.9', '0.7', '0.6']);
  expect(container.querySelectorAll('.slider-value')[2].textContent).toBe('60%');
  expect(parseFloat(container.querySelector('input')!.style.getPropertyValue('--fill'))).toBeCloseTo(75);
  expect(save).not.toHaveBeenCalled();
  expect(frame).toHaveBeenCalledTimes(1);

  await nextFrame();
  expect(save).toHaveBeenCalledTimes(1);
  expect(await loadSettings()).toMatchObject({
    knee: 0.7,
    color: 0.6,
    whites: { 'example.com': 0.9, 'other.com': 0.75 },
  });

  await slide(2, 0.8);
  await nextFrame();
  expect(save).toHaveBeenCalledTimes(2);
  expect((await loadSettings()).color).toBe(0.8);
});

it('keeps switches, site modes, language and reset working with saved settings', async () => {
  await click('[role="switch"]');
  expect(container.querySelector('[role="switch"]')?.getAttribute('aria-checked')).toBe('false');
  await click('.site [role="radio"]:nth-child(2)');
  await act(async () => {
    const language = container.querySelector('select')!;
    language.value = 'zh';
    language.dispatchEvent(new Event('change', { bubbles: true }));
  });
  expect(document.documentElement.lang).toBe('zh-CN');
  await slide(0, 0.9);
  await slide(1, 0.7);
  await slide(2, 0.8);
  await click('.controls button');
  await nextFrame();

  expect(await loadSettings()).toEqual({
    ...DEFAULTS,
    enabled: false,
    lang: 'zh',
    sites: { 'example.com': 'on' },
    whites: { 'other.com': 0.75 },
  });
  expect(container.querySelector('input')?.value).toBe('0.82');
  expect(container.querySelector('.wordmark img')?.getAttribute('src')).toBe('/icon/96.png');
});

it('updates preview curve parameters immediately and disables softening with the switch', async () => {
  const preview = container.querySelector<HTMLElement>('.preview')!;
  expect(preview.style.getPropertyValue('--mlw-on')).toBe('1');
  await slide(0, 0.9);
  await slide(1, 0.7);
  await slide(2, 0.6);
  expect(preview.style.getPropertyValue('--mlw-k')).toBe('0.7000');
  expect(preview.style.getPropertyValue('--mlw-b')).toBe('1.6667');
  expect(preview.style.getPropertyValue('--mlw-cd')).toBe('0.4000');

  const samples = preview.querySelectorAll<HTMLElement>('.sample');
  expect(samples).toHaveLength(4);
  for (const sample of samples) {
    const [before, after] = sample.querySelectorAll('span');
    expect(after.style.color).toBe(before.style.color);
  }
  await click('[role="switch"]');
  expect(preview.style.getPropertyValue('--mlw-on')).toBe('0');
});

it('waits for a pause in slider edits before scanning the page once', async () => {
  const query = vi.mocked(browser.tabs.sendMessage);
  query.mockClear();

  for (let i = 0; i < 6; i++) {
    await slide(2, 0.6 + i / 100);
    await nextFrame();
    expect(query).not.toHaveBeenCalled();
  }
  await act(async () => vi.advanceTimersByTime(49));
  expect(query).not.toHaveBeenCalled();
  await act(async () => vi.advanceTimersByTime(1));
  expect(query).toHaveBeenCalledTimes(1);
  expect((await loadSettings()).color).toBe(0.65);
});

it('cancels a pending page scan and removes the storage listener on unmount', async () => {
  const query = vi.mocked(browser.tabs.sendMessage);
  query.mockClear();
  await slide(2, 0.6);
  await nextFrame();
  await act(async () => root.unmount());
  await browser.storage.local.set({ settings: DEFAULTS });
  await act(async () => vi.advanceTimersByTime(100));
  expect(query).not.toHaveBeenCalled();
});

it.each([
  ['https://example.com', 'Reload to apply', true],
  ['chrome://extensions', 'Mellow can’t run on this page', false],
] as const)('keeps controls available on %s when the content script is missing', async (url, status, reload) => {
  const [tab] = await browser.tabs.query({ active: true, currentWindow: true });
  await browser.tabs.update(tab.id!, { url });
  vi.mocked(browser.tabs.sendMessage).mockImplementation(async () => { throw new Error('No receiver'); });
  await browser.storage.local.set({ settings: { ...DEFAULTS, color: 0.6 } });
  await act(async () => vi.advanceTimersByTime(50));
  expect(container.querySelector('.badge')?.textContent).toBe(status);
  expect(Boolean(container.querySelector('button.primary'))).toBe(reload);
  expect(container.querySelectorAll('.site [role="radio"]')).toHaveLength(0);
  expect(container.querySelectorAll('input[type="range"]')).toHaveLength(3);
});
