// A fade in a few steps rather than every frame. Each frame the strength
// changes, the browser works out every element's text color again, some
// milliseconds on a large page. Steps of under two points of lightness are
// too small to see one by one, so a dozen of them still read as a smooth
// fade, at a fraction of the work.

/** How many values a full fade shows. */
const FADE_STEPS = 12;

/** Where on [0, 1] the rising f reaches y, by bisection. */
function solve(f: (t: number) => number, y: number): number {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (f(mid) < y) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/** cubic-bezier(0.4, 0, 0.2, 1) in one dimension: a coordinate at t. */
const bezier = (t: number, a: number, b: number) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;

/** The ease of the fade, cubic-bezier(0.4, 0, 0.2, 1): quick, then gentle. */
export function ease(p: number): number {
  return bezier(solve((t) => bezier(t, 0.4, 0.2), p), 0, 1);
}

/**
 * Keyframes that hold each value until the next: equal steps from from to
 * to, each coming when the ease is halfway to it, so they come quickly at
 * first and then gently. A shorter way, as when a fade turns back halfway,
 * takes fewer steps.
 */
export function fadeKeyframes(name: string, from: number, to: number): Keyframe[] {
  const steps = Math.max(2, Math.round(FADE_STEPS * Math.abs(to - from)));
  const frames: Keyframe[] = [{ offset: 0, [name]: String(from), easing: 'step-end' }];
  for (let i = 1; i <= steps; i++) {
    const v = from + ((to - from) * i) / steps;
    frames.push({ offset: solve(ease, (i - 0.5) / steps), [name]: String(v), easing: 'step-end' });
  }
  frames.push({ offset: 1, [name]: String(to) });
  return frames;
}
