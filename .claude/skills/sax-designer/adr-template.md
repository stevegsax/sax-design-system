# ADR template

Copy into `decisions/YYYY-MM-DD-<slug>.md` in the sax-design-system repo.
One ADR per decision. Keep it short — it is a record, not an essay.

```markdown
---
status: Proposed
date: YYYY-MM-DD
requested-by: <user or agent>, <product repo>
---

# <Imperative summary: "Add disabled-state color roles">

## Context

What task surfaced the need (the mockup, the request). Why existing tokens
and patterns fall short — name the ones considered and rejected.

## Proposed change

The exact tokens, patterns, or standards requested: names (role-based),
tier, references (existing ramp steps only), contrast pairs with their gate
(75/60/45), pattern markup if applicable. If exact ramp steps need
measurement, say so and propose candidates.

## Provisional styling in use

Where the requesting mockup used a stopgap (`data-provisional` markers),
and what swaps in on approval.

## Impact

Semver class (value = patch/minor, rename/removal = major). Wiring category
per the design-system CLAUDE.md: new value in an existing tier+type (cheap)
vs. new type/tier/product (full checklist).

## Alternatives considered

Each with the reason it was rejected.
```

Statuses after review: `Approved` (implementation may proceed), then
`Approved (vX.Y.Z)` once implemented and released; `Rejected` (file stays
as a record); `Superseded by <file>`.
