# Working in this repo

- `tokens/**/*.tokens.json` (DTCG 2025.10) is the source of truth. `resolvers/` and `dist/` are generated — never hand-edit them; edit `config/matrix.json` or `scripts/resolver.jq` instead. Both are committed: regenerate (`npm run build`) and commit them together with any token change.
- Token tiers: component → semantic → primitive. New tokens go in the highest tier that fits. Name by role, never by value (no `blue`, no `gray-light`).
- Override sets (mode files, product files) may only remap `{references}`. Never redeclare a raw color value outside `tokens/primitive/`.
- Color values use the full structured form: `colorSpace` (oklch), `components`, `alpha`, and a `hex` fallback. Compute new ramp steps with culori (`clampChroma` to sRGB, then `formatHex`) — `npm run check:color` fails if hex and components disagree.
- Every fg/bg pairing intended for text or indicators must have an entry in `config/contrast-pairs.json` (APCA: 75 body, 60 headings/labels, 45 non-text).
- `npm run build` runs the whole pipeline (generate resolvers → ajv validation → color checks → CSS). Run it before considering any token change done.
- Product names are defined in `config/matrix.json` and `tokens/products/`.
- Dependencies are pinned exact (`.npmrc`); do not loosen version ranges.

## Releasing

- Products consume this package as a git dependency pinned to a release tag (`github:stevegsax/sax-design-system#vX.Y.Z`). There is no registry publish; `private: true` stays.
- Release flow: commit the change (with regenerated `dist/` and `resolvers/`, and a `CHANGELOG.md` entry), then `npm version patch|minor|major`, then `git push --follow-tags`. Move the Unreleased section of the changelog under the new version heading as part of the bump. The `version` script rebuilds after the bump so generated headers carry the new version, and stages the artifacts into the tag commit.
- Semver contract: token value changes are patch/minor; renaming or removing a token is major.
- Never add a `prepack` or `prepare` script: npm runs them on the consumer's machine when installing a git dependency, which would require Node, jq, and devDependencies in every consumer environment. Installs must stay zero-toolchain.
- Tags created manually with `git tag` are lightweight and `--follow-tags` will not push them; push those explicitly (`git push origin vX.Y.Z`). `npm version` creates annotated tags, which `--follow-tags` handles.
