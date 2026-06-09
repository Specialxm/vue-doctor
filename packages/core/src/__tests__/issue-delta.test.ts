import { describe, expect, it } from 'vitest';
import {
  createIssueKey,
  filterIssuesToFiles,
  filterNewIssues,
} from '../issue-delta.js';
import type { Issue } from '../types.js';

const makeIssue = (ruleId: string, file: string, line: number): Issue => ({
  ruleId,
  severity: 'error',
  file,
  line,
  message: 'test',
  category: 'architecture',
});

describe('issue-delta', () => {
  it('creates stable issue keys', () => {
    const issue = makeIssue('direct-api-in-view', 'src/App.vue', 3);
    expect(createIssueKey(issue)).toBe('direct-api-in-view|src/App.vue|3');
  });

  it('filters issues introduced in the PR', () => {
    const baseline = [makeIssue('direct-api-in-view', 'src/App.vue', 3)];
    const current = [
      makeIssue('direct-api-in-view', 'src/App.vue', 3),
      makeIssue('missing-key-in-vfor', 'src/List.vue', 8),
    ];

    const newIssues = filterNewIssues(current, baseline);

    expect(newIssues).toHaveLength(1);
    expect(newIssues[0].ruleId).toBe('missing-key-in-vfor');
  });

  it('filters issues to changed files', () => {
    const issues = [
      makeIssue('unused-component', 'src/Unused.vue', 1),
      makeIssue('direct-api-in-view', 'src/views/Order.vue', 4),
    ];

    const filtered = filterIssuesToFiles(issues, ['src/views/Order.vue']);

    expect(filtered).toHaveLength(1);
    expect(filtered[0].file).toBe('src/views/Order.vue');
  });
});
