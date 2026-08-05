# The design process

> **Status: proposed, not implemented.** This document specifies the
> process; nothing described here ships yet. It is the companion spec to
> `decisions/2026-08-05-text-driven-design-process.md`. Do not follow it
> as a guide until that ADR is `Approved`.

How a screen or a flow of screens goes from an idea to an accepted
design, entirely in text files, with no GUI design tool anywhere in the
path. `building-pages.md` covers how to build one page; this covers the
lifecycle around it — framing the problem, writing requirements, mapping
the flow, producing mockups, and recording the review.

The process runs in a **product repo**, against a pinned release of this
package. It produces plain text and JSON; the only rendered artifacts
are the mockups themselves, which are HTML.

## Principles

1. **Text is the record; renderings are disposable.** Every decision,
   requirement, and flow edge lives in a file a human can read and a
   diff can show. Mockups and diagrams are generated from, or checked
   against, those files — never the reverse.
2. **Never block.** A design does not stop moving because a human has
   not answered. When the process needs a human, it files a ticket,
   records the assumption it is proceeding under, and continues. This is
   the same rule the ADR gate already follows: style provisionally, file,
   move on.
3. **Gates bind acceptance, not progress.** Work continues past an open
   gate; a design cannot reach `accepted` with one unresolved.
4. **Divergence before convergence, once.** The brainstorm stage
   requires options that were considered and rejected. After it, the
   design converges — reopening the framing is a new design, not an edit.
5. **Two registers, one gate mechanism.** Decisions about *the product*
   live with the design. Decisions about *the style system* — a token, a
   pattern, a standard — go to this repo's `decisions/` exactly as they
   do today. Neither register absorbs the other.

## The lifecycle

| Stage | Question it answers | Artifact | Gate on exit |
| --- | --- | --- | --- |
| `brainstorm` | Is this the right problem, and which direction? | `brief.md` | G1 framing (non-blocking) |
| `requirements` | What must be true for this to be done? | `requirements.md` | G2 requirements (**blocking**) |
| `flow` | Which screens exist and how are they reached? | `flow.json` | G3 flow (non-blocking) |
| `mockup` | What does it look like? | `screens/*.html` + stories | — |
| `review` | Is it right, and does it comply? | `review.md` | G4 sign-off (**blocking**) |
| `accepted` | — | — | — |

Terminal stages besides `accepted`: `superseded` (a later design replaces
it — names the successor) and `abandoned` (dropped — records why).
Neither is ever deleted.

G2 blocks because building a dozen screens against wrong requirements is
the most expensive mistake available. G1 and G3 do not: a wrong framing
is cheap to rework while there is little built, and a flow correction
usually adds or removes a screen rather than invalidating the set.

## Where things live

In the product repo:

```text
design/
  README.md                     generated — the status index for all designs
  <slug>/
    design.json                 the control file (state, gates, links)
    brief.md                    stage 1
    requirements.md             stage 2
    flow.json                   stage 3 — source of truth for the screen graph
    flow.md                     generated from flow.json (Mermaid)
    review.md                   stage 5
    decisions/
      YYYY-MM-DD-<slug>.md      product design decisions (MADR)
    screens/
      <screen-id>.html          standalone mockup
      <screen-id>.<state>.html  optional per-state mockup
```

`design/README.md` and `flow.md` are generated. Everything else is
hand-written or agent-written and hand-editable.

Product design decisions get their own register under the design, not a
repo-wide one: they are scoped to the design that produced them, and a
superseded design carries its decisions into the record with it.

## The control file — `design.json`

One per design. It holds state that must be machine-readable: the stage,
the gates, the links out to ADRs and provisional styling. It holds no
prose — prose belongs in the markdown artifacts.

```json
{
  "$schema": "../../node_modules/@sax/design-system/schemas/design.json",
  "slug": "records-triage",
  "title": "Records triage",
  "stage": "mockup",
  "situation": "application",
  "created": "2026-08-05",
  "updated": "2026-08-11",
  "requested-by": "Steven Greenberg",
  "design-system": "v1.1.0",
  "gates": [
    {
      "id": "G1-framing",
      "stage": "brainstorm",
      "blocking": false,
      "status": "answered",
      "opened": "2026-08-05",
      "answered": "2026-08-07",
      "ticket": "sax-needs-human-action:tickets/2026-08-05-g1-records-triage.md",
      "assumed": "Triage is a queue, not a filtered list view.",
      "resolution": "Confirmed. Queue, with the filtered list kept as a fallback view."
    },
    {
      "id": "G2-requirements",
      "stage": "requirements",
      "blocking": true,
      "status": "open",
      "opened": "2026-08-09",
      "answered": null,
      "ticket": "sax-needs-human-action:tickets/2026-08-09-g2-records-triage.md",
      "assumed": "R-7 (bulk dismiss) is in scope for this design.",
      "resolution": null
    }
  ],
  "adrs": [
    { "slug": "2026-08-10-icon-set", "status": "Proposed" }
  ],
  "provisional": [
    { "marker": "2026-08-10-icon-set", "where": "screens/queue.html" }
  ],
  "supersedes": null,
  "superseded-by": null
}
```

| Field | Meaning |
| --- | --- |
| `stage` | One of the lifecycle stages above. The only field that gates check against. |
| `situation` | The default reading situation for this design's screens (`config/matrix.json`). Individual screens may differ. |
| `design-system` | The release tag the design was built against. A pin bump that changes rendering is a review trigger. |
| `gates[].blocking` | Whether the stage may be left with this gate open. |
| `gates[].assumed` | What the process proceeded with while waiting. Required whenever `status` is `open` — an open gate with no stated assumption is a check failure. |
| `gates[].resolution` | Copied from the ticket by `/design sync`. The ticket is the source of truth; this is a cache, and a check compares them. |
| `adrs` | Style-system ADRs this design filed, with last-synced status. |
| `provisional` | Every `data-provisional` marker in the design's screens, and where. Must reconcile with the ADR list and with the markup. |

## Stage 1 — brainstorm (`brief.md`)

Divergent. The point is to produce and discard options, in writing,
before anything converges. A brief with one option is a check failure.

```markdown
---
design: records-triage
stage: brainstorm
---

# Records triage — brief

## Problem

Who is hurting, doing what, and what the evidence is. No solution here.

## Prior art in the system

Which shipped patterns, prototypes, and existing product screens already
cover part of this. Name them; reuse is cheaper than design.

## Options considered

At least three, one paragraph each, each with the reason it was kept or
dropped.

1. **Queue** — …  Kept.
2. **Filtered list view** — …  Dropped: hides the backlog.
3. **Inbox with rules** — …  Dropped: no rules engine exists.

## Direction

The option taken, and the one-sentence reason.

## Non-goals

What this design deliberately does not do.

## Open questions

Each becomes a human gate ticket, or is answered in the brief before
leaving the stage.
```

On exit: gate **G1 framing** opens — a human confirms the problem and
the direction. Non-blocking; the process proceeds to requirements under
the stated assumption.

## Stage 2 — requirements (`requirements.md`)

[EARS](https://alistairmavin.com/ears/) notation, because it is
unambiguous to both a human reviewer and an agent, and because each
clause is directly testable. Requirements carry stable ids that the flow
and the review cite.

```markdown
---
design: records-triage
stage: requirements
---

# Records triage — requirements

### R-1 — See the triage backlog

**As** an analyst **I want** to see every record awaiting triage **so
that** I can judge the size of the backlog.

- **THE SYSTEM SHALL** list every record in the triage queue, oldest
  first.
- **WHEN** the queue is empty **THE SYSTEM SHALL** show the empty state.
- **WHILE** the queue is loading **THE SYSTEM SHALL** show the loading
  state.

*Acceptance:* a queue of 0, 1, and 200 records each render correctly.

### R-2 — Open a record

…

### R-7 — Dismiss records in bulk — *withdrawn (G2, 2026-08-12)*

Kept for the record; ids are never reused or renumbered.
```

Rules:

- Ids are `R-<n>`, assigned in order, **never reused and never
  renumbered**. A dropped requirement is marked `withdrawn` in place with
  the reason and the gate that dropped it.
- Every requirement uses one or more EARS clause forms: ubiquitous (`THE
  SYSTEM SHALL`), event-driven (`WHEN … THE SYSTEM SHALL`), state-driven
  (`WHILE … THE SYSTEM SHALL`), unwanted (`IF … THEN THE SYSTEM SHALL`),
  optional (`WHERE … THE SYSTEM SHALL`).
- The user-story line is context for humans; the EARS clauses are the
  contract. A requirement with a story and no clause is a check failure.
- The heading form `### R-<n> — <title>` is the parse anchor. Keep it.

On exit: gate **G2 requirements** opens. Blocking — the requirements are
the contract everything downstream is checked against.

## Stage 3 — flow (`flow.json`)

The screen graph is JSON, not a diagram, because it is checked: every
screen reachable, every requirement covered, every mockup present.
`flow.md` is generated from it as a Mermaid diagram, which GitHub renders
natively — so the picture is a view of the data, never a second copy of
it.

```json
{
  "$schema": "../../node_modules/@sax/design-system/schemas/flow.json",
  "design": "records-triage",
  "entry": ["queue"],
  "screens": [
    {
      "id": "queue",
      "title": "Triage queue",
      "purpose": "The backlog, oldest first; the analyst's starting point.",
      "situation": "application",
      "requirements": ["R-1", "R-3"],
      "states": ["default", "empty", "loading"],
      "mockup": "screens/queue.html",
      "story": "Records triage/Queue"
    },
    {
      "id": "record",
      "title": "Record detail",
      "purpose": "One record, with the evidence needed to accept or reject it.",
      "situation": "application",
      "requirements": ["R-2", "R-4"],
      "states": ["default", "error"],
      "mockup": "screens/record.html",
      "story": "Records triage/Record"
    }
  ],
  "transitions": [
    {
      "from": "queue",
      "to": "record",
      "trigger": "Selects a row",
      "kind": "navigate",
      "requirement": "R-2"
    },
    {
      "from": "record",
      "to": "queue",
      "trigger": "Accepts or rejects the record",
      "kind": "replace",
      "requirement": "R-4",
      "condition": "The record has a decision recorded"
    }
  ]
}
```

`kind` is one of `navigate`, `replace`, `overlay`, `dismiss`, `submit`,
`external`. `condition` is optional prose stating the guard.

A screen that is deliberately unreachable from an entry (a deep link, an
error landing) declares `"unreachable": "<reason>"` rather than failing
the reachability check.

On exit: gate **G3 flow** opens. Non-blocking.

## Stage 4 — mockup (`screens/`, plus stories)

Delegated to the `sax-designer` skill, unchanged: the decision ladder,
the situation attribute, both modes, no raw values, the ADR gate for
anything the system does not cover. What this process adds is that each
screen is now **named by the flow** and must exist where `flow.json` says
it does.

Two delivery surfaces, both required for a design entering review:

- **Standalone page** — `screens/<screen-id>.html`, self-contained, opened
  directly in a browser. The fast loop while designing.
- **Storybook story** — the same markup rendered under the design system's
  token and base stylesheets, so `storybook build` produces one static
  site covering every screen and state in the flow. The review surface.

The story is generated from the standalone page, not written twice: a
shipped helper imports the screen HTML raw and wires the situation
attribute and stylesheets the same way `stories/lib/prototypes.js` does
for the prototype fleet. The standalone page stays the source.

States: a screen declares its states in `flow.json`. The `default` state
is the screen's own file; another state may add
`screens/<screen-id>.<state>.html`. Any requirement written in the
unwanted form (`IF … THEN THE SYSTEM SHALL`) must map to a declared state
on some screen — that check is what stops error and empty states from
being quietly skipped, which is the most common gap in generated designs.

## Stage 5 — review (`review.md`)

Two halves, and the split matters: everything a machine can check is
checked before a human is asked to look.

```markdown
---
design: records-triage
stage: review
design-system: v1.1.0
reviewed: 2026-08-14
---

# Records triage — review

## Automated

| Check | Result |
| --- | --- |
| C1 requirement coverage | pass |
| C2 flow reachability | pass |
| C3 state coverage | **fail** — R-5 (IF … THEN) has no state |
| … | |

## Compliance

Findings from the `sax-designer` review checklist: raw values, primitive
leakage, unmarked provisional styling, ungated text pairings, mode
assumptions, brand mechanical rules.

## Human review

What a person must judge and cannot be checked: does this solve the
problem in `brief.md`, is the hierarchy right, is it worth building.

## Findings

Numbered, each with the screen it applies to and its disposition —
fixed, deferred (with a decision record), or accepted as-is.
```

On exit: gate **G4 sign-off** opens. Blocking — this is the gate that
`accepted` waits on.

## Product design decisions

A decision made *about the design* — not about the style system — is
recorded under the design in `decisions/YYYY-MM-DD-<slug>.md`, in MADR
form: context, decision drivers, considered options with pros and cons,
outcome, consequences. Same date-prefixed filename convention as this
repo's ADRs, and for the same reason: concurrent filings must not
collide.

File one when a choice would otherwise be invisible in the artifacts —
why the queue sorts oldest-first, why bulk actions were dropped, why a
confirmation step exists. Do not file one for a choice the requirements
already state.

**A decision that needs a token, a pattern, or a standard is not one of
these.** It goes to this repo's `decisions/` as an ADR, through the
existing gate, and gets listed in `design.json`'s `adrs` array. The
design keeps moving with `data-provisional` styling exactly as it does
today.

## Gates and human tickets

A gate is a point where the process wants a human. It opens a ticket in
`stevegsax/sax-needs-human-action`, records the ticket reference and the
assumption being made in `design.json`, and continues.

Tickets are files, not issues, so they diff and travel with the repo:

```text
tickets/
  YYYY-MM-DD-<slug>.md
  index.json                  generated
```

```markdown
---
id: 2026-08-09-g2-records-triage
kind: design-gate
status: open
blocking: true
opened: 2026-08-09
answered: null
origin-repo: stevegsax/<product>
origin-design: records-triage
gate: G2-requirements
---

# Approve the triage requirements

## Asked

Approve `design/records-triage/requirements.md` at R-1…R-8, or say what
changes.

## Why this needs a human

The requirements are the contract every later check runs against. R-7
(bulk dismiss) materially changes the flow and no existing product
behaviour settles it.

## Context

- Brief: `design/records-triage/brief.md`
- Requirements: `design/records-triage/requirements.md`
- Proceeding under: R-7 is in scope.

## Options

1. Approve as written.
2. Approve without R-7 — drops the bulk bar from the queue screen.
3. Changes required — say which.

## Resolution

<!-- The human writes here, then sets status: answered and fills in
     `answered:`. -->
```

`kind` covers more than this process: `design-gate`, `adr-review`,
`access`, `procurement`, `judgment`, `other`. `status` is `open`,
`answered`, `rejected`, or `withdrawn`.

The **"why this needs a human"** section is required, and it is the point
of the format. It forces the process to justify each escalation rather
than routing every uncertainty to a person, which is what makes a ticket
queue worth reading.

`/design sync` reads ticket status and copies resolutions into
`design.json`. The ticket is the source of truth; a mismatch is a check
failure, not a silent overwrite.

## Commands

The process is driven by text commands against a `sax-design-process`
skill, which delegates to `sax-designer` for anything that touches
markup.

| Command | Effect |
| --- | --- |
| `/design new <slug>` | Create `design/<slug>/` with `design.json` at stage `brainstorm`. |
| `/design brief` | Work the brainstorm stage. |
| `/design requirements` | Derive or edit requirements from the brief. |
| `/design flow` | Build or edit `flow.json`; regenerate `flow.md`. |
| `/design mockup [screen]` | Build screens and stories (delegates to `sax-designer`). |
| `/design review` | Run every check, write `review.md`, open G4. |
| `/design status [slug]` | Stage, open gates, open ADRs, failing checks. |
| `/design gate <id>` | Open or re-open a gate and file its ticket. |
| `/design sync` | Pull ticket resolutions and ADR statuses; refresh the index. |
| `/design accept` | Attempt `accepted`; fails listing every unmet gate and check. |

Every command is also a no-argument read: running `/design` with no verb
prints the index.

## Checks

The checks are what make this a process rather than a filing convention.
They run on `/design review` and `/design accept`, and they are cited by
id in `review.md`.

| Id | Check |
| --- | --- |
| C1 | Every requirement is referenced by at least one screen or transition. |
| C2 | Every screen is reachable from an entry, or declares `unreachable`. |
| C3 | Every unwanted-form (`IF … THEN`) requirement maps to a declared screen state. |
| C4 | Every screen and state named in `flow.json` has its mockup file, and every mockup file is named in `flow.json`. |
| C5 | Every screen has a story, and every story is in the built Storybook. |
| C6 | Every requirement id cited anywhere exists in `requirements.md` and is not withdrawn. |
| C7 | Every transition endpoint is a declared screen. |
| C8 | Every screen's `situation` is in `config/matrix.json`. |
| C9 | Every open gate states an assumption; every answered gate's resolution matches its ticket. |
| C10 | Every `data-provisional` marker in the screens is listed in `design.json` and has an ADR; every listed ADR is still open or its provisional styling is gone. |
| C11 | Every requirement has at least one EARS clause. |
| C12 | `flow.md` is current with `flow.json`. |
| C13 | The pinned `design-system` version matches the product's installed pin. |

Compliance checks on the markup itself — raw values, contrast gates,
brand rules, both modes — are the `sax-designer` review checklist, run as
part of stage 5 and reported in the same table.

## What implementation touches

For reference during review; none of this exists yet.

- **This repo:** `skills/sax-design-process/` (skill, templates for each
  artifact, MADR template); `schemas/design.json` and `schemas/flow.json`;
  `scripts/design/` (validate, check, build `flow.md`, build the index,
  gate and sync); a story helper for product screens; `files` gains
  `schemas`, `scripts/design`, and the new skill; `guidelines/README`
  cross-links; this document loses its status banner.
- **`sax-needs-human-action`:** `README.md` specifying the ticket format,
  `tickets/`, and the generated `index.json`.
- **Constraint:** the shipped scripts must run with **no dependencies** on
  Node 22 alone. Consumers install a zero-toolchain git dependency, so the
  checkers are hand-rolled rather than built on `ajv`. The JSON Schemas
  ship for editor support, not as the runtime validator.
