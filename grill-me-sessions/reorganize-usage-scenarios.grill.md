# Grill Session: reorganize-usage-scenarios

Started: 2026-07-19
Last updated: 2026-07-20
Status: complete (implementation landed; release pending)
Domain: design-system architecture and standards (sax-design-system)

## Summary

Began as a grilling of the layout-and-page-shell ADR; the 44rem/70rem
contradiction between the two shipped shells surfaced a deeper reframe: the
product axis is really an unnamed *reading situations* axis. The session
produced a five-situation taxonomy (literary, documentation, marketing,
presentation, application), a single-stylesheet combining design
(base `:root` + `[data-situation]` delta blocks, mixable per region), and
the umbrella ADR `decisions/2026-07-20-reading-situations.md` (Proposed).
The layout ADR is superseded; the disabled-state ADR is pending its own
grilling.

## Decision Log

### DECIDED: Five reading situations, including application

- **Decision**: The consumption axis is reading situations — literary,
  documentation, marketing, presentation, application. Application was
  missing from the original four; it is mandatory (all six motivating PM
  mockup requests are application pages). System must support full-page
  mockups, independent-component mockups, and deployable application
  styling.
- **Rationale**: Situations explain the existing overrides (all six remaps
  are situation-shaped) and give the axis a principled definition.
- **Date**: 2026-07-20

### DECIDED: Situations combine in one stylesheet, scoped by attribute

- **Decision**: One `dist/tokens.css`: base `:root` + one delta block per
  situation under `[data-situation="<name>"]`; consumers mix situations
  per region via the attribute. Deltas are computed at build time by
  per-situation resolution + diff of resolved literals (verified: emitted
  CSS has zero `var()` chains, so cascade re-pointing is not available).
- **Rationale**: Real pages mix situations; custom-property cascade gives
  region scoping for free; build time is explicitly not a constraint.
- **Date**: 2026-07-20

### DECIDED: Umbrella ADR drafted; layout ADR superseded

- **Decision**: `decisions/2026-07-20-reading-situations.md` (Proposed)
  carries the reorganization; `2026-07-19-layout-and-page-shell.md` is
  Superseded (container/rhythm tokens become per-situation; shells become
  per-situation patterns proposed on demand).
- **Rationale**: One canonical shell was wrong-by-construction; the ADR
  gate applies to this reframe like any other style-system change.
- **Date**: 2026-07-20

### DECIDED: Build produces everything; static deployment

- **Decision**: The system updates infrequently and should emit all output
  a consumer might need — per-situation samples, previews, situations
  index, mixing demo, extensive docs. Added generation time is acceptable.
- **Rationale**: Deployed as static content; consumers should not need the
  toolchain.
- **Date**: 2026-07-20

### DECIDED: Fail-loud default — no usable zero-attribute rendering

- **Decision**: `dist/base.css` ships reset + token-mapped base element
  rules scoped under `[data-situation]`, plus an unconditional diagnostic
  layer; a page (or region) with no declared situation renders visibly
  broken. Claude's earlier "usable neutral floor" proposal rejected by
  the user; recorded as a rejected alternative in the ADR.
- **Rationale**: A pleasant default becomes a silently adopted, ungoverned
  sixth situation. Fail-loud matches the build's existing gates and makes
  total situation coverage self-enforcing (unclassified gaps between
  regions render broken).
- **Date**: 2026-07-20

### DEFERRED: Distribution mechanism (git dependency vs submodule)

- **Reason**: Deployment detail; user wants the design locked first.
- **Open questions**: Whether per-situation consumption ever needs more
  than choosing an import; whether a starter-kit template repo is the real
  ask behind "submodule".
- **Risk if ignored**: Yesterday's `files`-based skill/pattern shipping
  assumes the npm git-dependency model; a submodule switch would strand it.
- **Date**: 2026-07-20

### DECIDED: ADRs approved and implemented

- **Decision**: User set both ADRs to `status: Approved` (2026-07-20);
  implementation landed the same day — situations axis, base+delta
  `dist/tokens.css`, `dist/base.css`, disabled roles, container/rhythm
  roles, per-situation previews/samples/index/mixing demo, situation
  catalog stories (25 baselines), docs/skills/Hugo example updated.
- **Rationale**: Design review is the user, per the ADR process.
- **Date**: 2026-07-20

## Open Threads

- Umbrella ADR awaits design review (the user). Base-situation choice
  (proposal: neutral base, situations always explicit), situation names,
  and the situation-contract role list are all encoded in the ADR as
  proposals — review may amend.
- Diagnostic treatment details (magenta + banner via `sax-diagnostic`
  layer) are Claude's sharpening within the user's fail-loud decision;
  user may amend the specific treatment at review.
- Disabled-state ADR (`2026-07-19-disabled-state.md`) still Proposed and
  next in the grilling queue, per "one ADR at a time".

## Parking Lot

- Print/PDF output for the literary situation ("paper book publishing"
  implies eventual print stylesheets).
- Literary-only APCA floor (Lc 90 preferred for fluent long-form body).
- Component-level mockup conventions (independent components, not just
  pages) for the sax-designer skill.
- Contrast pairs tagged per situation.
- Storybook catalog parser rework details (`parseVars` scope-awareness).
