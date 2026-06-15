import { describe, expect, it } from 'vitest';
import { runRuleOnFixture } from '../test-utils.js';

describe('deprecated-options-api', () => {
  it('reports Options API components', async () => {
    const issues = await runRuleOnFixture('bad-project', 'deprecated-options-api');

    expect(issues.some((issue) => issue.file.includes('LegacyView.vue'))).toBe(true);
  });

  it('stays silent for script setup components', async () => {
    const issues = await runRuleOnFixture('good-project', 'deprecated-options-api');

    expect(issues).toHaveLength(0);
  });
});
