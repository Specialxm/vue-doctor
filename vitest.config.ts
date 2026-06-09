import path from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  resolve: {
    alias: {
      '@vue-doctor/core': path.resolve(__dirname, 'packages/core/src/index.ts'),
      '@vue-doctor/rules': path.resolve(__dirname, 'packages/rules/src/index.ts'),
    },
  },
  test: {
    include: ['packages/**/src/**/*.test.ts'],
  },
});
