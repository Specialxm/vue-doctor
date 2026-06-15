import path from 'node:path';
import {
  ScanError,
  isScorePassing,
  renderJsonReport,
  renderQuietReport,
  renderTerminalReport,
  scanProject,
} from '@vue-doctor/core';
import { allRules } from '@vue-doctor/rules';
import { TOOL_VERSION } from '../version.js';

interface ScanCommandOptions {
  json?: boolean;
  quiet?: boolean;
  failBelow?: number;
  ignorePatterns?: string[];
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
      ignorePatterns: options.ignorePatterns,
    });

    if (options.json) {
      if (options.quiet) {
        process.stdout.write(`${JSON.stringify({ score: result.score.score })}\n`);
      } else {
        process.stdout.write(
          `${JSON.stringify(renderJsonReport(result, TOOL_VERSION), null, 2)}\n`,
        );
      }

      return resolveExitCode(result, options.failBelow);
    }

    if (options.quiet) {
      process.stdout.write(renderQuietReport(result));
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
  quiet?: boolean;
  failBelow?: string;
  ignore?: string[];
}): ScanCommandOptions => {
  const parsed: ScanCommandOptions = {
    json: options.json,
    quiet: options.quiet,
  };

  if (options.failBelow !== undefined) {
    parsed.failBelow = parseFailBelow(options.failBelow);
  }

  if (options.ignore !== undefined && options.ignore.length > 0) {
    parsed.ignorePatterns = options.ignore;
  }

  return parsed;
};
