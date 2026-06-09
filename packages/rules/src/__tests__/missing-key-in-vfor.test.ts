import { describe, expect, it } from 'vitest';
import { runRuleOnFixture } from '../test-utils.js';

describe('missing-key-in-vfor', () => {
  it('reports v-for without key', async () => {
    const issues = await runRuleOnFixture('bad-project', 'missing-key-in-vfor');

    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some((issue) => issue.ruleId === 'missing-key-in-vfor')).toBe(true);
    expect(issues.some((issue) => issue.file.includes('views/Order.vue'))).toBe(true);
  });

  it('stays silent when :key is on v-for element', async () => {
    const issues = await runRuleOnFixture('good-project', 'missing-key-in-vfor');
    const orderIssues = issues.filter((issue) => issue.file.includes('views/Order.vue'));

    expect(orderIssues).toHaveLength(0);
  });

  it('stays silent when key is on direct child of template v-for', async () => {
    const issues = await runRuleOnFixture('good-project', 'missing-key-in-vfor');
    const itemListIssues = issues.filter((issue) => issue.file.includes('views/ItemList.vue'));

    expect(itemListIssues).toHaveLength(0);
  });

  it('does not cross-report direct-api-in-view issues', async () => {
    const issues = await runRuleOnFixture('bad-project', 'missing-key-in-vfor');

    expect(issues.every((issue) => issue.ruleId === 'missing-key-in-vfor')).toBe(true);
  });
});
