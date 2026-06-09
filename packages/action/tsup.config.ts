import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
  clean: true,
  sourcemap: true,
  external: [
    '@actions/core',
    '@actions/github',
    '@vue-doctor/core',
    '@vue-doctor/rules',
  ],
});
