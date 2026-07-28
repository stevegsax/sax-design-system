/**
 * Application prototype fleet stories. One story per assembled prototype
 * (dist/prototypes/application/*.html), light and dark stacked, so a
 * change to any shared source — token, shell pattern, component pattern —
 * shows as a pixel diff across the whole fleet at once
 * (ADR 2026-07-28-page-shell-application).
 *
 * The emitted pages are the source: their <style> is the assembled shell +
 * pattern + module CSS, their <body> the spliced markup. Tokens come from
 * the parsed-vars scope the token catalog uses; base.css is inlined as in
 * a consuming page.
 */
import baseCss from '../../dist/base.css?raw';
import dashboard from '../../dist/prototypes/application/dashboard.html?raw';
import detail from '../../dist/prototypes/application/detail.html?raw';
import records from '../../dist/prototypes/application/records.html?raw';
import settings from '../../dist/prototypes/application/settings.html?raw';
import tokensCss from '../../dist/tokens.css?raw';
import logoUrl from '../../static-assets/logos/symbol-only/SAX_logo_symbol.svg';
import { situationVars } from './catalog.js';

const PROTOTYPES = { records, settings, dashboard, detail };

const CHROME_CSS = `
  .prototype-catalog { margin: 0; }
  .pr-panel { padding: 16px; }
  .pr-panel-title {
    margin: 0 0 8px;
    font: 600 13px/1.2 monospace;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-muted);
  }
`;

export function renderPrototype(name) {
  const html = PROTOTYPES[name].replaceAll('../../sax-logo-symbol.svg', logoUrl);
  const pageCss = [...html.matchAll(/<style>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
  const body = html.match(/<body[^>]*>([\s\S]*)<\/body>/)?.[1] ?? '';
  const allVars = situationVars(tokensCss, 'application');
  const scope = `pr-scope-${name}`;
  const scopedCss = [
    `.${scope} {`,
    '  color-scheme: light dark;',
    ...allVars.map(({ name: n, value }) => `  ${n}: ${value};`),
    '}',
  ].join('\n');
  document.body.dataset.situation = 'application';
  const panel = (scheme) => `
    <section class="pr-panel" style="color-scheme: ${scheme}">
      <h2 class="pr-panel-title">${scheme}</h2>
      <div data-situation="application">${body}</div>
    </section>`;
  const root = document.createElement('div');
  root.className = `token-catalog prototype-catalog ${scope}`;
  root.innerHTML = `
    <style>${baseCss}</style>
    <style>${CHROME_CSS}</style>
    <style>${pageCss}</style>
    <style>${scopedCss}</style>
    ${panel('light')}
    ${panel('dark')}`;
  return root;
}

/** CSF story factory: one story per assembled application prototype. */
export function prototypeStory(name) {
  return { render: () => renderPrototype(name) };
}
