# Mellow

A Chrome extension that lowers the lightness of bright text on dark pages. Backgrounds and images are not changed; SVG icons that inherit the text color may soften with the text.

It is intended for readers, in particular those with astigmatism, who see halos around white text on dark backgrounds.

## Behavior

- Text lightness is adjusted in OKLCH. Hue and chroma are preserved.
- Lightness above a threshold is compressed with a monotonic soft-knee curve, `L' = K + d / (1 + B·d)` where `d = L − K`. Brighter text is lowered more, and the order of lightness between texts is preserved.
- The upper limit for text lightness is derived from the page background: bright text is brought to APCA contrast Lc 68, instead of the Lc 100–108 of white on a dark background. This lies between the minimums APCA recommends for non-body text (Lc 60) and body text (Lc 75). APCA does not account for halos, so the comfortable level for readers who see them is lower; in trials, Lc 62 was slightly too dim and Lc 75 slightly too bright. The darker the background, the lower the limit.
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

Requires Chrome 119 or newer for [CSS relative color syntax](https://developer.chrome.com/blog/css-relative-color-syntax) (`oklch(from currentColor …)`).

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

Mellow makes no network requests and has no analytics. It processes page styles, text-node lengths and the current site's hostname locally to adjust brightness. Settings and per-site preferences are saved in `chrome.storage.local`, without browser-account sync. Page text is not stored or transmitted.

The extension requests `storage` and `activeTab`, and declares a content script for `<all_urls>` so softening can run automatically on supported pages. See [PRIVACY.md](PRIVACY.md) for the full privacy policy.

## Development

```sh
pnpm dev        # run in a browser with live reload
pnpm build      # build to .output/chrome-mv3
pnpm zip        # package for the Chrome Web Store
pnpm test       # run tests
pnpm typecheck  # type-check
```

## Release

Run `pnpm test`, `pnpm typecheck` and `pnpm zip`. The version in `package.json` becomes the extension version; version 1.0.0 produces `.output/mellow-1.0.0-chrome.zip`, ready to upload to the Chrome Web Store. To install it locally, extract the ZIP and load the extracted folder from `chrome://extensions`.

[Chrome Web Store copy](store/README.md) includes English and Simplified Chinese descriptions, permission explanations, privacy disclosures, reviewer instructions and release notes. The public privacy policy is [PRIVACY.md](PRIVACY.md).

The icon source is `assets/icon.svg`. The 128 px store export has 96 px artwork centered within 16 px transparent padding; the smaller toolbar and popup exports use less padding for legibility.

## Project structure

Built with TypeScript, [WXT](https://wxt.dev) and [React](https://react.dev).

React is loaded only by the popup. Content scripts and the background worker stay framework-free, and slider settings are saved at most once per animation frame.

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
