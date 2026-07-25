import { catalogStory } from './lib/catalog.js';
import { patternStory } from './lib/patterns.js';
export default { title: 'application' };
export const Color = catalogStory('application', 'color');
export const Typography = catalogStory('application', 'typography');
export const Dimension = catalogStory('application', 'dimension');
export const Component = catalogStory('application', 'component');
export const Effect = catalogStory('application', 'effect');
export const Patterns = patternStory('application');
