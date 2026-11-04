// Colors in OKLCH, where L is perceptual lightness: 0 black, 1 white. Every
// lightness Mellow reads or sets is this L.

export type OKLCH = { l: number; c: number; h: number };

/** An sRGB component, 0–1, as linear light. */
export const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
/** Linear light as an sRGB component, 0–1. */
export const fromLinear = (v: number) => (v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055);

/** OKLCH of an sRGB color of 0–255 components. */
export function rgbToOklch(r8: number, g8: number, b8: number): OKLCH {
  const [r, g, b] = [r8, g8, b8].map((v) => toLinear(v / 255));
  const l_ = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m_ = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s_ = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_;
  const A = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_;
  const B = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_;
  return { l: L, c: Math.hypot(A, B), h: (Math.atan2(B, A) * 180) / Math.PI };
}

export function hexToOklch(hex: string): OKLCH {
  const n = Number.parseInt(hex.replace('#', ''), 16);
  return rgbToOklch((n >> 16) & 255, (n >> 8) & 255, n & 255);
}

export function oklchToHex({ l, c, h }: OKLCH): string {
  const A = c * Math.cos((h * Math.PI) / 180);
  const B = c * Math.sin((h * Math.PI) / 180);
  const l_ = (l + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m_ = (l - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s_ = (l - 0.0894841775 * A - 1.291485548 * B) ** 3;
  const rgb = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
  return `#${rgb
    .map((v) => Math.round(Math.min(1, Math.max(0, fromLinear(v))) * 255).toString(16).padStart(2, '0'))
    .join('')}`;
}

/**
 * A color as getComputedStyle reports it, rgb() or oklch(), in OKLCH, if it
 * is opaque enough to count: null for transparent and half-transparent
 * colors, and for color spaces it does not read.
 */
export function parseColor(s: string): OKLCH | null {
  const o = /^oklch\(([\d.]+)(%?) ([\d.]+) ([\d.]+|none)(?: \/ ([\d.]+))?/.exec(s);
  if (o) {
    if (o[5] !== undefined && Number(o[5]) < 0.5) return null;
    return { l: Number(o[1]) / (o[2] ? 100 : 1), c: Number(o[3]), h: Number(o[4]) || 0 };
  }
  const m = /^rgba?\(([^)]+)\)/.exec(s);
  if (!m) return null;
  const [r, g, b, a = 1] = m[1].split(/[\s,/]+/).filter(Boolean).map(Number);
  return a < 0.5 ? null : rgbToOklch(r, g, b);
}
