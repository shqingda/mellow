// Reading an element's style makes the browser work styles out at once, if
// they are not up to date, and whatever that sets off is put down to the
// reader: a page's own http image starting to load shows as a warning of
// the extension's. So styles are read only where the browser has worked
// them out by itself: in a ResizeObserver's callback, which runs each frame
// after styles and layout and before paint. Marks set there still show in
// that frame's paint, and nothing is worked out twice.

const queue = new Set<() => void>();
let observer: ResizeObserver | null = null;
let running = false;

function observe() {
  const root = document.documentElement;
  if (!observer || !root) return;
  // A new observation reports once, in the next frame.
  observer.unobserve(root);
  observer.observe(root);
}

/** Runs fn once styles and layout of the next frame are worked out. */
export function afterLayout(fn: () => void) {
  const first = queue.size === 0;
  queue.add(fn);
  if (!first) return;
  observer ??= new ResizeObserver(() => {
    const fns = [...queue];
    queue.clear();
    running = true;
    try {
      for (const f of fns) f();
    } finally {
      running = false;
    }
    // Observing again from the callback would loop, which the page sees as
    // an error; what came in meanwhile waits for the next frame.
    if (queue.size > 0) requestAnimationFrame(observe);
  });
  if (!running) observe();
}
