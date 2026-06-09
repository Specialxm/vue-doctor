import { MAX_COMPONENT_LINES } from '@vue-doctor/core';
import type { Issue, Rule, ScanContext } from '@vue-doctor/core';

const countLines = (source: string): number => source.split('\n').length;

export const oversizedComponent: Rule = {
  id: 'oversized-component',
  description: 'Vue components should stay within a reasonable line count',
  severity: 'warn',
  category: 'maintainability',
  detect: (context: ScanContext): Issue[] => {
    const issues: Issue[] = [];

    for (const vueFile of context.vueFiles) {
      const lineCount = countLines(vueFile.source);
      if (lineCount <= MAX_COMPONENT_LINES) {
        continue;
      }

      issues.push({
        ruleId: 'oversized-component',
        severity: 'warn',
        file: vueFile.relativePath,
        line: 1,
        message: `Component has ${lineCount} lines (max ${MAX_COMPONENT_LINES})`,
        suggestion: 'Split into smaller components or extract composables',
        category: 'maintainability',
      });
    }

    return issues;
  },
};
