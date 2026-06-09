import path from 'node:path';
import glob from 'fast-glob';
import type { Issue, ScanOptions, ScanResult } from './types.js';
import { IGNORED_DIRS, VUE_FILE_GLOB } from './constants.js';
import { collectVueFiles } from './sfc-parser.js';
import { detectProjectMeta, isVueProject } from './project-detect.js';

export class ScanError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ScanError';
  }
}

export const scanProject = async (options: ScanOptions): Promise<ScanResult> => {
  const startedAt = Date.now();
  const root = path.resolve(options.root);

  if (!isVueProject(root)) {
    throw new ScanError(`Not a Vue project: ${root}`);
  }

  const filePaths = await glob(VUE_FILE_GLOB, {
    cwd: root,
    absolute: true,
    ignore: IGNORED_DIRS,
  });

  const vueFiles = await collectVueFiles(root, filePaths);
  const projectMeta = detectProjectMeta(root);
  const context = { root, vueFiles, projectMeta };

  const issues: Issue[] = [];
  for (const rule of options.rules) {
    issues.push(...rule.detect(context));
  }

  issues.sort((left, right) => {
    if (left.file !== right.file) {
      return left.file.localeCompare(right.file);
    }
    return left.line - right.line;
  });

  return {
    issues,
    projectMeta,
    durationMs: Date.now() - startedAt,
  };
};
