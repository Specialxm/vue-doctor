import path from 'node:path';
import {
  ScanError,
  renderJsonReport,
  renderTerminalReport,
  scanProject,
} from '@vue-doctor/core';
import { allRules } from '@vue-doctor/rules';

const TOOL_VERSION = '0.0.1';

interface ScanCommandOptions {
  json?: boolean;
}

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
      return 0;
    }

    process.stdout.write(renderTerminalReport(result, TOOL_VERSION));
    return result.issues.some((issue) => issue.severity === 'error') ? 1 : 0;
  } catch (error) {
    if (error instanceof ScanError) {
      process.stderr.write(`${error.message}\n`);
      return 2;
    }

    throw error;
  }
};
