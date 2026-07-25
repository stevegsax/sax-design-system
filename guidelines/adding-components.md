# Adding components

How a new component (or any style-system change) enters the design
system. The unit of change is a decision, recorded as an ADR; the
implementation follows the checklists in the repo `CLAUDE.md`.

## What a component is here

A component ships as a **pattern** (`patterns/<name>.html` — copyable
markup styled only by token custom properties) and, when it has its own
visual contract, **component tokens** (references to semantic roles).
There are no framework components: consumers install a zero-toolchain git
dependency, so everything is static HTML and CSS.

## Before proposing

Check whether the system already covers the need:

- `patterns/` — is there a pattern, or does `base.css` already style the
  element (links, plain buttons, form controls)?
- The package README token tables — is there a component or semantic role
  for it?
- `dist/preview/<situation>.html` — the rendered catalog.

## The path

1. **File an ADR.** `decisions/YYYY-MM-DD-<slug>.md`, `status: Proposed`,
   from the template in `.claude/skills/sax-designer/adr-template.md`:
   what is needed, why existing tokens and patterns fall short (name the
   ones considered), proposed token names and references, contrast pairs
   with gates. From a product repo, the `sax-designer` skill files it as a
   PR and styles the gap provisionally (`data-provisional="<adr-slug>"`)
   so the product keeps moving.
2. **Design review** happens in the design-system repo: the ADR status
   becomes `Approved` or `Rejected`. ADRs are permanent records either
   way.
3. **Implement** per the repo `CLAUDE.md` checklists. A component is not
   done until it appears in all three surfaces — `dist/tokens.css`, the
   README tables, the Storybook catalog — plus a pattern story and a
   committed visual baseline. New text or indicator pairings are measured
   (`node scripts/advise-color.js`) and gated in
   `config/contrast-pairs.json`.
4. **Release.** The change ships as a version tag; the ADR status becomes
   `Approved (vX.Y.Z)`. Products bump their pin and replace any
   provisional styling that referenced the ADR.

## Rules that shape proposals

- **Name by role, never by value**: `callout.warning.border`, not
  `orange-border`. Renames are breaking; get the role right first.
- **References only** above the primitive tier: component tokens remap
  `{references}` to semantic roles, never raw values.
- **Highest tier that fits**: a component earns its own tokens when it has
  an independent visual contract (dimensions, typography) that products or
  situations may tune; otherwise the pattern styles directly from semantic
  roles.
- **Situations** may remap only the situation contract; a component whose
  appearance should vary per situation needs its roles added to the
  contract — by ADR.

## Worked examples (all dated 2026-07-24)

| ADR | Outcome |
| --- | --- |
| `link-element-coverage` | No pattern — `base.css` element styling recorded as the standard |
| `alert-pattern` | Pattern only — styles directly from semantic status roles |
| `tag-component` | Component tokens + pattern + a new contrast gate |
| `callout-pattern` | Tokens + pattern + situation-contract widening; its implementation note shows a measured candidate being replaced |
