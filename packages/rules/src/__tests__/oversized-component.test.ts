import { describe, expect, it } from 'vitest';
import { runRuleOnFixture } from '../test-utils.js';

describe('oversized-component', () => {
  it('reports components exceeding line limit', async () => {
    const issues = await runRuleOnFixture('bad-project', 'oversized-component');

    expect(
      issues.some((issue) => issue.file.includes('components/BigComponent.vue')),
    ).toBe(true);
  });

  it('stays silent for small components', async () => {
    const issues = await runRuleOnFixture('good-project', 'oversized-component');

    expect(issues).toHaveLength(0);
  });

  it('reports line count in message', async () => {
    const issues = await runRuleOnFixture('bad-project', 'oversized-component');
    const bigIssue = issues.find((issue) =>
      issue.file.includes('BigComponent.vue'),
    );

    expect(bigIssue?.message).toMatch(/\d+ lines/);
  });
});
