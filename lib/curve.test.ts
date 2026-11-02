import { describe, expect, it } from 'vitest';
import { hexToOklch } from './color';
import { FILL, autoWhite, ceiling, cssVars, mapHex, mapLightness, whiteFor } from './curve';
import { DEFAULTS } from './settings';

describe('mapLightness', () => {
  it('leaves lightness up to the knee as it is', () => {
    for (let l = 0; l <= DEFAULTS.knee; l += 0.01) {
      expect(mapLightness(l, 0, DEFAULTS)).toBeCloseTo(l, 10);
    }
  });

  it('brings white down to the white set', () => {
    expect(mapLightness(1, 0, DEFAULTS)).toBeCloseTo(DEFAULTS.white, 10);
    expect(mapLightness(1, 0, { ...DEFAULTS, white: 0.7 })).toBeCloseTo(0.7, 10);
  });

  it('never turns back, however deep the cut', () => {
    for (const white of [0.62, 0.7, 0.78, 0.9, 1]) {
      let prev = -1;
      for (let l = 0; l <= 1.0001; l += 0.001) {
        const y = mapLightness(l, 0, { ...DEFAULTS, white });
        expect(y).toBeGreaterThanOrEqual(prev - 1e-12);
        prev = y;
      }
    }
  });

  it('is off at strength 0', () => {
    expect(mapLightness(0.97, 0, DEFAULTS, 0)).toBeCloseTo(0.97, 10);
  });

  it('softens colored text less', () => {
    const gray = 0.97 - mapLightness(0.97, 0, DEFAULTS);
    const blue = 0.97 - mapLightness(0.97, 0.2, DEFAULTS);
    expect(blue).toBeLessThan(gray);
    expect(blue).toBeGreaterThan(0);
    expect(0.97 - mapLightness(0.97, 0.2, { ...DEFAULTS, color: 1 })).toBeCloseTo(gray, 10);
    expect(mapLightness(0.97, 0.2, { ...DEFAULTS, color: 0 })).toBeCloseTo(0.97, 10);
  });
});

describe('GitHub dark', () => {
  it('softens text toward Claude Code docs and keeps it apart from secondary text', () => {
    const text = hexToOklch(mapHex('#f0f6fc', DEFAULTS));
    const muted = hexToOklch(mapHex('#9198a1', DEFAULTS));
    // Claude Code docs' body #9e9e9e is L 0.70; GitHub's text starts at 0.97.
    expect(text.l).toBeLessThan(0.86);
    expect(text.l).toBeGreaterThan(0.72);
    // Secondary text barely moves...
    expect(hexToOklch('#9198a1').l - muted.l).toBeLessThan(0.02);
    // ...and stays clearly apart.
    expect(text.l - muted.l).toBeGreaterThan(0.08);
  });
});

describe('css', () => {
  it('uses every variable it sets', () => {
    for (const name of Object.keys(cssVars(DEFAULTS))) expect(FILL).toContain(`var(${name})`);
    expect(FILL).toContain('var(--mlw-on)');
  });
});

describe('the brighter the text, the more it comes down', () => {
  it('drops white most, bright grays some, and gray text barely', () => {
    const drop = (hex: string) => hexToOklch(hex).l - hexToOklch(mapHex(hex, DEFAULTS)).l;
    const github = drop('#f0f6fc');
    const x = drop('#e7e9ea');
    const brightGray = drop('#c9d1d9');
    const docs = drop('#9e9e9e');
    expect(github).toBeGreaterThan(x);
    expect(x).toBeGreaterThan(brightGray);
    expect(brightGray).toBeGreaterThan(docs);
    expect(docs).toBeLessThan(0.015);
  });
});

describe('whiteFor', () => {
  it('finds the white that brings text where it is asked to', () => {
    for (const [l, c] of [[0.97, 0], [0.93, 0.004], [0.86, 0.1]]) {
      for (const y of [0.7, 0.78, 0.82]) {
        if (y >= l) continue;
        const white = whiteFor(l, c, y, DEFAULTS);
        expect(white).not.toBeNull();
        expect(mapLightness(l, c, { ...DEFAULTS, white: white! })).toBeCloseTo(y, 6);
      }
    }
    expect(whiteFor(0.6, 0, 0.55, DEFAULTS)).toBeNull();
  });
});

describe('the background', () => {
  const on = (hex: string, bgHex: string) => {
    const params = { ...DEFAULTS, white: autoWhite(hexToOklch(bgHex).l, DEFAULTS) };
    return Math.round(hexToOklch(mapHex(hex, params)).l * 100);
  };

  it('brings bright text down more the darker it is', () => {
    let prev = 0;
    for (let bg = 0; bg <= 0.5; bg += 0.01) {
      expect(ceiling(bg)).toBeGreaterThanOrEqual(prev);
      prev = ceiling(bg);
    }
    expect(on('#e7e9ea', '#000000')).toBe(77);
    expect(on('#f0f6fc', '#0d1117')).toBe(78);
    expect(on('#f0f6fc', '#0d1117')).toBeGreaterThan(on('#f0f6fc', '#000000'));
  });

  it('barely touches text below the ceiling', () => {
    expect(Math.round(hexToOklch('#9e9e9e').l * 100) - on('#9e9e9e', '#000000')).toBeLessThanOrEqual(1);
    expect(autoWhite(0.6, DEFAULTS)).toBe(1);
  });
});
