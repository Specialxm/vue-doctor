import fs from 'node:fs';
import path from 'node:path';
import { parse, compileScript } from '@vue/compiler-sfc';
import { Project } from 'ts-morph';
import type { ImportGraph, VueFileInfo } from './types.js';
import { resolveImportPath } from './resolve-import-path.js';

const ROUTER_VUE_IMPORT_PATTERN =
  /(?:import\s*\(\s*['"]([^'"]+\.vue)['"]\s*\)|from\s+['"]([^'"]+\.vue)['"])/g;

const addEdge = (
  edges: Map<string, Set<string>>,
  reverseEdges: Map<string, Set<string>>,
  from: string,
  to: string,
): void => {
  if (!edges.has(from)) {
    edges.set(from, new Set());
  }
  edges.get(from)!.add(to);

  if (!reverseEdges.has(to)) {
    reverseEdges.set(to, new Set());
  }
  reverseEdges.get(to)!.add(from);
};

const collectTsImports = (
  root: string,
  relativePath: string,
  sourceFile: import('ts-morph').SourceFile,
): Set<string> => {
  const imports = new Set<string>();

  for (const importDeclaration of sourceFile.getImportDeclarations()) {
    const moduleSpecifier = importDeclaration.getModuleSpecifierValue();
    const resolved = resolveImportPath(root, relativePath, moduleSpecifier);
    if (resolved) {
      imports.add(resolved);
    }
  }

  return imports;
};

const collectVueImports = (
  root: string,
  vueFile: VueFileInfo,
): Set<string> => {
  const imports = new Set<string>();
  const { descriptor, errors } = parse(vueFile.source, { filename: vueFile.path });

  if (errors.length > 0) {
    return imports;
  }

  if (!descriptor.script && !descriptor.scriptSetup) {
    return imports;
  }

  try {
    const compiled = compileScript(descriptor, { id: vueFile.path });
    const scriptImports = compiled.imports ?? {};

    for (const binding of Object.values(scriptImports)) {
      if (binding.isType) {
        continue;
      }

      const resolved = resolveImportPath(root, vueFile.relativePath, binding.source);
      if (resolved) {
        imports.add(resolved);
      }
    }
  } catch {
    return imports;
  }

  return imports;
};

export const findRouterEntryVueFiles = (
  root: string,
  tsRelativePaths: string[],
): Set<string> => {
  const entryFiles = new Set<string>();

  for (const relativePath of tsRelativePaths) {
    const normalized = relativePath.replace(/\\/g, '/');
    if (!/router/i.test(normalized)) {
      continue;
    }

    const absolutePath = path.join(root, relativePath);
    if (!fs.existsSync(absolutePath)) {
      continue;
    }

    const source = fs.readFileSync(absolutePath, 'utf-8');

    for (const match of source.matchAll(ROUTER_VUE_IMPORT_PATTERN)) {
      const importPath = match[1] ?? match[2];
      if (!importPath) {
        continue;
      }

      const resolved = resolveImportPath(root, relativePath, importPath);
      if (resolved) {
        entryFiles.add(resolved);
      }
    }
  }

  return entryFiles;
};

export const buildImportGraph = (
  root: string,
  vueFiles: VueFileInfo[],
  tsRelativePaths: string[],
): ImportGraph => {
  const edges = new Map<string, Set<string>>();
  const reverseEdges = new Map<string, Set<string>>();
  const project = new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: { allowJs: true },
  });

  for (const relativePath of tsRelativePaths) {
    const absolutePath = path.join(root, relativePath);
    if (fs.existsSync(absolutePath)) {
      project.addSourceFileAtPath(absolutePath);
    }
  }

  for (const vueFile of vueFiles) {
    const vueImports = collectVueImports(root, vueFile);
    edges.set(vueFile.relativePath, vueImports);

    for (const imported of vueImports) {
      addEdge(edges, reverseEdges, vueFile.relativePath, imported);
    }
  }

  for (const sourceFile of project.getSourceFiles()) {
    const relativePath = path.relative(root, sourceFile.getFilePath()).replace(/\\/g, '/');
    const tsImports = collectTsImports(root, relativePath, sourceFile);
    edges.set(relativePath, tsImports);

    for (const imported of tsImports) {
      addEdge(edges, reverseEdges, relativePath, imported);
    }
  }

  return { edges, reverseEdges };
};
