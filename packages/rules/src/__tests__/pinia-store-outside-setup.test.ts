import { describe, expect, it } from 'vitest';
import { runRuleOnFixture } from '../test-utils.js';

describe('pinia-store-outside-setup', () => {
  it('reports useStore call outside setup in Options API', async () => {
    const issues = await runRuleOnFixture('bad-project', 'pinia-store-outside-setup');

    expect(issues.some((issue) => issue.file.includes('views/LegacyView.vue'))).toBe(
      true,
    );
  });

  it('stays silent for script setup projects', async () => {
    const issues = await runRuleOnFixture('good-project', 'pinia-store-outside-setup');

    expect(issues).toHaveLength(0);
  });

  it('does not flag script setup store usage', async () => {
    const issues = await runRuleOnFixture('good-project', 'pinia-store-outside-setup');

    expect(issues.every((issue) => issue.ruleId === 'pinia-store-outside-setup')).toBe(
      true,
    );
  });
});
