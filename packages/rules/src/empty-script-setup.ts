import { parse as parseSfc } from '@vue/compiler-sfc';
import { EMPTY_SCRIPT_TEMPLATE_MIN_LINES } from '@vue-doctor/core';
import type { Issue, Rule, ScanContext } from '@vue-doctor/core';
import {
  getScriptSetupBlockLine,
  hasEmptyScriptSetupBlock,
} from './utils/empty-script-setup-block.js';

const countLines = (source: string): number => source.split('\n').length;

export const emptyScriptSetup: Rule = {
  id: 'empty-script-setup',
  description: 'Large templates should not rely on an empty script setup block',
  severity: 'info',
  category: 'maintainability',
  detect: (context: ScanContext): Issue[] => {
    const issues: Issue[] = [];

    for (const vueFile of context.vueFiles) {
      const { descriptor, errors } = parseSfc(vueFile.source, {
        filename: vueFile.path,
      });

      if (errors.length > 0 || !descriptor.template?.content) {
        continue;
      }

      if (
        !hasEmptyScriptSetupBlock(
          vueFile.source,
          descriptor.scriptSetup?.content,
        )
      ) {
        continue;
      }

      const templateLineCount = countLines(descriptor.template.content);
      if (templateLineCount < EMPTY_SCRIPT_TEMPLATE_MIN_LINES) {
        continue;
      }

      const line =
        descriptor.scriptSetup?.loc.start.line ??
        getScriptSetupBlockLine(vueFile.source);

      issues.push({
        ruleId: 'empty-script-setup',
        severity: 'info',
        file: vueFile.relativePath,
        line,
        message: `Template has ${templateLineCount} lines but script setup is empty`,
        suggestion: 'Extract logic into composables or split the template into components',
        category: 'maintainability',
      });
    }

    return issues;
  },
};
