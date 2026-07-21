---
status: Approved (v0.4.0)
date: 2026-07-19
requested-by: Claude (sax-designer capability build), sax-design-system
---

# Add disabled-state color roles

## Context

Settings pages and dropdowns need disabled controls, and no disabled token
exists anywhere in the system (verified: zero matches across `tokens/`).
The interaction states that do exist (hover, active, focus) cover only
button, link, and input. This blocks the settings-page and dropdown
requests.

## Proposed change

- Semantic roles, mapped per mode from the neutral ramp:
  `color.text.disabled`, `color.background.disabled`,
  `color.border.disabled`. Exact steps to be measured at implementation
  with `scripts/advise-color.js`; candidates: text `neutral.60`/`neutral.50`
  (light/dark), background `neutral.95`/`neutral.20`.
- Component tokens referencing them: `button.disabled.background`,
  `button.disabled.text`, `input.disabled.background`, `input.disabled.text`,
  `input.disabled.border`.
- A recorded standard: disabled content is exempt from the APCA gates (the
  APCA Readability Criterion exempts disabled controls). Documented here so
  the exemption is a decision, not an omission; no `contrast-pairs.json`
  entries are added for disabled pairings.

## Provisional styling in use

None yet; filed ahead of the first mockups. Until accepted, mockups will
render disabled controls with `--color-text-muted` on
`--color-background-inset`, marked
`data-provisional="2026-07-19-disabled-state"`.

## Impact

Minor release. All new values in existing tiers+types (cheap wiring). No
contrast gate changes beyond the documented exemption.

## Alternatives considered

- `opacity` on enabled colors — rejected: alpha-composited results vary by
  background and bypass the token system.
- Reusing `color.text.muted` permanently — rejected: conflates two roles;
  muted is readable secondary text, disabled is a non-interactive state,
  and the two must be able to diverge.
