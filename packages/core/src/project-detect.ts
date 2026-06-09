import fs from 'node:fs';
import path from 'node:path';
import type { ProjectMeta } from './types.js';

interface PackageJson {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

const readPackageJson = (root: string): PackageJson | null => {
  const packagePath = path.join(root, 'package.json');
  if (!fs.existsSync(packagePath)) {
    return null;
  }

  const raw = fs.readFileSync(packagePath, 'utf-8');
  return JSON.parse(raw) as PackageJson;
};

const findDependencyVersion = (
  packageJson: PackageJson,
  name: string,
): string | undefined => {
  return packageJson.dependencies?.[name] ?? packageJson.devDependencies?.[name];
};

export const detectProjectMeta = (root: string): ProjectMeta => {
  const packageJson = readPackageJson(root);
  const name = packageJson?.name ?? path.basename(root);
  const parts: string[] = [];

  const vueVersion = packageJson
    ? findDependencyVersion(packageJson, 'vue')
    : undefined;

  if (vueVersion) {
    parts.push(`Vue ${vueVersion.replace(/^\^|~/, '')}`);
  } else {
    parts.push('Vue');
  }

  if (packageJson && findDependencyVersion(packageJson, 'vite')) {
    parts.push('Vite');
  }

  if (packageJson && findDependencyVersion(packageJson, 'pinia')) {
    parts.push('Pinia');
  }

  if (
    packageJson &&
    (findDependencyVersion(packageJson, 'nuxt') ||
      findDependencyVersion(packageJson, 'nuxt3'))
  ) {
    parts.push('Nuxt');
  }

  return {
    root,
    name,
    vueVersion,
    framework: parts.join(' + '),
  };
};

export const isVueProject = (root: string): boolean => {
  const packageJson = readPackageJson(root);
  if (!packageJson) {
    return fs.existsSync(path.join(root, 'vite.config.ts')) ||
      fs.existsSync(path.join(root, 'nuxt.config.ts'));
  }

  const deps = {
    ...packageJson.dependencies,
    ...packageJson.devDependencies,
  };

  return Boolean(deps.vue || deps.nuxt || deps.nuxt3);
};
