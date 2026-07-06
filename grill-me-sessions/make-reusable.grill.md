# Grill Session: make-reusable

Started: 2026-06-19
Last updated: 2026-06-19
Status: complete
Domain: Software tooling / dev-environment setup — reusing the SAX design-system repo as the starting point for new design-system token-development sandboxes.

## Summary

FINAL PLAN (after the idea was progressively simplified): no copier, no rename.sh, no template
branch. To start a new design system: `git clone` SAX, repoint remotes so SAX is `upstream` and
the new project has its own `origin`, then edit primitives/criteria and run `npm run build`.
The deliverable is a token-development sandbox, NOT a shippable web product — so SAX text in the
demo pages is irrelevant and left as-is. Keeping SAX as `upstream` lets each sandbox pull future
pipeline improvements for free (the `copier update` benefit, achieved with plain git). The only
SAX artifact worth replacing is the logo SVGs, and only when/if the sandbox ever ships UI.

## Decision Log

### DECIDED: Sample pages included in template
- **Decision**: Keep the bespoke per-product build scripts and demo pages (blog, home, presentation) in the template.
- **Rationale**: They serve as starting points; user will edit after hydration.
- **Date**: 2026-06-19

### DECIDED: SAX values kept as starting point
- **Decision**: Leave SAX primitive colors, tokens, and generated artifacts (resolvers/, dist/) in place.
- **Rationale**: Avoids the stale-generated-artifacts problem (committed artifacts are valid for SAX values); colors edited by hand post-hydration.
- **Date**: 2026-06-19

### DECIDED: Hydration boundary is "just the name"
- **Decision**: The only copier-time variable is the name; everything else is baked SAX content.
- **Rationale**: Starting from SAX values anyway, so nothing else needs to vary at hydration.
- **Date**: 2026-06-19
- **CHALLENGED**: "the name" is not a single token — see Open Threads.

### DECIDED: Success = renamed copy that builds
- **Decision**: A correctly hydrated template builds a package identical to the SAX system but with a new name.
- **Date**: 2026-06-19

### DECIDED: Use git clone + rename.sh, not copier
- **Decision**: Drop copier. Reusability = `git clone --depth 1` + `rename.sh` to swap SAX identifiers. Upgrade to copier only when update-propagation or a questionnaire is genuinely needed.
- **Rationale**: Variable surface is a handful of name forms with no update link wanted; copier's weight buys nothing here.
- **Date**: 2026-06-19

### CHALLENGED: rename.sh is not a one-liner
- Naive `sed s/sax/x/gi` corrupts `stevegsax` (owner handle, contains "sax") and only half-renames `SAX_logo_symbol.svg` (string in 3 build scripts vs. the file on disk).
- Needs 3-4 distinct inputs (display_name, package_scope, repo_slug, owner) and ORDERED longest-first replacement; owner gets its own exact pass before bare `sax`.
- Status: open.

### DECIDED: No link to SAX repo
- **Decision**: Hydrated projects are completely disconnected; new `git init`, not a fork.
- **Date**: 2026-06-19

### DECIDED: No rename.sh, no template branch
- **Decision**: Skip both. SAX text doesn't matter for a token sandbox; the only real artifact is the logo SVGs (the "creator email" turned out NOT to exist in any tracked file — it's only git commit metadata, already the user's). A template branch is the highest-maintenance option and only exists to filter SAX demo-content churn the user doesn't care about.
- **Rationale**: Deliverable is a token sandbox, not a product. Renaming would also create permanent merge conflicts against `upstream`, killing free pipeline pulls.
- **Date**: 2026-06-19

### DECIDED: Keep SAX as `upstream` (clone main)
- **Decision**: Clone `main`; SAX stays as `upstream` so each sandbox can `git pull upstream main` for pipeline improvements. Each new design system gets its own `origin`.
- **Rationale**: Free `copier update`-style propagation with plain git, available precisely *because* nothing is renamed. Only expected conflict surface is `tokens/primitive/color.tokens.json`, which is the intended divergence.
- **Date**: 2026-06-19

## Open Threads / Final Risks

- **REMOTE FOOTGUN (must handle)**: a fresh `git clone` sets `origin = SAX`. If left unchanged, `git push` pushes the new design system's commits into the SAX repo. The clone routine MUST `git remote rename origin upstream` and add a new `origin` before any push.
- **COLOR-EDIT CONSTRAINT (will bite on first build)**: editing base colors is not "paste new hex." Per CLAUDE.md, `check:color` fails if `hex` and the oklch `components` disagree; new ramp steps must be computed with culori (`clampChroma` to sRGB → `formatHex`). The "provide base colors after hydration" step has real work behind it.
- **Logos (deferred, low risk)**: SAX SVGs in `static-assets/logos/` remain until the sandbox ships UI. Manual file swap when it matters.

## Acceptance test
- `npm run build` green (generate:resolvers → validate → check:color → all build:* steps).
- Remotes correct: `origin` = new repo, `upstream` = SAX.

## Parking Lot

- Whether hydration runs `npm run build` (needs Node + jq on the machine).
- Version/CHANGELOG reset on hydration.
