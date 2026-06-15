import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import { allRules } from '@vue-doctor/rules';
import { scanProject } from '@vue-doctor/core';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '../../../..',
);

const tempDirs: string[] = [];

afterEach(() => {
  for (const tempDir of tempDirs.splice(0)) {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }
});

describe('scan ignore patterns', () => {
  it('skips files matching --ignore patterns', async () => {
    const fullResult = await scanProject({
      root: path.join(repoRoot, 'fixtures/bad-project'),
      rules: allRules,
    });

    const ignoredResult = await scanProject({
      root: path.join(repoRoot, 'fixtures/bad-project'),
      rules: allRules,
      ignorePatterns: ['src/views/**'],
    });

    expect(ignoredResult.issues.length).toBeLessThan(fullResult.issues.length);
    expect(
      ignoredResult.issues.some((issue) => issue.file.startsWith('src/views/')),
    ).toBe(false);
  });
});

describe('install command output', () => {
  it('writes a Cursor rule file with all rule ids', async () => {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vue-doctor-install-'));
    tempDirs.push(tempDir);

    const { runInstallCommand } = await import('../commands/install.js');
    const exitCode = await runInstallCommand(tempDir);

    expect(exitCode).toBe(0);

    const rulePath = path.join(tempDir, '.cursor/rules/vue-doctor.mdc');
    const content = fs.readFileSync(rulePath, 'utf-8');

    for (const rule of allRules) {
      expect(content).toContain(rule.id);
    }

    expect(content).toContain('Fix priority');
  });
});
