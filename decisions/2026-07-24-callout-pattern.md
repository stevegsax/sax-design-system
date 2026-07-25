---
status: Approved (v1.0.0)
date: 2026-07-24
requested-by: Steven Greenberg, sax-design-system (repatriation of the claude.ai design-project components)
---

# Add the callout component (tokens, pattern, situation-contract widening)

## Context

The claude.ai design project defines Callout — a titled, standing aside —
in six variants. Design discussion (2026-07-24) set the direction: callouts
are authored content in static documentation, conceived as printed-document
admonitions — a bounded rectangle visually distinct from the main text.
That separates them from alert (`2026-07-24-alert-pattern.md`) by context,
not just construction: an alert is system-generated transient status on a
live page; a callout is written by an author and stays on the page. The
semantic element is `<aside>` — the callout is tangential content, not a
quotation, so it must not be built on `blockquote`. Authoring reality cuts
the other way: GitHub-flavored markdown admonitions (`> [!NOTE]` …) render
through blockquotes, and SAX documentation flows through markdown/Hugo, so
the styling must accept both forms. Situations will need to tune callouts
(documentation density differs from literary prose), which the previous
draft of this ADR made impossible — pattern CSS written directly against
semantic roles gives situation overrides no seam, since they may only remap
situation-contract roles.

## Proposed change

**Vocabulary** — the five GitHub admonition types: `note`, `tip`,
`important`, `warning`, `caution`. Mirror folds recorded: `info` and
`aside` → `note`; `summary` is dropped — it is research-note document
structure (an abstract), not an aside, and arrives with that template's own
pattern ADR later.

**Markup contract** — canonical form
`<aside class="callout note">` with a title line and body. The identical
classes on `blockquote` are styled the same, solely so markdown-rendered
admonitions can reach the pattern (e.g. a Hugo blockquote render hook
mapping alert types to these classes); `<aside>` remains the form patterns
and mockups use.

**Construction** — a bounded rectangle with a uniform fill and a
per-variant border and title ink; body ink is uniform `text.body`. Tinted
fills stay the alert language, and uniform body ink keeps sustained reading
consistent across variants.

**Component tokens** (references only):

- `callout.background` → `{color.background.inset}`
- `callout.radius` → `{radius.md}`
- `callout.border-width` → `{border.width.default}`
- `callout.padding-block` → `{space.sm}`,
  `callout.padding-inline` → `{space.md}`
- `callout.title-font` → `{typography.label}`,
  `callout.body-font` → `{typography.body}`
- Per variant, `callout.<variant>.border` / `callout.<variant>.title`:
  - `note` — `{color.border.default}` / `{color.text.heading}`
  - `tip` — `{color.status.success.border}` / `{color.status.success.text}`
  - `important` — `{color.accent.default}` / `{color.text.link}`
  - `warning` — `{color.status.warning.border}` / `{color.status.warning.text}`
  - `caution` — `{color.status.danger.border}` / `{color.status.danger.text}`

**Situation contract widening** — add `callout.padding-block`,
`callout.padding-inline`, `callout.radius`, `callout.title-font`, and
`callout.body-font` to the situation contract, so situations tune callout
density and typography. Variant colors are excluded: the status vocabulary
stays uniform system-wide. Implementation updates the contract lists in
`CLAUDE.md` and the `sax-designer` skill.

**Contrast pairs** — every text pairing is already gated on
`color.background.inset`: `text.body` (Lc 75), the three
`status.*.text` roles and `text.link` (Lc 60). New pairs, non-text at
`minLc: 45` on `color.background.page` (variant borders carry meaning;
precedent: the focus-indicator pair): `color.status.success.border`,
`color.status.warning.border`, `color.status.danger.border`,
`color.accent.default`. Measure at implementation with
`node scripts/advise-color.js`.

**Pattern** — `patterns/callout.html` showing the `<aside>` form for all
five variants.

**Implementation note (2026-07-24)** — measurement rejected the
`status.*.border` candidates for the tip/warning/caution borders (Lc 27–33
light, ~0 dark, vs the 45 gate: those roles are tinted-box edges, not
standalone indicators). Implemented as the status **text** inks
(`{color.status.<tone>.text}`), which are gated at Lc 75 on page and match
`important`'s strong-ink border weight. The contrast pairs reference the
component paths (`callout.<variant>.border`) so the gates follow any
future remap.

## Provisional styling in use

None.

## Impact

Minor release. New values in existing component tier + types (cheap
wiring); four new non-text contrast pairs; contract widening lands as
documentation edits in `CLAUDE.md` and the `sax-designer` skill
(consumer-facing — reaches products with the release); pattern file, story,
baseline.

## Alternatives considered

- Left-bar construction (GitHub's web styling) — rejected: callouts are
  print-minded bounded rectangles, and the thick left bar is `blockquote`'s
  established language in `base.css`; callouts must not read as quotations.
- Status-tinted fills per variant — rejected: tinted boxes are the alert
  language, and each would need a new `text.body`-at-Lc-75 measurement on
  a tinted background; the uniform inset fill needs zero new text gates.
- Pattern-only styling from semantic roles (this ADR's first draft) —
  rejected: situations may remap only contract roles, so a token-less
  callout could never adapt per situation.
- The mirror's six variants — superseded by the GitHub five; `summary`
  dropped as document structure.
- `blockquote` as the canonical element — rejected: the aside's semantic
  value is part of the decision; blockquote styling exists only as
  markdown-rendering compatibility.
