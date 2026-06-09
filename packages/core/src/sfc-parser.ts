import path from 'node:path';
import { parse } from '@vue/compiler-sfc';
import fs from 'node:fs';
import type { VueFileInfo } from './types.js';

export const parseVueSource = (
  relativePath: string,
  root: string,
  source: string,
): VueFileInfo | null => {
  const absolutePath = path.join(root, relativePath);
  const { descriptor, errors } = parse(source, { filename: absolutePath });

  if (errors.length > 0) {
    return null;
  }

  const scriptBlock = descriptor.scriptSetup ?? descriptor.script;
  const scriptContent = scriptBlock?.content ?? null;
  const scriptLang = scriptBlock?.lang === 'ts' ? 'ts' : scriptBlock ? 'js' : null;

  return {
    path: absolutePath,
    relativePath: relativePath.replace(/\\/g, '/'),
    source,
    scriptContent,
    scriptLang,
  };
};

export const parseVueFile = (absolutePath: string, root: string): VueFileInfo | null => {
  const source = fs.readFileSync(absolutePath, 'utf-8');
  const relativePath = path.relative(root, absolutePath).replace(/\\/g, '/');
  return parseVueSource(relativePath, root, source);
};

export const collectVueFiles = async (
  root: string,
  filePaths: string[],
  sourceOverrides?: ReadonlyMap<string, string>,
): Promise<VueFileInfo[]> => {
  const vueFiles: VueFileInfo[] = [];

  for (const filePath of filePaths) {
    if (!filePath.endsWith('.vue')) {
      continue;
    }

    const relativePath = path.isAbsolute(filePath)
      ? path.relative(root, filePath).replace(/\\/g, '/')
      : filePath.replace(/\\/g, '/');
    const overrideSource = sourceOverrides?.get(relativePath);
    const parsed = overrideSource
      ? parseVueSource(relativePath, root, overrideSource)
      : parseVueFile(path.join(root, relativePath), root);

    if (parsed) {
      vueFiles.push(parsed);
    }
  }

  return vueFiles;
};
