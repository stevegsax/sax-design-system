---
status: Proposed
date: 2026-08-18
requested-by: Claude (sax-designer), sax-unified-front-end
---

# Add a tree-navigation pattern

## Context

The unified front-end's library mockup (`sax-unified-front-end/mockups/library/`) needs a sidebar that presents document groups as a collapsible tree: investments with their portfolio companies as children, a document-type hierarchy, and path-nested personal tags — with per-node counts, a current-selection state, and a filter input, at a corpus scale (tens of thousands of documents) where a flat list fails. Considered and rejected: the page shell's `section-nav` (flat — no nesting, disclosure, or counts) and the card pattern (a container, not navigation).

## Proposed change

A `tree-navigation` pattern — pattern file only, no new tokens. Disclosure via nested `<details>`/`<summary>`; node rows styled from existing roles: `typography.label` in `color.text.body`, hover on `color.background.inset`, current node on `color.accent.subtle` with `color.text.link` (the pairing `section-nav .current` already uses), counts as `typography.caption` in `color.text.muted`, nesting indented by `space.md`. Markup shape:

```html
<ul class="tree">
  <li>
    <details open>
      <summary>SPV123</summary>
      <ul>
        <li><a class="current" href="#">All SPV123 files <span class="count">68</span></a></li>
      </ul>
    </details>
  </li>
</ul>
```

## Provisional styling in use

`sax-unified-front-end/mockups/library/index.html`, sidebar marked `data-provisional="2026-08-18-tree-navigation"`. On approval the mockup's local CSS is replaced by the pattern's and the marker removed.

## Impact

Minor — a new pattern file plus this record; no token wiring (same class of change as the tag and card pattern additions).

## Alternatives considered

- Flat `section-nav` lists, one per group kind — loses the hierarchy the product's data actually has (investment-to-company relations, a document-type hierarchy, path-nested personal tags).
- A scripted tree widget — the system ships no JavaScript; `<details>` disclosure is CSS-only and sufficient.
