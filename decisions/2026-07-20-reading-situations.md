---
status: Approved (v0.4.0)
date: 2026-07-20
requested-by: Steven Greenberg with Claude (grill session reorganize-usage-scenarios), sax-design-system
---

# Organize output around reading situations, combined in one stylesheet

## Context

The product axis (`product-home-page`, `blog-page`, `presentation`,
`document-viewer`) is an unprincipled list of page types. Analysis of the
shipped samples shows the real axis underneath it: `blog.html` wraps content
at 44rem (a book measure) while `home.html` wraps at 70rem — two *reading
situations*, never named. Meanwhile the mockup capability's motivating
requests (settings, document lists, sidebars) belong to a situation the
system does not define at all.

Real pages mix situations: a documentation site has a marketing landing;
document-viewer is an application frame around a reading pane. So situations
cannot be one-per-stylesheet; a single consumable output must support
per-region situation choice.

The entire current product axis amounts to six token remaps (three
`background.page`, one `background.inset`, one `card.border`, one dark-mode
`background.page`), all situation-shaped — evidence that the override
mechanism was already expressing situations informally.

## Proposed change

### 1. Five reading situations replace the product axis

- `literary` — linear long-form reading; book measure; ease of reading
  paramount; links de-emphasized until requested. (Absorbs `blog-page`'s
  overrides: page `neutral.95`/`neutral.5`, `card.border` strong.)
- `documentation` — skimming and jumping; longer lines, airier rhythm,
  lists/callouts/code; links visible. (New.)
- `marketing` — visual impact, big ideas; engagement over density.
  (Absorbs `product-home-page`'s overrides: pure-white page, inset 98.)
- `presentation` — one idea per surface; short text, few images. (Absorbs
  the `presentation` product, keeping its reveal.js kit and true-black dark
  override.)
- `application` — dense, interactive, act-don't-read: forms, tables,
  navigation, tool chrome. (New; home of the mockup capability's requests.
  `document-viewer` becomes its first sample.)

`config/matrix.json` `products` becomes `situations`;
`tokens/products/<name>/` becomes `tokens/situations/<name>/` (same
three-file override convention; overrides still remap `{references}` only).
The product-overlay mechanism is retained (empty for now) for real products
that need extras beyond a situation, e.g. document-viewer annotation UI.

### 2. One emitted stylesheet, situations scoped by attribute

`dist/tokens.css` contains a base `:root` block (the shared semantic
resolution, situation-neutral) followed by one delta block per situation:

```css
[data-situation="literary"] { --container-max: 44rem; … }
```

Consumers set `data-situation` on `<body>` or on any region container;
custom properties cascade to the subtree, so situations mix per-region on
one page. Because emitted values are fully resolved literals (verified:
zero `var()` chains in current output), each delta block is computed at
build time by resolving the full tree per situation × mode, merging
`light-dark()`, and diffing resolved values against base — transitively, so
component tokens that reference a remapped semantic role appear in the
delta. Build cost is accepted; output stays static.

### 3. Reset and base styles scoped to declared situations; the default renders broken

New artifact `dist/base.css`, separate from `tokens.css` (which stays
custom-properties-only — its inert, cannot-conflict contract is
load-bearing for existing consumers). Three cascade layers:

- `@layer sax-diagnostic` — unconditional. A page whose `body` lacks
  `data-situation` renders unmistakably broken: a raw magenta diagnostic
  treatment plus a generated banner naming the fix. Deliberately outside
  the palette — the one correct home for raw values is the signal that
  says "this is not design." Producing usable output without declaring a
  situation is a bug, and the default makes the bug visible — the runtime
  analog of the build's fail-loud gates (`check:ramps`, `check:color`).
- `@layer sax-reset` — hand-written minimal reset (box-sizing border-box,
  zeroed margins, media `max-width: 100%`, form controls inheriting
  font/color — the application situation needs that last one), scoped
  under `[data-situation]`. Not a vendored normalize: modern browsers
  have converged, and zero-dependency stays.
- `@layer sax-base` — classless element rules mapped to tokens via
  `var()` (body background/color/font, headings to `typography.heading-*`,
  links to `link.*`, code/pre to `typography.code` and inset background,
  flow spacing to `rhythm.*`), also scoped under `[data-situation]`. A
  situation region restyles plain semantic HTML with zero consumer CSS.
  This is the single deliberate layer of `var()` indirection — token
  *values* stay resolved literals per §2.

The standard this encodes: every page declares a primary situation on
`body`; regions may re-scope with their own `data-situation`. Because
reset and base apply only inside declared situations, an unclassified
region renders broken too — total coverage is self-enforcing, not
policed. There is **no usable zero-attribute rendering.** The base
`:root` custom properties remain (they are the diff baseline for §2 and
are inert without element rules); they do not soften the breakage.
Presentation is exempt from reset/base (reveal.js ships its own reset;
the theme layer reconciles with it) but its sample deck still declares
the situation. All shipped surfaces (preview, samples, catalog, Hugo
example, skill-produced mockups) declare situations and drop their four
hand-rolled micro-resets — that migration is the validation.

### 4. New semantic roles (dimension type, existing tier — cheap wiring)

- `container.max`, `container.gutter` — content measure and page gutter,
  per situation, derived from characters-per-line targets (literary ≈66
  CPL → 44rem; documentation ≈90 CPL; marketing 70rem; application wide).
- `rhythm.flow`, `rhythm.section` — prose paragraph and section rhythm
  (the "airier" lever). The base `space.*` scale is never remapped per
  situation: prose density and control density are different dials, and
  remapping the scale would silently resize component padding.

Link emphasis ("lightly emphasized" vs "visible") is carried by
situation shell patterns, not tokens — text-decoration and hover-reveal
behavior cannot be expressed in the existing token types, and a new `$type`
is the expensive wiring category for no gain here.

### 5. The situation contract

Situations may remap only: `color.background.page`, `color.background.inset`,
`card.border` (existing precedent), `container.*`, `rhythm.*`, and
typography leading (via `typography.*` line-height references). Everything
else — brand hue, status colors, control styling, the spacing scale — is
frozen across situations: identity, not ergonomics. Extending this list
requires a new ADR.

### 6. Outputs ("all the output a consumer might need")

Per situation: a sample page (home and blog recast as the marketing and
literary samples; documentation and application samples new) and a preview
catalog. New: a situations index page and a mixing demo (one page with a
region per situation). The presentation kit is unchanged under
`dist/presentation/`. README tables, Storybook catalog, and visual
baselines gain the situation axis.

### 7. Contrast gates

`check-color`/`advise-color` loop situations × modes instead of products ×
modes. Gate floors are unchanged for v1; pairs may optionally carry a
`situations` tag. Noted for a future ADR: APCA suggests Lc 90 preferred for
fluent long-form body text — a candidate literary-only floor.

## Provisional styling in use

None — the mockup capability has not shipped to a product repo yet.

## Impact

**Major release.** Import paths change (`dist/<product>/tokens.css` →
`dist/tokens.css`); consumers update one import and optionally add
`data-situation` attributes. Full wiring per exploration: `matrix.json`,
`generate-resolvers.sh` + `resolver.jq` (situation arg), `build.js`
(base + delta emission — the largest change), `css-tokens.js` resolver
paths, `check-color.js`/`advise-color.js` loops, `build-preview/home/blog/
presentation/docs` generators, `stories/lib/catalog.js` (its `parseVars`
regex reads the whole file and its `scopeCss` rewrites only the first
`:root` — both must become scope-aware or the catalog double-counts delta
tokens), the four `stories/*.stories.js`, all 20 visual baselines,
`examples/hugo-theme` vendored copy + README, `CLAUDE.md`, `README.md`,
and both skills. Supersedes `2026-07-19-layout-and-page-shell.md`; its
shell need returns as per-situation shell patterns, proposed per pattern
on demand. `2026-07-19-disabled-state.md` is unaffected and strengthened
(the application situation is its natural home).

## Alternatives considered

- One stylesheet per situation, import several — rejected: parallel
  `:root` blocks collide; cascade layers order declarations but do not
  scope them; mixing needs scoping.
- Emit `var()` reference chains so deltas cascade through component tokens
  — rejected: changes every consumer-visible value to an indirection and
  reworks the `light-dark()` merge; build-time diffing achieves the same
  static result within the accepted build budget.
- Class scoping (`.situation-literary`) — rejected in favor of
  `data-situation`: reads as state, no utility-class collisions.
- Baking the reset/base rules into `tokens.css` — rejected: its
  properties-only contract means importing it can never change existing
  rendering; consumers with their own reset (or reveal's) must be able to
  take tokens without ours.
- A usable neutral fallback (reset + base applied unconditionally) —
  rejected in review: a pleasant default becomes a silently adopted,
  ungoverned sixth situation; an unclassified page must be a visible bug,
  not a tolerable one.
- Per-situation repos/submodules — deferred (deployment detail, decided
  separately); the single-repo thin-overlay core is retained regardless.
