import { readFileSync } from 'node:fs';
import path from 'node:path';

function isPlainObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function deepMerge(target, source) {
  const merged = { ...target };
  for (const [key, value] of Object.entries(source)) {
    merged[key] =
      isPlainObject(value) && isPlainObject(merged[key]) ? deepMerge(merged[key], value) : value;
  }
  return merged;
}

function loadSource(source, baseDir) {
  if ('$ref' in source) {
    const tokens = JSON.parse(readFileSync(path.resolve(baseDir, source.$ref), 'utf8'));
    delete tokens.$schema;
    delete tokens.$description;
    return tokens;
  }
  return source;
}

/**
 * Applies the DTCG 2025.10 resolution algorithm: walk resolutionOrder,
 * deep-merge each set's sources in order, later occurrences win.
 * Modifiers are unused here (the matrix generates one resolver per context).
 */
export function resolveTokens(resolverPath) {
  const baseDir = path.dirname(resolverPath);
  const resolver = JSON.parse(readFileSync(resolverPath, 'utf8'));

  let tokens = {};
  for (const entry of resolver.resolutionOrder) {
    const ref = entry.$ref ?? '';
    if (!ref.startsWith('#/sets/')) {
      throw new Error(`${resolverPath}: unsupported resolutionOrder entry ${JSON.stringify(entry)}`);
    }
    const set = resolver.sets[ref.slice('#/sets/'.length)];
    if (!set) throw new Error(`${resolverPath}: unknown set reference ${ref}`);
    for (const source of set.sources) {
      tokens = deepMerge(tokens, loadSource(source, baseDir));
    }
  }
  return tokens;
}
