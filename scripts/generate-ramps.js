// Imperative shell: read the ramp spec, expand it with the pure builder, and
// write tokens/primitive/color.tokens.json. Run with --check to compare the
// generated output against the committed file without writing (CI guard).
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { buildRamp } from './lib/ramp.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const SPEC_PATH = path.join(ROOT, 'config/ramps.json');
const OUT_PATH = path.join(ROOT, 'tokens/primitive/color.tokens.json');

// Match the committed file's formatting exactly: one line per step, compact
// arrays with ", " separators, "none" preserved as a string. JSON.stringify on a
// number already yields its minimal decimal form (0.006, 250, 0.98 — no trailing
// zeros), which is what the file uses.
const num = (value) => (typeof value === 'string' ? JSON.stringify(value) : String(value));
const str = (value) => JSON.stringify(value);

function formatValue(value) {
  const components = value.components.map(num).join(', ');
  return `{ "colorSpace": ${str(value.colorSpace)}, "components": [${components}], "alpha": ${num(value.alpha)}, "hex": ${str(value.hex)} }`;
}

function formatEntry(entry, indent, isLast) {
  const comma = isLast ? '' : ',';
  if (entry.description !== undefined) {
    return [
      `${indent}${str(entry.key)}: {`,
      `${indent}  "$description": ${str(entry.description)},`,
      `${indent}  "$value": ${formatValue(entry.value)}`,
      `${indent}}${comma}`,
    ].join('\n');
  }
  return `${indent}${str(entry.key)}: { "$value": ${formatValue(entry.value)} }${comma}`;
}

function serialize(spec) {
  const { cap, decimals, ramps, schema } = spec;
  const lines = ['{', `  "$schema": ${str(schema)},`, '  "color": {', '    "$type": "color",'];
  ramps.forEach((ramp, rampIndex) => {
    lines.push(`    ${str(ramp.name)}: {`);
    lines.push(`      "$description": ${str(ramp.description)},`);
    const entries = buildRamp(ramp, cap, decimals);
    entries.forEach((entry, entryIndex) => {
      lines.push(formatEntry(entry, '      ', entryIndex === entries.length - 1));
    });
    lines.push(`    }${rampIndex === ramps.length - 1 ? '' : ','}`);
  });
  lines.push('  }', '}');
  return `${lines.join('\n')}\n`;
}

const spec = JSON.parse(readFileSync(SPEC_PATH, 'utf8'));
const output = serialize(spec);

if (process.argv.includes('--check')) {
  const current = readFileSync(OUT_PATH, 'utf8');
  if (current === output) {
    console.log(`generate:ramps --check: ${path.relative(ROOT, OUT_PATH)} is byte-for-byte identical to the spec.`);
  } else {
    console.error(`generate:ramps --check: MISMATCH — ${path.relative(ROOT, OUT_PATH)} differs from the spec output.`);
    const a = current.split('\n');
    const b = output.split('\n');
    let shown = 0;
    for (let i = 0; i < Math.max(a.length, b.length) && shown < 20; i++) {
      if (a[i] !== b[i]) {
        console.error(`  line ${i + 1}:\n    committed: ${a[i] ?? '<missing>'}\n    generated: ${b[i] ?? '<missing>'}`);
        shown += 1;
      }
    }
    process.exit(1);
  }
} else {
  writeFileSync(OUT_PATH, output);
  console.log(`generate:ramps: wrote ${path.relative(ROOT, OUT_PATH)} (${spec.ramps.length} ramps)`);
}
