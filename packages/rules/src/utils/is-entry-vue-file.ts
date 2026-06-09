const LAYOUT_PATH_PATTERN = /(^|\/)(layouts?)\//i;

export const isEntryVueFile = (relativePath: string): boolean => {
  const normalized = relativePath.replace(/\\/g, '/');
  return normalized.endsWith('/App.vue') || normalized === 'App.vue';
};

export const isLayoutVueFile = (relativePath: string): boolean => {
  const normalized = relativePath.replace(/\\/g, '/');
  return LAYOUT_PATH_PATTERN.test(normalized);
};
