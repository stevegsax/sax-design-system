---
status: Approved (v1.0.0)
date: 2026-07-24
requested-by: Steven Greenberg, sax-design-system (repatriation of the claude.ai design-project components)
---

# Add the labelled-field pattern and base label styling

## Context

The claude.ai design project defines Input as a labelled text field. The
control itself is already covered: `input.*` tokens (value/label fonts,
dimensions, borders, placeholder, disabled, focus) and `base.css` rules for
`input`/`select`/`textarea`, `::placeholder`, `:disabled`, and
`:focus-visible`. Two gaps remain: nothing applies `--input-label-font`
(`label` is unstyled in `base.css`), and the label + control composition —
stacking, gap, association — is undefined, so every form re-derives it.

## Proposed change

- `base.css` (via `scripts/build-base.js`): add
  `[data-situation] label { font: var(--input-label-font); }` — element
  coverage, consistent with how the other form elements are handled.
- `patterns/field.html`: a labelled control — `<label for>` above the
  control, `--space-2xs` gap, one field per block. Works unchanged for
  `input`, `select`, and `textarea`; states come from `base.css`.

No new tokens.

## Provisional styling in use

None.

## Impact

Minor release. One generated-file change (`base.css`), one pattern file,
pattern story + baseline.

## Alternatives considered

- Label styling in the pattern only — rejected: a bare `<label>` outside
  the pattern would silently miss its typography role; element coverage in
  `base.css` matches the system's approach to every other form element.
- Horizontal label layout variant — deferred: no product has asked; a
  variant can extend the pattern by ADR later.
