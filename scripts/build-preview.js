import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { cssTokensFor, isPrimitive } from './lib/css-tokens.js';

const ROOT = path.resolve(import.meta.dirname, '..');
const matrix = JSON.parse(readFileSync(path.join(ROOT, 'config/matrix.json'), 'utf8'));
const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

const byPrefix = (tokens, ...prefix) =>
  tokens.filter((t) => prefix.every((p, i) => t.path[i] === p));

function rampSection(light) {
  const ramps = ['neutral', 'brand', 'success', 'warning', 'danger'];
  const rows = ramps.map((ramp) => {
    const steps = byPrefix(light, 'color', ramp).map(
      (t) => `
      <div class="ramp-step">
        <div class="ramp-chip" style="background:${t.$value}"></div>
        <code>${t.path[2]}</code>
      </div>`,
    );
    return `<div class="ramp"><h3><code>color.${ramp}</code></h3><div class="ramp-row">${steps.join('')}</div></div>`;
  });
  return `
  <section>
    <h2>Primitive ramps <small>(not emitted to CSS — reference only)</small></h2>
    ${rows.join('\n')}
  </section>`;
}

function swatchGrid(tokens, light, dark) {
  const darkByName = new Map(dark.map((t) => [t.name, t.$value]));
  return tokens
    .map((t) => {
      const lightValue = light.find((l) => l.name === t.name).$value;
      const darkValue = darkByName.get(t.name);
      const values =
        lightValue === darkValue
          ? `<code>${lightValue}</code>`
          : `<code>${lightValue}</code><code>${darkValue}</code>`;
      return `
      <div class="swatch">
        <div class="chip" style="background:var(--${t.name})"></div>
        <code class="name">--${t.name}</code>
        <div class="values">${values}</div>
      </div>`;
    })
    .join('');
}

function colorPanel(scheme, light, dark) {
  const groups = ['background', 'text', 'border', 'accent', 'status'];
  const sections = groups
    .map((group) => {
      const tokens = byPrefix(light, 'color', group).filter((t) => !isPrimitive(t));
      return `<h3><code>color.${group}</code></h3><div class="grid">${swatchGrid(tokens, light, dark)}</div>`;
    })
    .join('\n');
  const componentColors = light.filter((t) => t.$type === 'color' && t.path[0] !== 'color');
  return `
  <div class="panel" style="color-scheme: ${scheme}">
    <h3 class="panel-title">${scheme}</h3>
    ${sections}
    <h3>component colors</h3>
    <div class="grid">${swatchGrid(componentColors, light, dark)}</div>
  </div>`;
}

function dimensionSection(light) {
  const spaceBars = byPrefix(light, 'space')
    .map(
      (t) => `
    <div class="dim-row"><code>--${t.name}</code><div class="bar" style="width:var(--${t.name})"></div><code>${t.$value}</code></div>`,
    )
    .join('');
  const radii = byPrefix(light, 'radius')
    .map(
      (t) => `
    <div class="radius-box" style="border-radius:var(--${t.name})"><code>--${t.name}</code><code>${t.$value}</code></div>`,
    )
    .join('');
  const borders = byPrefix(light, 'border-width')
    .map(
      (t) => `
    <div class="border-box" style="border-width:var(--${t.name})"><code>--${t.name}</code><code>${t.$value}</code></div>`,
    )
    .join('');
  const measures = [...byPrefix(light, 'container'), ...byPrefix(light, 'rhythm')]
    .map(
      (t) => `
    <div class="dim-row"><code>--${t.name}</code><div class="bar" style="width:var(--${t.name})"></div><code>${t.$value}</code></div>`,
    )
    .join('');
  return `
  <section>
    <h2>Dimensions</h2>
    <h3><code>space</code></h3>${spaceBars}
    <h3><code>container</code> &amp; <code>rhythm</code> <small>(situation-mapped)</small></h3>${measures}
    <h3><code>radius</code></h3><div class="row">${radii}</div>
    <h3><code>border-width</code></h3><div class="row">${borders}</div>
  </section>`;
}

function typographySection(light) {
  const roles = byPrefix(light, 'typography')
    .map(
      (t) => `
    <div class="type-row">
      <code>--${t.name}</code>
      <p style="font:var(--${t.name})">SAX Capital — disciplined exposure, measured risk. 0123456789</p>
    </div>`,
    )
    .join('');
  return `<section><h2>Typography</h2>${roles}</section>`;
}

function specimenSection() {
  const specimens = `
    <button class="btn-primary">Primary action</button>
    <button class="btn-secondary">Secondary action</button>
    <div class="card">
      <p style="font:var(--typography-heading-3); color:var(--color-text-heading); margin:0 0 0.5rem">Card title</p>
      <p style="font:var(--typography-body); margin:0">Body copy on a card surface, with <a href="#">an inline link</a>.</p>
    </div>
    <div class="field">
      <label style="font:var(--input-label-font)">Field label</label>
      <input type="text" placeholder="Placeholder text" />
    </div>
    <div class="alerts">
      <div class="alert success">Success: allocation confirmed.</div>
      <div class="alert warning">Warning: rebalancing pending.</div>
      <div class="alert danger">Danger: limit breached.</div>
    </div>`;
  return `
  <section>
    <h2>Component specimens</h2>
    <div class="panels">
      <div class="panel" style="color-scheme: light">${specimens}</div>
      <div class="panel" style="color-scheme: dark">${specimens}</div>
    </div>
  </section>`;
}

const CHROME = `
  body { margin: 0 auto; max-width: 72rem; padding: var(--space-xl); }
  h1 { font: var(--typography-heading-1); color: var(--color-text-heading); }
  h2 { font: var(--typography-heading-2); color: var(--color-text-heading);
       border-block-end: var(--border-width-default) solid var(--color-border-default);
       padding-block-end: var(--space-xs); margin-block-start: var(--space-2xl); }
  h3 { font: var(--typography-heading-3); color: var(--color-text-heading); }
  h2 small { font: var(--typography-body-small); color: var(--color-text-muted); }
  code { font: var(--typography-code); }
  section { margin-block-end: var(--space-xl); }
  a { color: var(--color-text-link); }
  .panels { display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-md); }
  .panel { background: var(--color-background-page); color: var(--color-text-body);
           border: var(--border-width-default) solid var(--color-border-default);
           border-radius: var(--card-radius); padding: var(--space-lg); }
  .panel-title { text-transform: uppercase; color: var(--color-text-muted); }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr));
          gap: var(--space-sm); margin-block-end: var(--space-lg); }
  .swatch { border: var(--border-width-default) solid var(--color-border-default);
            border-radius: var(--radius-md); padding: var(--space-xs);
            background: var(--color-background-surface); }
  .chip { height: 3rem; border-radius: var(--radius-sm);
          border: var(--border-width-default) solid var(--color-border-default); }
  .swatch .name { display: block; margin-block-start: var(--space-2xs); }
  .swatch .values code { display: block; color: var(--color-text-muted);
                         font: var(--typography-caption); }
  .ramp-row { display: flex; gap: var(--space-2xs); }
  .ramp-step { text-align: center; flex: 1; }
  .ramp-chip { height: 2.5rem; border-radius: var(--radius-sm);
               border: var(--border-width-default) solid var(--color-border-default); }
  .dim-row { display: grid; grid-template-columns: 10rem 1fr 6rem; align-items: center;
             gap: var(--space-sm); margin-block-end: var(--space-2xs); }
  .bar { height: 1rem; background: var(--color-accent-default); border-radius: var(--radius-sm); max-width: 100%; }
  .row { display: flex; gap: var(--space-md); flex-wrap: wrap; }
  .radius-box, .border-box { border: var(--border-width-thick) solid var(--color-border-strong);
                             padding: var(--space-md); background: var(--color-background-surface);
                             display: grid; gap: var(--space-2xs); }
  .border-box { border-style: solid; border-color: var(--color-border-strong); border-radius: var(--radius-sm); }
  .type-row { margin-block-end: var(--space-md); }
  .type-row p { margin: var(--space-2xs) 0 0; color: var(--color-text-body); }
  .btn-primary, .btn-secondary { font: var(--button-label-font); border-radius: var(--button-radius);
    padding: var(--button-padding-block) var(--button-padding-inline);
    margin-inline-end: var(--space-sm); cursor: pointer; }
  .btn-primary { background: var(--button-primary-background); color: var(--button-primary-text); border: none; }
  .btn-primary:hover { background: var(--button-primary-background-hover); }
  .btn-primary:active { background: var(--button-primary-background-active); }
  .btn-secondary { background: var(--button-secondary-background); color: var(--button-secondary-text);
                   border: var(--border-width-default) solid var(--button-secondary-border); }
  .card { background: var(--card-background); border: var(--border-width-default) solid var(--card-border);
          border-radius: var(--card-radius); padding: var(--card-padding); margin-block: var(--space-md); }
  .field { display: grid; gap: var(--space-2xs); margin-block-end: var(--space-md); }
  .field input { font: var(--input-value-font); color: var(--input-text);
                 background: var(--input-background); border-radius: var(--input-radius);
                 border: var(--input-border-width) solid var(--input-border);
                 padding: var(--input-padding-block) var(--input-padding-inline); }
  .field input::placeholder { color: var(--input-placeholder); }
  .field input:focus { outline: none; border: var(--input-border-width-focus) solid var(--input-border-focus); }
  .alerts { display: grid; gap: var(--space-xs); }
  .alert { padding: var(--space-sm) var(--space-md); border-radius: var(--radius-md);
           font: var(--typography-body-small); border: var(--border-width-default) solid; }
  .alert.success { background: var(--color-status-success-background);
                   color: var(--color-status-success-text); border-color: var(--color-status-success-border); }
  .alert.warning { background: var(--color-status-warning-background);
                   color: var(--color-status-warning-text); border-color: var(--color-status-warning-border); }
  .alert.danger { background: var(--color-status-danger-background);
                  color: var(--color-status-danger-text); border-color: var(--color-status-danger-border); }
`;

const outDir = path.join(ROOT, 'dist', 'preview');
mkdirSync(outDir, { recursive: true });

for (const situation of matrix.situations) {
  const [light, dark] = await Promise.all(['light', 'dark'].map((m) => cssTokensFor(situation, m)));
  const emitted = light.filter((t) => !isPrimitive(t));
  const emittedDark = dark.filter((t) => !isPrimitive(t));

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${pkg.name} — ${situation} tokens</title>
<link rel="stylesheet" href="../tokens.css">
<link rel="stylesheet" href="../base.css">
<style>${CHROME}</style>
</head>
<body data-situation="${situation}">
<h1>${situation} design tokens</h1>
<p>Generated by <code>${pkg.name}</code> v${pkg.version}. This page declares
<code>data-situation="${situation}"</code>, so the swatches below show the base tokens with this
situation's deltas applied. Light and dark render side by side via <code>color-scheme</code>.</p>
${rampSection(light)}
<section>
  <h2>Color roles</h2>
  <div class="panels">
    ${colorPanel('light', emitted, emittedDark)}
    ${colorPanel('dark', emitted, emittedDark)}
  </div>
</section>
${dimensionSection(emitted)}
${typographySection(emitted)}
${specimenSection()}
</body>
</html>
`;

  writeFileSync(path.join(outDir, `${situation}.html`), html);
  console.log(`dist/preview/${situation}.html`);
}
