# vue-doctor — Agent Instructions

> AI 开发本仓库时必须遵循的规范。  
> 详细产品设计见 `docs/`，Skills 见 `.agents/skills/`。

## General Rules

- MUST: Use pnpm. `pnpm install`, `pnpm build`, `pnpm test`, `pnpm vue-doctor`.
- MUST: TypeScript strict mode. Prefer `interface` over `type` for object shapes.
- MUST: Use arrow functions for all new functions.
- MUST: kebab-case for file names (`direct-api-in-view.ts`, not `directApiInView.ts`).
- MUST: Descriptive variable names — no 1–2 char names except loop indices.
- MUST: No `as` type casts unless unavoidable — prefer type guards.
- MUST: No comments unless explaining non-obvious logic. Prefix hacks with `// HACK: reason`.
- MUST: Magic numbers go in `constants.ts` as `SCREAMING_SNAKE_CASE` with unit suffix (`_MS`, `_LINES`).
- MUST: One utility per file in `utils/`. Search existing utils before adding new ones.
- MUST: Remove dead code. Don't repeat yourself.
- MUST: Before changing **public surface** (CLI flags, score algorithm, JSON schema, Action I/O, terminal output), run the `product-thinking` skill.
- MUST: Before adding a rule, read `vue-doctor-rule-writing` skill and write tests first.
- MUST NOT: Use LLM for detection logic — all rules are deterministic AST analysis.
- MUST NOT: Add Web UI, backend, or database in MVP scope.

## Package Layout

```
packages/
  core/           Scanner engine: project-detect, SFC parse, score, reporter, types
  rules/          Detection rules — each rule = one file, exports Rule object
  cli/            Published CLI entry (bin: vue-doctor)
  action/         GitHub Action (Week 4+)
fixtures/
  bad-project/    Must trigger rules
  good-project/   Must NOT trigger rules
docs/             Product design & feature plan
.agents/skills/   Agent skills for development workflows
```

## Core Types (packages/core/src/types.ts)

All shared types live here. Rules import from `@vue-doctor/core`, never duplicate.

```typescript
export type Severity = 'error' | 'warn' | 'info';
export type Category = 'architecture' | 'performance' | 'maintainability' | 'security';

export interface Issue {
  ruleId: string;
  severity: Severity;
  file: string;
  line: number;
  column?: number;
  message: string;
  suggestion?: string;
  category: Category;
}

export interface Rule {
  id: string;
  description: string;
  severity: Severity;
  category: Category;
  detect: (context: ScanContext) => Issue[];
}
```

## Rule Conventions

- Rule file: `packages/rules/src/{rule-id}.ts`
- Rule id: kebab-case matching filename
- Export: `export const directApiInView: Rule = { id: 'direct-api-in-view', ... }`
- Register in: `packages/rules/src/index.ts`
- Test file: `packages/rules/src/__tests__/{rule-id}.test.ts`
- Detection: AST nodes only — NEVER regex on source text for code detection
- Conservative: when uncertain, stay silent (no false positives)

## SFC Parsing Strategy

1. **Template rules** (`missing-key-in-vfor`): use `@vue/compiler-sfc` → `compileTemplate` → walk AST
2. **Script rules** (`direct-api-in-view`): use `@vue/compiler-sfc` → `compileScript` → feed to ts-morph OR analyze CallExpression nodes
3. **File-level rules** (`oversized-component`): read file stats + SFC block sizes
4. **Cross-file rules** (`unused-component`): build import graph in core, pass via ScanContext

See `.agents/skills/vue-sfc-ast-analysis/SKILL.md` for detailed patterns.

## Testing

- Framework: Vitest
- Every rule: ≥1 positive test (triggers) + ≥1 negative test (silent)
- Fixtures drive integration tests: `pnpm vue-doctor fixtures/bad-project` must find issues
- Snapshot JSON report for regression: `packages/core/src/__tests__/report.snapshot.test.ts`

## Commit Style

```
feat(rules): add direct-api-in-view detection
fix(core): handle empty script setup blocks
docs: update feature plan for v0.0.5
chore: bump version to 0.1.0
```

Scope: `core`, `rules`, `cli`, `action`, `docs`, `fixtures`

## Public Surface Checklist

Before merging changes to CLI / score / JSON / Action:

1. Run `product-thinking` skill
2. Bump `schemaVersion` if JSON shape changed
3. Update `--help` text
4. Update README if user-facing
5. Add/update Vitest coverage

## Reference Projects

- [React Doctor](https://github.com/millionco/react-doctor) — architecture & skills pattern
- [antfu/skills](https://github.com/antfu/skills) — Vue best practices
- [Knip](https://github.com/webpro-nl/knip) — dead code detection (v0.2)
- [vue-ts-morph](https://github.com/ypresto/vue-ts-morph) — .vue + ts-morph integration
