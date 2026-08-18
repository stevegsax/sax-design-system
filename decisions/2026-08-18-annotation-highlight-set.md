---
status: Proposed
date: 2026-08-18
requested-by: Claude (sax-designer), sax-unified-front-end
---

# Add an evidence wash to the annotation highlight set

## Context

The unified front-end's viewer mockups (`sax-unified-front-end/mockups/viewer-pdf/`, `viewer-epub/`) render highlights in two semantic tones: a standard wash for margin highlights and a distinct wash for highlights cited as evidence by a tag application (the wash is derived from that citation, never picked by the author — there is no color picker). The system ships `annotation.highlight` (highlight ramp, hue 104) and `annotation.selected` (marker ramp, hue 63); the marker hue is spoken for by the selected/flash state, so no role exists for the evidence tone. Considered and rejected: reusing `annotation.selected` for evidence (collides with selection) and `color.accent.subtle` (a UI role, not a document wash).

A prior proposal covers this ground: PR #8 (branch `adr/annotation-highlight-set`, 2026-07-26) proposes a five-hue personal palette from the epub-reader era. The requesting product's design ruling of 2026-08-18 supersedes that direction (see Alternatives); this record and #8 should be ruled together.

## Proposed change

- `annotation.evidence` — component tier, annotation type: a wash for evidence-anchoring highlights, on a hue visually distinct from both hue 104 (highlight) and hue 63 (marker). Exact ramp and step need measurement; candidate: a step from the brand ramp (hue 249.6) or a new dedicated ramp if brand-blue reads as interactive.
- Contrast gates for text over washes — a new pair category: document body text over the blended wash-on-surface result, in both modes, at Lc 75. The blend ratio applied by consumers should be fixed by this decision (the mockups use 35% via `color-mix`, matching the annotation_manager viewer's precedent); today no gate covers text sitting on any wash.
- Keep `annotation.selected` as the selected/flash state; state whether flash renders as a wash swap or an outline so consumers converge.

## Provisional styling in use

Both viewer mockups: `mark.hl-evidence` and `.annotation-card.evidence` borrow `--annotation-selected`, and the flash state is a `--color-border-focus` outline, all marked `data-provisional="2026-08-18-annotation-highlight-set"`.

## Impact

Minor if the evidence wash references an existing ramp step (new value in an existing tier+type); a new ramp would take the fuller wiring checklist. The text-over-wash gate category is new in `config/contrast-pairs.json` either way.

## Alternatives considered

- Five-color personal palette (open PR #8) — rejected by the requesting product's own design ruling (2026-08-18): a private code on a shared channel, and five ramps of token cost for information the product's private tags already carry.
- Author-keyed colors — collision-prone at the product's user count; attribution already rides the annotation card.
