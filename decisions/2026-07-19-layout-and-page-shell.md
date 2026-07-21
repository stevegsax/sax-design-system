---
status: Superseded by 2026-07-20-reading-situations.md
date: 2026-07-19
requested-by: Claude (sax-designer capability build), sax-design-system
---

# Add layout tokens and a canonical page-shell pattern

> Superseded: grilling surfaced that "the" 70rem width contradicts
> `blog.html`'s 44rem measure — the two are different *reading situations*,
> and no single canonical shell exists. Container/rhythm tokens return in
> `2026-07-20-reading-situations.md` as per-situation values; shells return
> as per-situation patterns, proposed on demand.

## Context

The mockup workflow produces full pages, but the system defines nothing
above the component level. `dist/product-home-page/home.html` hard-codes
`max-width: 70rem` in a local `.wrap` class; `blog.html` rolls its own
variant with different markup and class names. Every mockup would improvise
page width, gutters, and header/nav/footer structure — the exact
inconsistency the mockup capability exists to prevent. This blocks all six
motivating requests (documents list, settings, 404, sidebar, landing page,
tags dropdown): each is a full page.

## Proposed change

- Semantic dimension tokens:
  - `container.max` (`--container-max`) — page content max width. Proposed
    value: the 70rem already shipping in `home.html`, added to the primitive
    dimension tier and referenced from semantic.
  - `container.gutter` (`--container-gutter`) — horizontal page padding.
    Proposed: `{space.lg}` (matches `home.html`'s `.wrap`).
- First entry in the pattern library: `patterns/page-shell.html` — the
  canonical `header`/`nav`/`main`/`footer` markup, lifted from
  `home.html`, restated against the new container tokens.
- Implementation includes the pattern-library Storybook wiring (a story
  section rendering `patterns/*.html` per product, with visual baselines),
  since this is the first pattern.

## Provisional styling in use

None yet; filed ahead of the first mockups. Until accepted, mockups will
hard-code `max-width: 70rem` and hand-rolled shells marked
`data-provisional="2026-07-19-layout-and-page-shell"`.

## Impact

Minor release. Dimension tokens are new values in an existing tier+type
(cheap wiring). The pattern library story section is new tooling — the
stories/catalog checklist in `CLAUDE.md` applies. No new contrast pairs.

## Alternatives considered

- Per-mockup improvisation — rejected: inconsistent pages defeat the
  purpose.
- Shipping a layout utility stylesheet in `dist/` — rejected: the emitted
  CSS is tokens-only by design; patterns carry markup and usage instead.
