const VIEW_PATH_PATTERNS = [/src\/views\//, /src\/pages\//];

export const isViewFilePath = (relativePath: string): boolean => {
  const normalized = relativePath.replace(/\\/g, '/');
  return VIEW_PATH_PATTERNS.some((pattern) => pattern.test(normalized));
};
