import { describe, expect, it } from 'vitest';
import { hexToOklch, oklchToHex, parseColor } from './color';

describe('color conversion', () => {
  it('round-trips', () => {
    for (const hex of ['#000000', '#ffffff', '#f0f6fc', '#4493f8', '#ffa657', '#9198a1']) {
      expect(oklchToHex(hexToOklch(hex))).toBe(hex);
    }
  });
});

describe('parseColor', () => {
  it('reads rgb() and oklch() as getComputedStyle reports them', () => {
    expect(parseColor('rgb(255, 255, 255)')?.l).toBeCloseTo(1, 4);
    expect(parseColor('rgba(0, 0, 0, 0.8)')?.l).toBeCloseTo(0, 4);
    expect(parseColor('oklch(0.9 0.02 250)')).toEqual({ l: 0.9, c: 0.02, h: 250 });
    expect(parseColor('oklch(90% 0.02 250 / 0.9)')?.l).toBeCloseTo(0.9, 6);
  });

  it('leaves out what is too transparent to count, and what it cannot read', () => {
    expect(parseColor('rgba(0, 0, 0, 0)')).toBeNull();
    expect(parseColor('oklch(0.9 0.02 250 / 0.2)')).toBeNull();
    expect(parseColor('color(display-p3 1 1 1)')).toBeNull();
  });
});
