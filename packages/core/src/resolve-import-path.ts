import fs from 'node:fs';
import path from 'node:path';

const RESOLVE_EXTENSIONS = ['', '.ts', '.tsx', '.vue', '.js', '.jsx'];

const INDEX_FILES = ['index.ts', 'index.tsx', 'index.js', 'index.jsx'];

export const resolveImportPath = (
  root: string,
  fromRelativePath: string,
  importPath: string,
): string | null => {
  if (!importPath.startsWith('.')) {
    return null;
  }

  const fromAbsoluteDir = path.dirname(path.join(root, fromRelativePath));
  const resolvedBase = path.resolve(fromAbsoluteDir, importPath);

  for (const extension of RESOLVE_EXTENSIONS) {
    const candidate = resolvedBase + extension;
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return path.relative(root, candidate).replace(/\\/g, '/');
    }
  }

  for (const indexFile of INDEX_FILES) {
    const candidate = path.join(resolvedBase, indexFile);
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) {
      return path.relative(root, candidate).replace(/\\/g, '/');
    }
  }

  return null;
};
