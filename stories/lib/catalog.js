/**
 * Token catalog renderer. Each story shows every custom property one reading
 * situation resolves from the built tokens.css (base :root merged with that
 * situation's [data-situation] delta block), light and dark side by side, so
 * a Playwright screenshot of the story is a visual fingerprint of that
 * situation's tokens.
 *
 * The built CSS is the single source: variables are parsed out of the file
 * text per selector block, so new tokens appear in the catalog (and in
 * snapshots) without touching this file.
 */
import tokensCss from '../../dist/tokens.css?raw';

/** Split a tokens.css string into { selector, declarations } blocks. */
export function parseBlocks(css) {
  const uncommented = css.replace(/\/\*[\s\S]*?\*\//g, '');
  return [...uncommented.matchAll(/([^{}]+)\{([^}]*)\}/g)].map(([, selector, body]) => ({
    selector: selector.trim(),
    declarations: [...body.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)].map(([, name, value]) => ({
      name,
      value: value.trim(),
    })),
  }));
}

/**
 * The custom properties one situation resolves: base :root overlaid with the
 * situation's delta block. Order follows :root, so screenshots stay stable as
 * deltas move between blocks.
 */
export function situationVars(css, situation) {
  const blocks = parseBlocks(css);
  const root = blocks.find((b) => b.selector === ':root');
  if (!root) throw new Error('expected a :root block in tokens.css');
  const delta = blocks.find((b) => b.selector === `[data-situation="${situation}"]`);
  if (!delta) throw new Error(`no [data-situation="${situation}"] block in tokens.css`);
  const merged = new Map(root.declarations.map(({ name, value }) => [name, value]));
  for (const { name, value } of delta.declarations) merged.set(name, value);
  return [...merged].map(([name, value]) => ({ name, value }));
}

const SECTION_FILTERS = {
  color: ({ name }) => name.startsWith('--color-'),
  typography: ({ name }) => name.startsWith('--typography-'),
  dimension: ({ name }) =>
    name.startsWith('--space-') ||
    name.startsWith('--radius-') ||
    name.startsWith('--border-width-') ||
    name.startsWith('--container-') ||
    name.startsWith('--rhythm-'),
  effect: ({ name }) => name.startsWith('--elevation-'),
};
const CLAIMED = Object.values(SECTION_FILTERS);
SECTION_FILTERS.component = (v) => !CLAIMED.some((match) => match(v));

/** Classify a raw CSS value so component tokens pick the right renderer. */
export function valueKind(value) {
  // Composite box-shadow: length tokens followed by a color. Checked before
  // the color test, which only matches a value that STARTS with a color.
  if (/\dpx\b/.test(value) && /(oklch|rgb|#|light-dark)/.test(value)) return 'shadow';
  if (/^(light-dark|oklch|rgb|#)/.test(value)) return 'color';
  if (/^\d{3}\s/.test(value)) return 'font';
  if (/^-?[\d.]+(rem|px|em)$/.test(value)) return 'dimension';
  return 'other';
}

const renderers = {
  color: ({ name }) => `
    <div class="tc-item">
      <div class="tc-swatch" style="background: var(${name})"></div>
      <code class="tc-name">${name}</code>
    </div>`,
  font: ({ name }) => `
    <div class="tc-item tc-wide">
      <div class="tc-sample" style="font: var(${name})">The quick brown fox jumps over the lazy dog</div>
      <code class="tc-name">${name}</code>
    </div>`,
  dimension: ({ name }) => {
    const box = name.includes('radius')
      ? `<div class="tc-radius" style="border-radius: var(${name})"></div>`
      : name.includes('border-width')
        ? `<div class="tc-border" style="border-width: var(${name})"></div>`
        : `<div class="tc-bar" style="width: var(${name})"></div>`;
    return `
    <div class="tc-item">
      ${box}
      <code class="tc-name">${name}</code>
    </div>`;
  },
  shadow: ({ name }) => `
    <div class="tc-item">
      <div class="tc-shadow" style="box-shadow: var(${name})"></div>
      <code class="tc-name">${name}</code>
    </div>`,
  other: ({ name, value }) => `
    <div class="tc-item tc-wide">
      <code class="tc-value">${value}</code>
      <code class="tc-name">${name}</code>
    </div>`,
};

const CHROME_CSS = `
  .token-catalog { display: flex; margin: 0; }
  .tc-panel {
    flex: 1 1 50%;
    padding: 24px;
    background: var(--color-background-page);
    color: var(--color-text-body);
  }
  .tc-panel-title {
    margin: 0 0 16px;
    font: 600 13px/1.2 monospace;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-muted);
  }
  .tc-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px 16px; }
  .tc-item { min-width: 0; }
  .tc-wide { grid-column: 1 / -1; }
  .tc-swatch {
    height: 40px;
    border-radius: 4px;
    border: 1px solid var(--color-border-default);
  }
  .tc-bar { height: 12px; background: var(--color-accent-default); max-width: 100%; }
  .tc-shadow {
    height: 40px;
    margin: 8px;
    border-radius: 6px;
    background: var(--color-background-surface);
  }
  .tc-radius {
    width: 48px;
    height: 48px;
    background: var(--color-accent-subtle);
    border: 1px solid var(--color-border-strong);
  }
  .tc-border {
    height: 24px;
    border: 0 solid var(--color-border-strong);
    background: var(--color-background-inset);
  }
  .tc-sample { overflow: hidden; white-space: nowrap; }
  .tc-name, .tc-value {
    display: block;
    margin-top: 4px;
    font: 11px/1.4 monospace;
    color: var(--color-text-muted);
    overflow-wrap: break-word;
  }
`;

function renderPanel(scheme, vars) {
  const items = vars.map((v) => renderers[valueKind(v.value)](v)).join('');
  return `
    <section class="tc-panel" style="color-scheme: ${scheme}">
      <h2 class="tc-panel-title">${scheme}</h2>
      <div class="tc-grid">${items}</div>
    </section>`;
}

export function renderCatalog(situation, section) {
  const allVars = situationVars(tokensCss, situation);
  const vars = allVars.filter(SECTION_FILTERS[section]);
  const scope = `tc-scope-${situation}`;
  const scopedCss = [
    `.${scope} {`,
    '  color-scheme: light dark;',
    ...allVars.map(({ name, value }) => `  ${name}: ${value};`),
    '}',
  ].join('\n');
  const root = document.createElement('div');
  root.className = `token-catalog ${scope}`;
  root.innerHTML = `
    <style>${CHROME_CSS}</style>
    <style>${scopedCss}</style>
    ${renderPanel('light', vars)}
    ${renderPanel('dark', vars)}`;
  return root;
}

/** CSF story factory: one story per (situation, section). */
export function catalogStory(situation, section) {
  return { render: () => renderCatalog(situation, section) };
}
