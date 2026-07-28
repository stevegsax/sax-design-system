---
status: Proposed
date: 2026-07-28
requested-by: Claude (agent) for Steven Greenberg, annotation_manager
---

# Add an application shell pattern (full-width top bar + side pane)

## Context

The annotation_manager viewer is being restructured: a top bar spanning the
full page width, with the content row below it holding the working surface
and a right-hand annotations pane. The mockup
(`annotation_manager/mockups/viewer-layout/`) could compose every visual
property from existing tokens (`--color-background-*`, `--border-width-*`,
`--space-*`, `--card-*`, `--typography-*`, `--elevation-*`), but the shell
itself — header-spans-all grid, scrollable working region, fixed-width side
pane — has no pattern to copy: `patterns/` is empty at v0.4.0, and the
situation contract's `container.*` roles are prose-measure oriented, not an
app-shell composition. Every application-situation product will re-derive
this same grid.

## Proposed change

A `patterns/application-shell/` entry: markup + structural CSS for a grid of
`auto 1fr` rows and `1fr <pane>` columns, header spanning all columns,
main region scrolling independently, optional side pane with its own
scroll. Visuals stay token-composed exactly as in the requesting mockup
(header on `color.background.surface` with a `border.width.default`
bottom rule; working region on `color.background.inset`; pane on
`color.background.page` behind a start-side rule). Pane width is the one
value with no token: propose either documenting it as a structural
parameter of the pattern or adding a component token
`shell.pane-width` (candidate value: 20rem). No new colors, no new
contrast pairs (all pairings already gated).

## Provisional styling in use

`annotation_manager/mockups/viewer-layout/index.html` marks the shell grid
`data-provisional="2026-07-28-application-shell-pattern"`. On approval the
grid block swaps for the pattern markup; nothing else changes.

## Impact

Additive: new pattern (+ optionally one component token) — minor. Wiring:
first entry in the pattern library, so it establishes the pattern-entry
format; otherwise cheap (no ramp, mode, or situation changes).

## Alternatives considered

- **Per-product bespoke shells (status quo)** — rejected: each application
  product re-derives the identical grid and drifts.
- **Widening the situation contract with shell roles** — rejected: the
  shell is a composition, not a per-situation remapping; the contract
  stays narrow by design.
