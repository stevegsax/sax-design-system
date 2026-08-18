---
status: Proposed
date: 2026-08-18
requested-by: Claude (sax-designer), sax-unified-front-end
---

# Add a table pattern

## Context

The unified front-end's library mockup renders a document table — format column, linked titles, tag-chip cells, a status badge, uploader, date — with a pagination bar. `base.css` gives tables borders and label-typed headers, but no pattern covers column roles (metadata columns, link-title cells, chip cells), row hover, or pagination. The same shape recurs on that product's review-queue and gap-report screens, and `patterns/README.md` already names "table" among intended patterns. Considered and rejected: bare base styling (borders and type only) and the card pattern (not tabular).

## Proposed change

A `table` pattern — pattern file only, no new tokens: metadata cells as `typography.caption` in `color.text.muted`; title links as `typography.label`; row hover on `color.background.inset`; a pagination bar of caption-typed count text plus secondary buttons. Sortable headers and row selection are out of scope here; this request is the read-only shape.

## Provisional styling in use

`sax-unified-front-end/mockups/library/index.html`, table and pagination marked `data-provisional="2026-08-18-table-pattern"`.

## Impact

Minor — a new pattern file plus this record; no token wiring.

## Alternatives considered

- Per-product table CSS — the same roles get re-derived three times in one product alone (library, review queue, gap report) and then diverge.
