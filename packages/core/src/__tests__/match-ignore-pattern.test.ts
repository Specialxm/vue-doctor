import { describe, expect, it } from 'vitest';
import { filterIgnoredPaths, isIgnoredPath } from '../match-ignore-pattern.js';

describe('match-ignore-pattern', () => {
  it('matches glob patterns against relative paths', () => {
    expect(isIgnoredPath('src/views/LegacyView.vue', ['**/legacy/**'])).toBe(false);
    expect(isIgnoredPath('src/legacy/Old.vue', ['**/legacy/**'])).toBe(true);
    expect(isIgnoredPath('src/components/Unused.vue', ['**/*.spec.ts'])).toBe(false);
  });

  it('filters ignored paths from a file list', () => {
    const files = [
      'src/views/Home.vue',
      'src/legacy/Old.vue',
      'src/composables/useOrder.ts',
    ];

    expect(filterIgnoredPaths(files, ['**/legacy/**'])).toEqual([
      'src/views/Home.vue',
      'src/composables/useOrder.ts',
    ]);
  });

  it('returns all paths when no ignore patterns are provided', () => {
    const files = ['src/App.vue'];

    expect(filterIgnoredPaths(files, [])).toEqual(files);
    expect(isIgnoredPath('src/App.vue', [])).toBe(false);
  });
});
