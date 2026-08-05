---
status: Proposed
date: 2026-08-05
requested-by: Steven Greenberg, sax-design-system
---

# Adopt a text-driven design process from brainstorm to accepted design

## Context

The system covers the back half of designing a screen well and the front
half not at all. `sax-designer` turns a stated request into a
token-compliant mockup; `decisions/` records changes to the style system;
`patterns/`, the prototype fleet, and the Storybook catalog give the
mockup something to be built from and reviewed in.

What is missing is everything before "design a settings page" — the
framing that decides it should exist, the requirements it is answerable
to, and the flow that says which other screens it sits between. There is
also no product-level decision register: the ADRs here govern tokens,
patterns, and standards, so a choice like "triage is a queue, not a
filtered list" has nowhere to live and disappears into a mockup. And
nothing tracks a design's state, so "is this reviewed" is answered by
asking someone.

The consequence is that designs arrive fully formed with their reasoning
lost, and review has nothing to check them against except taste. The
requirement is that the whole lifecycle be driven by text commands with
its state in plain text and JSON, with no GUI design tool in the path.

Surveyed practice converges on a small number of things worth taking:
spec-driven development's gated `requirements → design → tasks` sequence
(Kiro, Spec Kit) and its use of EARS notation for requirements that are
unambiguous to a human and an agent alike; MADR for decision records, and
Log4brains' date-prefixed filenames, which this repo already uses for the
same merge-collision reason; and Mermaid as the only text flow-diagram
format in general use — but as a rendering, since it cannot be checked.
Nothing surveyed runs a full lifecycle against a design token system;
the pieces exist and the assembly does not.

## Proposed change

A process, specified in full in `guidelines/design-process.md`, shipped
to product repos as a second skill alongside `sax-designer`.

- **Six stages**, each with one artifact, in a product repo's
  `design/<slug>/`: `brainstorm` (`brief.md`), `requirements`
  (`requirements.md`, EARS), `flow` (`flow.json`), `mockup`
  (`screens/*.html` plus stories), `review` (`review.md`), `accepted`.
  Terminal alternatives: `superseded`, `abandoned`.
- **A control file**, `design.json`, holding the machine-readable state —
  stage, gates, ADR links, provisional markers — and no prose.
- **`flow.json` as the screen graph**, with `flow.md` generated from it as
  Mermaid. The graph is data so that reachability, requirement coverage,
  and state coverage can be checked; the diagram is a view of it.
- **Human gates** at four points. A gate files a ticket in
  `stevegsax/sax-needs-human-action`, records the assumption the process
  is proceeding under, and does not wait. Gates bind acceptance, not
  progress; two of the four are blocking.
- **A product decision register** under each design, in MADR form, for
  decisions about the product. Decisions about the style system continue
  to come here as ADRs, unchanged.
- **Thirteen checks** (C1–C13) covering coverage, reachability, state
  completeness, mockup and story presence, gate hygiene, and pin currency.
- **A `/design` command surface** driving all of it, delegating to
  `sax-designer` for anything that touches markup.
- **Both mockup surfaces**: the standalone self-contained page stays the
  source and the fast loop; a generated Storybook story is the review
  surface, so `storybook build` yields one static site per design.

## Provisional styling in use

None — this decision adds no tokens and changes no rendering.

## Impact

- **Semver:** minor. New skill, new schemas, new scripts, new `files`
  entries; nothing existing is renamed or removed. `sax-designer` is
  unchanged in behaviour and gains a cross-reference.
- **Wiring:** outside the token pipeline entirely — no new `$type`, tier,
  or situation, so the "Extending the system" checklists do not apply. The
  `files` field gains `schemas`, `scripts/design`, and
  `skills/sax-design-process`; verify with `npm pack --dry-run`.
- **Zero-toolchain constraint:** the shipped checkers must run on Node 22
  with no dependencies. `ajv` is a devDependency here and cannot be
  assumed in a consumer, so validation is hand-rolled and the JSON Schemas
  ship for editor support only. This is the same constraint that forbids
  `prepack` and `prepare`.
- **Second repo:** `sax-needs-human-action` gains the ticket format,
  `tickets/`, and a generated index. It is the interface between the
  process and its human gates.
- **Consumers:** additive. A product repo with no `design/` directory is
  unaffected; the process starts when the first `/design new` runs.

## Alternatives considered

- **Fold the lifecycle into `sax-designer`.** Rejected: that skill answers
  "how do I build a compliant page", and it is already long. The lifecycle
  answers "should this page exist and is it done", which is a different
  job with a different audience — a product manager, not a designer — and
  a different failure mode.
- **A separate `sax-design-process` repo.** Rejected: a second version to
  pin and keep in step with the token release, for a process whose every
  stage depends on the tokens, patterns, and situations shipped here.
- **Requirements as JSON.** Rejected: requirements are prose that must be
  argued about in review, and a JSON string array is worse at that than
  markdown. The strict `### R-<n> — <title>` anchor makes the markdown
  parseable, which is the same trade the pattern and prototype header
  comments already make.
- **Mermaid as the flow source of truth.** Rejected: a diagram cannot be
  checked for requirement coverage or reachability without parsing it back
  into a graph, and Mermaid has no place to hang a screen's requirements,
  states, mockup path, or story id. Generating Mermaid from JSON gets the
  picture without the ambiguity.
- **Blocking every gate.** Rejected: it contradicts the rule the ADR gate
  already establishes — file and move on — and it would make a design's
  pace the human's availability. Two blocking gates put the stop where the
  wasted work is worst.
- **Gates as GitHub issues rather than files.** Rejected: issues do not
  diff, do not travel with a clone, and cannot be checked by a script that
  runs offline. Files in a repo built for exactly this purpose do.
- **Storybook stories only, dropping the standalone page.** Rejected: the
  standalone page is the fast loop and needs no toolchain to open, which
  is the same reason patterns ship as plain HTML. Generating the story
  from the page costs nothing and keeps one source.
