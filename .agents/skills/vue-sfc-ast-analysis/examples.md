# Vue SFC AST — Rule Examples

## R-01: direct-api-in-view

```typescript
// Trigger: fetch/axios in src/views/*.vue or src/pages/*.vue
// Silent: same call in src/composables/useX.ts
// Silent: same call in src/api/*.ts

const VIEW_PATTERNS = [/src\/views\//, /src\/pages\//];

function isViewFile(filePath: string): boolean {
  return VIEW_PATTERNS.some(p => p.test(filePath.replace(/\\/g, '/')));
}
```

## R-02: missing-key-in-vfor

```typescript
// compiler-dom ElementNode: check props array
// Must have prop with name 'key' OR bind with arg 'key'
// Silent: v-for on <template> where key is on child (acceptable)

function hasVForKey(node: ElementNode): boolean {
  return node.props.some(prop => {
    if (prop.type === NodeTypes.ATTRIBUTE && prop.name === 'key') return true;
    if (prop.type === NodeTypes.DIRECTIVE && prop.name === 'bind' && prop.arg?.content === 'key') return true;
    return false;
  });
}
```

## R-03: unused-component

```typescript
// 1. Collect all .vue files except App.vue, layouts/*
// 2. Build reverse import graph
// 3. Report files with zero importers AND not in router config

// Edge: lazy-loaded routes
// const route = { component: () => import('./Foo.vue') }
// v1: regex scan router files for import('./Foo.vue') path
```

## R-04: oversized-composable

```typescript
const MAX_COMPOSABLE_LINES = 150;
const COMPOSABLE_DIRS = [/composables\//, /hooks\//, /use[A-Z]/];

// Count lines in .ts files under composables/ or named use*.ts
```

## R-05: oversized-component

```typescript
const MAX_COMPONENT_LINES = 300;
// Count entire .vue file lines (all blocks)
```

## R-06: pinia-store-outside-setup

```typescript
// Detect: export default { ... methods: { foo() { useStore() } } }
// i.e. Options API component calling useStore outside setup

// Silent: <script setup> with useStore() at top level (correct)
// Check: descriptor.script (NOT scriptSetup) exists AND contains useStore call
```
