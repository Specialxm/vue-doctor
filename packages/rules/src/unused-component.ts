import { findRouterEntryVueFiles } from '@vue-doctor/core';
import type { Issue, Rule, ScanContext } from '@vue-doctor/core';
import {
  isEntryVueFile,
  isLayoutVueFile,
} from './utils/is-entry-vue-file.js';

export const unusedComponent: Rule = {
  id: 'unused-component',
  description: 'Vue components should be imported or registered in the router',
  severity: 'warn',
  category: 'maintainability',
  detect: (context: ScanContext): Issue[] => {
    const issues: Issue[] = [];
    const routerEntries = findRouterEntryVueFiles(
      context.root,
      context.tsFiles.map((file) => file.relativePath),
    );
    const entryFiles = new Set<string>();

    for (const vueFile of context.vueFiles) {
      if (isEntryVueFile(vueFile.relativePath) || isLayoutVueFile(vueFile.relativePath)) {
        entryFiles.add(vueFile.relativePath);
      }
    }

    for (const routerEntry of routerEntries) {
      entryFiles.add(routerEntry);
    }

    for (const vueFile of context.vueFiles) {
      const relativePath = vueFile.relativePath;

      if (isEntryVueFile(relativePath) || isLayoutVueFile(relativePath)) {
        continue;
      }

      const importers = context.importGraph.reverseEdges.get(relativePath);
      if (importers && importers.size > 0) {
        continue;
      }

      if (entryFiles.has(relativePath)) {
        continue;
      }

      issues.push({
        ruleId: 'unused-component',
        severity: 'warn',
        file: relativePath,
        line: 1,
        message: 'Component is not imported by any other file',
        suggestion: 'Remove the file or import it from a parent component or route',
        category: 'maintainability',
      });
    }

    return issues;
  },
};
