import { execFileSync } from 'node:child_process';
import { SCANNABLE_FILE_PATTERN } from './constants.js';
import { ScanError } from './errors.js';

const runGit = (args: string[], cwd: string): string => {
  return execFileSync('git', args, {
    cwd,
    encoding: 'utf-8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim();
};

export const isGitRepository = (cwd: string): boolean => {
  try {
    runGit(['rev-parse', '--git-dir'], cwd);
    return true;
  } catch {
    return false;
  }
};

export const resolveGitRef = (ref: string, cwd: string): string => {
  const candidates = [ref, `origin/${ref}`, `refs/remotes/origin/${ref}`];

  for (const candidate of candidates) {
    try {
      runGit(['rev-parse', '--verify', candidate], cwd);
      return candidate;
    } catch {
      continue;
    }
  }

  throw new ScanError(`Cannot resolve git ref: ${ref}`);
};

const GIT_NETWORK_TIMEOUT_MS = 5000;

export const fetchRemoteBranch = (branch: string, cwd: string): void => {
  try {
    execFileSync('git', ['fetch', 'origin', branch, '--depth=1'], {
      cwd,
      stdio: ['ignore', 'pipe', 'pipe'],
      timeout: GIT_NETWORK_TIMEOUT_MS,
    });
  } catch {
    // Best-effort when checkout already has full history or network is unavailable.
  }
};

export const getMergeBase = (headRef: string, baseRef: string, cwd: string): string => {
  try {
    return runGit(['merge-base', headRef, baseRef], cwd);
  } catch {
    throw new ScanError(`Cannot find merge base between ${headRef} and ${baseRef}`);
  }
};

export const getChangedFilesBetween = (
  fromRef: string,
  toRef: string,
  cwd: string,
): string[] => {
  const output = runGit(['diff', '--name-only', '--diff-filter=ACMR', `${fromRef}...${toRef}`], cwd);

  if (!output) {
    return [];
  }

  return output
    .split('\n')
    .map((file) => file.trim().replace(/\\/g, '/'))
    .filter((file) => file.length > 0 && SCANNABLE_FILE_PATTERN.test(file));
};

export const readFileAtRef = (
  ref: string,
  relativePath: string,
  cwd: string,
): string | null => {
  try {
    return execFileSync('git', ['show', `${ref}:${relativePath}`], {
      cwd,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch {
    return null;
  }
};

export const readWorkingFile = (root: string, relativePath: string): string | null => {
  try {
    return execFileSync('git', ['show', `HEAD:${relativePath}`], {
      cwd: root,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch {
    return null;
  }
};
