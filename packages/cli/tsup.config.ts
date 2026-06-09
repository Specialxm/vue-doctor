import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  banner: {
    js: '#!/usr/bin/env node',
  },
  clean: true,
  sourcemap: true,
  external: ['@vue-doctor/core', '@vue-doctor/rules', 'commander'],
});
