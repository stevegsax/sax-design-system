# sax-design-system

> This repository is the SAX Capital design system: one versioned source for the colors, spacing, and typography shared by SAX products.

Each design decision is recorded once as a design token — a named value like `color.text.heading` — in [DTCG 2025.10](https://www.designtokens.org/tr/2025.10/format/) JSON, and [Style Dictionary v5](https://styledictionary.com/) transforms those tokens into one deployable stylesheet serving five *reading situations* (see below). Products pin a version of this package, so a change made here (a palette adjustment, a new spacing step) reaches every product on its next dependency update, with accessibility verified by the build before anything ships.

## Installing

After cloning this repository:

- run `npm run build` to regenerate the values and components.
- Check the [example pages](dist/index.html)
- To see the individual token values, run `npm run storybook`. This will start a server and open a page in your browser showing the tokens.

## Changing the system

After any change to `tokens/**`, `config/`, or `scripts/`, rebuild and verify:

```sh
npm run build          # resolvers → schema validation → color + APCA gates → dist/, README tables
npm run test:visual    # Storybook catalog and patterns vs committed baselines (macOS only)
```

`npm run build` regenerates every committed artifact (`resolvers/`, `dist/`, the README token tables) — commit them together with the source change. A token is not added until it appears in `dist/tokens.css`, the tables below, **and** the Storybook catalog. If a visual diff is intentional, inspect `test-results/`, then `npm run test:visual:update` and commit the new baselines.

Review these files for compliance before any release:

- `decisions/` — every token, pattern, or standard change has an ADR, with status set per `decisions/README.md`. No ADR, no change.
- `config/contrast-pairs.json` — every text or indicator pairing is APCA-gated (Lc 75 body, 60 labels, 45 non-text); the build fails on a breach, but *unlisted* pairings pass silently — the review is checking that new pairings are listed.
- `guidelines/brand.md` — voice and the mechanical rules (sentence case, no emoji, no exclamation marks, formal punctuation) for any copy in patterns, samples, or docs.
- `skills/sax-designer/SKILL.md` — re-read end to end against the change before `npm version`: it is the one consumer-facing artifact with no build gate, and its examples drift silently when a release fills a gap they describe.

### Reviewing visually

The files above are gates; the design itself is reviewed by looking at it:

1. **Live catalog** — `npm run storybook` (localhost:6006): every situation ×
   token category plus a Patterns story per situation, light and dark side by
   side. The fastest place to see a change in every context it touches.
2. **Pixel diffs** — run `npm run test:visual` *before* updating baselines.
   Every story that changed fails and captures expected / actual / diff
   images; `npx playwright show-report` opens them per story with
   side-by-side and slider views. Look at every diff — a story you didn't
   expect in the failure list is the review catching a side effect.
3. **In context** — `open dist/index.html` for the situations index and
   sample pages, `dist/preview/<situation>.html` for the rendered token
   catalog, `dist/mixing.html` for situations nested on one page,
   `dist/presentation/presentation.html` for the deck.
4. **Accept** — only after 1–3: `npm run test:visual:update`, commit the new
   baselines with the change, and review them once more as image diffs in
   the PR (GitHub renders 2-up / swipe / onion-skin) — the reviewer's second
   look.

## Using the tokens

Depend on this repository at a release tag — the tag is the version pin:

```json
"dependencies": {
  "@sax/design-system": "git+https://github.com/stevegsax/sax-design-system.git#v1.0.3"
}
```

`dist/` is committed and prebuilt, so installing needs no toolchain. Import the system stylesheet and the base layer, then declare a reading situation:

```css
@import '@sax/design-system/dist/tokens.css';
@import '@sax/design-system/dist/base.css';
```

```html
<body data-situation="application">
```

Every page declares its primary situation on `<body>` (or `<html>`); any region may re-scope with its own `data-situation`. A page that declares none renders deliberately, unmistakably broken — an unclassified page is a bug, not a default. `base.css` provides the reset and classless element styles (scoped to declared situations; unlayered consumer rules always win); `tokens.css` is custom properties only and never changes rendering by itself.

Style with the custom properties. Reach for **component tokens** first; where none exists for your case, fall back to **semantic tokens**:

```css
.confirm-button {
  background: var(--button-primary-background);
  color: var(--button-primary-text);
  border-radius: var(--button-radius);
  padding: var(--button-padding-block) var(--button-padding-inline);
  font: var(--button-label-font);
}

.empty-state {
  /* no empty-state component tokens yet — use semantic roles */
  background: var(--color-background-inset);
  color: var(--color-text-muted);
  padding: var(--space-lg);
  font: var(--typography-body);
}
```

Rules of the road:

- Never hard-code a color, size, or font that a token covers. If the token you need is missing, request it here rather than inlining a value — that is how the system stays propagating.
- Typography tokens are CSS `font` shorthand values: `font: var(--typography-body)`.
- Light and dark mode need no code: every color is a `light-dark()` pair and the stylesheet sets `color-scheme: light dark`, so the browser follows the OS/page preference. To force a mode on a subtree, set `color-scheme: light` (or `dark`) on its container.
- Releases follow semver: palette value changes are patch/minor; renaming or removing a token is a breaking change. Move your pin deliberately.
- See `dist/preview/<situation>.html` for a rendered catalog of every token as that situation resolves it, `dist/index.html` for the situations index, and `dist/mixing.html` for several situations coexisting on one page.

## Reading situations

The consumption axis is the *reading situation* — how the user reads the page, not which product renders it ([ADR](decisions/2026-07-20-reading-situations.md)):

| Situation | Reading behavior | Sample |
| --- | --- | --- |
| `literary` | Linear long-form reading; book measure; links de-emphasized until hover | `dist/samples/literary.html` |
| `documentation` | Skim and jump; airier rhythm; visible links, lists, code, tables | `dist/samples/documentation.html` |
| `marketing` | Visual impact; wide stage; engagement over density | `dist/samples/marketing.html` |
| `presentation` | One idea per surface; reveal.js kit; true-black dark | `dist/presentation/presentation.html` |
| `application` | Dense, interactive tool chrome: forms, tables, navigation | `dist/samples/application.html` |

One stylesheet serves all five: `tokens.css` holds a base `:root` block plus one small delta block per situation under `[data-situation="…"]`. Situations may remap only the roles in the situation contract (page/inset backgrounds, `card.border`, `container.*`, `rhythm.*`, typography leading); everything else — brand hue, status colors, control styling, the spacing scale — is identity and stays uniform. Mixing is per-region: wrap any element in `data-situation` and its subtree re-resolves.

## Migrating from v0.3.x

v0.3.x shipped one stylesheet per product (`dist/<product>/tokens.css`); those files no longer exist. Three steps restore your exact previous rendering:

1. **Replace the import.** One old import line becomes two:

   ```css
   /* before */
   @import '@sax/design-system/dist/product-home-page/tokens.css';
   /* after */
   @import '@sax/design-system/dist/tokens.css';
   @import '@sax/design-system/dist/base.css';
   ```

2. **Declare the situation your product's old stylesheet mapped to** on `<body>` (or `<html>`):

   | v0.3.x import | Declare |
   | --- | --- |
   | `dist/product-home-page/tokens.css` | `data-situation="marketing"` |
   | `dist/blog-page/tokens.css` | `data-situation="literary"` |
   | `dist/presentation/tokens.css` | `data-situation="presentation"` (on `<html>`; see below) |
   | `dist/document-viewer/tokens.css` | `data-situation="application"` |

3. **Verify.** Open the page: a magenta striped banner means the attribute is missing (that failure is deliberate). Compare against `dist/samples/` if anything looks off.

No `var()` usage changes: every v0.3.x custom property still exists, and under the mapped situation each one resolves to the identical value your old product stylesheet shipped (verified against the v0.3.1 builds during this release). The values your product build used to bake in — blog's tinted page, home's pure white — now live in the situation's delta block, which is why the attribute is not optional: with `base.css` a missing attribute renders loudly broken, and without `base.css` it silently drifts to the base values.

Notes:

- `base.css` also carries a reset and classless element styles, all inside `@layer`, so your existing unlayered CSS always wins. Keep your own reset through the migration and delete it at leisure.
- **Presentation decks:** re-copy the kit directory (it still carries its own `tokens.css`) and add `data-situation="presentation"` to `<html>` — without it the true-black dark page is gone. Stylesheet link order is unchanged.
- Token previews moved from `dist/<product>/preview.html` to `dist/preview/<situation>.html`.
- If you copied the `sax-designer` skill, re-copy it after moving the pin (see below).
- New in this version, adopt when convenient: `--container-max`/`--container-gutter` (replace hardcoded page measures), `--rhythm-flow`/`--rhythm-section`, and the disabled-state tokens (`--button-disabled-*`, `--input-disabled-*`, `--color-text-disabled`, …).

### Guides

`guidelines/building-pages.md` — composing a page from tokens, base
element styles, and patterns (the decision ladder, situations, modes,
where to crib layout). `guidelines/adding-components.md` — how a new
component or standard enters the system via ADR, with worked examples.
`guidelines/brand.md` — ratified voice, copy, and visual-restraint
standards.

### Designing mockups (sax-designer skill)

The package ships a Claude Code skill that turns design requests ("design a
settings page", "add a collapsible sidebar") into token-compliant HTML mockups
in your product repo. One-time setup, repeated whenever you move the version pin:

```sh
mkdir -p .claude/skills
cp -R node_modules/@sax/design-system/skills/sax-designer .claude/skills/
```

Mockups land in `mockups/<slug>/index.html` — each links `dist/tokens.css`
and `dist/base.css`, declares `data-situation` on `<body>` (regions may
re-scope), styles only with the token custom properties, and opens in your
browser. When a design needs a token, pattern, or
standard the system lacks, the skill styles the gap provisionally, files an ADR
to this repository (`decisions/`), and moves on; a design review here approves
and releases the change, after which the product bumps its pin and the
provisional styling is replaced.

### Claude Designer (claude.ai design project)

The design system is mirrored to a claude.ai **design-system project**
("SAX Capital Design System") that the Designer tool reads: browsable
cards for every pattern, token specimen, slide, and application prototype,
plus React components, templates, and the guides. The repository is the
source of truth — the mirror is generated, and every file except the
app-managed ones (`_ds_bundle.js`, `_ds_manifest.json` is regenerated too
but by our script, `support.js`, thumbnails) is overwritten on sync.
Never edit the project directly on claude.ai.

Package, verify, upload:

```sh
node scripts/build-design-sync.js <out-dir>    # 1. assemble the upload bundle from repo artifacts
node scripts/check-design-sync.js <out-dir>    # 2. render gate: every card in headless Chromium
# 3. upload: in a Claude Code session, ask to "sync the design-system mirror"
```

Step 1 builds the complete bundle: the shipped `tokens.css` (verbatim) and
`base.css`, specimen-only primitive ramps, `@dsCard` preview cards for
patterns/specimens/slides/UI kits/prototypes, the React component sources,
Design Component templates, guides, the skill, and `_ds_manifest.json` —
the derived index the Designer pane actually renders from (card list,
token panel, and the global CSS it injects into card renders). Step 2
fails on 404s, JS errors, the missing-situation diagnostic, or unresolved
token variables — do not upload a failing bundle. Step 3 uses the
DesignSync tool through your claude.ai login (finalize a plan, then write
files from the bundle directory); it is incremental, so re-syncs upload
only what changed.

Sync after every release, and after any change to patterns, prototypes,
guides, or the skill — the mirror drifts silently otherwise (it has no
pin to move).

### Presentations

`dist/presentation/` is a complete [reveal.js](https://revealjs.com/) kit: `reveal.js`, `reset.css`, `reveal.css` (structure: slide positioning, transitions, fragments), `tokens.css` (the custom properties), and `theme.css` (the theme layer). reveal's structural CSS reads almost none of the `--r-*` variables itself — the theme layer is what maps them onto the token custom properties and applies them, so a deck without it falls back to reveal's hardcoded white viewport and the reset's zeroed margins. Copy or serve the directory (a browser cannot resolve bare package paths) and link all four stylesheets, in this order:

```html
<link rel="stylesheet" href="reset.css">
<link rel="stylesheet" href="reveal.css">
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="theme.css">
```

The deck must declare `data-situation="presentation"` on `<html>` — the situation's token deltas (including the true-black dark page) are scoped to that attribute. `theme.css` follows reveal.js's [theme-authoring convention](https://github.com/hakimel/reveal.js/blob/master/css/theme/README.md): a `:root` block of `--r-*` settings mapped to token custom properties, applied across the elements reveal's template covers (headings `h1`–`h6`, lists, code, blockquote, tables, selection, controls). For syntax-highlighted code, the kit also ships reveal's highlight plugin (`highlight.js`) with a token-driven highlight.js theme (`highlight.css`) — link it after `theme.css`, load the plugin, and register `RevealHighlight`. `dist/presentation/presentation.html` is a sample deck built this way. For the design decisions behind the theme — and how to verify a change by rendering — see `tokens/situations/presentation/README.md`.

### Hugo theme

`examples/hugo-theme/` is a [Hugo](https://gohugo.io/) theme styled entirely from the token custom properties — a worked example of consuming `tokens.css` in a static site, with no Sass or token toolchain. It renders the SAX Capital marketing home, a reverse-chronological blog index, and post pages. Run the bundled demo with `cd examples/hugo-theme/exampleSite && hugo server --themesDir ../..`. See `examples/hugo-theme/README.md` for layout and the tokens.css provenance note. Unlike `dist/`, this is hand-authored consumer code, so it is not regenerated by the build.

## Layout

```text
├── tokens/                  Source of truth (DTCG 2025.10 format)
│   ├── primitive/           OKLCH tonal ramps (color generated from config/ramps.json), spacing/type scales, font stacks
│   ├── semantic/            Role tokens: color per mode (light, dark); dimension and typography mode-agnostic
│   ├── component/           Component tokens, mode-agnostic, reference semantic roles
│   └── situations/<name>/   Override sets per reading situation (common + per-mode)
├── config/
│   ├── ramps.json           Primitive color ramp spec (hue + chroma rule); generates primitive/color.tokens.json
│   ├── matrix.json          Situation × mode matrix; drives resolver generation
│   └── contrast-pairs.json  APCA Lc gates checked on every build
├── decisions/               ADRs — every style-system change is proposed and recorded here
├── patterns/                Page-level pattern library shipped to consumers (ADR-gated)
├── guidelines/              Brand standards and how-to guides (brand, building-pages, adding-components)
├── resolvers/               Generated DTCG resolver documents (do not edit)
├── schemas/                 Vendored official DTCG 2025.10 JSON schemas
├── scripts/                 Resolver generation, build, color checks
├── dist/                    Generated output (committed; consumers install prebuilt)
│   ├── tokens.css           Base :root + per-situation [data-situation] delta blocks
│   ├── base.css             Diagnostic, reset, and classless base layers
│   ├── index.html           Situations index; mixing.html — several situations on one page
│   ├── preview/             Token catalog per situation
│   ├── samples/             Sample page per situation
│   └── presentation/        Self-contained reveal.js kit
└── examples/hugo-theme/     Hand-authored Hugo theme consuming tokens.css (not generated)
```

## Token tiers

Consumers use **component tokens** first (`--button-primary-background`), **semantic tokens** as a fallback (`--color-text-heading`), and never primitives — primitive ramps are excluded from the CSS output. Tokens are named by role, never by value.

Overrides (situation sets, mode files) only remap references. A primitive change propagates everywhere because nothing redeclares palette values.

## Component tokens

The preferred tier for consumers. Every component token is a reference into the semantic tier, so component styling follows mode and situation overrides automatically. Regenerated by `npm run build` (`build:docs`) from `tokens/component/` — do not edit by hand.

<!-- generated:component-tokens -->

| Token | CSS custom property | References |
| --- | --- | --- |
| `annotation.highlight` | `--annotation-highlight` | `{color.highlight.90}` |
| `annotation.selected` | `--annotation-selected` | `{color.marker.70}` |
| `annotation.selection-bar-surface` | `--annotation-selection-bar-surface` | `{color.neutral.20}` |
| `annotation.selection-bar-text` | `--annotation-selection-bar-text` | `{color.neutral.98}` |
| `button.disabled.background` | `--button-disabled-background` | `{color.background.disabled}` |
| `button.disabled.text` | `--button-disabled-text` | `{color.text.disabled}` |
| `button.label-font` | `--button-label-font` | `{typography.label}` |
| `button.padding-block` | `--button-padding-block` | `{space.xs}` |
| `button.padding-inline` | `--button-padding-inline` | `{space.md}` |
| `button.primary.background` | `--button-primary-background` | `{color.accent.default}` |
| `button.primary.background-active` | `--button-primary-background-active` | `{color.accent.active}` |
| `button.primary.background-hover` | `--button-primary-background-hover` | `{color.accent.hover}` |
| `button.primary.text` | `--button-primary-text` | `{color.text.on-accent}` |
| `button.radius` | `--button-radius` | `{radius.md}` |
| `button.secondary.background` | `--button-secondary-background` | `{color.background.surface}` |
| `button.secondary.border` | `--button-secondary-border` | `{color.border.strong}` |
| `button.secondary.text` | `--button-secondary-text` | `{color.text.link}` |
| `callout.background` | `--callout-background` | `{color.background.inset}` |
| `callout.body-font` | `--callout-body-font` | `{typography.body}` |
| `callout.border-width` | `--callout-border-width` | `{border-width.default}` |
| `callout.caution.border` | `--callout-caution-border` | `{color.status.danger.text}` |
| `callout.caution.title` | `--callout-caution-title` | `{color.status.danger.text}` |
| `callout.important.border` | `--callout-important-border` | `{color.accent.default}` |
| `callout.important.title` | `--callout-important-title` | `{color.text.link}` |
| `callout.note.border` | `--callout-note-border` | `{color.border.default}` |
| `callout.note.title` | `--callout-note-title` | `{color.text.heading}` |
| `callout.padding-block` | `--callout-padding-block` | `{space.sm}` |
| `callout.padding-inline` | `--callout-padding-inline` | `{space.md}` |
| `callout.radius` | `--callout-radius` | `{radius.md}` |
| `callout.tip.border` | `--callout-tip-border` | `{color.status.success.text}` |
| `callout.tip.title` | `--callout-tip-title` | `{color.status.success.text}` |
| `callout.title-font` | `--callout-title-font` | `{typography.label}` |
| `callout.warning.border` | `--callout-warning-border` | `{color.status.warning.text}` |
| `callout.warning.title` | `--callout-warning-title` | `{color.status.warning.text}` |
| `card.background` | `--card-background` | `{color.background.surface}` |
| `card.border` | `--card-border` | `{color.border.default}` |
| `card.padding` | `--card-padding` | `{space.lg}` |
| `card.radius` | `--card-radius` | `{radius.lg}` |
| `input.background` | `--input-background` | `{color.background.surface}` |
| `input.border` | `--input-border` | `{color.border.strong}` |
| `input.border-focus` | `--input-border-focus` | `{color.border.focus}` |
| `input.border-width` | `--input-border-width` | `{border-width.default}` |
| `input.border-width-focus` | `--input-border-width-focus` | `{border-width.focus}` |
| `input.disabled.background` | `--input-disabled-background` | `{color.background.disabled}` |
| `input.disabled.border` | `--input-disabled-border` | `{color.border.disabled}` |
| `input.disabled.text` | `--input-disabled-text` | `{color.text.disabled}` |
| `input.label-font` | `--input-label-font` | `{typography.label}` |
| `input.padding-block` | `--input-padding-block` | `{space.xs}` |
| `input.padding-inline` | `--input-padding-inline` | `{space.sm}` |
| `input.placeholder` | `--input-placeholder` | `{color.text.muted}` |
| `input.radius` | `--input-radius` | `{radius.sm}` |
| `input.text` | `--input-text` | `{color.text.body}` |
| `input.value-font` | `--input-value-font` | `{typography.body}` |
| `link.text` | `--link-text` | `{color.text.link}` |
| `link.text-hover` | `--link-text-hover` | `{color.accent.active}` |
| `shell.sidebar-width` | `--shell-sidebar-width` | `{dimension.container.18}` |
| `tag.background` | `--tag-background` | `{color.accent.subtle}` |
| `tag.label-font` | `--tag-label-font` | `{typography.caption}` |
| `tag.padding-block` | `--tag-padding-block` | `{space.2xs}` |
| `tag.padding-inline` | `--tag-padding-inline` | `{space.xs}` |
| `tag.radius` | `--tag-radius` | `{radius.full}` |
| `tag.text` | `--tag-text` | `{color.text.link}` |

<!-- /generated:component-tokens -->

## Semantic tokens

The fallback tier when no component token fits. Regenerated by `build:docs` from `tokens/semantic/` — do not edit by hand. See `dist/preview/<situation>.html` for the rendered catalog.

<!-- generated:semantic-tokens -->

### Color (mapped per mode)

| Token | CSS custom property | Light | Dark |
| --- | --- | --- | --- |
| `color.background.page` | `--color-background-page` | `{color.neutral.98}` | `{color.neutral.10}` |
| `color.background.surface` | `--color-background-surface` | `{color.neutral.100}` | `{color.neutral.15}` |
| `color.background.surface-raised` | `--color-background-surface-raised` | `{color.neutral.100}` | `{color.neutral.20}` |
| `color.background.inset` | `--color-background-inset` | `{color.neutral.95}` | `{color.neutral.5}` |
| `color.background.disabled` | `--color-background-disabled` | `{color.neutral.95}` | `{color.neutral.20}` |
| `color.text.heading` | `--color-text-heading` | `{color.neutral.10}` | `{color.neutral.95}` |
| `color.text.body` | `--color-text-body` | `{color.neutral.20}` | `{color.neutral.90}` |
| `color.text.muted` | `--color-text-muted` | `{color.neutral.40}` | `{color.neutral.80}` |
| `color.text.disabled` | `--color-text-disabled` | `{color.neutral.60}` | `{color.neutral.50}` |
| `color.text.on-accent` | `--color-text-on-accent` | `{color.neutral.100}` | `{color.brand.15}` |
| `color.text.link` | `--color-text-link` | `{color.brand.40}` | `{color.brand.80}` |
| `color.border.default` | `--color-border-default` | `{color.neutral.80}` | `{color.neutral.30}` |
| `color.border.strong` | `--color-border-strong` | `{color.neutral.60}` | `{color.neutral.50}` |
| `color.border.disabled` | `--color-border-disabled` | `{color.neutral.80}` | `{color.neutral.30}` |
| `color.border.focus` | `--color-border-focus` | `{color.brand.50}` | `{color.brand.80}` |
| `color.accent.default` | `--color-accent-default` | `{color.brand.50}` | `{color.brand.80}` |
| `color.accent.hover` | `--color-accent-hover` | `{color.brand.40}` | `{color.brand.90}` |
| `color.accent.active` | `--color-accent-active` | `{color.brand.30}` | `{color.brand.70}` |
| `color.accent.subtle` | `--color-accent-subtle` | `{color.brand.95}` | `{color.brand.20}` |
| `color.status.success.text` | `--color-status-success-text` | `{color.success.40}` | `{color.success.90}` |
| `color.status.success.background` | `--color-status-success-background` | `{color.success.95}` | `{color.success.20}` |
| `color.status.success.border` | `--color-status-success-border` | `{color.success.80}` | `{color.success.30}` |
| `color.status.warning.text` | `--color-status-warning-text` | `{color.warning.40}` | `{color.warning.90}` |
| `color.status.warning.background` | `--color-status-warning-background` | `{color.warning.95}` | `{color.warning.20}` |
| `color.status.warning.border` | `--color-status-warning-border` | `{color.warning.80}` | `{color.warning.30}` |
| `color.status.danger.text` | `--color-status-danger-text` | `{color.danger.40}` | `{color.danger.90}` |
| `color.status.danger.background` | `--color-status-danger-background` | `{color.danger.95}` | `{color.danger.20}` |
| `color.status.danger.border` | `--color-status-danger-border` | `{color.danger.80}` | `{color.danger.30}` |

### Dimension

| Token | CSS custom property | Value |
| --- | --- | --- |
| `space.2xs` | `--space-2xs` | `{dimension.scale.1}` |
| `space.xs` | `--space-xs` | `{dimension.scale.2}` |
| `space.sm` | `--space-sm` | `{dimension.scale.3}` |
| `space.md` | `--space-md` | `{dimension.scale.4}` |
| `space.lg` | `--space-lg` | `{dimension.scale.6}` |
| `space.xl` | `--space-xl` | `{dimension.scale.8}` |
| `space.2xl` | `--space-2xl` | `{dimension.scale.12}` |
| `space.3xl` | `--space-3xl` | `{dimension.scale.16}` |
| `radius.sm` | `--radius-sm` | `{dimension.scale.1}` |
| `radius.md` | `--radius-md` | `{dimension.scale.2}` |
| `radius.lg` | `--radius-lg` | `{dimension.scale.3}` |
| `radius.full` | `--radius-full` | `{dimension.max}` |
| `border-width.default` | `--border-width-default` | `{dimension.line.1}` |
| `border-width.thick` | `--border-width-thick` | `{dimension.line.2}` |
| `border-width.focus` | `--border-width-focus` | `{dimension.line.2}` |
| `container.max` | `--container-max` | `{dimension.container.56}` |
| `container.gutter` | `--container-gutter` | `{space.lg}` |
| `rhythm.flow` | `--rhythm-flow` | `{dimension.scale.4}` |
| `rhythm.section` | `--rhythm-section` | `{dimension.scale.12}` |

### Typography

Composite roles; the table shows the scale positions each role draws from. All use `{font.family.sans}` except `typography.code` (`{font.family.mono}`).

| Token | CSS custom property | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
| `typography.heading-1` | `--typography-heading-1` | `{font.size.800}` | `{font.weight.bold}` | `{font.line-height.tight}` |
| `typography.heading-2` | `--typography-heading-2` | `{font.size.700}` | `{font.weight.semibold}` | `{font.line-height.tight}` |
| `typography.heading-3` | `--typography-heading-3` | `{font.size.600}` | `{font.weight.semibold}` | `{font.line-height.snug}` |
| `typography.body` | `--typography-body` | `{font.size.300}` | `{font.weight.regular}` | `{font.line-height.normal}` |
| `typography.body-small` | `--typography-body-small` | `{font.size.200}` | `{font.weight.regular}` | `{font.line-height.normal}` |
| `typography.label` | `--typography-label` | `{font.size.200}` | `{font.weight.medium}` | `{font.line-height.snug}` |
| `typography.caption` | `--typography-caption` | `{font.size.100}` | `{font.weight.regular}` | `{font.line-height.snug}` |
| `typography.code` | `--typography-code` | `{font.size.200}` | `{font.weight.regular}` | `{font.line-height.normal}` |

### Effect

Composite box-shadows (`$type: shadow`). Mode-agnostic — identical in light and dark, because `light-dark()` cannot wrap a box-shadow string. The color is a translucent near-black; the table shows each layer's `offsetX offsetY blur spread @alpha`.

| Token | CSS custom property | Layers |
| --- | --- | --- |
| `elevation.sm` | `--elevation-sm` | `0px 1px 2px 0px @12%` |
| `elevation.md` | `--elevation-md` | `0px 2px 8px 0px @16% + 0px 1px 2px 0px @12%` |

<!-- /generated:semantic-tokens -->

## Color model

- Palettes are OKLCH tonal ramps; step number = OKLCH lightness × 100.
- The brand ramp is anchored to the SAX logo blue (`color.brand.anchor`, `#005A9C`, OKLCH hue 249.6). The anchor is a maximal-chroma blue, so the ramp's chroma curve follows the sRGB gamut ceiling: `min(0.17, gamut max)` at each lightness. Status ramps remain gamut-proportional at `min(0.17, 0.85 × gamut max)`.
- Every color token carries the full structured value (`colorSpace`, `components`, `alpha`) plus a `hex` fallback; the build verifies the fallback matches the components.
- Contrast is gated with [APCA](https://github.com/Myndex/apca-w3) per the [APCA Readability Criterion](https://readtech.org/ARC/): Lc 75 body text, 60 headings/labels, 45 non-text. Pairs are declared in `config/contrast-pairs.json` and checked for base plus every situation × mode. Disabled controls are exempt by recorded decision.

## Build

```sh
npm run build
```

1. `check:ramps` — verifies `tokens/primitive/color.tokens.json` still matches `config/ramps.json`. Fails the build if a primitive color was hand-edited instead of regenerated.
2. `generate:resolvers` — emits one resolver per cell of the situation × mode matrix, plus `base.<mode>` resolvers for the shared resolution (jq, from `config/matrix.json`).
3. `validate` — ajv validates token files against the DTCG format schema and resolvers against the resolver schema.
4. `check:color` — hex-fallback consistency + APCA contrast gates, per base and situation × mode. Fails the build on violation.
5. `build:tokens` — one Style Dictionary resolution per resolver; light and dark merge into `light-dark()` values, then each situation's resolved values are diffed against base and emitted as a `[data-situation]` delta block in the single `dist/tokens.css`. Mode-invariant tokens emit as plain values; typography composites emit as CSS `font` shorthand, e.g. `font: var(--typography-body)`.
6. `build:base` — emits `dist/base.css`: the `sax-diagnostic` layer (a page with no declared situation renders unmistakably broken), plus `sax-reset` and `sax-base` (classless element styles over the tokens), both scoped to `[data-situation]`.
7. `build:preview` — emits `dist/preview/<situation>.html`, a static catalog per situation: primitive ramps, color roles in side-by-side light/dark panels (via `color-scheme`), dimension and typography scales, and component specimens.
8. `build:samples` — emits `dist/samples/<situation>.html` (marketing page, literary essay, documentation page, application workspace), the situations index (`dist/index.html`), and the mixing demo (`dist/mixing.html`) — all built exclusively from the emitted custom properties and `base.css`, each declaring its situation.
9. `build:presentation` — emits `dist/presentation/theme.css`, the reveal.js theme layer (maps reveal's `--r-*` variables onto the token custom properties and consumes them — reveal's own CSS is structure only), and `presentation.html`, a sample deck that links it. The kit carries its own copy of `tokens.css` so the directory stays self-contained. reveal.js is pinned and vendored from npm.
10. `build:docs` — regenerates the semantic and component token lists in this README from `tokens/semantic/` and `tokens/component/`.

To change the color palette, edit the hues and chroma rules in `config/ramps.json` and run `npm run generate:ramps` (never hand-edit `tokens/primitive/color.tokens.json` — `check:ramps` will reject it). To add a situation or mode, edit `config/matrix.json` and add the corresponding override files under `tokens/situations/`.

All tooling is pinned to exact versions (`.npmrc` sets `save-exact`) so rebuilding never produces diff noise from a floating transform tool.

## Releasing

`dist/` is committed; a release is a version bump plus a git tag:

```sh
npm run build          # regenerate and verify everything
git commit ...         # commit the token change together with dist/
npm version patch      # or minor / major per the semver contract
git push --follow-tags
```

`npm version` runs the build again after bumping (so generated headers carry the new version), stages the regenerated artifacts into the tag commit, and creates the `vX.Y.Z` tag that consumers pin. The package stays `private: true` — it is consumed as a git dependency, never published to a registry.

## Starting a new design system from this repo

This repo doubles as the starting point for a new design system. There is no copier template, rename script, or template branch: clone it, keep this repo as `upstream`, and edit tokens. The new project is a token-development sandbox, so the SAX names and demo copy are left in place — they are scaffolding, not output. The only branded artifacts are the logo SVGs in `static-assets/logos/`; replace those when the sandbox renders UI you care about.

Clone with this repo's remote named `upstream`, then create your own repo as `origin`:

```sh
git clone -o upstream https://github.com/stevegsax/sax-design-system.git my-design-system
cd my-design-system
gh repo create <owner>/my-design-system --private --source=. --remote=origin --push
```

`gh ... --push` sets `main` to track `origin/main`, so `git push` and `git pull` default to your repo. Disable pushing to `upstream` so commits can never land here by accident:

```sh
git remote set-url --push upstream DISABLED
git branch -vv        # confirm main tracks origin/main, not upstream/main
```

Pull pipeline improvements (schemas, color checks, build scripts) from this repo whenever you want them:

```sh
git pull upstream main        # conflicts, when any, are confined to tokens you diverged
```

Then set the palette. Edit the hues, chroma rules, and brand `anchor` in `config/ramps.json` and run `npm run generate:ramps` — never hand-write `tokens/primitive/color.tokens.json`; `check:ramps` rejects any drift from the spec, and `check:color` separately verifies every hex fallback against its OKLCH components. The clone is sound once `npm run build` is green and `git remote -v` shows `origin` as your repo and `upstream` as this one.
