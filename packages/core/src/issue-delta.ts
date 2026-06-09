import type { Issue } from './types.js';

export const createIssueKey = (issue: Issue): string =>
  `${issue.ruleId}|${issue.file}|${issue.line}`;

export const filterNewIssues = (currentIssues: Issue[], baselineIssues: Issue[]): Issue[] => {
  const baselineKeys = new Set(baselineIssues.map(createIssueKey));

  return currentIssues.filter((issue) => !baselineKeys.has(createIssueKey(issue)));
};

export const filterIssuesToFiles = (
  issues: Issue[],
  changedFiles: readonly string[],
): Issue[] => {
  const changedSet = new Set(changedFiles);

  return issues.filter((issue) => changedSet.has(issue.file));
};
