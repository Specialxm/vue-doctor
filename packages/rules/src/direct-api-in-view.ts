import { Project, SyntaxKind } from 'ts-morph';
import type { Issue, Rule, ScanContext } from '@vue-doctor/core';
import { isApiCallExpression } from './utils/is-api-call-expression.js';
import { isViewFilePath } from './utils/is-view-file-path.js';

export const directApiInView: Rule = {
  id: 'direct-api-in-view',
  description: 'API calls should not be made directly in view components',
  severity: 'error',
  category: 'architecture',
  detect: (context: ScanContext): Issue[] => {
    const issues: Issue[] = [];
    const project = new Project({ useInMemoryFileSystem: true });

    for (const vueFile of context.vueFiles) {
      if (!isViewFilePath(vueFile.relativePath)) {
        continue;
      }

      if (!vueFile.scriptContent) {
        continue;
      }

      const sourceFile = project.createSourceFile(
        `${vueFile.relativePath}.ts`,
        vueFile.scriptContent,
        { overwrite: true },
      );

      for (const callExpression of sourceFile.getDescendantsOfKind(
        SyntaxKind.CallExpression,
      )) {
        if (!isApiCallExpression(callExpression)) {
          continue;
        }

        issues.push({
          ruleId: 'direct-api-in-view',
          severity: 'error',
          file: vueFile.relativePath,
          line: callExpression.getStartLineNumber(),
          message: 'API call directly in view component',
          suggestion: 'Move to a composable or Pinia action',
          category: 'architecture',
        });
      }
    }

    return issues;
  },
};
