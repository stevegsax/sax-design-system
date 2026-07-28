# Changelog

Notable changes to the SAX design system. Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/); versions follow semver (token value changes are patch/minor; renaming or removing a token is major).

## [Unreleased]

### Added

- **Application page shell** ([ADR](decisions/2026-07-28-page-shell-application.md)): `patterns/page-shell-application.html` — app bar, sidebar, full-bleed main, status footer, each region documented in the pattern itself (now a rule for all patterns). New `shell.sidebar-width` component token (primitive `dimension.container.18`). The `sax-designer` skill and `building-pages.md` start application pages from the shell.
- **Application prototype fleet** — four archetypes (records, settings, dashboard, detail) assembled at build time by `scripts/build-prototypes.js` from the shell pattern plus content modules in `prototypes/application/`; pattern styles are pulled in from `patterns/*.html`, so one edit re-renders every page. Emitted to `dist/prototypes/application/` with a gallery index (linked from `dist/index.html`); the records prototype regenerates `dist/samples/application.html` so sample and standard cannot drift. One Storybook story and baseline per prototype; the mirror gains an "Application prototypes" card group.
- `CLAUDE.md`: "New pattern" checklist (explicit `stories/lib/patterns.js` and mirror `CARD_LAYOUT` wiring).
- **`dist/patterns/<situation>.html`** — every shipped pattern rendered statically under each situation's tokens (`scripts/build-patterns.js`); the Storybook Patterns story, shareable without a dev server.

### Changed — breaking (dist page paths)

- **dist navigation rationalized.** `dist/index.html` is now the home page linking every surface; token catalogs move `dist/preview/` → `dist/catalog/` (with a situation switcher and sample cross-links in a shared nav strip); the mixing demo moves `dist/mixing.html` → `dist/demos/mixing.html`; the prototype gallery gains the nav strip. Sample pages and individual prototypes stay chrome-free by decision — they are the artifact under review. A link-integrity check runs over the emitted pages. Only page URLs changed; stylesheet paths (`dist/tokens.css`, `dist/base.css`) are untouched.

## [1.0.3] - 2026-07-28

### Added

- Logo usage standard ([ADR](decisions/2026-07-28-logo-usage.md)): the symbol mark (`SAX_logo_symbol`) is the logo wherever a product shows one; on web pages, the SVG variant. Recorded in `guidelines/brand.md` and the `sax-designer` skill.

### Fixed

- Logo SVGs are now inline-safe: fills as presentation attributes, no document-level `<style>`/classes/ids (the three files shared Illustrator's `.st*` classes with colliding meanings and `id="Layer_1"`, breaking any context that inlines them together); the wordmark's hidden draft layer is deleted (file halved). The claude.ai mirror's rendered logo references revert from the PNG workaround to SVG, verified by an inline-collision render test.
- Follow-through on the skill's relocation to `skills/sax-designer/` (moved out of `.claude/skills/` to avoid account-symlink conflicts): the package `files` field, README copy command, `CLAUDE.md`, guides, `decisions/README.md`, and the mirror generator all pointed at the old path — the `files` entry would have silently shipped the next release without the skill. Consumers still copy to their repo's `.claude/skills/`; only the source path changed.

## [1.0.2] - 2026-07-25

### Added

- `sax-designer` skill: **migration mode** — a workflow for restyling existing product UI onto the system (audit into a value→token map, approval gate, per-page foundation via `data-situation` scoping, ladder-ordered replacement, ADR gate for gaps, mode/contrast verification). The skill description now triggers on migration requests, and `guidelines/building-pages.md` gains a "Migrating an existing page" section documenting the incremental-adoption property.

- `scripts/build-design-sync.js` — generates the claude.ai design-project mirror bundle from repo artifacts (tokens verbatim from `dist/`, pattern cards, React components with current token truths, specimen cards from token data, slides, Design Component templates, UI kits from `dist/samples/`). The mirror is fully generated as of 2026-07-25; only app-managed files (`_ds_bundle.js`, `_ds_manifest.json`, `support.js`, thumbnails) are not owned by the script. Not shipped to consumers (`scripts/` is outside the package `files` field).
- `scripts/check-design-sync.js` — render-check for the mirror bundle: loads every card and UI-kit page in headless Chromium and fails on 404s, JS errors, the missing-situation diagnostic, or unresolved token variables. Caught the first sync's breakage: UI kits linked `dist`-relative stylesheets that don't exist in the mirror, and component cards depended on the pane's compiled bundle — cards now inline their component source, and the kits link the mirror's `styles.css`/`base.css`.
- The mirror generator also emits `_ds_manifest.json`: the claude.ai pane renders from this derived index (card list, token panel, and the `globalCssPaths` it injects into card renders), and the app's self-check does not rebuild it after a sync — a stale manifest pointing at deleted token files broke every card. `styles.css` is now a concatenation rather than `@import` lines so injection has no relative URLs to resolve, and the UI kits carry `@dsCard` markers to stay in the index.
- Mirror pane-rendering fixes (verified in the desktop app): rendered logo references use PNG, not SVG — the pane inlines SVG images into one document and the logos all share Illustrator's `id="Layer_1"`, so duplicate ids cross-contaminate; the Marketing Page template's access form is plain token-styled HTML because design-tool imports pass text content as React children, which must never reach a void `<input>` (React error 137); `Input` treats string children as its label as a guard.

## [1.0.1] - 2026-07-25

### Fixed

- `sax-designer` skill review (post-v1.0.0): the decision ladder now leads with patterns; the two provisional-styling examples referenced gaps filled in v0.4.0 (disabled state, container width) and now cite currently-open gaps (page shell, icon set); the ground-truth table points at all three `guidelines/` docs, not just `brand.md`. The release flow in `CLAUDE.md` gains a pre-`npm version` step: re-read the skill against the release, since it is the one consumer-facing artifact with no build gate.

## [1.0.0] - 2026-07-25

Migration for v0.4.x consumers: the package is renamed `@sax/design-tokens` → `@sax/design-system` (repo URL unchanged). Update the dependency key in `package.json` and every `node_modules/@sax/design-tokens/…` path (mockup stylesheet links, vendored-CSS copy steps) to `@sax/design-system`. Token names and CSS custom properties are unchanged.

### Changed — breaking

- **Package renamed to `@sax/design-system`.** The system now ships patterns, brand guidelines, and logos alongside the tokens; the old name undersold the scope. Consumers pin the same repo (`github:stevegsax/sax-design-system#vX.Y.Z`) under the new name.

### Added

- **Pattern library, first six patterns** (one ADR each, dated 2026-07-24): `button`, `field`, `card`, `alert`, `tag`, `callout`. Links are deliberately not a pattern — `base.css` element coverage is the recorded standard ([ADR](decisions/2026-07-24-link-element-coverage.md)). Each pattern has a Storybook story per situation and committed visual baselines.
- **Tag component tokens** ([ADR](decisions/2026-07-24-tag-component.md)): `tag.background`, `tag.text`, `tag.label-font`, `tag.radius`, `tag.padding-*`; gated `tag.text` on `tag.background` at Lc 60 (measured 66.6–80.9 across all situations × modes).
- **Callout component tokens** ([ADR](decisions/2026-07-24-callout-pattern.md)): uniform inset fill with per-variant border/title inks for the five GitHub admonition types (`note`, `tip`, `important`, `warning`, `caution`); `<aside>` canonical, same classes accepted on `blockquote` for rendered markdown. The situation contract widens to callout density/typography (`callout.padding-*`, `callout.radius`, `callout.title-font`, `callout.body-font`). Status-border candidates failed the Lc 45 gate and were implemented as status text inks (see the ADR's implementation note); four new non-text border gates.
- **`base.css`: `label` element styling** ([ADR](decisions/2026-07-24-field-pattern.md)) — applies `--input-label-font`, closing the gap where the token existed but nothing used it.
- **Brand guidelines** (`guidelines/brand.md`, [ADR](decisions/2026-07-24-brand-guidelines.md)): ratified voice/copy standards, four mechanical review gates (sentence case, no emoji, no exclamation marks, formal punctuation), visual-restraint guidance, and recorded pending decisions (typefaces, icon set, imagery). The blanket no-icon/no-imagery/no-gradient rules from the claude.ai mirror were struck as unratified inference.
- **Logos ship with the package**: `guidelines` and `static-assets` join the `files` field.
- **How-to guides**: `guidelines/building-pages.md` (composing pages — decision ladder, situations, modes, layout sources) and `guidelines/adding-components.md` (the ADR path for new components, with the 2026-07-24 ADRs as worked examples).
- Storybook: a `Patterns` story per situation renders every shipped pattern under that situation's tokens, light and dark side by side.

## [0.4.0] - 2026-07-21

Migration for v0.3.x consumers: see "Migrating from v0.3.x" in the README — two import lines, one `data-situation` attribute, rendering verified identical to the old per-product builds.

### Changed — breaking

- **Reading situations replace the product axis** ([ADR](decisions/2026-07-20-reading-situations.md)). `config/matrix.json` now defines `situations` (`literary`, `documentation`, `marketing`, `presentation`, `application`); `tokens/products/` is now `tokens/situations/`, with the former product overrides redistributed (blog-page → literary, product-home-page → marketing, presentation unchanged; document-viewer's role is carried by the application sample).
- **One stylesheet.** `dist/<product>/tokens.css` is replaced by a single `dist/tokens.css`: a base `:root` block plus one `[data-situation="…"]` delta block per situation, computed at build time by diffing each situation's resolved values against base. Consumers import `dist/tokens.css`, declare `data-situation` on `<body>` (or `<html>`), and may re-scope any region; situations mix per-region on one page.
- Per-product sample pages are replaced by `dist/samples/<situation>.html`, `dist/preview/<situation>.html`, a situations index (`dist/index.html`), and a mixing demo (`dist/mixing.html`). The reveal.js kit stays under `dist/presentation/` and now carries its own copy of `tokens.css`; decks must declare `data-situation="presentation"` on `<html>`.
- `scripts/advise-color.js` flag `--product` is now `--situation`; contrast gates run for base plus every situation × mode.

### Added

- `dist/base.css` — three cascade layers: `sax-diagnostic` (a page with no declared situation renders unmistakably broken, by design), plus `sax-reset` and `sax-base` (classless element styles over the tokens), both scoped to `[data-situation]`. Unlayered consumer rules always win.
- Layout roles: `container.max`, `container.gutter` (per-situation content measure; primitive `dimension.container` steps 44/56/70) and `rhythm.flow`, `rhythm.section` (prose rhythm — situations vary these instead of remapping the spacing scale).
- Disabled-state roles ([ADR](decisions/2026-07-19-disabled-state.md)): semantic `color.text.disabled`, `color.background.disabled`, `color.border.disabled`; component `button.disabled.*` and `input.disabled.*`. Disabled pairings are exempt from the APCA gates by recorded decision.
- `decisions/` (ADR record and process), `patterns/` (ADR-gated pattern library scaffold), and the `sax-designer` skill, shipped to consumers via the package `files` field together with `config/` and `patterns/`.
- The Hugo example now demonstrates situation mixing: home declares `marketing`, blog pages `literary`, and the theme's content measure follows `--container-max`.

## [0.3.1] - 2026-07-17

### Fixed

- The `effect`/shadow tier shipped in `tokens.css` but was invisible to the README generator and the Storybook catalog (both are category-aware), so `elevation.*` was absent from the docs and had no catalog preview while `annotation.*` appeared. `scripts/build-docs.js` now emits an Effect table; `stories/lib/catalog.js` gains an `effect` section, a shadow swatch renderer, and the `document-viewer` product, and every product gets an Effect story plus a `document-viewer` catalog page.

### Added

- `CLAUDE.md` "Extending the system" checklist — every file to touch when adding a token type, tier file, prefix, or product, so a new category can't be left out of the README lists and the catalog again (the three-surface definition of done: `dist` + README + catalog).

## [0.3.0] - 2026-07-17

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

[Unreleased]: https://github.com/stevegsax/sax-design-system/compare/v1.0.3...HEAD
[1.0.3]: https://github.com/stevegsax/sax-design-system/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/stevegsax/sax-design-system/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/stevegsax/sax-design-system/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/stevegsax/sax-design-system/compare/v0.4.0...v1.0.0
[0.4.0]: https://github.com/stevegsax/sax-design-system/compare/v0.3.1...v0.4.0
[0.3.1]: https://github.com/stevegsax/sax-design-system/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/stevegsax/sax-design-system/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/stevegsax/sax-design-system/compare/v0.1.1...v0.2.0
[0.1.1]: https://github.com/stevegsax/sax-design-system/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/stevegsax/sax-design-system/releases/tag/v0.1.0
