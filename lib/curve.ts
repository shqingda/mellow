// The curve mellow applies to the lightness of text, in OKLCH, where L is
// perceptual: 0 black, 1 white. Lightness up to the knee stays as it is;
// above it, a rational soft clip
//
//   L' = K + d / (1 + B·d),   d = L − K
//
// leaves the knee at slope 1, so it joins the identity without a kink, can
// never turn back however deep it cuts, and barely moves secondary text
// just past the knee while white comes down to `white`.
//
// The same parameters go into the CSS expression below and into the
// functions here, which the popup's preview and the tests use.

import { hexToOklch, oklchToHex } from './color';

export interface CurveParams {
  /** Lightness where softening starts, 0.4–0.85. */
  knee: number;
  /** What pure white's lightness becomes, above the knee, at most 1. */
  white: number;
  /**
   * How much colored text is softened, from 0 (left as is) to 1 (as gray
   * text). Saturated colors are how themes tell things apart.
   */
  color: number;
}

/** Chroma from which text counts as fully colored. */
const FULL_CHROMA = 0.15;

function clampParams(p: CurveParams): CurveParams {
  const knee = Math.min(Math.max(p.knee, 0.4), 0.85);
  const white = Math.min(Math.max(p.white, knee + 0.01), 1);
  const color = Math.min(Math.max(p.color, 0), 1);
  return { knee, white, color };
}

/** B of the soft clip, such that L = 1 maps to white. */
function slope({ knee, white }: CurveParams): number {
  const b = (1 - knee) / (white - knee) - 1;
  return Math.max(0, b) / (1 - knee);
}

/** How strongly text of chroma c is softened, in [0, 1]. */
function chromaWeight(c: number, color: number): number {
  return 1 - (1 - color) * Math.min(1, c / FULL_CHROMA);
}

/** The new lightness of text of lightness l and chroma c, at strength on. */
export function mapLightness(l: number, c: number, params: CurveParams, on = 1): number {
  const p = clampParams(params);
  const b = slope(p) * on * chromaWeight(c, p.color);
  const d = Math.max(0, l - p.knee);
  return Math.min(l, p.knee + d / (1 + b * d));
}

/**
 * The white that brings text of lightness l and chroma c to lightness y:
 * mapLightness's inverse in its white. Null when no white can, as for
 * colored text the color strength leaves as it is.
 */
export function whiteFor(l: number, c: number, y: number, params: CurveParams): number | null {
  const { knee } = clampParams(params);
  const d = l - knee;
  if (d <= 0) return null;
  if (y >= l) return 1;
  const w = chromaWeight(c, params.color);
  if (w <= 0) return null;
  const b = (d / (Math.max(y, knee + 1e-3) - knee) - 1) / d / w;
  return knee + (1 - knee) / (1 + b * (1 - knee));
}

// How bright text may be on a background before it glares. What the eye
// minds is contrast: text against the background, with the light every
// screen and eye scatters added to both. Text up to the ceiling is left as
// it is; text above it is brought down to about it. A darker background
// lowers the ceiling, as white glares most on black.

/** The light scattered over both, as a luminance. */
const FLARE = 0.3;
/** The contrast, with the flare, above which text starts to glare. */
const COMFORT_RATIO = 2.49;
/** Bright text as pages use it, which the ceiling is set for. */
const BRIGHT_TEXT = 0.93;

/** The highest comfortable text lightness on a background of lightness bg. */
export function ceiling(bg: number): number {
  const y = Math.min(1, COMFORT_RATIO * (bg ** 3 + FLARE) - FLARE);
  return Math.cbrt(y);
}

/** The white that brings bright text to the ceiling of background bg. */
export function autoWhite(bg: number, params: CurveParams): number {
  const c = ceiling(bg);
  return whiteFor(BRIGHT_TEXT, 0, c, params) ?? 1;
}

/**
 * The value of -webkit-text-fill-color: each element's own text color with
 * its lightness mapped. Set on the root, it inherits as a relative color,
 * which every element resolves against its own currentColor. The
 * parameters are custom properties, so changing them restyles nothing but
 * the root's declaration, and --mlw-on, registered as a number, animates.
 */
export const FILL = [
  'oklch(from currentColor',
  ' min(l, calc(var(--mlw-k) + max(0, l - var(--mlw-k))',
  ` / (1 + var(--mlw-b) * var(--mlw-on) * (1 - var(--mlw-cd) * min(1, c / ${FULL_CHROMA})) * max(0, l - var(--mlw-k)))))`,
  ' c h / alpha)',
].join('');

/** Custom property values for params. */
export function cssVars(params: CurveParams): Record<string, string> {
  const p = clampParams(params);
  return {
    '--mlw-k': p.knee.toFixed(4),
    '--mlw-b': slope(p).toFixed(4),
    '--mlw-cd': (1 - p.color).toFixed(4),
  };
}

/** What text of color hex looks like with params applied. */
export function mapHex(hex: string, params: CurveParams, on = 1): string {
  const o = hexToOklch(hex);
  return oklchToHex({ ...o, l: mapLightness(o.l, o.c, params, on) });
}
