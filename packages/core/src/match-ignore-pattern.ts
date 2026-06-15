import micromatch from 'micromatch';

export const isIgnoredPath = (
  relativePath: string,
  ignorePatterns: readonly string[],
): boolean => {
  if (ignorePatterns.length === 0) {
    return false;
  }

  const normalizedPath = relativePath.replace(/\\/g, '/');

  return ignorePatterns.some((pattern) =>
    micromatch.isMatch(normalizedPath, pattern, { dot: true }),
  );
};

export const filterIgnoredPaths = (
  relativePaths: readonly string[],
  ignorePatterns: readonly string[],
): string[] => {
  if (ignorePatterns.length === 0) {
    return [...relativePaths];
  }

  return relativePaths.filter(
    (relativePath) => !isIgnoredPath(relativePath, ignorePatterns),
  );
};
