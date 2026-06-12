import { Command } from 'commander';
import { parseScanOptions, runScanCommand } from './commands/scan.js';
import { TOOL_VERSION } from './version.js';

const program = new Command();

program
  .name('vue-doctor')
  .description('Vue 3 codebase health scanner for the AI coding era')
  .version(TOOL_VERSION)
  .argument('[directory]', 'project directory to scan', '.')
  .option('--json', 'output results as JSON')
  .option(
    '--fail-below <score>',
    'exit with code 1 when health score is below this threshold (0-100)',
  )
  .action(async (directory: string, options: { json?: boolean; failBelow?: string }) => {
    try {
      const exitCode = await runScanCommand(directory, parseScanOptions(options));
      process.exit(exitCode);
    } catch (error) {
      if (error instanceof Error) {
        process.stderr.write(`${error.message}\n`);
        process.exit(2);
      }

      throw error;
    }
  });

program.parse();
