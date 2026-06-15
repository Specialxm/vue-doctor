import { Command } from 'commander';
import { runInstallCommand } from './commands/install.js';
import { parseScanOptions, runScanCommand } from './commands/scan.js';
import { TOOL_VERSION } from './version.js';

const program = new Command();

program
  .name('vue-doctor')
  .description('Vue 3 codebase health scanner for the AI coding era')
  .version(TOOL_VERSION);

program
  .command('install')
  .description('generate a Cursor rule from vue-doctor detection rules')
  .argument('[directory]', 'project directory', '.')
  .action(async (directory: string) => {
    try {
      const exitCode = await runInstallCommand(directory);
      process.exit(exitCode);
    } catch (error) {
      if (error instanceof Error) {
        process.stderr.write(`${error.message}\n`);
        process.exit(2);
      }

      throw error;
    }
  });

program
  .argument('[directory]', 'project directory to scan', '.')
  .option('--json', 'output results as JSON')
  .option('--quiet', 'output only the health score')
  .option(
    '--fail-below <score>',
    'exit with code 1 when health score is below this threshold (0-100)',
  )
  .option(
    '--ignore <pattern>',
    'ignore files matching glob pattern (repeatable)',
    (value: string, previous: string[]) => [...previous, value],
    [],
  )
  .action(
    async (
      directory: string,
      options: {
        json?: boolean;
        quiet?: boolean;
        failBelow?: string;
        ignore?: string[];
      },
    ) => {
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
    },
  );

program.parse();
