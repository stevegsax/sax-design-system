import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const README = path.join(ROOT, 'README.md');

const load = (tier, file) => JSON.parse(readFileSync(path.join(ROOT, 'tokens', tier, file), 'utf8'));

/** Flatten a DTCG tree to [path, $value] pairs for leaf tokens. */
function leaves(node, prefix = []) {
  if (node === null || typeof node !== 'object') return [];
  if ('$value' in node) return [[prefix.join('.'), node.$value]];
  return Object.entries(node)
    .filter(([key]) => !key.startsWith('$'))
    .flatMap(([key, child]) => leaves(child, [...prefix, key]));
}

const cssVar = (tokenPath) => `--${tokenPath.replaceAll('.', '-')}`;

const light = leaves(load('semantic', 'color.light.tokens.json'));
const dark = new Map(leaves(load('semantic', 'color.dark.tokens.json')));
const dimension = leaves(load('semantic', 'dimension.tokens.json'));
const typography = leaves(load('semantic', 'typography.tokens.json'));

const component = ['color', 'dimension', 'typography']
  .flatMap((type) => leaves(load('component', `${type}.tokens.json`)))
  .sort(([a], [b]) => a.localeCompare(b));

const colorRows = light.map(
  ([p, v]) => `| \`${p}\` | \`${cssVar(p)}\` | \`${v}\` | \`${dark.get(p)}\` |`,
);
const dimensionRows = dimension.map(([p, v]) => `| \`${p}\` | \`${cssVar(p)}\` | \`${v}\` |`);
const typographyRows = typography.map(
  ([p, v]) =>
    `| \`${p}\` | \`${cssVar(p)}\` | \`${v.fontSize}\` | \`${v.fontWeight}\` | \`${v.lineHeight}\` |`,
);

const componentRows = component.map(([p, v]) => `| \`${p}\` | \`${cssVar(p)}\` | \`${v}\` |`);

const semanticSection = `

### Color (mapped per mode)

| Token | CSS custom property | Light | Dark |
| --- | --- | --- | --- |
${colorRows.join('\n')}

### Dimension

| Token | CSS custom property | Value |
| --- | --- | --- |
${dimensionRows.join('\n')}

### Typography

Composite roles; the table shows the scale positions each role draws from. All use \`{font.family.sans}\` except \`typography.code\` (\`{font.family.mono}\`).

| Token | CSS custom property | Size | Weight | Line height |
| --- | --- | --- | --- | --- |
${typographyRows.join('\n')}
`;

const componentSection = `
| Token | CSS custom property | References |
| --- | --- | --- |
${componentRows.join('\n')}
`;

let readme = readFileSync(README, 'utf8');
for (const [name, body] of [
  ['semantic-tokens', semanticSection],
  ['component-tokens', componentSection],
]) {
  const start = `<!-- generated:${name} -->`;
  const end = `<!-- /generated:${name} -->`;
  const pattern = new RegExp(`${start}[\\s\\S]*?${end}`);
  if (!pattern.test(readme)) {
    throw new Error(`README.md is missing the ${start} ... ${end} markers`);
  }
  readme = readme.replace(pattern, `${start}\n\n${body.trim()}\n\n${end}`);
}
writeFileSync(README, readme);
console.log(
  `README.md token lists regenerated (${light.length} semantic color, ${dimension.length} dimension, ${typography.length} typography, ${component.length} component)`,
);
