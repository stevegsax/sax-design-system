---
status: Proposed
date: 2026-07-26
requested-by: Claude (sax-designer skill), epub-reader
---

# Give the literary situation a long-form reading identity

## Context

epub-reader's reading column — the product's core surface — was designed
as an editorial page: serif display/body faces (Fraunces/Newsreader),
a warm paper background, and a single reserved terracotta accent for
reading-position cues (active-block indicator, drop caps, chapter
numerals, footnote markers). The rest of the app has migrated onto
v1.0.2; the reading column is the marked-provisional remainder.

Why existing tokens fall short:

- Typography roles all resolve to the system sans stack.
  `guidelines/brand.md` lists brand typefaces as *pending selection* —
  this ADR is a concrete input to that decision for the literary
  situation specifically: sustained long-form reading is the one
  situation where a text serif is the typographic norm.
- The literary situation delta remaps `color.background.page` to
  `neutral.95` — cool near-white. A warm paper tone has no ramp: every
  ramp is hue 250 (neutral/brand) or a status/annotation hue.
- The reserved-accent treatment maps by role to `color.accent.*`, but
  accent is uniform across situations (brand blue); the editorial
  design's argument is that a reading surface wants a quieter, warmer
  accent than interactive-blue.

## Proposed change

Three separable pieces — each can be approved or rejected
independently; they are one ADR because they form one identity
question:

1. **Serif typography for literary.** Add `font.family.serif` and remap
   the literary situation's body/heading typography roles to it. This
   widens the situation contract (today: leading only) — that widening
   is the decision. Candidate faces per the brand-typeface selection;
   the system stack fallback would be `Iowan Old Style, Georgia,
   serif`.
2. **Warm paper page for literary.** Add a low-chroma warm ramp
   (candidate: OKLCH hue ~85, chroma ~0.015, "paper") and remap
   literary `color.background.page` → `paper.95`-equivalent. Page and
   inset backgrounds are already inside the situation contract.
3. **Reading-accent role.** New semantic role
   `color.accent.reading` (or a literary-situation remap of an accent
   sub-role) for position/structure cues in long-form content,
   referencing a warm ramp step; vermillion-adjacent candidate at
   OKLCH hue ~35. Gate: Lc 45 non-text against the literary page
   background; Lc 60 where it colors text-sized numerals.

If all three are rejected, the fallback is full adoption: the reading
column restyles onto the uniform roles (sans, neutral page, brand
accent) and the editorial identity is retired.

## Provisional styling in use

epub-reader `reader.css` zone 1 + `tokens.css`
(`data-provisional="2026-07-26-literary-reading-surface"` on
`<main class="reader">`): the editorial paper palette, serif stacks,
and vermillion values, scoped to the reading column only. On approval,
each piece swaps for its released token; on rejection the column
restyles onto uniform roles and the provisional file is deleted either
way.

## Impact

Piece 1: new font family primitive + situation-contract widening —
full checklist, minor semver. Piece 2: new ramp + one situation remap —
ramp wiring checklist, minor. Piece 3: new semantic color role +
contrast pairs — minor. No renames or removals.

## Alternatives considered

- Keep the editorial styling as a permanent product-local exception —
  rejected: the reading surface is the product's most-seen page;
  a standing exemption hollows out the standard.
- Full adoption without an ADR — rejected as a *default*: it destroys
  a deliberate product design without a recorded decision; it remains
  the documented fallback if this ADR is rejected.
- Per-product situation overrides — rejected: the system's core rule is
  that situations, not products, are the consumption axis; a
  per-product fork breaks propagation.
