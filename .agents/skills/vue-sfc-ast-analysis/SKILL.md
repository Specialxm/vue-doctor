---
name: vue-sfc-ast-analysis
description: >-
  Parse and analyze Vue 3 SFC files using @vue/compiler-sfc and ts-morph.
  Use when implementing vue-doctor detection rules, building import graphs,
  walking template AST, or analyzing script setup blocks.
---

# Vue SFC AST Analysis

## Two-Parser Strategy

| Layer | Tool | Use for |
|-------|------|---------|
| Template | `@vue/compiler-sfc` compileTemplate | v-for, v-if, directives |
| Script | `@vue/compiler-sfc` compileScript + ts-morph | imports, calls, composables |
| File stats | fs + SFC parse | line counts, block sizes |

Do NOT use regex on `.vue` source text for code detection.

## SFC Parse Entry

```typescript
import { parse, compileScript, compileTemplate } from '@vue/compiler-sfc';
import fs from 'node:fs';

function parseVueFile(filePath: string, source: string) {
  const { descriptor, errors } = parse(source, { filename: filePath });
  if (errors.length) return null;

  const scriptContent = descriptor.scriptSetup?.content
    ?? descriptor.script?.content;

  return { descriptor, scriptContent };
}
```

## Template Analysis (e.g. missing-key-in-vfor)

```typescript
import { compileTemplate } from '@vue/compiler-sfc';

const result = compileTemplate({
  source: descriptor.template!.content,
  filename: filePath,
  id: filePath,
});

if (result.ast) {
  walk(result.ast, {
    _VFOR(node) {
      // check node.props for key binding
    },
  });
}
```

Use `@vue/compiler-dom` node types. Check for `key` prop on v-for element.

## Script Analysis (e.g. direct-api-in-view)

**Option A — ts-morph on extracted script** (preferred for call detection):

```typescript
import { Project, SyntaxKind } from 'ts-morph';

// Create virtual TS file from compiled script
const project = new Project({ useInMemoryFileSystem: true });
const sourceFile = project.createSourceFile(
  `${filePath}.ts`,
  scriptContent,
  { overwrite: true },
);

sourceFile.getDescendantsOfKind(SyntaxKind.CallExpression).forEach(call => {
  const expr = call.getExpression().getText();
  // check for fetch, axios, $fetch, useFetch patterns
});
```

**Option B — compiler-sfc bindings** (for macro-aware analysis):

```typescript
const compiled = compileScript(descriptor, {
  id: filePath,
  inlineTemplate: false,
});
// compiled.bindings, compiled.imports available
```

## Import Graph (for unused-component)

```typescript
interface ImportGraph {
  // file → files it imports
  edges: Map<string, Set<string>>;
  // file → files that import it
  reverseEdges: Map<string, Set<string>>;
}

// Build from:
// 1. ts-morph getImportDeclarations() on .ts files
// 2. compileScript imports on .vue files
// 3. Route config static imports (best-effort)

// Entry points (NOT unused):
// - main.ts / App.vue
// - router/routes registered components
// - components registered globally (best-effort skip)
```

Conservative: if unsure whether a component is an entry point, do NOT report unused.

## API Call Detection Patterns

Detect these call patterns in view/script:

```typescript
const API_CALL_PATTERNS = [
  'fetch',
  'axios',
  '$fetch',      // Nuxt
  'useFetch',    // Nuxt
  'useAsyncData', // Nuxt
] as const;

// Match: direct call OR member expression (axios.get, http.post)
// Skip: type-only imports, comments, string literals
```

## File Size Rules (oversized-*)

```typescript
import { parse } from '@vue/compiler-sfc';

function getSfcLineCount(source: string): number {
  return source.split('\n').length;
}

function getComposableLineCount(filePath: string, source: string): number {
  // Only count script block for composables in .ts files: full file
  // For .vue composables: script block only
}
```

## Edge Cases — Stay Silent

| Case | Action |
|------|--------|
| `.vue` parse error | Skip file, log warn |
| No `<script setup>` | Skip script rules |
| Dynamic import `import()` | Cannot resolve — skip |
| `defineAsyncComponent` | Cannot resolve — skip |
| Barrel re-exports | May miss — acceptable v1 |
| `<script setup lang="ts">` + generic | parse normally |

## vue-ts-morph (Optional)

For full `.vue` ts-morph support, evaluate [vue-ts-morph](https://github.com/ypresto/vue-ts-morph):

```typescript
import { createVueFileSystemHost } from 'vue-ts-morph';
const project = new Project({ fileSystem: createVueFileSystemHost() });
```

Limitation: no template support. Use compiler-sfc for template rules regardless.

## Additional Resources

- Implementation patterns: [examples.md](examples.md)
