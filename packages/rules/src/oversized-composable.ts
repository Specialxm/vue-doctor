import { MAX_COMPOSABLE_LINES } from '@vue-doctor/core';
import type { Issue, Rule, ScanContext } from '@vue-doctor/core';
import { isComposableFilePath } from './utils/is-composable-file-path.js';

const countLines = (source: string): number => source.split('\n').length;

export const oversizedComposable: Rule = {
  id: 'oversized-composable',
  description: 'Composables should stay within a reasonable line count',
  severity: 'warn',
  category: 'maintainability',
  detect: (context: ScanContext): Issue[] => {
    const issues: Issue[] = [];

    for (const tsFile of context.tsFiles) {
      if (!isComposableFilePath(tsFile.relativePath)) {
        continue;
      }

      const lineCount = countLines(tsFile.source);
      if (lineCount <= MAX_COMPOSABLE_LINES) {
        continue;
      }

      issues.push({
        ruleId: 'oversized-composable',
        severity: 'warn',
        file: tsFile.relativePath,
        line: 1,
        message: `Composable has ${lineCount} lines (max ${MAX_COMPOSABLE_LINES})`,
        suggestion: 'Split into smaller composables or extract helper modules',
        category: 'maintainability',
      });
    }

    return issues;
  },
};
