---
status: Approved (v1.0.0)
date: 2026-07-24
requested-by: Steven Greenberg, sax-design-system (repatriation of the claude.ai design-project components)
---

# Add the tag component (tokens and pattern)

## Context

The claude.ai design project defines Tag — a topic/metadata pill — drawn
from the v0.2.0 sample pages. Nothing survives in v0.4.0: no `tag.*`
tokens, no sample markup, no gated pairing. Unlike alert and callout,
which map onto the existing semantic status vocabulary, a tag is an
interface control with its own dimensions and typography, like button,
input, and card — it warrants component-tier tokens so situations and
future ADRs can tune it without touching semantic roles.

## Proposed change

Component tokens (references only, per the override rule):

- `tag.background` → `{color.accent.subtle}`
- `tag.text` → candidate `{color.text.link}`; measure with
  `node scripts/advise-color.js` at implementation, fallback candidate
  `{color.text.body}`
- `tag.label-font` → `{typography.caption}`
- `tag.radius` → `{radius.full}`
- `tag.padding-block` → `{space.2xs}`, `tag.padding-inline` → `{space.xs}`

Contrast pair: `tag.text` on `tag.background`, `minLc: 60` (label gate),
added to `config/contrast-pairs.json`.

`patterns/tag.html`: an inline pill (`<span>`) carrying those tokens.

## Provisional styling in use

None.

## Impact

Minor release. New values in existing component tier + types
(color/dimension/typography files exist — cheap wiring), one new contrast
pair, pattern file, story, baseline.

## Alternatives considered

- Pattern-only styling from semantic roles (the alert approach) —
  rejected: tags are a control with their own dimension/typography
  contract; products will need to reference them as a component.
- Neutral styling (`background.inset` + `text.muted`) — rejected: visually
  conflates tags with code spans and inset wells, which share that surface.
