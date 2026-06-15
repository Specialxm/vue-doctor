import type { Rule } from '@vue-doctor/core';
import { deprecatedOptionsApi } from './deprecated-options-api.js';
import { directApiInView } from './direct-api-in-view.js';
import { emptyScriptSetup } from './empty-script-setup.js';
import { missingKeyInVfor } from './missing-key-in-vfor.js';
import { oversizedComposable } from './oversized-composable.js';
import { oversizedComponent } from './oversized-component.js';
import { piniaStoreOutsideSetup } from './pinia-store-outside-setup.js';
import { syncWatchAbuse } from './sync-watch-abuse.js';
import { unusedComponent } from './unused-component.js';

export const allRules: Rule[] = [
  directApiInView,
  missingKeyInVfor,
  unusedComponent,
  oversizedComposable,
  oversizedComponent,
  piniaStoreOutsideSetup,
  syncWatchAbuse,
  deprecatedOptionsApi,
  emptyScriptSetup,
];

export {
  deprecatedOptionsApi,
  directApiInView,
  emptyScriptSetup,
  missingKeyInVfor,
  oversizedComposable,
  oversizedComponent,
  piniaStoreOutsideSetup,
  syncWatchAbuse,
  unusedComponent,
};
