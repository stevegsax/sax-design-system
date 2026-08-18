---
status: Proposed
date: 2026-08-18
requested-by: Claude (sax-designer), sax-unified-front-end
---

# Add a status badge pattern

## Context

The unified front-end's library mockup shows an ambient "2 pending" count on rows whose document carries review-pending tag applications; the badge links into a review queue. Sibling screens need the same shape for present/pending/missing states. No badge or count idiom exists in the system. Considered and rejected: the alert pattern (block-level, transient status — the wrong shape for persistent inline row chrome) and plain caption text (insufficient prominence for a worklist indicator).

## Proposed change

A `badge` pattern — pattern file only, no new tokens: an inline pill in `typography.caption`, `radius.full`, `space.2xs`/`space.xs` padding, with status variants reusing the alert-gated pairings — warning, success, danger, each `color.status.<variant>.text` on `color.status.<variant>.background` with `color.status.<variant>.border` (text pairing already gated at Lc 60, "warning alert text" and siblings in `config/contrast-pairs.json`). Interactive when wrapped in `<a>`, like the tag pattern.

## Provisional styling in use

`sax-unified-front-end/mockups/library/index.html`, `.badge-pending` marked `data-provisional="2026-08-18-status-badge"`.

## Impact

Minor — a new pattern file plus this record; reuses gated status pairings; no token wiring.

## Alternatives considered

- Alert pattern — transient and block-level; a persistent inline count is a different role.
- Tag pattern variant — the tag is topic metadata; overloading it with status semantics muddies both roles.
