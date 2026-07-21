import path from 'node:path';
import StyleDictionary from 'style-dictionary';
import { transforms } from 'style-dictionary/enums';
import { resolveTokens } from './resolve.js';

const ROOT = path.resolve(import.meta.dirname, '..', '..');

// Primitive tiers stay out of the deployable CSS: consumers use component
// tokens first, semantic tokens as a fallback, never raw scale steps.
const RAMPS = new Set(['neutral', 'brand', 'success', 'warning', 'danger', 'highlight', 'marker']);

export const isPrimitive = (token) =>
  (token.path[0] === 'color' && RAMPS.has(token.path[1])) ||
  token.path[0] === 'dimension' ||
  token.path[0] === 'font';

// DTCG dimension objects ({value, unit}) have no built-in CSS string transform.
StyleDictionary.registerTransform({
  name: 'dimension/css',
  type: 'value',
  transitive: true,
  filter: (token, options) => (options.usesDtcg ? token.$type : token.type) === 'dimension',
  transform: (token, _, options) => {
    const value = options.usesDtcg ? token.$value : token.value;
    return typeof value === 'object' ? `${value.value}${value.unit}` : value;
  },
});

/** All tokens for one situation x mode (or 'base' x mode), transformed to CSS values, primitives included. */
export async function cssTokensFor(situation, mode) {
  const resolverPath = path.join(ROOT, 'resolvers', `${situation}.${mode}.resolver.json`);
  const sd = new StyleDictionary({
    tokens: resolveTokens(resolverPath),
    log: { verbosity: 'silent' },
    platforms: {
      css: {
        transforms: [
          transforms.nameKebab,
          transforms.colorOklch,
          'dimension/css',
          transforms.fontFamilyCss,
          transforms.typographyCssShorthand,
          // Composite box-shadow tokens ($type: shadow) → CSS shorthand; the
          // built-in transform resolves and OKLCH-formats the shadow color.
          transforms.shadowCssShorthand,
        ],
      },
    },
  });
  const { allTokens } = await sd.getPlatformTokens('css');
  return allTokens;
}
