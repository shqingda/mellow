# Mellow

A Chrome extension that lowers the lightness of bright text on dark pages. Backgrounds, images and icons are not changed.

It is intended for readers, in particular those with astigmatism, who see halos around white text on dark backgrounds.

## Behavior

- Text lightness is adjusted in OKLCH. Hue and chroma are preserved.
- Lightness above a threshold is compressed with a monotonic soft-knee curve, `L' = K + d / (1 + B·d)` where `d = L − K`. Brighter text is lowered more, and the order of lightness between texts is preserved.
- The upper limit for text lightness is derived from the page background: the darker the background, the lower the limit.
- Only pages detected as dark are affected. Detection samples the painted background at 25 points in the viewport.
- Colored text, such as links and syntax highlighting, is adjusted less than gray text.
- Text on colored or light backgrounds, such as buttons and notifications, keeps its original color.
- The style is applied at `document_start`, before the page is first painted.

## Install

Requires Node.js and pnpm.

```sh
pnpm install
pnpm build
```

In `chrome://extensions`, enable Developer mode, choose **Load unpacked** and select `.output/chrome-mv3`.

Requires a version of Chrome that supports CSS relative color syntax (`oklch(from currentColor …)`).

## Usage

The popup provides:

- A global on/off switch.
- A per-site mode: Auto (dark pages only), Always on, or Off.
- **White text**: a per-site setting. The value shown is the current lightness of the page's main text.
- **Softening starts**: the lightness above which text is adjusted.
- **Colored text**: how much colored text is adjusted.
- Interface language: Auto (follows the browser), Chinese or English.

<kbd>Alt</kbd>+<kbd>Shift</kbd>+<kbd>M</kbd> turns Mellow on or off for the current site.

## Privacy

Mellow makes no network requests. Settings are stored locally with `chrome.storage.local`. The only permissions requested are `storage` and `activeTab`.

## Development

```sh
pnpm dev        # run in a browser with live reload
pnpm build      # build to .output/chrome-mv3
pnpm zip        # package for the Chrome Web Store
pnpm test       # run tests
pnpm typecheck  # type-check
```

Built with TypeScript, [WXT](https://wxt.dev) and [Preact](https://preactjs.com).

| Path | Contents |
|---|---|
| `entrypoints/content.ts` | Content script: applies the style, detects page lightness, handles fades |
| `entrypoints/background.ts` | Keyboard shortcut |
| `components/` | Popup interface |
| `lib/curve.ts` | Lightness curve, background-based limit, generated CSS |
| `lib/color.ts` | sRGB and OKLCH conversion, parsing of computed colors |
| `lib/detect.ts` | Dark page detection |
| `lib/keep.ts` | Marking of elements on colored or light backgrounds |
| `lib/settings.ts` | Settings and storage |

## License

No license has been chosen yet.
