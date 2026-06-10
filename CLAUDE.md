# Working in this repo

- `tokens/**/*.tokens.json` (DTCG 2025.10) is the source of truth. `resolvers/` and `dist/` are generated — never hand-edit them; edit `config/matrix.json` or `scripts/resolver.jq` instead.
- Token tiers: component → semantic → primitive. New tokens go in the highest tier that fits. Name by role, never by value (no `blue`, no `gray-light`).
- Override sets (mode files, product files) may only remap `{references}`. Never redeclare a raw color value outside `tokens/primitive/`.
- Color values use the full structured form: `colorSpace` (oklch), `components`, `alpha`, and a `hex` fallback. Compute new ramp steps with culori (`clampChroma` to sRGB, then `formatHex`) — `npm run check:color` fails if hex and components disagree.
- Every fg/bg pairing intended for text or indicators must have an entry in `config/contrast-pairs.json` (APCA: 75 body, 60 headings/labels, 45 non-text).
- `npm run build` runs the whole pipeline (generate resolvers → ajv validation → color checks → CSS). Run it before considering any token change done.
- Product names `portal` and `console` are placeholders pending real product names; rename in `config/matrix.json` and `tokens/products/`.
- Dependencies are pinned exact (`.npmrc`); do not loosen version ranges.
