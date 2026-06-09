const COMPOSABLE_PATH_PATTERNS = [/composables\//, /hooks\//, /use[A-Z]/];

export const isComposableFilePath = (relativePath: string): boolean => {
  const normalized = relativePath.replace(/\\/g, '/');
  return COMPOSABLE_PATH_PATTERNS.some((pattern) => pattern.test(normalized));
};
