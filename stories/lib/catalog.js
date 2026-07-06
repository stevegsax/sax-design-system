/**
 * Token catalog renderer. Each story shows every custom property from one
 * product's built tokens.css, light and dark side by side, so a Playwright
 * screenshot of the story is a visual fingerprint of that product's tokens.
 *
 * The built CSS is the single source: variables are parsed out of the file
 * text, so new tokens appear in the catalog (and in snapshots) without
 * touching this file.
 */
import blogCss from '../../dist/blog-page/tokens.css?raw';
import presentationCss from '../../dist/presentation/tokens.css?raw';
import homeCss from '../../dist/product-home-page/tokens.css?raw';

const PRODUCT_CSS = {
  'product-home-page': homeCss,
  'blog-page': blogCss,
  presentation: presentationCss,
};

/** Flatten `--name: value;` declarations out of a tokens.css string. */
export function parseVars(css) {
  return [...css.matchAll(/(--[a-z0-9-]+):\s*([^;]+);/g)].map(([, name, value]) => ({
    name,
    value: value.trim(),
  }));
}

/** Re-target the single :root block at a class so products can coexist. */
export function scopeCss(css, selector) {
  if (!css.includes(':root')) throw new Error('expected a :root block in tokens.css');
  return css.replace(':root', selector);
}

const SECTION_FILTERS = {
  color: ({ name }) => name.startsWith('--color-'),
  typography: ({ name }) => name.startsWith('--typography-'),
  dimension: ({ name }) =>
    name.startsWith('--space-') || name.startsWith('--radius-') || name.startsWith('--border-width-'),
};
const CLAIMED = Object.values(SECTION_FILTERS);
SECTION_FILTERS.component = (v) => !CLAIMED.some((match) => match(v));

/** Classify a raw CSS value so component tokens pick the right renderer. */
export function valueKind(value) {
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
  .tc-bar { height: 12px; background: var(--color-accent-default); }
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

export function renderCatalog(product, section) {
  const css = PRODUCT_CSS[product];
  if (!css) throw new Error(`unknown product: ${product}`);
  const vars = parseVars(css).filter(SECTION_FILTERS[section]);
  const scope = `tc-scope-${product}`;
  const root = document.createElement('div');
  root.className = `token-catalog ${scope}`;
  root.innerHTML = `
    <style>${CHROME_CSS}</style>
    <style>${scopeCss(css, `.${scope}`)}</style>
    ${renderPanel('light', vars)}
    ${renderPanel('dark', vars)}`;
  return root;
}

/** CSF story factory: one story per (product, section). */
export function catalogStory(product, section) {
  return { render: () => renderCatalog(product, section) };
}
