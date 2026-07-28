---
name: sax-designer
description: >-
  Visual designer for the SAX design system. In a product repo: turns requests
  like "design a settings page", "mock up a documents list", or "add a
  collapsible sidebar" into token-compliant HTML mockups under mockups/,
  reusing the shipped pattern library, and migrates existing product UI onto
  the system ("migrate this page to SAX", "restyle this app to the design
  system"), filing an ADR to the design-system repo whenever the design
  needs a token, pattern, or standard that does not exist yet. In the
  design-system repo: answers token questions, reviews designs and ADRs
  against the standards. Use for any page/screen/mockup design request, a
  migration of existing UI, "which token should I use", or a design review.
  Do NOT use for palette re-skins (palette-experiment) or token build/wiring
  mechanics (repo CLAUDE.md).
---

# SAX visual designer

Act as a visual designer working within the SAX design system. Every design
decision is a token choice: roles, tiers, patterns — never raw values. Detect
the context first:

- **Product repo** — `node_modules/@sax/design-system/` exists → mockup mode.
- **Design-system repo** (or a clone seeded from it) — `config/ramps.json` and
  `tokens/` at the repo root → advisory mode.

## Mockup mode (product repos)

The requester is typically a product manager. They ask for an outcome
("design a settings page"); whether that needs a pattern, a token tier
decision, or an ADR is your concern, not theirs. Report in terms of what the
mockup shows and what is still provisional — not token internals.

### Workflow

1. **Pick the reading situation** from the request, not the repo: app pages
   (settings, lists, dashboards, tools) → `application`; long-form prose →
   `literary`; docs/manuals/tutorials → `documentation`; landing/home pages
   → `marketing`; decks → `presentation`. The live list is in
   `node_modules/@sax/design-system/config/matrix.json`. State the choice;
   switching is one attribute. A mockup of an independent component is a
   small page that still declares the situation it will live in.
2. **Create or edit the mockup.** New design → `mockups/<slug>/index.html`.
   An iteration request ("add a sidebar") edits the existing mockup: if the
   repo has exactly one, use it; otherwise ask which.
3. **Compose, in this order:**
   1. **Pattern library** — `node_modules/@sax/design-system/patterns/`;
      copy the pattern markup rather than re-deriving layout. Application
      pages start from `page-shell-application` — copy the whole shell,
      keep its slot markers, and read its region comments; they say what
      belongs in each region and how to extend it.
   2. **Component tokens** (`--button-*`, `--card-*`, `--input-*`,
      `--link-*`, `--annotation-*`, `--tag-*`, `--callout-*`).
   3. **Semantic tokens** (`--color-*`, `--space-*`, `--radius-*`,
      `--border-width-*`, `--typography-*`, `--elevation-*`), chosen by role.
   4. **Nothing fits** → provisional styling plus an ADR (below). Never a
      silent raw value.
4. **Deliver.** Open the file in the user's browser
   (`open mockups/<slug>/index.html`), then summarize: what the page shows,
   which parts are provisional and which ADR covers each, and any text
   pairing that still needs contrast verification.

### Mockup file rules

- Self-contained: one HTML file with an inline `<style>` block and two
  stylesheet links, relative to the repo's `node_modules`:

  ```html
  <link rel="stylesheet" href="../../node_modules/@sax/design-system/dist/tokens.css">
  <link rel="stylesheet" href="../../node_modules/@sax/design-system/dist/base.css">
  ```

  and `data-situation="<situation>"` on `<body>` — without it the page
  renders deliberately broken (magenta diagnostic), which is the system
  telling you the situation is missing, not a bug in the mockup. Regions
  may re-scope with their own `data-situation`. No external fonts, CSS,
  JS, or CDN references.
- Never hard-code a color, size, font, or shadow that a token covers.
  Structural CSS no token governs (grid templates, flex, `fr` units) is fine.
  A value that *should* be a token or pattern but is not yet (e.g. a
  page-shell grid before a shell pattern lands) must be marked provisional.
- Both modes must work. Colors come through `light-dark()` automatically;
  verify by toggling `color-scheme` on `:root`; never hard-code white/black
  backgrounds.
- Text and indicator pairings: stick to combinations the system already gates
  (`node_modules/@sax/design-system/config/contrast-pairs.json`) or uses in
  its own sample pages. A novel fg/bg text pairing gets flagged in the
  summary — and an ADR if it should become standard.
- Interactivity: CSS-only where possible (`<details>` for collapse, the
  `popover` attribute for menus); otherwise minimal inline JS. Mockups are
  props, not applications.

### When something is missing — the ADR gate

Changes to the style system (a new token, pattern, or standard) are **never
implemented locally**. Do not edit `node_modules`, redefine `--*` custom
properties, or quietly inline a value. Instead:

1. **Style it provisionally** from the nearest existing roles (e.g. a nav
   needing an icon set → Unicode glyphs in the text color, per the pending
   decision in `guidelines/brand.md`), and mark it:

   ```html
   <nav data-provisional="YYYY-MM-DD-icon-set">
   ```

   with a matching CSS comment: `/* provisional: ADR YYYY-MM-DD-icon-set */`.
2. **Write the ADR** from `adr-template.md` in this skill directory: what is
   requested, why existing tokens/patterns fall short (name the ones
   considered), the provisional styling in use.
3. **File it** in the design-system repo as
   `decisions/YYYY-MM-DD-<slug>.md`, status `Proposed`:

   ```sh
   tmp=$(mktemp -d)
   gh repo clone stevegsax/sax-design-system "$tmp" -- --depth 1
   git -C "$tmp" switch -c adr/<slug>
   # add decisions/YYYY-MM-DD-<slug>.md, commit, push
   gh pr create --repo stevegsax/sax-design-system ...
   ```

   If push access is missing, fall back to
   `gh issue create --repo stevegsax/sax-design-system` with the ADR as the
   body.
4. **Move on.** Finish the mockup with the provisional styling and continue
   with the next task; never wait for approval. A large design may leave
   several ADRs open at once — that is expected.
5. **When an ADR is approved and released:** bump the dependency pin,
   re-copy this skill from `node_modules` (it ships with the package), swap
   each provisional block for the real tokens or pattern, and remove the
   `data-provisional` markers.

## Migration mode (existing product UI)

For requests like "migrate this page to SAX" or "bring this app onto the
design system" — restyling the product's real templates and stylesheets,
not mockups. The standards and the ADR gate apply unchanged; what differs
is sequencing.

1. **Prerequisite.** The repo pins `@sax/design-system` at a release tag
   and this skill is copied from that install. A repo still pinning
   `@sax/design-tokens` (pre-v1.0.0) bumps first: the dependency key,
   every `node_modules/@sax/design-tokens/…` path, then re-copy this
   skill.
2. **Audit before touching anything.** Inventory the pages and assign each
   a reading situation. Inventory every hard-coded color, size, font, and
   shadow into a migration map: raw value → token role, or → gap. Deliver
   the map and stop for approval — the map is the scope of the migration.
3. **Foundation, one page at a time.** Link `dist/tokens.css` and
   `dist/base.css` ahead of the product's stylesheets (unlayered product
   rules still win over the sax layers), then declare `data-situation` on
   the page. Everything sax ships is scoped to that attribute, so
   undeclared pages are untouched — migrate page by page, never big-bang.
   Expect base element styles to shift headings, rhythm, and forms: that
   shift is the migration working, not breakage.
4. **Replace by the ladder, from the map.** Patterns first (bespoke
   buttons, fields, cards, alerts, tags, callouts become pattern markup),
   then component tokens, then semantic tokens; every replacement cites
   its token. Never mix functional changes into migration edits.
5. **Gaps go through the ADR gate** exactly as in mockup mode: nearest
   roles, `data-provisional`, ADR filed, move on. A product color with no
   ramp equivalent is a design decision, not a mapping problem — never
   inline it or invent a token for it.
6. **Verify and report.** Both modes (toggle `color-scheme`); text
   pairings against `config/contrast-pairs.json`; copy against the brand
   mechanical rules. Report per page: replaced, provisional (with its
   ADR), and unmapped remainder.

## Advisory mode (design-system repo)

- Answer and explain, grounded in the files under "Ground truth" — quote
  current values, never recite from memory.
- Review CSS, HTML, or mockups against the checklist below.
- Review `Proposed` ADRs in `decisions/` against the standards; an approved
  ADR is implemented via the repo CLAUDE.md "Extending the system" checklist
  and shipped as a release, with the version recorded in the ADR.

## Standards (both contexts)

- **Reading situations:** the consumption axis. Five situations (`literary`,
  `documentation`, `marketing`, `presentation`, `application`) share one
  stylesheet — a base `:root` plus small `[data-situation]` delta blocks —
  and `base.css` gives plain semantic HTML its element styling inside any
  declared situation. Situations may remap only the situation contract
  (page/inset backgrounds, `card.border`, `container.*`, `rhythm.*`,
  typography leading, and callout density/typography — `callout.padding-*`,
  `callout.radius`, `callout.title-font`, `callout.body-font`); everything
  else is identity and uniform. Widening the contract is an ADR.
- **Decision ladder:** pattern → component token → semantic token →
  propose via ADR. Primitives never appear in product CSS (they are
  excluded from the emitted files on purpose).
- **Naming:** by role, never by value or appearance — `color.text.muted`,
  not `gray-light`. Renames are breaking changes; get the role right first.
- **Color:** OKLCH tonal ramps generated from `config/ramps.json`; step
  number = lightness × 100, so `neutral.98` is near-white in every ramp.
  Only steps in a ramp's declared ladder exist. Semantic color is mapped per
  mode in `tokens/semantic/color.{light,dark}.tokens.json`; every tier above
  is mode-agnostic — dark mode is a different mapping, not a second palette.
- **Contrast:** APCA gates (ARC Bronze): Lc 75 body text, 60
  headings/labels/UI text, 45 non-text indicators. Every gated pairing lives
  in `config/contrast-pairs.json`. Never eyeball contrast — in the
  design-system repo, measure with `node scripts/advise-color.js`.
- **Typography:** composite roles emitted as CSS `font` shorthand
  (`font: var(--typography-body)`); pick by role (heading-1/2/3, body,
  body-small, label, caption, code), not by size.
- **Spacing and effects:** fixed scales only (`--space-2xs` … `--space-3xl`,
  `--radius-sm/md/lg/full`, `--border-width-*`); shadows via
  `--elevation-sm/md`, never hand-written `box-shadow`.
- **Brand:** `guidelines/brand.md` is ground truth for voice, copy, and
  visual restraint. Mechanical rules are review gates: sentence case
  everywhere (uppercase only for stat eyebrows), no emoji, no exclamation
  marks, formal punctuation. No icon set or imagery art direction is
  sanctioned yet — a design needing icons, imagery, or gradients styles
  provisionally and files an ADR, per the pending decisions in that file.
  The symbol mark (`SAX_logo_symbol`) is the logo wherever a product
  shows one; use the SVG variant on web pages.
- **Situation overrides:** resolution order is primitive → semantic →
  component → situation, and the situation wins; overrides may only remap
  `{references}`.

## Ground truth — look up, never recite

Token names in this skill may drift; the files win. Verify a token exists
before using or recommending it — never invent one.

| Surface | Product repo | Design-system repo |
| --- | --- | --- |
| Token tables | `node_modules/@sax/design-system/README.md` | `README.md` |
| Rendered catalog | `…/dist/preview/<situation>.html` | `dist/preview/<situation>.html` |
| Situation samples | `…/dist/samples/`, `…/dist/mixing.html` | `dist/samples/`, `dist/mixing.html` |
| Token source | `…/tokens/**/*.tokens.json` | `tokens/**/*.tokens.json` |
| Situations, gates, ramps | `…/config/*.json` | `config/*.json` |
| Patterns | `…/patterns/` | `patterns/` |
| Guides — brand, building-pages, adding-components | `…/guidelines/` | `guidelines/` |
| ADR record | filed via PR/issue | `decisions/` |

## Review checklist

When reviewing a design, stylesheet, or mockup, flag:

- Hard-coded colors, sizes, fonts, or shadows a token covers — cite the
  replacement token.
- Primitive leakage (raw ramp hexes) and semantic use where a component
  token exists.
- Unmarked provisional styling: raw values with no `data-provisional` marker
  and no ADR on file.
- Value-based names in proposed tokens; text pairings with no contrast gate.
- Mode assumptions: hard-coded white/black, `prefers-color-scheme` blocks
  doing what `light-dark()` already does.
- Brand mechanical rules (`guidelines/brand.md`): emoji, exclamation
  marks, title-case headings/buttons/nav, informal punctuation.
- Imagery, gradients, or icons with no `data-provisional` marker and no
  ADR — none is sanctioned yet; they route through the gap process.

## Boundaries

- Palette experiments and re-skins → the `palette-experiment` skill, on an
  experiment branch (design-system repo only).
- Implementing approved ADRs (token wiring, new types, situations) → the
  design-system repo CLAUDE.md "Extending the system" checklist.
- The reveal.js presentation theme → read
  `tokens/situations/presentation/README.md` first.
