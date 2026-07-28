# Building pages

How to compose a page from the shipped tokens, element styles, and
patterns. The `sax-designer` skill follows this workflow when it builds
mockups; this is the same procedure for a human.

## Start

Every page links two stylesheets and declares a reading situation:

```html
<link rel="stylesheet" href="node_modules/@sax/design-system/dist/tokens.css">
<link rel="stylesheet" href="node_modules/@sax/design-system/dist/base.css">
...
<body data-situation="application">
```

Situations (`config/matrix.json`): `literary` (long-form prose),
`documentation` (docs, manuals), `marketing` (landing pages),
`presentation` (decks), `application` (tools, lists, settings). A page
with no declared situation renders as magenta diagnostic stripes — that is
the system reporting the missing attribute, not a bug. Regions may
re-scope with their own `data-situation` (see `dist/mixing.html`).

## What you get before writing any CSS

`base.css` styles plain semantic HTML inside a declared situation:
headings, prose rhythm, links, lists, blockquotes, code, tables, buttons
(secondary by default, with disabled and focus states), form controls, and
labels. `<main>` gets the situation's content measure and gutters. Write
semantic HTML first; much of a page needs nothing more.

## The decision ladder

For each element, take the first rung that fits — never a raw value that a
token covers:

1. **Pattern** — copy the markup from `patterns/` rather than re-deriving
   it: `button`, `field`, `card`, `alert`, `tag`, `callout`. Each file's
   header comment says where it applies. Links are deliberately not a
   pattern; write `<a>` and `base.css` styles it.
2. **Component tokens** (`--button-*`, `--card-*`, `--input-*`,
   `--link-*`, `--tag-*`, `--callout-*`, `--annotation-*`) — for styling
   a known component beyond what the pattern shows.
3. **Semantic tokens** (`--color-*`, `--space-*`, `--radius-*`,
   `--border-width-*`, `--typography-*`, `--elevation-*`) — chosen by
   role, for everything else. Token tables: the package README.
4. **Nothing fits** — style provisionally from the nearest roles, mark it
   `data-provisional="<adr-slug>"`, and file an ADR (see
   `adding-components.md`). Never a silent raw value.

Structural CSS that no token governs — grid templates, flex, `fr` units —
is yours to write.

## Layout

**Application pages start from the `page-shell-application` pattern** —
app bar, sidebar (`--shell-sidebar-width`), full-bleed main, status
footer, with each region's purpose documented in the pattern itself. The
assembled prototype fleet (`dist/prototypes/application/index.html`)
shows the shell carrying four page archetypes; crib from whichever is
closest to your page. Other situations have no shell yet — shells are
per-situation and proposed on demand
(`decisions/2026-07-20-reading-situations.md`); crib their structure from
`dist/samples/<situation>.html`. Use `--rhythm-flow` / `--rhythm-section`
for vertical rhythm and `--space-*` for gaps, not ad-hoc margins.

## Modes and contrast

- Light and dark come free: colors are `light-dark()` pairs and the root
  sets `color-scheme`. Verify both by toggling `color-scheme` on a
  container. Never hard-code white or black.
- Keep text and indicator pairings to combinations the system gates
  (`config/contrast-pairs.json`) or uses in its own samples. A novel
  pairing needs an APCA measurement and a gate entry — flag it, don't
  eyeball it.

## Copy

`brand.md` governs voice and the mechanical rules (sentence case, no
emoji, no exclamation marks, formal punctuation). Reviews flag violations.

## Migrating an existing page

The system is built for incremental adoption: every rule in `base.css`
and every situation delta is scoped to `[data-situation]`, so linking the
two stylesheets changes nothing until a page declares a situation.
Migrate page by page: audit the page's raw values into a map (value →
token role, or → gap), link the stylesheets ahead of the product's own
CSS, declare the situation, then replace values by the decision ladder —
patterns first. Gaps follow the same provisional-plus-ADR process as new
work; a legacy color with no ramp equivalent is a design decision, never
a straight mapping. The `sax-designer` skill runs this workflow from a
request like "migrate this page to SAX".

## Or delegate

In a product repo with the skill installed, `/sax-designer` runs this
entire workflow from a request like "design a settings page" and reports
what is provisional. Reading its output against `dist/samples/` is the
fastest way to learn the system.
