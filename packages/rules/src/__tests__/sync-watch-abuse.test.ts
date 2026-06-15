import { describe, expect, it } from 'vitest';
import { runRuleOnFixture } from '../test-utils.js';

describe('sync-watch-abuse', () => {
  it('reports watch callbacks that mutate the watched source', async () => {
    const issues = await runRuleOnFixture('bad-project', 'sync-watch-abuse');

    expect(issues.some((issue) => issue.file.includes('useBadWatch.ts'))).toBe(true);
  });

  it('stays silent for valid watch usage', async () => {
    const issues = await runRuleOnFixture('good-project', 'sync-watch-abuse');

    expect(issues).toHaveLength(0);
  });
});
