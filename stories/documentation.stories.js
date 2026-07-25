import { catalogStory } from './lib/catalog.js';
import { patternStory } from './lib/patterns.js';
export default { title: 'documentation' };
export const Color = catalogStory('documentation', 'color');
export const Typography = catalogStory('documentation', 'typography');
export const Dimension = catalogStory('documentation', 'dimension');
export const Component = catalogStory('documentation', 'component');
export const Effect = catalogStory('documentation', 'effect');
export const Patterns = patternStory('documentation');
