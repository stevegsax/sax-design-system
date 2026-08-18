---
status: Proposed
date: 2026-08-18
requested-by: Claude (sax-designer), sax-unified-front-end
---

# Add a document-viewer chrome pattern

## Context

The unified front-end's viewer mockups put one shared chrome around two different reading surfaces (a paged PDF canvas; a continuous literary reading pane): a viewer toolbar under the app bar — back link, document title, format caption, find-in-document field, format-specific location controls (page count and zoom for PDF; a location breadcrumb for EPUB), rail toggles — and a three-column body: an annotations rail and a contents rail flanking the pane. The page shell covers the app bar, a single sidebar, and main; nothing covers a second contextual toolbar, a second rail, or the toolbar's control idioms. Considered and rejected: overloading the app bar (it is global chrome; these controls are document-contextual) and per-format chromes (the two source products' historical state — they diverge).

## Proposed change

A `viewer-chrome` pattern — pattern file only, no new tokens: toolbar on `color.background.surface` with the default bottom border, title as `typography.label` in `color.text.heading`, location controls as `typography.caption` in `color.text.muted`, secondary buttons from base; body grid `var(--shell-sidebar-width) 1fr var(--shell-sidebar-width)` with the rails styled as the shell sidebar is (surface background, dividing border, own scroll). Rail collapse mechanics are out of scope here (the mockups' toggles are inert); a later decision covers collapse/resize.

## Provisional styling in use

`sax-unified-front-end/mockups/viewer-pdf/index.html` and `viewer-epub/index.html`, toolbar and body grid marked `data-provisional="2026-08-18-viewer-chrome"`.

## Impact

Minor — a new pattern file plus this record; no token wiring. Reuses `shell.sidebar.width` for both rails; if rail width needs its own dial, that is a follow-up token request.

## Alternatives considered

- Extending `page-shell-application` in place — the shell is every application page's start; a document viewer is one page kind, and burdening the shell with viewer controls taxes every other page.
- Per-format chrome patterns — doubles the surface and re-creates the divergence the unified product exists to remove.
