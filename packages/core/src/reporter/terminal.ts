import pc from 'picocolors';
import {
  SCORE_ATTENTION_THRESHOLD,
  SCORE_HEALTHY_THRESHOLD,
  SCORE_UNHEALTHY_THRESHOLD,
} from '../constants.js';
import type { Category, Issue, ScanResult } from '../types.js';

const severityIcon = (severity: Issue['severity']): string => {
  if (severity === 'error') {
    return pc.red('✖');
  }
  if (severity === 'warn') {
    return pc.yellow('⚠');
  }
  return pc.blue('ℹ');
};

const countBySeverity = (issues: Issue[]) => {
  return issues.reduce(
    (counts, issue) => {
      counts[issue.severity] += 1;
      return counts;
    },
    { error: 0, warn: 0, info: 0 },
  );
};

const countByCategory = (issues: Issue[]): Record<Category, number> => {
  const counts: Record<Category, number> = {
    architecture: 0,
    performance: 0,
    maintainability: 0,
    security: 0,
  };

  for (const issue of issues) {
    counts[issue.category] += 1;
  }

  return counts;
};

const scoreEmoji = (score: number): string => {
  if (score >= SCORE_HEALTHY_THRESHOLD) {
    return '🟢';
  }

  if (score >= SCORE_ATTENTION_THRESHOLD) {
    return '🟡';
  }

  if (score >= SCORE_UNHEALTHY_THRESHOLD) {
    return '🟠';
  }

  return '🔴';
};

const formatScoreLine = (result: ScanResult): string => {
  const { score, label } = result.score;
  const emoji = scoreEmoji(score);
  const scoreText = `${score}/100`;

  if (score >= SCORE_HEALTHY_THRESHOLD) {
    return `  ${emoji} ${pc.green(`Score: ${scoreText}`)} — ${label}`;
  }

  if (score >= SCORE_ATTENTION_THRESHOLD) {
    return `  ${emoji} ${pc.yellow(`Score: ${scoreText}`)} — ${label}`;
  }

  if (score >= SCORE_UNHEALTHY_THRESHOLD) {
    return `  ${emoji} ${pc.yellow(`Score: ${scoreText}`)} — ${label}`;
  }

  return `  ${emoji} ${pc.red(`Score: ${scoreText}`)} — ${label}`;
};

export const renderTerminalReport = (
  result: ScanResult,
  toolVersion: string,
): string => {
  const lines: string[] = [];
  const counts = countBySeverity(result.issues);
  const categoryCounts = countByCategory(result.issues);

  lines.push('');
  lines.push(`  vue-doctor v${toolVersion}`);
  lines.push('');
  lines.push(`  Project: ${result.projectMeta.name}`);
  lines.push(`  Framework: ${result.projectMeta.framework}`);
  lines.push('');
  lines.push(formatScoreLine(result));
  lines.push('');

  if (result.issues.length === 0) {
    lines.push(pc.green('  ✓ No issues found'));
    lines.push('');
    return lines.join('\n');
  }

  for (const issue of result.issues) {
    const location = issue.column
      ? `${issue.file}:${issue.line}:${issue.column}`
      : `${issue.file}:${issue.line}`;

    lines.push(`  ${severityIcon(issue.severity)} ${pc.bold(location)}`);
    lines.push(`    ${issue.ruleId} — ${issue.message}`);
    if (issue.suggestion) {
      lines.push(pc.gray(`    → ${issue.suggestion}`));
    }
    lines.push('');
  }

  lines.push(
    `  ${result.issues.length} issue${result.issues.length === 1 ? '' : 's'} ` +
      `(${counts.error} error${counts.error === 1 ? '' : 's'}, ` +
      `${counts.warn} warning${counts.warn === 1 ? '' : 's'}, ` +
      `${counts.info} info)`,
  );
  lines.push('');

  const categoryLines = Object.entries(categoryCounts)
    .filter(([, count]) => count > 0)
    .map(([category, count]) => `    ${category}: ${count}`);

  if (categoryLines.length > 0) {
    lines.push('  By category:');
    lines.push(...categoryLines);
    lines.push('');
  }

  return lines.join('\n');
};

export const renderJsonReport = (result: ScanResult, toolVersion: string) => {
  const counts = countBySeverity(result.issues);
  const categoryCounts = countByCategory(result.issues);

  return {
    schemaVersion: 1 as const,
    toolVersion,
    project: {
      root: result.projectMeta.root,
      name: result.projectMeta.name,
      framework: result.projectMeta.framework,
      vueVersion: result.projectMeta.vueVersion,
    },
    score: result.score.score,
    summary: {
      errors: counts.error,
      warnings: counts.warn,
      infos: counts.info,
      total: result.issues.length,
      byCategory: categoryCounts,
    },
    issues: result.issues,
    durationMs: result.durationMs,
  };
};

export const renderQuietReport = (result: ScanResult): string => {
  return `${result.score.score}\n`;
};
