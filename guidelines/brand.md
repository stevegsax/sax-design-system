# SAX Capital brand guidelines

Ratified standards for voice, copy, and visual restraint
(decisions/2026-07-24-brand-guidelines.md). The `sax-designer` skill treats
this file as ground truth for copy and visual-restraint decisions; the
mechanical rules below are review-checklist gates.

## Voice and copy

- The voice is institutional, precise, understated.
- Declarative, confident, unembellished. Claims are specific and often
  self-limiting.
- Third person or first-person plural ("we prefer…"); the reader is a peer
  professional, never addressed in a salesy register.
- Prefer a sharp aphorism to a superlative.
- Vocabulary is the language of quant finance and engineering (drawdown
  budgets, optimizer constraints, reproducible backtests); product and CLI
  names in monospace.
- Compliance-aware copy is part of the brand ("Accredited investors
  only.").
- Reference CTAs: "Open an account", "Request access", "Read our
  methodology", "See a sample report".

## Mechanical rules (review gates)

A design review flags a violation of these the way it flags a hard-coded
hex:

- Sentence case everywhere — headings, buttons, navigation. Uppercase only
  for small caption/eyebrow labels (stat labels).
- No emoji.
- No exclamation marks.
- Formal punctuation: `·` separators, en/em dashes, real quotation marks.

## Visual restraint (guidance, not prohibition)

- The brand leans on typography, borders, and flat color. Accent appears in
  controls, links, focus indicators, and pale subtle washes; large flooded
  accent areas are off-voice.
- Imagery, gradients, and icons are used deliberately and sparingly.

## Pending decisions (interim rules)

- **Brand typefaces** — pending selection. The system font stack
  (`system-ui`, `ui-monospace`) is the deliberate interim, not a
  substitution. A future typography ADR supersedes this.
- **Icon set** — none sanctioned. Unicode typographic characters cover
  occasional glyphs in patterns and mockups; a design that needs real icons
  triggers an icon-set ADR rather than an ad-hoc pick.
- **Imagery and gradients** — no art direction defined; the only brand
  imagery is the sailboat logo. A mockup that needs imagery or a gradient
  marks it provisional and files an ADR, per the standard gap process.

## Brand marks

`static-assets/logos/` ships with the package: the full lockup, the
wordmark, and the sailboat symbol, each as SVG and PNG. These are the only
brand imagery.

- **The symbol is the logo** (decisions/2026-07-28-logo-usage.md).
  Wherever a product shows a logo — page headers, slides, app chrome —
  use `SAX_logo_symbol`. The full lockup and wordmark are reserved
  assets, used only by explicit design decision.
- **On web pages, use the SVG variant**; PNG is for raster-only contexts.
- Logo SVGs are inline-safe by standard: presentation attributes only,
  no document-level `<style>`, classes, or ids. Sanitize any new export
  the same way before committing.
