---
status: Approved (v1.0.0)
date: 2026-07-24
requested-by: Steven Greenberg, sax-design-system (repatriation of the claude.ai design-project components)
---

# Record links as base-element coverage; no link pattern

## Context

The claude.ai design project defines a Link component. In this repo the
anchor element is already fully covered without one: `link.text` and
`link.text.hover` exist at the component tier, and `base.css` applies them
to `a` / `a:hover` inside any declared situation. A `patterns/link.html`
would restate that element styling with no added composition, and the two
copies could drift.

## Proposed change

No pattern file. Record the standard instead: links are element-level
coverage — consumers write plain `<a>` and `base.css` styles it. The
regenerated claude.ai mirror derives its Link card from the `base.css`
element rules, not from a pattern.

## Provisional styling in use

None.

## Impact

Record only; no release surface beyond this file.

## Alternatives considered

- A `patterns/link.html` for symmetry with Button — rejected: a pattern
  earns its file by encoding composition or variants; this one would
  duplicate two `base.css` rules.
