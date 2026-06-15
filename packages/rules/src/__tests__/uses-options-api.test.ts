import { describe, expect, it } from 'vitest';
import { usesOptionsApi } from '../utils/uses-options-api.js';

describe('usesOptionsApi', () => {
  it('detects export default object literals', () => {
    expect(
      usesOptionsApi(`
        export default {
          methods: { refresh() {} },
        }
      `),
    ).toBe(true);
  });

  it('ignores script setup style exports', () => {
    expect(
      usesOptionsApi(`
        const count = ref(0)
        export default count
      `),
    ).toBe(false);
  });
});
