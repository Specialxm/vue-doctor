import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanProject } from '@vue-doctor/core';
import { allRules } from '@vue-doctor/rules';

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, '../../..');

export const runRuleOnFixture = async (
  fixtureRelativePath: string,
  ruleId?: string,
) => {
  const fixtureRoot = path.join(repoRoot, 'fixtures', fixtureRelativePath);
  const rules = ruleId
    ? allRules.filter((rule) => rule.id === ruleId)
    : allRules;

  const result = await scanProject({
    root: fixtureRoot,
    rules,
  });

  return result.issues;
};

export const runScanOnFixture = async (fixtureRelativePath: string) => {
  const fixtureRoot = path.join(repoRoot, 'fixtures', fixtureRelativePath);

  return scanProject({
    root: fixtureRoot,
    rules: allRules,
  });
};
