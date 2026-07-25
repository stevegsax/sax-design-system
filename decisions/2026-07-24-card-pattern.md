---
status: Approved (v1.0.0)
date: 2026-07-24
requested-by: Steven Greenberg, sax-design-system (repatriation of the claude.ai design-project components)
---

# Add the card pattern

## Context

The claude.ai design project defines Card as a bordered surface container.
The `card.*` component tokens are complete (`background`, `border`,
`padding`, `radius`), `card.border` is part of the situation contract
(situations may remap it), and the sample pages use card markup — but no
canonical fragment exists for consumers to copy.

## Proposed change

`patterns/card.html`: a container styled by `--card-background`, a
`--border-width-default` solid `--card-border` border, `--card-padding`,
and `--card-radius`. The pattern records the standing standard the mirror
observed: cards are flat — defined by border on surface, never a shadow.
The `elevation.*` tokens exist for other surfaces (overlays, raised
chrome), not cards.

No new tokens.

## Provisional styling in use

None.

## Impact

Minor release. Pattern file, story, baseline only.

## Alternatives considered

- Elevation (shadow) on cards — rejected: the system leans on borders and
  insets; situations already tune card presence by remapping `card.border`,
  and a shadow would bypass that contract.
- Header/footer card slots — deferred: no demonstrated use; extend by ADR
  when a product needs them.
