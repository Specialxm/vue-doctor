import fs from 'node:fs';
import path from 'node:path';
import glob from 'fast-glob';
import type {
  DiffScanOptions,
  DiffScanResult,
  Issue,
  ScanOptions,
  ScanResult,
  TsFileInfo,
} from './types.js';
import {
  IGNORED_DIRS,
  SCANNABLE_FILE_PATTERN,
  TS_FILE_GLOB,
  VUE_FILE_GLOB,
} from './constants.js';
import { buildImportGraph } from './import-graph.js';
import {
  fetchRemoteBranch,
  getChangedFilesBetween,
  getMergeBase,
  isGitRepository,
  readFileAtRef,
  readWorkingFile,
  resolveGitRef,
} from './git-diff.js';
import { filterIssuesToFiles, filterNewIssues } from './issue-delta.js';
import { collectVueFiles } from './sfc-parser.js';
import { detectProjectMeta, isVueProject } from './project-detect.js';
import { calculateScore } from './score.js';
import { ScanError } from './errors.js';

export { ScanError };

const sortIssues = (issues: Issue[]): Issue[] => {
  return [...issues].sort((left, right) => {
    if (left.file !== right.file) {
      return left.file.localeCompare(right.file);
    }
    return left.line - right.line;
  });
};

const runRules = (context: Parameters<import('./types.js').Rule['detect']>[0], rules: ScanOptions['rules']): Issue[] => {
  const issues: Issue[] = [];

  for (const rule of rules) {
    issues.push(...rule.detect(context));
  }

  return sortIssues(issues);
};

const buildTsFiles = (
  root: string,
  relativePaths: string[],
  sourceOverrides?: ReadonlyMap<string, string>,
): TsFileInfo[] => {
  const tsFiles: TsFileInfo[] = [];

  for (const relativePath of relativePaths) {
    if (!relativePath.endsWith('.ts') && !relativePath.endsWith('.tsx')) {
      continue;
    }

    const overrideSource = sourceOverrides?.get(relativePath);
    const source =
      overrideSource ?? fs.readFileSync(path.join(root, relativePath), 'utf-8');

    tsFiles.push({
      path: path.join(root, relativePath),
      relativePath,
      source,
    });
  }

  return tsFiles;
};

const resolveTargetFiles = async (
  root: string,
  includeFiles?: string[],
): Promise<string[]> => {
  if (includeFiles) {
    return includeFiles.filter((file) => SCANNABLE_FILE_PATTERN.test(file));
  }

  const vueFilePaths = await glob(VUE_FILE_GLOB, {
    cwd: root,
    absolute: true,
    ignore: IGNORED_DIRS,
  });

  const tsFilePaths = await glob(TS_FILE_GLOB, {
    cwd: root,
    absolute: true,
    ignore: IGNORED_DIRS,
  });

  return [
    ...vueFilePaths.map((filePath) => path.relative(root, filePath).replace(/\\/g, '/')),
    ...tsFilePaths.map((filePath) => path.relative(root, filePath).replace(/\\/g, '/')),
  ];
};

const buildSourceOverrides = (
  root: string,
  files: string[],
  ref: string,
): Map<string, string> => {
  const overrides = new Map<string, string>();

  for (const relativePath of files) {
    const source = readFileAtRef(ref, relativePath, root);
    if (source !== null) {
      overrides.set(relativePath, source);
    }
  }

  return overrides;
};

export const scanProject = async (options: ScanOptions): Promise<ScanResult> => {
  const startedAt = Date.now();
  const root = path.resolve(options.root);

  if (!isVueProject(root)) {
    throw new ScanError(`Not a Vue project: ${root}`);
  }

  const targetFiles = await resolveTargetFiles(root, options.includeFiles);
  const vueRelativePaths = targetFiles.filter((file) => file.endsWith('.vue'));
  const vueFilePaths = vueRelativePaths.map((file) => path.join(root, file));
  const vueFiles = await collectVueFiles(root, vueFilePaths, options.sourceOverrides);
  const tsFiles = buildTsFiles(
    root,
    targetFiles.filter((file) => file.endsWith('.ts') || file.endsWith('.tsx')),
    options.sourceOverrides,
  );
  const tsRelativePaths = tsFiles.map((file) => file.relativePath);
  const importGraph = buildImportGraph(root, vueFiles, tsRelativePaths);
  const projectMeta = detectProjectMeta(root);
  const context = { root, vueFiles, tsFiles, importGraph, projectMeta };
  const issues = runRules(context, options.rules);

  return {
    issues,
    projectMeta,
    durationMs: Date.now() - startedAt,
    score: calculateScore(issues),
  };
};

export const scanPullRequestDiff = async (
  options: DiffScanOptions,
): Promise<DiffScanResult> => {
  const startedAt = Date.now();
  const root = path.resolve(options.root);

  if (!isVueProject(root)) {
    throw new ScanError(`Not a Vue project: ${root}`);
  }

  if (!isGitRepository(root)) {
    throw new ScanError(`Not a git repository: ${root}`);
  }

  fetchRemoteBranch(options.baseBranch, root);
  const baseRef = resolveGitRef(options.baseBranch, root);
  const headRef = resolveGitRef('HEAD', root);
  const mergeBase = getMergeBase(headRef, baseRef, root);
  const changedFiles = getChangedFilesBetween(mergeBase, headRef, root);

  if (changedFiles.length === 0) {
    const projectMeta = detectProjectMeta(root);

    return {
      changedFiles,
      newIssues: [],
      baselineIssues: [],
      currentIssues: [],
      projectMeta,
      durationMs: Date.now() - startedAt,
      score: calculateScore([]),
    };
  }

  const baselineOverrides = buildSourceOverrides(root, changedFiles, mergeBase);
  const baselineResult = await scanProject({
    root,
    rules: options.rules,
    includeFiles: changedFiles,
    sourceOverrides: baselineOverrides,
  });

  const currentOverrides = new Map<string, string>();
  for (const relativePath of changedFiles) {
    const source = readWorkingFile(root, relativePath);
    if (source !== null) {
      currentOverrides.set(relativePath, source);
    }
  }

  const currentResult = await scanProject({
    root,
    rules: options.rules,
    includeFiles: changedFiles,
    sourceOverrides: currentOverrides,
  });

  const baselineIssues = filterIssuesToFiles(baselineResult.issues, changedFiles);
  const currentIssues = filterIssuesToFiles(currentResult.issues, changedFiles);
  const newIssues = filterNewIssues(currentIssues, baselineIssues);

  return {
    changedFiles,
    newIssues,
    baselineIssues,
    currentIssues,
    projectMeta: currentResult.projectMeta,
    durationMs: Date.now() - startedAt,
    score: calculateScore(newIssues),
  };
};
