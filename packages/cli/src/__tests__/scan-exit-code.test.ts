import { describe, expect, it } from 'vitest';
import { calculateScore } from '@vue-doctor/core';
import { allRules } from '@vue-doctor/rules';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanProject } from '@vue-doctor/core';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../..',
);

describe('scan exit code logic', () => {
  it('bad-project score is below a high threshold', async () => {
    const result = await scanProject({
      root: path.join(repoRoot, 'fixtures/bad-project'),
      rules: allRules,
    });

    expect(result.score.score).toBeLessThan(100);
    expect(calculateScore(result.issues).score).toBe(result.score.score);
  });

  it('good-project achieves perfect score', async () => {
    const result = await scanProject({
      root: path.join(repoRoot, 'fixtures/good-project'),
      rules: allRules,
    });

    expect(result.score.score).toBe(100);
  });
});
