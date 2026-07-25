---
status: Approved (v1.0.0)
date: 2026-07-24
requested-by: Steven Greenberg, sax-design-system (repatriation of the claude.ai design-project components)
---

# Adopt brand guidelines; ship guidelines and logos

## Context

The claude.ai design project's readme is the only written record of SAX
brand standards — but it is a reverse-engineering of what the v0.2.0
sample pages implied, not an authored standard. Porting it wholesale would
launder inference into policy. Design discussion (2026-07-24) set the
direction: this ADR enumerates every claim so the brand owner ratifies or
strikes each line; the approved list becomes `guidelines/brand.md`. Voice
stays in this repo — products pin only this package, and the
`sax-designer` skill needs the standards at mockup time (constraint
recorded: `sax-standards` must not grow a competing voice document).
Three of the mirror's rules — "no icon set", "no imagery", "no
gradients" — have unknown provenance and are struck as blanket
prohibitions below.

## Proposed change

`guidelines/brand.md`, authored from the ratified lines below. Strike or
amend any line by editing this ADR during review; approval ratifies what
remains.

### Decided — voice and copy

- The voice is institutional, precise, understated.
- Declarative, confident, unembellished. Claims are specific and often
  self-limiting.
- Third person or first-person plural ("we prefer…"); the reader is
  addressed as a peer professional, never in a salesy register.
- Prefer a sharp aphorism to a superlative.
- Vocabulary is the language of quant finance and engineering (drawdown
  budgets, optimizer constraints, reproducible backtests); product and CLI
  names in monospace.
- Compliance-aware copy is part of the brand ("Accredited investors
  only.").
- Reference CTAs: "Open an account", "Request access", "Read our
  methodology", "See a sample report".

### Decided — mechanical rules (checkable in review)

- Sentence case everywhere — headings, buttons, navigation. Uppercase only
  for small caption/eyebrow labels (stat labels).
- No emoji.
- No exclamation marks.
- Formal punctuation: `·` separators, en/em dashes, real quotation marks.

These four become explicit items in the `sax-designer` review checklist —
a design review flags a violation the way it flags a hard-coded hex.

### Decided — visual restraint (guidance, not prohibition)

- The brand leans on typography, borders, and flat color. Accent appears
  in controls, links, focus indicators, and pale subtle washes; large
  flooded accent areas are off-voice.
- Imagery, gradients, and icons are used deliberately and sparingly — the
  restraint is real, the prohibition is not (see struck items).

### Pending — open decisions with interim rules

- **Brand typefaces**: pending selection. The system font stack
  (`system-ui`, `ui-monospace`) is the deliberate interim, not a
  substitution. Superseded by a future typography ADR.
- **Icon set**: none sanctioned. Interim: Unicode typographic characters
  cover occasional glyphs in patterns and mockups; a design that needs
  real icons triggers the icon-set ADR rather than an ad-hoc pick.
- **Imagery and gradients**: no art direction defined; the only brand
  imagery is the sailboat logo. Interim: a mockup that needs imagery or a
  gradient marks it provisional and files an ADR, per the standard gap
  process — allowed, but unstandardized.

### Struck from the mirror's account

- "No icon set", "no imagery", "no gradients" as blanket prohibitions —
  provenance unknown; almost certainly inferred from absence in generated
  sample pages, an accident of the samples rather than a decision.
  Replaced by the restraint guidance and pending decisions above.

### Distribution and enforcement

- Package `files`: add `guidelines` and `static-assets` (the logo lockups,
  SVG + PNG). Verify with `npm pack --dry-run`.
- `sax-designer` skill: cite `guidelines/brand.md` as ground truth for
  copy and visual-restraint decisions; add the four mechanical rules to
  the review checklist; route imagery/icon needs through the pending-ADR
  interim rules.

## Provisional styling in use

None.

## Impact

Minor release. No token wiring. Package contents grow by the guidelines
doc and six logo files. The skill edit is consumer-facing and reaches
products with the release.

## Alternatives considered

- Porting the mirror readme wholesale — rejected: it is inference, not
  authorship; every line here is ratified or struck by the brand owner,
  and the struck items are recorded.
- Housing voice and tone in `sax-standards` — rejected: products pin only
  this package, and the `sax-designer` skill cannot resolve a cross-repo
  citation from a product repo; the no-competing-doc constraint is
  recorded instead.
- Keeping the blanket no-icon/no-imagery/no-gradient prohibitions —
  rejected: unknown provenance, and the brand owner confirms restraint,
  not prohibition.
