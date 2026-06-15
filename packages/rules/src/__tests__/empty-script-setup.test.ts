import { describe, expect, it } from 'vitest';
import { runRuleOnFixture } from '../test-utils.js';

describe('empty-script-setup', () => {
  it('reports empty script setup with a large template', async () => {
    const issues = await runRuleOnFixture('bad-project', 'empty-script-setup');

    expect(issues.some((issue) => issue.file.includes('BigComponent.vue'))).toBe(true);
  });

  it('stays silent for components with script logic', async () => {
    const issues = await runRuleOnFixture('good-project', 'empty-script-setup');

    expect(issues).toHaveLength(0);
  });
});
