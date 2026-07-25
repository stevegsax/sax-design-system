/**
 * Pattern catalog renderer. One story per situation shows every shipped
 * pattern (patterns/*.html) rendered under that situation's tokens, light
 * and dark side by side — the pattern analogue of the token catalog.
 *
 * Pattern fragments are imported raw and injected as-is (comment header,
 * <style>, markup), with dist/base.css providing the element styling the
 * patterns lean on, exactly as in a consuming page. The body gets the
 * situation attribute so base.css's missing-situation diagnostic stays
 * quiet; tokens come from the same parsed-vars scope the token catalog
 * uses.
 */
import baseCss from '../../dist/base.css?raw';
import tokensCss from '../../dist/tokens.css?raw';
import alert from '../../patterns/alert.html?raw';
import button from '../../patterns/button.html?raw';
import callout from '../../patterns/callout.html?raw';
import card from '../../patterns/card.html?raw';
import field from '../../patterns/field.html?raw';
import tag from '../../patterns/tag.html?raw';
import { situationVars } from './catalog.js';

const PATTERNS = [
  ['button', button],
  ['field', field],
  ['card', card],
  ['alert', alert],
  ['tag', tag],
  ['callout', callout],
];

const CHROME_CSS = `
  .pattern-catalog { display: flex; margin: 0; }
  .pc-panel { flex: 1 1 50%; padding: 24px; }
  .pc-panel-title {
    margin: 0 0 16px;
    font: 600 13px/1.2 monospace;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color-text-muted);
  }
  .pc-pattern { margin-block-end: 24px; }
  .pc-pattern-title {
    margin: 0 0 8px;
    font: 600 11px/1.4 monospace;
    color: var(--color-text-muted);
  }
`;

function renderPanel(scheme, situation) {
  const sections = PATTERNS.map(
    ([name, html]) => `
    <section class="pc-pattern">
      <h3 class="pc-pattern-title">${name}</h3>
      ${html}
    </section>`,
  ).join('');
  return `
    <section class="pc-panel" data-situation="${situation}" style="color-scheme: ${scheme}">
      <h2 class="pc-panel-title">${scheme}</h2>
      ${sections}
    </section>`;
}

export function renderPatterns(situation) {
  const allVars = situationVars(tokensCss, situation);
  const scope = `pc-scope-${situation}`;
  const scopedCss = [
    `.${scope} {`,
    '  color-scheme: light dark;',
    ...allVars.map(({ name, value }) => `  ${name}: ${value};`),
    '}',
  ].join('\n');
  document.body.dataset.situation = situation;
  const root = document.createElement('div');
  root.className = `token-catalog pattern-catalog ${scope}`;
  root.innerHTML = `
    <style>${baseCss}</style>
    <style>${CHROME_CSS}</style>
    <style>${scopedCss}</style>
    ${renderPanel('light', situation)}
    ${renderPanel('dark', situation)}`;
  return root;
}

/** CSF story factory: one patterns story per situation. */
export function patternStory(situation) {
  return { render: () => renderPatterns(situation) };
}
