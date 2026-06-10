# sax-design-system

Design tokens for SAX Capital products. DTCG 2025.10 JSON is the source of truth; Style Dictionary v5 transforms it into deployable CSS per product.

## Layout

```text
├── tokens/                  Source of truth (DTCG 2025.10 format)
│   ├── primitive/           OKLCH tonal ramps, spacing/type scales, font stacks
│   ├── semantic/            Role tokens: color per mode (light, dark); dimension and typography mode-agnostic
│   ├── component/           Component tokens, mode-agnostic, reference semantic roles
│   └── products/<name>/     Override sets per product (common + per-mode)
├── config/
│   ├── matrix.json          Product × mode matrix; drives resolver generation
│   └── contrast-pairs.json  APCA Lc gates checked on every build
├── resolvers/               Generated DTCG resolver documents (do not edit)
├── schemas/                 Vendored official DTCG 2025.10 JSON schemas
├── scripts/                 Resolver generation, build, color checks
└── dist/<product>/          Generated CSS + preview page (gitignored; built on publish)
```

## Token tiers

Consumers use **component tokens** first (`--button-primary-background`), **semantic tokens** as a fallback (`--color-text-heading`), and never primitives — primitive ramps are excluded from the CSS output. Tokens are named by role, never by value.

Overrides only remap references. A primitive change propagates everywhere because nothing redeclares palette values.

## Color model

- Palettes are OKLCH tonal ramps; step number = OKLCH lightness × 100.
- Brand ramp chroma is gamut-proportional: `min(0.17, 0.85 × sRGB gamut max)` at each lightness, hue 250.
- Every color token carries the full structured value (`colorSpace`, `components`, `alpha`) plus a `hex` fallback; the build verifies the fallback matches the components.
- Contrast is gated with [APCA](https://github.com/Myndex/apca-w3) per the [APCA Readability Criterion](https://readtech.org/ARC/): Lc 75 body text, 60 headings/labels, 45 non-text. Pairs are declared in `config/contrast-pairs.json` and checked for every product × mode.

## Build

```sh
npm run build
```

1. `generate:resolvers` — emits one resolver per cell of the product × mode matrix (jq, from `config/matrix.json`).
2. `validate` — ajv validates token files against the DTCG format schema and resolvers against the resolver schema.
3. `check:color` — hex-fallback consistency + APCA contrast gates. Fails the build on violation.
4. `build:tokens` — one Style Dictionary build per resolver; each product's light and dark resolutions are merged into a single `dist/<product>/tokens.css` using `light-dark()` (no separate mode artifacts, no `prefers-color-scheme` blocks). Mode-invariant tokens (dimensions, typography) emit as plain values; typography composites emit as CSS `font` shorthand, e.g. `font: var(--typography-body)`.
5. `build:preview` — emits `dist/<product>/preview.html`, a static page that renders every token: primitive ramps, color roles in side-by-side light/dark panels (via `color-scheme`), dimension and typography scales, and component specimens.
6. `build:home` — emits `dist/product-home-page/home.html`, a sample marketing page built exclusively from the emitted custom properties; a realistic smoke test of the tokens in a real layout.
7. `build:blog` — emits `dist/blog-page/blog.html`, a sample blog index with posts (tags, blockquote, code block) under the same constraint: token custom properties only.

To add a product or mode, edit `config/matrix.json` and add the corresponding override files under `tokens/products/`.

## Consuming

Products pin a version of this package and import the CSS for their product:

```css
@import '@sax/design-tokens/dist/product-home-page/tokens.css';
```

The stylesheet sets `color-scheme: light dark`; mode follows the OS/page preference automatically. Releases follow semver: palette value changes are patch/minor; renaming or removing a token is a breaking change.

All tooling is pinned to exact versions (`.npmrc` sets `save-exact`) so rebuilding never produces diff noise from a floating transform tool.
