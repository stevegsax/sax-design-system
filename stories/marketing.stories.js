import { catalogStory } from './lib/catalog.js';
import { patternStory } from './lib/patterns.js';
export default { title: 'marketing' };
export const Color = catalogStory('marketing', 'color');
export const Typography = catalogStory('marketing', 'typography');
export const Dimension = catalogStory('marketing', 'dimension');
export const Component = catalogStory('marketing', 'component');
export const Effect = catalogStory('marketing', 'effect');
export const Patterns = patternStory('marketing');
