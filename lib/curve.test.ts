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
    expect(text.l).toBeGreaterThan(0.76);
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

/**
 * APCA 0.0.98G-4g's contrast of light text on a dark background, as Lc,
 * straight from the sRGB values: a check on curve.ts's own solving of it.
 */
function apca(textHex: string, bgHex: string): number {
  const y = (hex: string) => {
    const n = Number.parseInt(hex.slice(1), 16);
    const [r, g, b] = [n >> 16, n >> 8, n].map((v) => ((v & 255) / 255) ** 2.4);
    const lum = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
    return lum < 0.022 ? lum + (0.022 - lum) ** 1.414 : lum;
  };
  return ((y(textHex) ** 0.62 - y(bgHex) ** 0.65) * 1.14 - 0.027) * 100;
}

describe('apca', () => {
  it('matches APCA’s published values', () => {
    expect(apca('#ffffff', '#000000')).toBeCloseTo(107.88, 1);
    expect(apca('#ffffff', '#888888')).toBeCloseTo(68.54, 1);
  });
});

describe('the background', () => {
  const mapped = (hex: string, bgHex: string) => {
    const params = { ...DEFAULTS, white: autoWhite(hexToOklch(bgHex).l, DEFAULTS) };
    return mapHex(hex, params);
  };
  const on = (hex: string, bgHex: string) => Math.round(hexToOklch(mapped(hex, bgHex)).l * 100);

  it('brings bright text to Lc 68, between APCA’s minimums for other text and body text', () => {
    for (const bg of ['#000000', '#0d1117', '#121212', '#15202b', '#1e1e1e', '#282c34', '#333333']) {
      // #e8e8e8 is L 0.93, the bright text the ceiling is set for.
      expect(Math.abs(apca(mapped('#e8e8e8', bg), bg) - 68)).toBeLessThan(1);
      // White stays a little above, where on black it would be Lc 108.
      expect(apca(mapped('#ffffff', bg), bg)).toBeLessThan(75);
    }
  });

  it('brings bright text down more the darker it is', () => {
    let prev = 0;
    for (let bg = 0; bg <= 0.5; bg += 0.01) {
      expect(ceiling(bg)).toBeGreaterThanOrEqual(prev);
      prev = ceiling(bg);
    }
    expect(on('#e7e9ea', '#000000')).toBe(81);
    expect(on('#f0f6fc', '#0d1117')).toBe(82);
    expect(on('#f0f6fc', '#15202b')).toBeGreaterThan(on('#f0f6fc', '#000000'));
  });

  it('barely touches text below the ceiling', () => {
    expect(Math.round(hexToOklch('#9e9e9e').l * 100) - on('#9e9e9e', '#000000')).toBeLessThanOrEqual(1);
    expect(autoWhite(0.6, DEFAULTS)).toBe(1);
  });
});
