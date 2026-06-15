import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { scanProject } from '../packages/core/dist/index.js';
import { allRules } from '../packages/rules/dist/index.js';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cacheDir = path.join(repoRoot, '.leaderboard-cache');

const LEADERBOARD_PROJECTS = [
  {
    name: 'VueUse',
    slug: 'vueuse',
    tarball: 'https://api.github.com/repos/vueuse/vueuse/tarball/main',
    directory: '.',
    url: 'https://github.com/vueuse/vueuse',
  },
  {
    name: 'Pinia',
    slug: 'pinia',
    tarball: 'https://api.github.com/repos/vuejs/pinia/tarball/v4',
    directory: '.',
    url: 'https://github.com/vuejs/pinia',
  },
  {
    name: 'Element Plus',
    slug: 'element-plus',
    tarball: 'https://api.github.com/repos/element-plus/element-plus/tarball/dev',
    directory: 'packages/components',
    url: 'https://github.com/element-plus/element-plus',
  },
  {
    name: 'VeeValidate',
    slug: 'vee-validate',
    tarball: 'https://api.github.com/repos/logaretm/vee-validate/tarball/main',
    directory: '.',
    url: 'https://github.com/logaretm/vee-validate',
  },
  {
    name: 'Vue Router',
    slug: 'router',
    tarball: 'https://api.github.com/repos/vuejs/router/tarball/main',
    directory: 'packages/router',
    url: 'https://github.com/vuejs/router',
  },
];

const downloadTarball = (tarballUrl, slug) => {
  const extractDir = path.join(cacheDir, slug);
  const archivePath = path.join(cacheDir, `${slug}.tar.gz`);

  if (fs.existsSync(extractDir)) {
    return extractDir;
  }

  fs.mkdirSync(cacheDir, { recursive: true });

  execSync(
    `curl.exe -L -o "${archivePath}" "${tarballUrl}"`,
    { stdio: 'inherit' },
  );

  fs.mkdirSync(extractDir, { recursive: true });
  execSync(`tar -xzf "${archivePath}" -C "${extractDir}"`, { stdio: 'inherit' });

  return extractDir;
};

const resolveExtractedRoot = (extractDir) => {
  const entries = fs.readdirSync(extractDir, { withFileTypes: true });
  const rootEntry = entries.find((entry) => entry.isDirectory());

  if (!rootEntry) {
    throw new Error(`No extracted directory found in ${extractDir}`);
  }

  return path.join(extractDir, rootEntry.name);
};

const scanLeaderboardProject = async (project) => {
  const extractDir = downloadTarball(project.tarball, project.slug);
  const extractedRoot = resolveExtractedRoot(extractDir);
  const scanRoot = path.join(extractedRoot, project.directory);

  if (!fs.existsSync(scanRoot)) {
    throw new Error(`Scan directory not found: ${scanRoot}`);
  }

  const startedAt = Date.now();
  const result = await scanProject({
    root: scanRoot,
    rules: allRules,
    ignorePatterns: ['**/__tests__/**', '**/*.spec.ts', '**/*.test.ts'],
  });

  return {
    name: project.name,
    url: project.url,
    directory: project.directory,
    score: result.score.score,
    label: result.score.label,
    issues: result.issues.length,
    errors: result.issues.filter((issue) => issue.severity === 'error').length,
    warnings: result.issues.filter((issue) => issue.severity === 'warn').length,
    durationMs: Date.now() - startedAt,
  };
};

const main = async () => {
  const results = [];

  for (const project of LEADERBOARD_PROJECTS) {
    process.stdout.write(`Scanning ${project.name}...\n`);

    try {
      const entry = await scanLeaderboardProject(project);
      results.push(entry);
      process.stdout.write(
        `  ${entry.name}: ${entry.score}/100 (${entry.issues} issues)\n`,
      );
    } catch (error) {
      process.stderr.write(
        `  ${project.name} failed: ${error instanceof Error ? error.message : String(error)}\n`,
      );
    }
  }

  results.sort((left, right) => right.score - left.score);

  const scannedAt = new Date().toISOString().slice(0, 10);
  const outputPath = path.join(repoRoot, 'docs/leaderboard.json');
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify({ scannedAt, projects: results }, null, 2)}\n`,
    'utf-8',
  );

  process.stdout.write(`\nWrote ${outputPath}\n`);
};

await main();
