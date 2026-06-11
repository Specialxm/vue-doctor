import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { ScanError, isGitRepository, scanPullRequestDiff } from '../index.js';
import type { Rule } from '../types.js';

const smokeRules: Rule[] = [
  {
    id: 'smoke-rule',
    description: 'smoke test rule',
    severity: 'warn',
    category: 'maintainability',
    detect: () => [],
  },
];

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../..',
);
const badProjectRoot = path.join(repoRoot, 'fixtures/bad-project');

describe('scanPullRequestDiff', () => {
  it('requires a git repository', async () => {
    if (isGitRepository(badProjectRoot)) {
      return;
    }

    await expect(
      scanPullRequestDiff({
        root: badProjectRoot,
        rules: smokeRules,
        baseBranch: 'main',
      }),
    ).rejects.toThrow(ScanError);
  });

  it(
    'runs against repository history when available',
    async () => {
      if (!isGitRepository(repoRoot)) {
        return;
      }

      const result = await scanPullRequestDiff({
        root: badProjectRoot,
        gitRoot: repoRoot,
        rules: smokeRules,
        baseBranch: 'main',
      });

      expect(result.changedFiles).toBeInstanceOf(Array);
      expect(result.score.score).toBeGreaterThanOrEqual(0);
      expect(result.score.score).toBeLessThanOrEqual(100);
    },
    15000,
  );
});
