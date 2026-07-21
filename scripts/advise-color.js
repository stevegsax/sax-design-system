// scripts/advise-color.js
//
// Read-only APCA advisor for palette experiments
// (see .claude/skills/palette-experiment/SKILL.md).
//
// For every fg/bg pair in config/contrast-pairs.json, across base plus every
// situation x mode in config/matrix.json, it reports the APCA Lc, flags pairs
// below the build gate, and for each one recommends the nearest existing ramp
// step that would clear the gate -- plus whether the current value already meets
// a relaxed "soft" floor, so you can choose fix-vs-relax per palette.
//
// It reuses the same OKLCH/APCA math as scripts/check-color.js, so its numbers
// match the gate exactly. It NEVER edits files; it only advises.
//
// Usage:
//   node scripts/advise-color.js                      # soft floor 60, all cells
//   node scripts/advise-color.js --soft 65
//   node scripts/advise-color.js --situation literary --mode dark
//   node scripts/advise-color.js --all                # also list passing pairs

import { readFileSync } from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { APCAcontrast, sRGBtoY } from 'apca-w3';
import StyleDictionary from 'style-dictionary';
import { culoriToRgb255, dtcgToCulori } from './lib/color.js';
import { resolveTokens } from './lib/resolve.js';

// ---------------------------------------------------------------------------
// Pure core -- no I/O, no side effects. Exported so it can be unit-tested.
// ---------------------------------------------------------------------------

// APCA Lc magnitude (polarity-independent) for two DTCG color values.
export function apcaLc(fg, bg) {
  const y = (value) => sRGBtoY(culoriToRgb255(dtcgToCulori(value)));
  return Math.abs(APCAcontrast(y(fg), y(bg)));
}

// Same swatch? Compare DTCG components (numeric within epsilon; "none" exact).
export function sameValue(a, b) {
  if (!a?.components || !b?.components || a.components.length !== b.components.length) return false;
  return a.components.every((c, i) => {
    const d = b.components[i];
    return typeof c === 'number' && typeof d === 'number' ? Math.abs(c - d) < 1e-6 : c === d;
  });
}

// Flatten primitive ramps to [{ ramp, step, value }], skipping the brand anchor
// (a duplicate curve point, not a numbered step).
export function flattenPrimitives(primitiveColor) {
  const out = [];
  for (const [ramp, node] of Object.entries(primitiveColor)) {
    if (ramp.startsWith('$') || typeof node !== 'object') continue;
    for (const [step, token] of Object.entries(node)) {
      if (step.startsWith('$') || step === 'anchor') continue;
      out.push({ ramp, step, value: token.$value });
    }
  }
  return out;
}

// Which ramp/step a resolved value is, or null.
export function locate(value, primitives) {
  return primitives.find((p) => sameValue(p.value, value)) ?? null;
}

// In one ramp's steps, the step that clears minLc against bg with the smallest
// lightness move from fg. Returns { ramp, step, value, lc } or null.
export function nearestClearingStep({ fg, bg, rampSteps, minLc }) {
  const fgL = fg.components[0];
  return rampSteps
    .map((s) => ({ ...s, lc: apcaLc(s.value, bg) }))
    .filter((s) => s.lc >= minLc)
    .sort((a, b) => Math.abs(a.value.components[0] - fgL) - Math.abs(b.value.components[0] - fgL))[0]
    ?? null;
}

// A finding for one pair. `soft` caps the advisory floor (a body 75 drops to it).
export function advisePair({ pair, fg, bg, primitives, soft }) {
  const lc = apcaLc(fg, bg);
  const finding = { usage: pair.usage, minLc: pair.minLc, lc, passes: lc >= pair.minLc };
  if (finding.passes) return finding;
  const from = locate(fg, primitives);
  finding.from = from ? `${from.ramp}.${from.step}` : null;
  const rampSteps = from ? primitives.filter((p) => p.ramp === from.ramp) : [];
  const fix = nearestClearingStep({ fg, bg, rampSteps, minLc: pair.minLc });
  finding.fix = fix ? { to: `${fix.ramp}.${fix.step}`, lc: fix.lc } : null;
  finding.softFloor = Math.min(pair.minLc, soft);
  finding.clearsSoft = lc >= finding.softFloor;
  return finding;
}

// ---------------------------------------------------------------------------
// Imperative shell -- runs only when this file is executed directly.
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = { soft: 60, situation: null, mode: null, all: false };
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--soft') args.soft = Number(argv[(i += 1)]);
    else if (argv[i] === '--situation') args.situation = argv[(i += 1)];
    else if (argv[i] === '--mode') args.mode = argv[(i += 1)];
    else if (argv[i] === '--all') args.all = true;
  }
  return args;
}

async function main() {
  const ROOT = path.resolve(import.meta.dirname, '..');
  const args = parseArgs(process.argv.slice(2));
  const matrix = JSON.parse(readFileSync(path.join(ROOT, 'config/matrix.json'), 'utf8'));
  const { pairs } = JSON.parse(readFileSync(path.join(ROOT, 'config/contrast-pairs.json'), 'utf8'));
  const primitives = flattenPrimitives(
    JSON.parse(readFileSync(path.join(ROOT, 'tokens/primitive/color.tokens.json'), 'utf8')).color,
  );

  const situations = args.situation ? [args.situation] : ['base', ...matrix.situations];
  const modes = args.mode ? [args.mode] : matrix.modes;
  let below = 0;

  for (const situation of situations) {
    for (const mode of modes) {
      const resolverPath = path.join(ROOT, 'resolvers', `${situation}.${mode}.resolver.json`);
      const sd = new StyleDictionary({
        tokens: resolveTokens(resolverPath),
        log: { verbosity: 'silent' },
        platforms: { resolved: {} },
      });
      const { allTokens } = await sd.getPlatformTokens('resolved');
      const byPath = new Map(allTokens.map((t) => [t.path.join('.'), t.$value]));

      for (const pair of pairs) {
        const fg = byPath.get(pair.foreground);
        const bg = byPath.get(pair.background);
        if (!fg || !bg) {
          console.log(`miss  ${situation}/${mode}  ${pair.usage}  (missing ${!fg ? pair.foreground : pair.background})`);
          continue;
        }
        const f = advisePair({ pair, fg, bg, primitives, soft: args.soft });
        if (f.passes) {
          if (args.all) console.log(`ok    ${situation}/${mode}  Lc ${f.lc.toFixed(1).padStart(5)} >= ${f.minLc}  ${f.usage}`);
          continue;
        }
        below += 1;
        console.log(`below ${situation}/${mode}  Lc ${f.lc.toFixed(1).padStart(5)} < ${f.minLc}  ${f.usage}`);
        console.log(`        fix:   ${f.from ?? '(fg not a ramp step)'}${f.fix ? ` -> ${f.fix.to} (Lc ${f.fix.lc.toFixed(1)})` : ` -- no step clears ${f.minLc}`}`);
        console.log(`        relax: minLc ${f.minLc} -> ${Math.floor(f.lc)}  ${f.clearsSoft ? `(>= soft floor ${f.softFloor})` : `(below soft floor ${f.softFloor}; prefer the fix)`}`);
      }
    }
  }

  console.log(below === 0
    ? '\nAll pairs clear their gate.'
    : `\n${below} pair(s) below gate. fix = move the fg one step; relax = lower the gate on this branch (SKILL.md rule 5).`);
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) await main();
