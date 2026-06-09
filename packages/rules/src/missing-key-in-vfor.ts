import { parse as parseSfc } from '@vue/compiler-sfc';
import { parse as parseTemplate } from '@vue/compiler-dom';
import type { Issue, Rule, ScanContext } from '@vue-doctor/core';
import {
  isMissingVForKeyViolation,
  walkTemplateChildren,
} from './utils/has-vfor-key.js';

export const missingKeyInVfor: Rule = {
  id: 'missing-key-in-vfor',
  description: 'v-for elements must have a key attribute or :key binding',
  severity: 'error',
  category: 'performance',
  detect: (context: ScanContext): Issue[] => {
    const issues: Issue[] = [];

    for (const vueFile of context.vueFiles) {
      const { descriptor, errors } = parseSfc(vueFile.source, {
        filename: vueFile.path,
      });

      if (errors.length > 0 || !descriptor.template?.content) {
        continue;
      }

      const templateBlock = descriptor.template;
      const templateOffsetLine = templateBlock.loc.start.line;

      const templateAst = parseTemplate(templateBlock.content, {
        onError: () => {
          // Stay silent on template parse errors (v1).
        },
      });

      walkTemplateChildren(templateAst.children, (element) => {
        if (!isMissingVForKeyViolation(element)) {
          return;
        }

        issues.push({
          ruleId: 'missing-key-in-vfor',
          severity: 'error',
          file: vueFile.relativePath,
          line: templateOffsetLine + element.loc.start.line - 1,
          column: element.loc.start.column,
          message: 'v-for is missing a key attribute or :key binding',
          suggestion: 'Add :key="uniqueId" to the v-for element or its direct child',
          category: 'performance',
        });
      });
    }

    return issues;
  },
};
