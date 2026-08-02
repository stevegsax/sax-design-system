---
status: Proposed
date: 2026-07-26
requested-by: Claude (sax-designer skill), epub-reader
---

# Add a five-hue annotation highlight set

## Context

The epub-reader migration (application surfaces now on v1.0.2) has a
user-facing highlight picker: readers annotate text in one of five
colors — yellow, green, blue, pink, orange. The five names are literals
in the product's API and database (`HighlightColor` in
`annotations/schemas.py`; the CSS classes `color-{name}` render both the
inline `<mark>` washes and the selection-toolbar swatches), so the set
size is a product contract, not a styling preference.

Considered and rejected:

- `annotation.highlight` (`{color.highlight.90}`) — the right role for a
  *single* highlight, and the reader uses it for search-hit `<mark>`s
  and `::selection`; it cannot represent a five-way user choice.
- `annotation.selected` (`{color.marker.70}`) — the marker ramp's role
  is the *selected/active annotation state*, not a user-pickable hue;
  overloading it as "orange highlight" would conflate two roles.
- Status ramps (success/danger) for green/pink — status roles carry
  meaning (ok/error) that a reader's color choice must not imply.
- `brand` for blue — accent is an interaction role, not content
  marking.

There is no pink ramp at all.

## Proposed change

Extend the annotation component group with a highlight *set*, one token
per product literal, each referencing a light ramp step suitable for a
translucent overlay on the rendered page (the existing highlight ramp's
documented consumption model):

- `annotation.highlight-yellow` → `{color.highlight.90}` (the existing
  single-highlight reference)
- `annotation.highlight-green` → `{color.success.90}` or a new
  dedicated ramp step — needs measurement
- `annotation.highlight-blue` → `{color.brand.90}` or dedicated ramp
- `annotation.highlight-pink` → new ramp (no existing hue near
  OKLCH ~20-30) — candidate: a `rose` ramp built with the standard
  gamut-proportional rule
- `annotation.highlight-orange` → `{color.marker.90}` (hue 63 exists;
  the *reference* is to the ramp step, not to the selected-state role)

Gate: non-text indicator (Lc 45) for swatch-on-surface; body text over
each wash at Lc 75 against `color.text.body` in both modes. Measure
with `scripts/advise-color.js`; exact steps may shift to pass the
gates.

## Provisional styling in use

epub-reader `reader.css` + `tokens.css` (`data-provisional=
"2026-07-26-annotation-highlight-set"` on `#selection-toolbar`; CSS
comments on the wash rules): five editorial hex hues color-mixed to
translucency. On approval the five `--hl-*` custom properties and the
`color-mix()` washes swap for the released `--annotation-highlight-*`
tokens.

## Impact

New values in an existing tier+type (component → color references):
minor. If green/blue/pink need dedicated ramps, that adds primitive
ramp generation (`config/ramps.json`) — still minor by semver, but the
full "new ramp" wiring checklist applies.

## Alternatives considered

- Reduce the product to one highlight color — rejected: the five-color
  picker is shipped, in the API contract, and in stored data.
- Product-local palette outside the system — rejected: violates the
  no-local-token rule and leaves annotation colors out of mode
  mapping (the washes must eventually resolve per light/dark).
