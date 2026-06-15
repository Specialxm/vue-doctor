import { parse as parseSfc } from '@vue/compiler-sfc';
import type { Issue, Rule, ScanContext } from '@vue-doctor/core';
import { usesOptionsApi } from './utils/uses-options-api.js';

export const deprecatedOptionsApi: Rule = {
  id: 'deprecated-options-api',
  description: 'Prefer script setup over Options API for new Vue components',
  severity: 'info',
  category: 'maintainability',
  detect: (context: ScanContext): Issue[] => {
    const issues: Issue[] = [];

    for (const vueFile of context.vueFiles) {
      const { descriptor, errors } = parseSfc(vueFile.source, {
        filename: vueFile.path,
      });

      if (errors.length > 0 || descriptor.scriptSetup || !descriptor.script?.content) {
        continue;
      }

      if (!usesOptionsApi(descriptor.script.content)) {
        continue;
      }

      issues.push({
        ruleId: 'deprecated-options-api',
        severity: 'info',
        file: vueFile.relativePath,
        line: descriptor.script.loc.start.line,
        message: 'Component uses Options API instead of script setup',
        suggestion: 'Migrate to <script setup lang="ts"> for new Vue 3 code',
        category: 'maintainability',
      });
    }

    return issues;
  },
};
