---
status: Proposed
date: 2026-08-18
requested-by: Claude (sax-designer), sax-unified-front-end
---

# Promote the annotation card from prototype idiom to shipped pattern

## Context

The `.annotation-card` idiom — a card with a thick wash-colored inline-start border, quoted text in `typography.body-small`, metadata in caption-muted, and a `.selected` variant — exists only in the Document Workspace prototype (`prototypes/application/records.html`). Prototype CSS carries no stability contract, yet consumers are steered to copy it, and the unified front-end's viewer mockups now do so in two files; the same card recurs in that product's review queue next. Every consumer copying demo CSS drifts independently the first time the prototype changes. Considered and rejected: the card pattern (lacks the wash-keyed accent border, the quote/meta/actions structure, and the selected state).

## Proposed change

An `annotation-card` pattern — pattern file, no new tokens: the prototype's existing markup and CSS promoted as-is (`card.background`, `card.border`, `border.width.thick` start border in `annotation.highlight`, `radius.md`, `space.sm`, `typography.body-small` quote, caption-muted meta), plus two variants the requesting product adds: `.selected` (start border in `annotation.selected`, per the prototype) and `.evidence` (start border in the evidence wash — depends on the evidence-wash decision, `2026-08-18-annotation-highlight-set`, PR #14; until that is ruled the variant references `annotation.selected` provisionally).

## Provisional styling in use

`sax-unified-front-end/mockups/viewer-pdf/index.html` and `viewer-epub/index.html`, annotation rails marked `data-provisional="2026-08-18-annotation-card-pattern"`.

## Impact

Minor — a new pattern file plus this record; no token wiring. The prototype should reference the pattern once shipped, so the idiom has one home.

## Alternatives considered

- Leave it as a prototype idiom consumers copy — each copy drifts independently with no notice when the prototype changes; the steering-to-copy advice already concedes the demand.
- Extend the card pattern with modifiers — the annotation card's structure (quote, location meta, chip row, actions) is a different role, not a card skin.
