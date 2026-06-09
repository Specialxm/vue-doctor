import { describe, expect, it } from 'vitest';
import { runRuleOnFixture } from '../test-utils.js';

describe('direct-api-in-view', () => {
  it('reports fetch in view component', async () => {
    const issues = await runRuleOnFixture('bad-project', 'direct-api-in-view');

    expect(issues.length).toBeGreaterThan(0);
    expect(issues.some((issue) => issue.ruleId === 'direct-api-in-view')).toBe(true);
    expect(issues.some((issue) => issue.file.includes('views/Order.vue'))).toBe(true);
  });

  it('stays silent for API call in composable', async () => {
    const issues = await runRuleOnFixture('good-project', 'direct-api-in-view');

    expect(issues).toHaveLength(0);
  });

  it('stays silent for view that delegates to composable', async () => {
    const issues = await runRuleOnFixture('good-project', 'direct-api-in-view');
    const viewIssues = issues.filter((issue) => issue.file.includes('views/'));

    expect(viewIssues).toHaveLength(0);
  });
});
