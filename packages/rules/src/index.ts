import type { Rule } from '@vue-doctor/core';
import { directApiInView } from './direct-api-in-view.js';
import { missingKeyInVfor } from './missing-key-in-vfor.js';
import { oversizedComposable } from './oversized-composable.js';
import { oversizedComponent } from './oversized-component.js';
import { piniaStoreOutsideSetup } from './pinia-store-outside-setup.js';
import { unusedComponent } from './unused-component.js';

export const allRules: Rule[] = [
  directApiInView,
  missingKeyInVfor,
  unusedComponent,
  oversizedComposable,
  oversizedComponent,
  piniaStoreOutsideSetup,
];

export {
  directApiInView,
  missingKeyInVfor,
  unusedComponent,
  oversizedComposable,
  oversizedComponent,
  piniaStoreOutsideSetup,
};
