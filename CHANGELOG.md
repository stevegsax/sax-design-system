# Changelog

Notable changes to the SAX design tokens. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow semver (token value changes are patch/minor; renaming or removing a token is major).

## [Unreleased]

### Added

- **`document-viewer` product** (`dist/document-viewer/tokens.css`) for the SAX PDF annotation viewer. v1 consumes the shared semantics unchanged (empty product overrides); the viewer-specific surface is carried by the new tokens below.
- **`annotation.*` component color tokens** — `annotation.highlight` (highlighter yellow), `annotation.selected` (marker orange), `annotation.selection-bar-surface` / `annotation.selection-bar-text` (the floating selection action bar). Mode-agnostic: they sit on the theme-independent rendered page, and the consuming app applies its own translucency/blend.
- **`highlight` (OKLCH hue 104) and `marker` (hue 63) primitive ramps** in `config/ramps.json`, backing the annotation marks; `scripts/lib/css-tokens.js` recognizes both as primitive so their raw steps stay out of `dist`.
- **`elevation.sm` / `elevation.md` shadow tokens** (`tokens/semantic/effect.tokens.json`, `$type: shadow`) — the design system's first effect tier. `scripts/lib/css-tokens.js` now wires Style Dictionary's `shadow/css/shorthand` transform so composite box-shadows emit as CSS. Shadows are mode-agnostic by contract (a `light-dark()` wrapper cannot wrap a box-shadow string); their color is a translucent near-black effect parameter.
- Because the component and effect tiers are shared, the existing products (`product-home-page`, `blog-page`, `presentation`) also now carry `--annotation-*` and `--elevation-*` custom properties — additive, no value changes to their existing tokens.
- Storybook token catalog (`npm run storybook`) rendering every custom property from each product's built `tokens.css`, light and dark side by side, and a Playwright visual regression harness (`npm run test:visual`) that screenshots each catalog story against committed baselines. Baselines are platform-suffixed; regenerate intentionally with `npm run test:visual:update` after reviewing the diff in `test-results/`.

- README section documenting how to reuse this repo as the starting point for a new design system: clone with this repo as `upstream`, set a new `origin`, disable upstream push, and `git pull upstream main` for pipeline improvements over time.
- Primitive color ramps are now generated from `config/ramps.json` (a hue + chroma rule per ramp) by `npm run generate:ramps`, replacing hand-maintained OKLCH components. The chroma rules are `const`, `ceiling` (`min(cap, gamutMax)`), and `proportional` (`min(cap, factor x gamutMax)`); the brand anchor stays pinned. `scripts/lib/color.js` holds the shared OKLCH/sRGB helpers now used by both the generator and `check-color.js`.

### Changed

- `npm run build` now runs `check:ramps` first, failing if `tokens/primitive/color.tokens.json` has drifted from `config/ramps.json`. Consequence: primitive color values are no longer hand-editable — change the palette by editing the spec and running `npm run generate:ramps`.

### Fixed

- `.gitignore` anchored the Python-derived `lib/` and `lib64/` patterns to the repo root (`/lib/`, `/lib64/`). The unanchored `lib/` also matched `scripts/lib/`, which left `scripts/lib/resolve.js` untracked — so a fresh clone failed `npm run build` at `check:color` with a missing-module error. The library files are now committed and the pattern can no longer re-trap them.

## [0.2.0] - 2026-06-11

### Added

- `tokens/products/presentation/README.md`: notes on reveal.js's two-layer styling model and the failure modes a deck hits without a theme layer, with a mapping of our `--r-*` variables to reveal's documented [theme-authoring convention](https://github.com/hakimel/reveal.js/blob/master/css/theme/README.md).
- `dist/presentation/theme.css`: the reveal.js theme layer, now shipped with the presentation kit. reveal's own CSS is structure only and reads almost none of the `--r-*` variables; the theme layer is what applies them. Decks link `reset.css`, `reveal.css`, `tokens.css`, `theme.css` in that order. The sample deck links it instead of carrying the theme inline.

### Fixed

- The presentation theme declared reveal's `--r-*` variables but never consumed the structural ones, so decks fell back to reveal's hardcoded white viewport (invisible near-white headings in dark mode), the reset's zeroed margins (headings flush against body text), and zero list padding (bullets clipped at the slide edge). The theme layer now applies `--r-background-color`, `--r-main-color`, heading and block margins, list indentation, and the `::selection` colors.
- The theme layer restores what reveal's reset strips from inline elements — bold (`strong`/`b`), italic (`em`/`i`), and `sup`/`sub` alignment — and, matching stock reveal themes, left-aligns lists (as centered inline blocks, so bullets sit next to their text) and code blocks (so indentation survives reveal's centered slides).
- Aligned the theme to reveal's documented theme-authoring convention: heading sizes are now `--r-heading{1,2,3}-size` variables (was hardcoded), the shared heading rule covers `h1`–`h6` with `word-wrap: break-word`, and tables (`th`/`td`) get token-driven styling — so consumer decks using those elements are themed without extra CSS. The sample deck gains an APCA-gates table slide that exercises it.
- `dist/presentation/highlight.css` + `highlight.js`: syntax highlighting via reveal's highlight plugin, with a **token-driven** highlight.js theme (stock monokai/zenburn are fixed dark palettes). Syntax colors map to semantic tokens, so code follows `light-dark()` and is gated through APCA like everything else — six new `contrast-pairs.json` entries against `color.background.inset` (default code text at Lc 75, colored roles at 60). The sample deck gains a "Consume a token" code slide.
- reveal's scroll-view scrollbar consumes `--r-overlay-element-{bg,fg}-color` as bare `R, G, B` triplets inside `rgba()`, which a `light-dark()` color cannot express — the old declarations were invalid at every use site. The scrollbar rules are now styled with the tokens directly via `color-mix()`, and the two variable declarations are removed.
- Removed the unread `--r-heading-font-weight` declaration; heading weight comes from the `--typography-heading-*` composites.
- Code blocks now set `display: block` on `pre code` (the stock theme's job; reveal.css leaves it inline) and pad to `--space-xl`. Without `display: block`, padding applied only to the inline box's start, so every line after the first sat flush against the box edge.

## [0.1.1] - 2026-06-10

### Added

- This changelog, shipped with the package.

### Changed

- Documented the release process in `CLAUDE.md`.

## [0.1.0] - 2026-06-10

Initial release.

### Added

- DTCG 2025.10 token source in three tiers (component → semantic → primitive) for color, dimension, and typography.
- OKLCH tonal ramps: neutral, brand, and status (success, warning, danger). The brand ramp is anchored to the SAX logo blue (`color.brand.anchor`, `#005A9C`); its chroma curve follows the sRGB gamut ceiling through the anchor.
- Semantic roles mapped per mode (light, dark) and component tokens for button, card, input, and link.
- Build pipeline: resolver generation from the product × mode matrix, ajv validation against the official DTCG schemas, hex-fallback consistency checks, and APCA contrast gates (96 checks) that fail the build on violation.
- Per-product CSS using `light-dark()` — one stylesheet per product, no separate mode artifacts — for three products: `product-home-page`, `blog-page`, `presentation`.
- Generated previews and samples: token catalog, marketing page, blog index, and a token-themed reveal.js deck.
- Git-tag release model: `dist/` is committed and prebuilt; products pin `github:stevegsax/sax-design-system#vX.Y.Z` and install with no toolchain.

[Unreleased]: https://github.com/stevegsax/sax-design-system/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/stevegsax/sax-design-system/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/stevegsax/sax-design-system/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/stevegsax/sax-design-system/releases/tag/v0.1.0
