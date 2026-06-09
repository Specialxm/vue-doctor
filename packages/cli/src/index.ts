import { Command } from 'commander';
import { runScanCommand } from './commands/scan.js';

const program = new Command();

program
  .name('vue-doctor')
  .description('Vue 3 codebase health scanner for the AI coding era')
  .version('0.0.1')
  .argument('[directory]', 'project directory to scan', '.')
  .option('--json', 'output results as JSON')
  .action(async (directory: string, options: { json?: boolean }) => {
    const exitCode = await runScanCommand(directory, options);
    process.exit(exitCode);
  });

program.parse();
