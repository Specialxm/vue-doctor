import { parse } from '@vue/compiler-sfc';
import { Project, SyntaxKind } from 'ts-morph';
import type { Issue, Rule, ScanContext } from '@vue-doctor/core';
import {
  isInsideSetupFunction,
  isPiniaStoreCall,
} from './utils/is-pinia-store-call.js';

export const piniaStoreOutsideSetup: Rule = {
  id: 'pinia-store-outside-setup',
  description: 'Pinia stores should be used inside setup(), not Options API hooks',
  severity: 'warn',
  category: 'architecture',
  detect: (context: ScanContext): Issue[] => {
    const issues: Issue[] = [];
    const project = new Project({ useInMemoryFileSystem: true });

    for (const vueFile of context.vueFiles) {
      const { descriptor, errors } = parse(vueFile.source, { filename: vueFile.path });

      if (errors.length > 0 || !descriptor.script?.content) {
        continue;
      }

      const scriptBlock = descriptor.script;
      const scriptOffsetLine = scriptBlock.loc.start.line;
      const sourceFile = project.createSourceFile(
        `${vueFile.relativePath}.options.ts`,
        scriptBlock.content,
        { overwrite: true },
      );

      for (const callExpression of sourceFile.getDescendantsOfKind(
        SyntaxKind.CallExpression,
      )) {
        if (!isPiniaStoreCall(callExpression)) {
          continue;
        }

        if (isInsideSetupFunction(callExpression)) {
          continue;
        }

        issues.push({
          ruleId: 'pinia-store-outside-setup',
          severity: 'warn',
          file: vueFile.relativePath,
          line: scriptOffsetLine + callExpression.getStartLineNumber() - 1,
          message: 'Pinia store is used outside setup()',
          suggestion: 'Move store access into setup() or migrate to <script setup>',
          category: 'architecture',
        });
      }
    }

    return issues;
  },
};
