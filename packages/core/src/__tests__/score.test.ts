import { describe, expect, it } from 'vitest';
import { calculateScore, getScoreLabel, isScorePassing } from '../score.js';
import type { Issue } from '../types.js';

const makeIssue = (
  ruleId: string,
  severity: Issue['severity'],
): Issue => ({
  ruleId,
  severity,
  file: 'src/App.vue',
  line: 1,
  message: 'test',
  category: 'architecture',
});

describe('calculateScore', () => {
  it('returns perfect score with no issues', () => {
    const result = calculateScore([]);

    expect(result.score).toBe(100);
    expect(result.label).toBe('Healthy');
    expect(result.errorRuleCount).toBe(0);
  });

  it('deducts per unique rule, not per occurrence', () => {
    const issues = [
      makeIssue('direct-api-in-view', 'error'),
      makeIssue('direct-api-in-view', 'error'),
      makeIssue('missing-key-in-vfor', 'error'),
      makeIssue('unused-component', 'warn'),
    ];

    const result = calculateScore(issues);

    expect(result.errorRuleCount).toBe(2);
    expect(result.warningRuleCount).toBe(1);
    expect(result.score).toBe(96);
  });

  it('floors score at zero', () => {
    const issues = Array.from({ length: 80 }, (_, index) =>
      makeIssue(`error-rule-${index}`, 'error'),
    );

    expect(calculateScore(issues).score).toBe(0);
  });
});

describe('getScoreLabel', () => {
  it('maps score bands to labels', () => {
    expect(getScoreLabel(95)).toBe('Healthy');
    expect(getScoreLabel(80)).toBe('Needs attention');
    expect(getScoreLabel(60)).toBe('Unhealthy');
    expect(getScoreLabel(30)).toBe('Critical');
  });
});

describe('isScorePassing', () => {
  it('compares score against threshold', () => {
    expect(isScorePassing(68, 60)).toBe(true);
    expect(isScorePassing(59, 60)).toBe(false);
  });
});
