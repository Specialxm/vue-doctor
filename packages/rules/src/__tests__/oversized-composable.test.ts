import { describe, expect, it } from 'vitest';
import { runRuleOnFixture } from '../test-utils.js';

describe('oversized-composable', () => {
  it('reports composables exceeding line limit', async () => {
    const issues = await runRuleOnFixture('bad-project', 'oversized-composable');

    expect(issues.some((issue) => issue.file.includes('composables/useBig.ts'))).toBe(
      true,
    );
  });

  it('stays silent for small composables', async () => {
    const issues = await runRuleOnFixture('good-project', 'oversized-composable');
    const composableIssues = issues.filter((issue) =>
      issue.file.includes('composables/'),
    );

    expect(composableIssues).toHaveLength(0);
  });

  it('does not flag non-composable ts files', async () => {
    const issues = await runRuleOnFixture('bad-project', 'oversized-composable');

    expect(issues.every((issue) => issue.file.includes('composables/'))).toBe(true);
  });
});
