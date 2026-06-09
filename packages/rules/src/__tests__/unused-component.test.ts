import { describe, expect, it } from 'vitest';
import { runRuleOnFixture } from '../test-utils.js';

describe('unused-component', () => {
  it('reports vue files with no importers', async () => {
    const issues = await runRuleOnFixture('bad-project', 'unused-component');

    expect(issues.some((issue) => issue.file.includes('components/Unused.vue'))).toBe(
      true,
    );
  });

  it('stays silent when all components are imported', async () => {
    const issues = await runRuleOnFixture('good-project', 'unused-component');

    expect(issues).toHaveLength(0);
  });

  it('does not flag App.vue entry component', async () => {
    const issues = await runRuleOnFixture('bad-project', 'unused-component');
    const appIssues = issues.filter((issue) => issue.file.endsWith('App.vue'));

    expect(appIssues).toHaveLength(0);
  });
});
