# Working in this repo

- `tokens/**/*.tokens.json` (DTCG 2025.10) is the source of truth, **except `tokens/primitive/color.tokens.json`**, which is generated from `config/ramps.json` by `npm run generate:ramps`. `resolvers/` and `dist/` are also generated — never hand-edit any of these; edit `config/ramps.json` (primitive color ramps), `config/matrix.json`, or `scripts/resolver.jq` instead. All are committed: regenerate (`npm run build`) and commit them together with any token change.
- Token tiers: component → semantic → primitive. New tokens go in the highest tier that fits. Name by role, never by value (no `blue`, no `gray-light`).
- Override sets (mode files, product files) may only remap `{references}`. Never redeclare a raw color value outside `tokens/primitive/`.
- Color values use the full structured form: `colorSpace` (oklch), `components`, `alpha`, and a `hex` fallback. Primitive ramps are computed from `config/ramps.json` (hue + chroma rule per ramp) — to change the palette, edit the spec and run `npm run generate:ramps`, never hand-edit the components. `npm run check:ramps` (part of `build`) fails if the committed file drifts from the spec; `npm run check:color` fails if any hex and components disagree.
- Every fg/bg pairing intended for text or indicators must have an entry in `config/contrast-pairs.json` (APCA: 75 body, 60 headings/labels, 45 non-text).
- `npm run build` runs the whole pipeline (generate resolvers → ajv validation → color checks → CSS). Run it before considering any token change done.
- `npm run test:visual` screenshots the Storybook token catalog (`stories/`, one story per product × category, parsed from the built `dist/*/tokens.css`) against committed baselines in `tests/visual/tokens.spec.js-snapshots/`. Run it after `npm run build` for any token change; if a diff is intentional, inspect `test-results/`, then `npm run test:visual:update` and commit the new baselines with the token change. Baselines are darwin-suffixed — they only compare on macOS.
- Product names are defined in `config/matrix.json` and `tokens/products/`.
- Dependencies are pinned exact (`.npmrc`); do not loosen version ranges.
- Before touching the reveal.js theme (`scripts/build-presentation.js`, `dist/presentation/theme.css`) or the presentation product's tokens, read `tokens/products/presentation/README.md` — it covers reveal's two-layer styling model, the `--r-*` variable contracts, and how to verify a theme change by rendering in headless Chrome.

## Extending the system (tokens, types, products)

A token is not "added" until it appears in **three** places: `dist/<product>/tokens.css`, the README token tables, and the Storybook catalog. `dist` updates automatically from the resolver, but the README generator (`scripts/build-docs.js`) and the catalog (`stories/lib/catalog.js`) are **category-aware** — they enumerate known token files and known CSS-var prefixes. A new token *value* in an existing tier+type flows everywhere for free; a new token *type, tier file, prefix, or product* ships to `dist` but silently vanishes from the README and catalog until you teach those tools its category. (This is how the `effect`/shadow tier first shipped invisible.) Match the change to its checklist:

- **New token in an existing tier + type** (e.g. another `semantic/color`, another `component/dimension`): edit the JSON, `npm run build`. Appears in all three surfaces automatically.
- **New primitive ramp (a new hue):** edit `config/ramps.json`, run `npm run generate:ramps`, **and** add the ramp name to the `RAMPS` set in `scripts/lib/css-tokens.js` — otherwise its raw steps leak into every product's `dist` instead of being filtered as primitives. Reference the steps from semantic/component tokens.
- **New token `$type` or new tier file** (the most wiring — e.g. `tokens/semantic/effect.tokens.json`, `$type: shadow`): touch **all** of —
  - `scripts/resolver.jq` — add the file to the correct `sets.sources`, or it is never resolved into any product.
  - `scripts/lib/css-tokens.js` — register any Style-Dictionary transform the type needs in the `css` platform (e.g. `transforms.shadowCssShorthand`); extend `isPrimitive` if it lives under a primitive path.
  - `scripts/build-docs.js` — `leaves(load(...))` the file, add a rows/table + a `###` section, and update the console count line, or the README omits it.
  - `stories/lib/catalog.js` — add a `SECTION_FILTERS` entry keyed on the new CSS-var prefix **before** the `component` catch-all (so it is claimed, not lumped into component), plus a `valueKind` branch + a renderer if the value needs a bespoke preview (shadows get a swatch that casts the box-shadow).
  - `stories/*.stories.js` — export the new section story in **every** product.
- **New product:** add it to `config/matrix.json`; create all three `tokens/products/<name>/overrides{,.light,.dark}.tokens.json` (they may be empty of tokens, but `resolver.jq` `$ref`s all three, so they must exist); add `config/contrast-pairs.json` entries for any new text/indicator pairing; `npm run generate:resolvers` + `npm run build`. **Also** add the product's `tokens.css?raw` import to `PRODUCT_CSS` in `stories/lib/catalog.js` and create `stories/<name>.stories.js`, or the product has no catalog page or baseline.
- After any of these: `npm run build`, confirm the token shows in `dist` **and** the README **and** the catalog, then `npm run test:visual:update` on macOS to capture/refresh baselines and commit them with the change (a new story or section has no baseline until you do).

## Releasing

- Products consume this package as a git dependency pinned to a release tag (`github:stevegsax/sax-design-system#vX.Y.Z`). There is no registry publish; `private: true` stays.
- Release flow: commit the change (with regenerated `dist/` and `resolvers/`, and a `CHANGELOG.md` entry), then `npm version patch|minor|major`, then `git push --follow-tags`. Move the Unreleased section of the changelog under the new version heading as part of the bump. The `version` script rebuilds after the bump so generated headers carry the new version, and stages the artifacts into the tag commit.
- Semver contract: token value changes are patch/minor; renaming or removing a token is major.
- Never add a `prepack` or `prepare` script: npm runs them on the consumer's machine when installing a git dependency, which would require Node, jq, and devDependencies in every consumer environment. Installs must stay zero-toolchain.
- Tags created manually with `git tag` are lightweight and `--follow-tags` will not push them; push those explicitly (`git push origin vX.Y.Z`). `npm version` creates annotated tags, which `--follow-tags` handles.
