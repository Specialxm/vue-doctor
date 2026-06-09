import { PR_COMMENT_MARKER } from '../constants.js';
import type { Issue, ScoreResult } from '../types.js';

const severityLabel = (severity: Issue['severity']): string => {
  if (severity === 'error') {
    return 'error';
  }

  if (severity === 'warn') {
    return 'warning';
  }

  return 'info';
};

export const renderPullRequestComment = (
  newIssues: Issue[],
  score: ScoreResult,
  changedFileCount: number,
): string => {
  const lines: string[] = [PR_COMMENT_MARKER, '## vue-doctor Report', ''];

  lines.push(`**Score (PR delta):** ${score.score}/100 — ${score.label}`);
  lines.push(`**Changed files scanned:** ${changedFileCount}`);
  lines.push(`**New issues:** ${newIssues.length}`);
  lines.push('');

  if (newIssues.length === 0) {
    lines.push('No new issues introduced by this PR.');
    return lines.join('\n');
  }

  lines.push('| Severity | File | Rule | Message |');
  lines.push('| --- | --- | --- | --- |');

  for (const issue of newIssues) {
    const location = issue.column
      ? `${issue.file}:${issue.line}:${issue.column}`
      : `${issue.file}:${issue.line}`;

    lines.push(
      `| ${severityLabel(issue.severity)} | ${location} | ${issue.ruleId} | ${issue.message} |`,
    );
  }

  lines.push('');
  lines.push('_Only issues introduced in this PR are shown (baseline compared at merge-base)._');

  return lines.join('\n');
};
