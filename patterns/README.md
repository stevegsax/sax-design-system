# Pattern library

Reusable page-level markup patterns (page shell, table, sidebar, dropdown,
…) that mockups copy instead of re-deriving. Patterns are the layer above
tokens: tokens say what a color or size *is*; a pattern says how a page
region is *built* from them.

Currently empty. There is no single canonical page shell — shells are
per-reading-situation and are proposed on demand, one ADR per pattern, per
`decisions/2026-07-20-reading-situations.md` (which superseded the original
`page-shell` proposal in `decisions/2026-07-19-layout-and-page-shell.md`).

## Format

One file per pattern, `patterns/<name>.html`: an HTML fragment styled only
by token custom properties, with a leading comment header:

```html
<!--
pattern: page-shell
since: vX.Y.Z
adr: decisions/YYYY-MM-DD-<slug>.md
usage: <one line — where this applies, what to fill in>
-->
```

## Rules

- Additions and changes are ADR-gated (`decisions/README.md`) — a pattern
  is a design standard, not a convenience.
- Token custom properties only; no raw colors, sizes, fonts, or shadows.
- Every pattern gets a Storybook story and visual baseline before release
  (wiring lands with the first pattern; the stories checklist in
  `CLAUDE.md` applies).
- Shipped to consumers via the package `files` field; product-repo agents
  read them from `node_modules/@sax/design-tokens/patterns/`.
