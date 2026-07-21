import { globSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { APCAcontrast, sRGBtoY } from 'apca-w3';
import StyleDictionary from 'style-dictionary';
import { culoriToHex, culoriToRgb255, dtcgToCulori } from './lib/color.js';
import { resolveTokens } from './lib/resolve.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const matrix = JSON.parse(readFileSync(path.join(ROOT, 'config/matrix.json'), 'utf8'));
const { pairs } = JSON.parse(readFileSync(path.join(ROOT, 'config/contrast-pairs.json'), 'utf8'));

const failures = [];

// 1. Every authored hex fallback must match its OKLCH components exactly.
for (const file of globSync('tokens/**/*.tokens.json', { cwd: ROOT })) {
  const visit = (node, tokenPath) => {
    if (node === null || typeof node !== 'object') return;
    const value = node.$value;
    if (value && typeof value === 'object' && value.hex) {
      const derived = culoriToHex(dtcgToCulori(value));
      if (derived !== value.hex.toLowerCase()) {
        failures.push(`${file}: ${tokenPath} hex ${value.hex} != ${derived} derived from components`);
      }
    }
    for (const [key, child] of Object.entries(node)) {
      if (!key.startsWith('$')) visit(child, tokenPath ? `${tokenPath}.${key}` : key);
    }
  };
  visit(JSON.parse(readFileSync(path.join(ROOT, file), 'utf8')), '');
}

// 2. APCA Lc gates per situation x mode (plus the base resolution, so the
// shared semantic defaults are gated even where every situation remaps them).
function apcaY(value) {
  return sRGBtoY(culoriToRgb255(dtcgToCulori(value)));
}

for (const situation of ['base', ...matrix.situations]) {
  for (const mode of matrix.modes) {
    const resolverPath = path.join(ROOT, 'resolvers', `${situation}.${mode}.resolver.json`);
    const sd = new StyleDictionary({
      tokens: resolveTokens(resolverPath),
      log: { verbosity: 'silent' },
      platforms: { resolved: {} },
    });
    const { allTokens } = await sd.getPlatformTokens('resolved');
    const byPath = new Map(allTokens.map((token) => [token.path.join('.'), token.$value]));

    for (const pair of pairs) {
      const fg = byPath.get(pair.foreground);
      const bg = byPath.get(pair.background);
      if (!fg || !bg) {
        failures.push(`${situation}/${mode}: missing token in pair ${pair.foreground} on ${pair.background}`);
        continue;
      }
      const lc = APCAcontrast(apcaY(fg), apcaY(bg));
      const abs = Math.abs(lc);
      const status = abs >= pair.minLc ? 'ok' : 'FAIL';
      console.log(
        `${status.padEnd(4)} ${situation}/${mode} Lc ${abs.toFixed(1).padStart(5)} >= ${pair.minLc} ${pair.usage}`,
      );
      if (abs < pair.minLc) {
        failures.push(
          `${situation}/${mode}: ${pair.usage} Lc ${abs.toFixed(1)} < ${pair.minLc} (${pair.foreground} on ${pair.background})`,
        );
      }
    }
  }
}

if (failures.length > 0) {
  console.error(`\n${failures.length} color check(s) failed:`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}
console.log('\nAll color checks passed.');
