import {
  ERROR_RULE_PENALTY,
  INFO_RULE_PENALTY,
  PERFECT_SCORE,
  SCORE_ATTENTION_THRESHOLD,
  SCORE_HEALTHY_THRESHOLD,
  SCORE_UNHEALTHY_THRESHOLD,
  WARNING_RULE_PENALTY,
} from './constants.js';
import type { Issue, ScoreResult } from './types.js';

const countUniqueRulesBySeverity = (issues: Issue[]) => {
  const errorRules = new Set<string>();
  const warningRules = new Set<string>();
  const infoRules = new Set<string>();

  for (const issue of issues) {
    if (issue.severity === 'error') {
      errorRules.add(issue.ruleId);
    } else if (issue.severity === 'warn') {
      warningRules.add(issue.ruleId);
    } else {
      infoRules.add(issue.ruleId);
    }
  }

  return {
    errorRuleCount: errorRules.size,
    warningRuleCount: warningRules.size,
    infoRuleCount: infoRules.size,
  };
};

export const getScoreLabel = (score: number): string => {
  if (score >= SCORE_HEALTHY_THRESHOLD) {
    return 'Healthy';
  }

  if (score >= SCORE_ATTENTION_THRESHOLD) {
    return 'Needs attention';
  }

  if (score >= SCORE_UNHEALTHY_THRESHOLD) {
    return 'Unhealthy';
  }

  return 'Critical';
};

const scoreFromRuleCounts = (
  errorRuleCount: number,
  warningRuleCount: number,
  infoRuleCount: number,
): number => {
  const penalty =
    errorRuleCount * ERROR_RULE_PENALTY +
    warningRuleCount * WARNING_RULE_PENALTY +
    infoRuleCount * INFO_RULE_PENALTY;

  return Math.max(0, Math.round(PERFECT_SCORE - penalty));
};

export const calculateScore = (issues: Issue[]): ScoreResult => {
  const { errorRuleCount, warningRuleCount, infoRuleCount } =
    countUniqueRulesBySeverity(issues);
  const score = scoreFromRuleCounts(errorRuleCount, warningRuleCount, infoRuleCount);

  return {
    score,
    label: getScoreLabel(score),
    errorRuleCount,
    warningRuleCount,
    infoRuleCount,
  };
};

export const isScorePassing = (score: number, failBelow: number): boolean =>
  score >= failBelow;
