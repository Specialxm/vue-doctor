import { describe, expect, it } from 'vitest';
import { PR_COMMENT_MARKER } from '../constants.js';
import { renderPullRequestComment } from '../reporter/pr-comment.js';
import type { Issue, ScoreResult } from '../types.js';

const score: ScoreResult = {
  score: 94,
  label: 'Healthy',
  errorRuleCount: 1,
  warningRuleCount: 1,
  infoRuleCount: 0,
};

const issue: Issue = {
  ruleId: 'missing-key-in-vfor',
  severity: 'error',
  file: 'src/views/Order.vue',
  line: 12,
  message: 'v-for is missing a key',
  category: 'performance',
};

describe('renderPullRequestComment', () => {
  it('includes marker for sticky comment updates', () => {
    const body = renderPullRequestComment([], score, 2);

    expect(body).toContain(PR_COMMENT_MARKER);
    expect(body).toContain('94/100');
  });

  it('renders table rows for new issues', () => {
    const body = renderPullRequestComment([issue], score, 1);

    expect(body).toContain('missing-key-in-vfor');
    expect(body).toContain('src/views/Order.vue:12');
  });
});
