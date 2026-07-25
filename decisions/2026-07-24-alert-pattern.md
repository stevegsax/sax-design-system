---
status: Approved (v1.0.0)
date: 2026-07-24
requested-by: Steven Greenberg, sax-design-system (repatriation of the claude.ai design-project components)
---

# Add the alert pattern

## Context

The claude.ai design project defines Alert as a transient status notice in
success / warning / danger tones. The token side is fully in place at the
semantic tier: nine `color.status.*` roles, with `contrast-pairs.json`
already gating each `status.<tone>.text` on `status.<tone>.background` at
Lc 60 ("… alert text"). The sample pages carry two one-off precursors —
`.notice` (marketing) and `.callout` (documentation, hand-built from the
warning roles) — but no reusable fragment.

## Proposed change

`patterns/alert.html`, three variants (`success`, `warning`, `danger`),
generalizing the documentation sample's styling: variant
`--color-status-<tone>-background` / `--color-status-<tone>-text`, a
`--border-width-default` solid `--color-status-<tone>-border` border,
`--radius-md`, `--space-sm` / `--space-md` padding, `--typography-body-small`.
Accessibility is part of the pattern: `role="alert"` for danger,
`role="status"` for success and warning.

No new tokens: the semantic status vocabulary is the component contract.

## Provisional styling in use

None.

## Impact

Minor release. Pattern file, story, baseline. No token or contrast-gate
changes — all three pairings are already gated.

## Alternatives considered

- `alert.*` component tokens — rejected: they would be one-to-one
  indirection over the status roles with no independent degree of freedom;
  if alerts ever need to diverge from inline status text, that ADR can
  introduce the tier then.
- A neutral/info variant — rejected here: no status hue exists for it;
  standing neutral asides are the callout pattern's role
  (`2026-07-24-callout-pattern.md`).
