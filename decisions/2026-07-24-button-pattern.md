---
status: Approved (v1.0.0)
date: 2026-07-24
requested-by: Steven Greenberg, sax-design-system (repatriation of the claude.ai design-project components)
---

# Add the button pattern

## Context

The claude.ai design project ("SAX Capital Design System", built from
v0.2.0) defines a Button component with primary and secondary variants.
The token side is already complete in this repo: `button.*` covers both
variants, dimensions, label font, and — since ADR
`2026-07-19-disabled-state.md` — disabled colors. `base.css` styles a bare
`<button>` as the secondary variant with disabled and focus-visible states.
What is missing is the pattern: there is no primary-variant markup, and no
hover/active styling anywhere (`base.css` has no `button:hover` rule). The
mirror's disabled convention (opacity 0.5) predates the disabled tokens and
is superseded.

## Proposed change

`patterns/button.html`, using the class vocabulary the sample pages already
ship (`class="btn primary"` / `class="btn secondary"`):

- Bare `<button>` and `.btn.secondary` — as `base.css` renders today; the
  pattern documents rather than restyles it.
- `.btn.primary` — `--button-primary-background` / `--button-primary-text`,
  `:hover` → `--button-primary-background-hover`, `:active` →
  `--button-primary-background-active`.
- Disabled and focus-visible come from `base.css` unchanged.

No new tokens. Recorded observation: the secondary variant has no
hover/active tokens; if a product needs visible secondary hover feedback,
that is a separate ADR, not a pattern-level improvisation.

## Provisional styling in use

None — repatriation of an already-designed component, not a mockup request.

## Impact

Minor release. No token wiring. First-pattern cost applies to this batch:
Storybook pattern stories and visual baselines land with it
(`patterns/README.md` — "wiring lands with the first pattern").

## Alternatives considered

- Shipping the mirror's React component — rejected: consumers install a
  zero-toolchain git dependency; patterns are framework-neutral HTML.
- Opacity-based disabled styling (the mirror's convention) — rejected:
  superseded by the disabled color roles, for the reasons in
  `2026-07-19-disabled-state.md`.
