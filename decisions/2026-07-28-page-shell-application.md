---
status: Approved
date: 2026-07-28
requested-by: Steven Greenberg, sax-design-system
---

# Add the application page shell, shell tokens, and prototype fleet

## Context

The reading-situations decision (`2026-07-20-reading-situations.md`)
superseded the original canonical page shell: shells are per-situation,
proposed on demand. This is the first demand — product migrations are
starting, and migration mode replaces "patterns first", so the shell must
exist before the migrations for them to have a target. The shipped
application sample (`dist/samples/application.html`) is the de facto
design: a full-width app bar, an 18rem sidebar + content grid, full-bleed
`main` (application already remaps `--container-max` to unbounded at the
token level), and a site footer. The sample hard-codes the sidebar width.

Design direction (2026-07-28): the shell ships as a **pattern, not
base.css defaults**. The pattern is teaching material — a consumer should
understand what each region of a SAX application is for, what it looks
like, and how the regions compose, because every application will add its
own components and must follow the idiom rather than reinvent it. Recent
skill-generated pages fell short of the intended idiom; the pattern's
markup and its documentation are the lever that improves generated output.

The shell's deeper purpose is a **structured feedback loop**: design
feedback given while looking at one page must land in a shared source and
be visible across *every* application page, not just the page under
discussion. That requires a fleet of application prototypes that are
*generated from* the shared sources — one sample page cannot show "the
effect everywhere", and hand-copied prototypes would absorb feedback one
page at a time, which is the failure mode this ADR exists to prevent.

## Proposed change

- **Component tokens** (`shell`, references only):
  - `shell.sidebar-width` — the sample's 18rem, promoted from hard-code.
    Requires a primitive dimension step (candidate: `dimension.container`
    gains an 18 step; exact home confirmed at implementation).
  Further `shell.*` roles are added on demand, not speculatively.
- **Pattern** `patterns/page-shell-application.html`: semantic landmarks —
  `<header>` app bar (brand + `<nav>` toolbar), an `.app` grid of
  `<aside>` sidebar and full-bleed `<main>`, `<footer>`. Structural grid
  stays structural CSS; the sidebar column references
  `--shell-sidebar-width`. **Every region carries a comment stating its
  role, what belongs in it, which tokens govern it, and how to extend it**
  — the teaching mandate. `patterns/README.md` records this as a rule for
  all future patterns: a pattern documents its regions' purpose, not just
  its markup.
- **Skill and guides**: the `sax-designer` skill's mockup and migration
  workflows start application pages from this shell;
  `guidelines/building-pages.md` replaces its "no page-shell yet" caveat
  with the application shell as the starting point (other situations
  remain shell-less, proposed on demand).
- **Prototype fleet — the feedback surface.** A set of representative
  application prototypes, each *assembled at build time* from the shell
  pattern plus a page-specific content module (`scripts/build-samples.js`
  grows into this role): initial fleet of four archetypes — a records
  list/table page, a settings/form page, a dashboard (cards + stats), and
  a detail/reading page. The pattern's region comments double as the
  assembly anchors, so the teaching markup and the build contract are the
  same thing. Emitted to `dist/prototypes/application/…` with an index
  page (a gallery linking every prototype) reachable from `dist/index.html`.
  Each prototype gets a Storybook story and visual baseline.
- **The feedback loop, recorded as process**: feedback on any prototype is
  classified to its shared source — token value, `shell.*` role, pattern
  markup/region doc, skill instruction, or page content — the one source
  is edited, `npm run build` regenerates the whole fleet, and the effect
  is reviewed everywhere at once: the gallery for in-context reading,
  `npm run test:visual` for the pixel diff across every prototype at
  once (an unexpected page in the failure list is the loop working).
  Token-value and pattern tweaks inside existing roles need no new ADR —
  they ship as patch/minor; new roles or standards changes come back
  through the ADR gate as usual.
- **Deferred, recorded**: automatic landmark layout in `base.css` —
  imposed grid would fight page-by-page migration; revisit with migration
  evidence if products converge. Responsive sidebar collapse — a later
  CSS-only extension; not part of the markup contract now.
- **Contrast**: no new pairings — the sidebar composes already-gated
  roles (`background.surface`, `border.default`, gated text roles).

## Provisional styling in use

None. The application sample is regenerated as one of the fleet at
implementation so sample and standard cannot drift.

## Impact

Minor release. One new primitive dimension step + `shell.*` component
tokens (existing tier+type — cheap wiring). Pattern wiring per the
CLAUDE.md "New pattern" checklist (added with this ADR): pattern file,
explicit `stories/lib/patterns.js` entry, mirror generator `CARD_LAYOUT`
entry, `patterns/README.md`, story + baseline, mirror resync. The fleet
adds a build step (assembly from the pattern), four prototype pages with
stories and baselines, and a gallery index. Skill and guide edits are
consumer-facing and reach products with the release; the mirror's UI-kit
group grows to carry the fleet.

## Alternatives considered

- `base.css` landmark defaults (automatic layout on
  `data-situation="application"`) — rejected for now: high blast radius
  against existing app structure during page-by-page migration; the
  pattern is opt-in. Deferral recorded above rather than silent.
- Hard-coding the sidebar width in the pattern — rejected: products tune
  density; a width products cannot remap becomes a fork magnet.
- Waiting for the first migration to inform the shell — rejected:
  migrations need the target idiom to migrate onto; the shipped sample
  already validates the design, and migration experience can feed a v2.
- Hand-authoring the prototype pages from copied pattern markup —
  rejected: copies absorb feedback one page at a time; only build-time
  assembly guarantees that one edit is every page's edit.
