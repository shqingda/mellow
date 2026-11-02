import { describe, expect, it } from 'vitest';
import { ease, fadeKeyframes } from './fade';

describe('fade', () => {
  it('eases from 0 to 1, quick then gentle', () => {
    expect(ease(0)).toBeCloseTo(0, 4);
    expect(ease(1)).toBeCloseTo(1, 4);
    expect(ease(0.5)).toBeGreaterThan(0.7);
  });

  it('moves white text by under two points a step', () => {
    const frames = fadeKeyframes('--mlw-on', 0, 1);
    const values = frames.map((f) => Number(f['--mlw-on']));
    // White comes down by about 0.2 of lightness at full strength.
    for (let i = 1; i < values.length; i++) expect((values[i] - values[i - 1]) * 0.2).toBeLessThan(0.025);
    expect(values.at(-1)).toBe(1);
    expect(frames.length).toBeLessThan(16);
  });
});
