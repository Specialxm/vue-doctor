import type { Rule } from '@vue-doctor/core';
import { directApiInView } from './direct-api-in-view.js';

export const allRules: Rule[] = [directApiInView];

export { directApiInView };
