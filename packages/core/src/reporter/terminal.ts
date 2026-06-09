import pc from 'picocolors';
import type { Issue, ScanResult } from '../types.js';

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

export const renderTerminalReport = (
  result: ScanResult,
  toolVersion: string,
): string => {
  const lines: string[] = [];
  const counts = countBySeverity(result.issues);

  lines.push('');
  lines.push(`  vue-doctor v${toolVersion}`);
  lines.push('');
  lines.push(`  Project: ${result.projectMeta.name}`);
  lines.push(`  Framework: ${result.projectMeta.framework}`);
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

  return lines.join('\n');
};

export const renderJsonReport = (result: ScanResult, toolVersion: string) => {
  const counts = countBySeverity(result.issues);

  return {
    schemaVersion: 1 as const,
    toolVersion,
    project: {
      root: result.projectMeta.root,
      name: result.projectMeta.name,
      framework: result.projectMeta.framework,
      vueVersion: result.projectMeta.vueVersion,
    },
    summary: {
      errors: counts.error,
      warnings: counts.warn,
      infos: counts.info,
      total: result.issues.length,
    },
    issues: result.issues,
    durationMs: result.durationMs,
  };
};
