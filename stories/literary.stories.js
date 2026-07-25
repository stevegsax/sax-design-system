import { catalogStory } from './lib/catalog.js';
import { patternStory } from './lib/patterns.js';
export default { title: 'literary' };
export const Color = catalogStory('literary', 'color');
export const Typography = catalogStory('literary', 'typography');
export const Dimension = catalogStory('literary', 'dimension');
export const Component = catalogStory('literary', 'component');
export const Effect = catalogStory('literary', 'effect');
export const Patterns = patternStory('literary');
