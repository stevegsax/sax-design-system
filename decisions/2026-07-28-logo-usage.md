---
status: Approved (v1.0.3)
date: 2026-07-28
requested-by: Steven Greenberg, sax-design-system
---

# Standardize logo usage: the symbol mark, SVG on web

## Context

Three brand marks ship in `static-assets/logos/` (full lockup, wordmark,
sailboat symbol) with no usage rule — nothing said which mark a product
header should carry or which file variant to use. The claude.ai mirror
breakage (2026-07-25) also exposed asset defects: all three SVG exports
carried Illustrator's document-level `<style>` blocks with colliding class
meanings (`.st0` = brand fill in two files, `display:none` in the third),
shared `id="Layer_1"`, and the wordmark contained an entire hidden draft
layer. Any context that inlines SVGs cross-contaminated them, forcing a
PNG workaround that contradicted web practice.

## Proposed change

- **The symbol is the logo.** Wherever a product shows a logo — page
  headers, slides, app chrome — use `SAX_logo_symbol`. The full lockup
  and wordmark remain reserved assets, used only by explicit design
  decision.
- **On web pages, use the SVG variant.** PNG is for raster-only contexts.
- **Logo SVGs must be inline-safe**: presentation attributes only — no
  document-level `<style>`, no classes, no ids. Implemented for all three
  files (fills inlined, ids removed, the wordmark's hidden draft layer
  deleted — its file halved); any future export is sanitized the same way
  before committing. Verified by rendering all three inlined into one
  document.

## Provisional styling in use

None. The claude.ai mirror's PNG references (a workaround for the
collision) revert to SVG with this change.

## Impact

Minor release. Guideline + asset change; no token wiring. `brand.md` and
the `sax-designer` skill record the rule; the mirror generator switches
rendered logo references back to SVG.

## Alternatives considered

- Keeping PNG on web (the workaround) — rejected: fixes the consumer
  instead of the asset; every future inlining context would re-hit the
  collision.
- Namespacing ids/classes per file — rejected in favor of removing them:
  presentation attributes need no namespace discipline to stay safe.
