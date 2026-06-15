import { describe, expect, it } from 'vitest';
import {
  extractScriptSetupBlockContent,
  hasEmptyScriptSetupBlock,
  isEmptyScriptSetupContent,
} from '../utils/empty-script-setup-block.js';

describe('empty-script-setup-block', () => {
  it('detects omitted empty script setup blocks from source', () => {
    const source = `<script setup lang="ts">
</script>

<template><div /></template>`;

    expect(hasEmptyScriptSetupBlock(source, undefined)).toBe(true);
  });

  it('ignores files without script setup', () => {
    const source = '<template><div /></template>';

    expect(hasEmptyScriptSetupBlock(source, undefined)).toBe(false);
  });

  it('treats comment-only script setup as empty', () => {
    const content = extractScriptSetupBlockContent(`<script setup lang="ts">
// layout only
</script>`);

    expect(content).not.toBeNull();
    expect(isEmptyScriptSetupContent(content!)).toBe(true);
  });
});
