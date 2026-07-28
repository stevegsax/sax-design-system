// scripts/build-prototypes.js
//
// Assembles the application prototype fleet (ADR
// 2026-07-28-page-shell-application). Each file in prototypes/application/
// is a content module: a header comment (prototype/title/archetype/patterns)
// plus slot sections. The module's slots are spliced into the
// patterns/page-shell-application.html shell, and the <style> blocks of the
// patterns the module declares are pulled in from patterns/*.html — so one
// pattern edit is every page's edit; feedback lands once and shows
// everywhere. Emits dist/prototypes/application/ plus a gallery index, and
// overwrites dist/samples/application.html with the records prototype so
// sample and standard cannot drift. Runs after build:samples.

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const pkg = JSON.parse(readFileSync(path.join(ROOT, 'package.json'), 'utf8'));

// ---------------------------------------------------------------------------
// Pure core
// ---------------------------------------------------------------------------

export function headerFields(html) {
  const comment = html.match(/^<!--([\s\S]*?)-->/)?.[1] ?? '';
  const fields = {};
  for (const line of comment.split('\n')) {
    const m = line.match(/^\s*([a-z-]+):\s*(.+)$/);
    if (m) fields[m[1]] = m[2].trim();
  }
  return fields;
}

export function splitStyles(html) {
  const styles = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]);
  return { css: styles.join('\n'), markup: html.replace(/<style>[\s\S]*?<\/style>\s*/g, '') };
}

export function slotContents(html) {
  return Object.fromEntries(
    [...html.matchAll(/<!-- slot:([a-z-]+) -->([\s\S]*?)<!-- \/slot:\1 -->/g)].map(
      ([, name, body]) => [name, body.trim()],
    ),
  );
}

/** Replace each shell slot with the module's content; unfilled slots keep
 *  the pattern's example content. Markers are dropped from the output. */
export function fillSlots(shellMarkup, slots) {
  return shellMarkup.replace(
    /<!-- slot:([a-z-]+) -->([\s\S]*?)<!-- \/slot:\1 -->/g,
    (whole, name, fallback) => (slots[name] !== undefined ? slots[name] : fallback.trim()),
  );
}

const stripHeader = (html) => html.replace(/^<!--[\s\S]*?-->\s*/, '');

// ---------------------------------------------------------------------------
// Imperative shell
// ---------------------------------------------------------------------------

const shell = splitStyles(
  stripHeader(readFileSync(path.join(ROOT, 'patterns/page-shell-application.html'), 'utf8')),
);
const patternCss = (name) =>
  splitStyles(stripHeader(readFileSync(path.join(ROOT, 'patterns', `${name}.html`), 'utf8'))).css;

const page = ({ title, css, body, depth }) => `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<link rel="stylesheet" href="${depth}tokens.css">
<link rel="stylesheet" href="${depth}base.css">
<style>${css}</style>
</head>
<body data-situation="application">
${body}
</body>
</html>
`;

const outDir = path.join(ROOT, 'dist/prototypes/application');
mkdirSync(outDir, { recursive: true });

const LOGO_SRC = '../static-assets/logos/symbol-only/SAX_logo_symbol.svg';
const fleet = [];
for (const file of readdirSync(path.join(ROOT, 'prototypes/application'))
  .filter((f) => f.endsWith('.html'))
  .sort()) {
  const raw = readFileSync(path.join(ROOT, 'prototypes/application', file), 'utf8');
  const fields = headerFields(raw);
  const mod = splitStyles(stripHeader(raw));
  const used = (fields.patterns ?? '').split(/\s+/).filter(Boolean);
  const css = [shell.css, ...used.map(patternCss), mod.css].join('\n');
  const body = fillSlots(shell.markup, slotContents(mod.markup));

  const emit = (dest, rel, depth) => {
    writeFileSync(
      dest,
      page({
        title: `${fields.title} — SAX prototype`,
        css,
        body: body.replaceAll(LOGO_SRC, `${depth}sax-logo-symbol.svg`),
        depth,
      }),
    );
    console.log(rel);
  };
  emit(path.join(outDir, `${fields.prototype}.html`), `dist/prototypes/application/${fields.prototype}.html`, '../../');
  if (fields.prototype === 'records') {
    emit(path.join(ROOT, 'dist/samples/application.html'), 'dist/samples/application.html (fleet: records)', '../');
  }
  fleet.push(fields);
}

const gallery = page({
  title: 'Application prototype fleet — SAX design system',
  css: `
  main { max-width: none; margin: 0; padding: var(--space-lg) var(--container-gutter); }
  .fleet-note { color: var(--color-text-muted); max-width: 44rem; }
  section { margin-block-end: var(--rhythm-section); }
  section h2 { margin-block-end: var(--space-2xs); }
  .archetype { font: var(--typography-caption); color: var(--color-text-muted); margin-block-end: var(--space-sm); }
  iframe { width: 100%; height: 640px; border: var(--border-width-default) solid var(--color-border-default);
           border-radius: var(--radius-md); background: var(--color-background-page); }
`,
  body: `<main>
  <h1>Application prototype fleet</h1>
  <p class="fleet-note">Every page below is assembled at build time from
     <code>patterns/page-shell-application.html</code> plus its content module
     (ADR 2026-07-28-page-shell-application). Feedback lands in the shared
     source and re-renders here everywhere at once — generated by ${pkg.name}
     v${pkg.version}; do not edit the emitted pages.</p>
${fleet
  .map(
    (f) => `  <section>
    <h2><a href="${f.prototype}.html">${f.title}</a></h2>
    <p class="archetype">${f.archetype ?? ''}</p>
    <iframe src="${f.prototype}.html" loading="lazy" title="${f.title}"></iframe>
  </section>`,
  )
  .join('\n')}
</main>`,
  depth: '../../',
});
writeFileSync(path.join(outDir, 'index.html'), gallery);
console.log('dist/prototypes/application/index.html');
