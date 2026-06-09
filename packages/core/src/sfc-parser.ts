import path from 'node:path';
import { parse } from '@vue/compiler-sfc';
import fs from 'node:fs';
import type { VueFileInfo } from './types.js';

export const parseVueFile = (absolutePath: string, root: string): VueFileInfo | null => {
  const source = fs.readFileSync(absolutePath, 'utf-8');
  const { descriptor, errors } = parse(source, { filename: absolutePath });

  if (errors.length > 0) {
    return null;
  }

  const scriptBlock = descriptor.scriptSetup ?? descriptor.script;
  const scriptContent = scriptBlock?.content ?? null;
  const scriptLang = scriptBlock?.lang === 'ts' ? 'ts' : scriptBlock ? 'js' : null;

  return {
    path: absolutePath,
    relativePath: path.relative(root, absolutePath).replace(/\\/g, '/'),
    source,
    scriptContent,
    scriptLang,
  };
};

export const collectVueFiles = async (
  root: string,
  filePaths: string[],
): Promise<VueFileInfo[]> => {
  const vueFiles: VueFileInfo[] = [];

  for (const filePath of filePaths) {
    if (!filePath.endsWith('.vue')) {
      continue;
    }

    const parsed = parseVueFile(filePath, root);
    if (parsed) {
      vueFiles.push(parsed);
    }
  }

  return vueFiles;
};
