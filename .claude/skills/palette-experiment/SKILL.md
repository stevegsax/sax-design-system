---
name: palette-experiment
description: >-
  Re-skin the SAX design system for an aesthetic (low eye strain, Solarized,
  sepia, 80s terminal, muted, high-contrast, etc.) on a throwaway experiment
  branch. Edits the ramp spec + semantic tokens, regenerates real CSS, measures
  APCA contrast, and recommends concrete fixes against a relaxed soft floor —
  letting you wave breaches through per palette. Use when asked to experiment
  with a palette/theme/color scheme, optimize the look for an attribute, or try
  an alternate skin. Do NOT use to change the canonical palette on main.
---

# Palette experiment

Improvise alternate palettes on a disposable branch while `main` stays strict.
You edit the **spec** (`config/ramps.json`) and the **semantic** tokens, then the
existing pipeline expands them into `dist/<product>/tokens.css`. You never paint
pixels — you move hues, chroma, and which tonal step each role points at.

## What this does and does not do

- It produces a palette **flavored** by a reference, not a pixel copy. The
  generator imposes a fixed-hue ramp + chroma rule + lightness ladder, so you can
  match a reference's **hues, temperature, and mood** — not its exact colors.
- Faithful reproduction would mean hand-writing `tokens/primitive/color.tokens.json`.
  Do not. `check:ramps` rejects it and it breaks the spec-is-source-of-truth rule.
- This is for **experiment branches only**. Relaxed contrast gates and improvised
  looks must never reach `main`.

## Hard rules

1. **Never run on `main`.** First thing, every time: `git branch --show-current`.
   If it is `main`, stop and create `experiment/<name>` instead. If relaxed gates
   leak to `main`, the whole accessibility contract is silently broken.
2. **Edit the spec, regenerate — never hand-edit generated files.** Generated:
   `tokens/primitive/color.tokens.json`, `resolvers/`, `dist/`. Edit
   `config/ramps.json` then run `npm run generate:ramps`.
3. **Reference only existing steps.** Semantic tokens point at steps by number
   (`{color.neutral.98}`). A reference to a step NOT in the ladder is schema-valid, so
   `validate` (ajv) PASSES it — then resolution CRASHES ("Reference Errors: Some token
   references could not be found", from `build:tokens` / `check-color`). Valid steps:

   ```
   neutral                        0 5 10 15 20 30 40 50 60 70 80 90 95 98 100
   brand success warning danger   10 15 20 30 40 50 60 70 80 90 95 98   (brand also: anchor)
   ```

   There is no `.25`, `.45`, `.55`, `.85`. Change hue/chroma/cap freely; leave the ladder alone.
4. **Situation overrides win — reconcile them.** Resolution order is primitive → semantic →
   component → **situation**. `tokens/situations/<situation>/overrides.{light,dark}.tokens.json`
   re-pin tokens after semantic, so a semantic change to a re-pinned token is silently ignored
   for that situation. Today three situations re-pin `background.page`
   (marketing→`neutral.100`, literary→`.95`/`.5`, presentation dark→`neutral.0`). Edit the
   override too, or accept the situation's value.
5. **Relaxations stay on the branch.** Lowering a gate edits the committed
   `config/contrast-pairs.json`; that is fine on an experiment branch and only there.

## The knobs

```
config/ramps.json                      ← hue + saturation levers (primitive tier)
├── cap            0.17                 global chroma ceiling — lower to desaturate
├── ramps[].hue                        per-ramp hue (neutral 250, brand 249.6,
│                                        success 150, warning 85, danger 25)
└── ramps[].rule   const|ceiling|proportional   neutral is const 0.006

tokens/semantic/color.light.tokens.json   ← luminance + contrast levers (light)
tokens/semantic/color.dark.tokens.json    ← luminance + contrast levers (dark)
├── background.{page,surface,surface-raised,inset}   which neutral step is the bg
├── text.{heading,body,muted,on-accent,link}         which step is the fg
├── border.{default,strong,focus}
├── accent.{default,hover,active,subtle}
└── status.{success,warning,danger}.{text,background,border}

tokens/situations/<situation>/overrides.{light,dark}.tokens.json   ← SITUATION tier — WINS over semantic
└── re-pins today: background.page marketing→neutral.100, literary→.95/.5, presentation(dark)→neutral.0

config/contrast-pairs.json             ← the build's APCA gate (23 pairs)
└── pairs[].minLc   75 body · 60 headings/labels/alerts · 45 non-text
```

The four eye-strain levers map to these:

| Lever | Where | How |
| --- | --- | --- |
| Warmer temperature | `ramps.json` hue | move `neutral.hue` off 250 toward warm (~70–90) |
| Reduced saturation | `ramps.json` cap | lower `cap` (e.g. 0.17 → 0.13) |
| Lower peak luminance | semantic bg **+ situation override** | `background.page` off pure white (.98→.95) — also in any situation's override file that re-pins it |
| Softer contrast | semantic text | narrow the text↔bg gap (`text.body` .20→.40) — **the lever that breaches Lc 75** |

Warmth and saturation are APCA-cheap (luminance barely moves). Luminance and
contrast move APCA and are where the soft floor and the relax protocol come in.

## Workflow

1. **Branch.** `git branch --show-current`; if `main`, `git switch -c experiment/<name>`.
2. **Resolve a reference.** For a named scheme (Solarized, Gruvbox, sepia) use its
   known hexes; for a vibe, propose a small reference set and confirm with the user.
   Convert hexes to OKLCH:

   ```sh
   node --input-type=module -e 'import {converter} from "culori"; const ok=converter("oklch"); for (const h of ["#fdf6e3","#268bd2"]) {const c=ok(h); console.log(h, `L=${c.l.toFixed(3)} C=${c.c.toFixed(3)} H=${(c.h??0).toFixed(0)}`);}'
   ```

3. **Best-fit primitives.** In `config/ramps.json`: set each ramp's `hue` from the
   reference (neutral from the base tones, brand/success/warning/danger from accents),
   and `cap` for the saturation lever. When the reference's neutral drifts in hue,
   pick the end that serves the target (warm for eye strain). Keep `steps`. Then:

   ```sh
   npm run generate:ramps
   ```

4. **Remap semantics, then reconcile situation overrides.** Change luminance + contrast in both
   `tokens/semantic/color.light.tokens.json` and `.dark.tokens.json`. Then, for each token you
   changed, grep `tokens/situations/*/overrides.*.tokens.json` — any situation that re-pins it
   (today: `background.page` in marketing, literary, and presentation-dark) overrides your change,
   so edit the override too or accept that situation keeps its own value.
5. **Measure + advise.** Regenerate resolvers if missing, then run the advisor:

   ```sh
   npm run generate:resolvers && node scripts/advise-color.js
   ```

   For every pair it prints the APCA Lc, flags those below the committed gate, and names
   the nearest clearing step (the **fix**) plus the **relax** target. (`node scripts/check-color.js`
   prints every raw line if you want it.)
6. **Decide per pair (soft floor).** The advisor marks the **soft floor** — body Lc 60
   (vs main's 75), headings/labels 60, non-text 45. For each flagged pair present three
   choices: **(a)** apply the named fix, **(b)** relax the gate, **(c)** accept. Decide per palette.
7. **Apply / relax.** Apply chosen fixes to the semantic files. For pairs the user
   keeps below 75, lower that pair's `minLc` in `config/contrast-pairs.json` to ≤ the
   achieved Lc so the build can go green.
8. **Build + preview.**

   ```sh
   npm run build
   open dist/preview/marketing.html   # or literary / documentation / presentation / application
   ```

   Iterate from step 3 until it looks right by eye.

## The recommender

`scripts/advise-color.js` is the recommender — run it after `generate:ramps`. It
resolves every product × mode, reports each pair's Lc, flags those below the gate, and
for each names the nearest ramp step that clears it plus the relax target:

```
below literary/light  Lc  70.1 < 75  body text on page
        fix:   neutral.50 -> neutral.40 (Lc 81.3)
        relax: minLc 75 -> 70  (>= soft floor 60)
```

(Cells are `base` plus each situation × mode; filter with `--situation literary --mode dark`.)

Under the hood it holds the background fixed and walks the foreground ramp's steps with
the same OKLCH/APCA math as `check-color.js`. To check a single what-if by hand:

```sh
node --input-type=module -e '
import { readFileSync } from "node:fs";
import { dtcgToCulori, culoriToRgb255 } from "./scripts/lib/color.js";
import { APCAcontrast, sRGBtoY } from "apca-w3";
const y = v => sRGBtoY(culoriToRgb255(dtcgToCulori(v)));
const prim = JSON.parse(readFileSync("tokens/primitive/color.tokens.json","utf8")).color;
const ramp = "neutral";                                   // foreground ramp
const bg = prim["neutral"]["95"].$value;                  // background step value
for (const [step, tok] of Object.entries(prim[ramp])) {
  if (step.startsWith("$") || step === "anchor") continue;
  console.log(`${ramp}.${step}`.padEnd(12), "Lc", Math.abs(APCAcontrast(y(tok.$value), y(bg))).toFixed(1));
}
'
```

Read off the nearest existing step that clears the floor and recommend it — only steps
already in the ladder, never invent a `.45`. E.g. *"`text.body` `{color.neutral.50}`
(Lc 70 on the page) → `{color.neutral.40}` clears Lc 75 at Lc 81; the ladder has no step
between."* If the reference's own step sits below the gate (Solarized's soft body does,
Lc 70 < 75), say so and offer to relax the gate instead of darkening.

> Soft floor vs build gate: the soft floor (60) is *advisory* — yours, in this
> conversation. The build gate is whatever `config/contrast-pairs.json` says. To pass
> the build with a deliberately low-contrast look, lower the relevant `minLc` to ≤
> the achieved Lc (the "relax" choice). To keep the look readable instead, apply the
> recommended step and leave the gate alone.

## Worked example: low eye strain via Solarized

Solarized's neutrals drift from teal (base03, H≈220) in the darks to warm cream
(base3 `#fdf6e3`, L0.974 C0.026 H90) in the lights. For eye strain, best-fit the
**warm** end. Accents map almost onto the existing hues.

`config/ramps.json`:

```
cap: 0.17 → 0.13                       # gentle desaturation
neutral.hue: 250 → 88                  # warm cream tint
neutral.rule.value: 0.006 → 0.02       # a touch more warmth in the greys
brand.hue:   249.6 → 245               # Solarized blue (barely moves)
success.hue: 150 → 119                 # Solarized green
warning.hue: 85 → 86                   # Solarized yellow (already there)
danger.hue:  25 → 27                   # Solarized red (already there)
```

`tokens/semantic/color.light.tokens.json` (luminance + contrast):

```
background.page:   {color.neutral.98} → {color.neutral.95}   # warm off-white
background.surface:{color.neutral.100} → {color.neutral.98}  # no pure white
text.heading:      {color.neutral.10} → {color.neutral.40}
text.body:         {color.neutral.20} → {color.neutral.50}   # ~Solarized base00 (L0.57), soft
```

Then `npm run generate:ramps` and measure. `text.body` at `neutral.50` (the existing
step nearest Solarized's body, base00 L0.57) on a `neutral.95` page lands at **Lc 70**
— it clears the soft floor (60) but breaches the body gate (75). The only darker neutral
step is `.40` (Lc 81 — the ladder jumps 40→50→60, there is no `.45`), so either darken to
`.40` or keep `.50` and relax `body text on page` / `on surface` / `code text on inset` to
`minLc: 65`. Also reconcile situation overrides: marketing re-pins `background.page` to
`neutral.100` (white) — lower it to `{color.neutral.95}` too, or that situation stays pure white.
In dark mode keep `page` at `.10` (the only step below `surface`=`.15`; `.15` collapses them) and
dim the text instead (`text.body .90→.80`) — that softening pulls dark body to ~Lc 67, the same
soft breach you relax in light.

## Done

"Done" is by eye: open the situation previews (`dist/preview/*.html`), confirm the warm low-strain feel, and confirm
the Lc report shows nothing below the experiment's chosen floor. Leave the work on the
branch; do not merge to `main`.
