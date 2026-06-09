import path from 'node:path';
import {
  ScanError,
  isScorePassing,
  renderJsonReport,
  renderTerminalReport,
  scanProject,
} from '@vue-doctor/core';
import { allRules } from '@vue-doctor/rules';

const TOOL_VERSION = '0.0.1';

interface ScanCommandOptions {
  json?: boolean;
  failBelow?: number;
}

const parseFailBelow = (value: string): number => {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    throw new Error('--fail-below must be a number between 0 and 100');
  }

  return parsed;
};

const resolveExitCode = (
  result: Awaited<ReturnType<typeof scanProject>>,
  failBelow?: number,
): number => {
  if (failBelow !== undefined) {
    return isScorePassing(result.score.score, failBelow) ? 0 : 1;
  }

  return result.issues.some((issue) => issue.severity === 'error') ? 1 : 0;
};

export const runScanCommand = async (
  targetDirectory: string,
  options: ScanCommandOptions,
): Promise<number> => {
  const root = path.resolve(targetDirectory);

  try {
    const result = await scanProject({
      root,
      rules: allRules,
    });

    if (options.json) {
      process.stdout.write(
        `${JSON.stringify(renderJsonReport(result, TOOL_VERSION), null, 2)}\n`,
      );
      return resolveExitCode(result, options.failBelow);
    }

    process.stdout.write(renderTerminalReport(result, TOOL_VERSION));
    return resolveExitCode(result, options.failBelow);
  } catch (error) {
    if (error instanceof ScanError) {
      process.stderr.write(`${error.message}\n`);
      return 2;
    }

    throw error;
  }
};

export const parseScanOptions = (options: {
  json?: boolean;
  failBelow?: string;
}): ScanCommandOptions => {
  const parsed: ScanCommandOptions = {
    json: options.json,
  };

  if (options.failBelow !== undefined) {
    parsed.failBelow = parseFailBelow(options.failBelow);
  }

  return parsed;
};
