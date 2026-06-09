---
name: vue-doctor-dev
description: >-
  Develop the vue-doctor CLI static analysis tool. Use when writing scanner,
  CLI, reporter, GitHub Action, fixtures, or any code in the vue-doctor monorepo.
  Covers pnpm workspace layout, package boundaries, and MVP scope constraints.
---

# vue-doctor Development

## Before Writing Code

1. Read `AGENTS.md`
2. Find the feature ID in `docs/02-feature-plan.md` and its Definition of Done
3. Search existing code before adding utilities:
   ```powershell
   rg "functionName" packages/
   rg "similarConcept" packages/
   ```

## Package Boundaries

| Package | Owns | Must NOT |
|---------|------|----------|
| `core` | scanner, parser, score, reporter, types | rule logic |
| `rules` | detection rules + tests | CLI, output formatting |
| `cli` | commander, args, exit codes | AST analysis |
| `action` | GitHub Action wrapper | duplicate scan logic |

Dependency direction: `cli → core ← rules`

## Implementation Order

Always: **fixtures → tests → implementation → integration test**

```powershell
pnpm test                    # unit tests
pnpm typecheck               # types
pnpm vue-doctor fixtures/bad-project   # integration
```

## Week-by-Week Focus

| Week | Build | Skill to pair |
|------|-------|---------------|
| W1 | CLI skeleton + SC-03/04 + R-01 | vue-sfc-ast-analysis |
| W2 | Rules R-02~R06 + import graph | vue-doctor-rule-writing |
| W3 | Score + reporter + --json | product-thinking (JSON schema) |
| W4 | GitHub Action | product-thinking (Action I/O) |
| W5 | npm publish + Leaderboard | vue-doctor-ship |
| W6 | install command + v0.1.0 tag | vue-doctor-ship |

## MVP Scope Guard

Stop and ask the user before adding:
- Web UI / dashboard
- LLM-based detection
- Vue 2 support
- `--fix` auto-fix
- Config file (vue-doctor.config.ts) — v0.2 only

## Common Patterns

### Add a new core module

```
packages/core/src/{name}.ts
packages/core/src/__tests__/{name}.test.ts
export from packages/core/src/index.ts
```

### Add a CLI flag

1. Run `product-thinking` skill first
2. Add to commander in `packages/cli/src/commands/scan.ts`
3. Pass through to scanner options
4. Update `--help` text
5. Test: `pnpm vue-doctor . --{flag}`

## Output When Done

```markdown
Implemented: <what>
Tests: <what passed>
Integration: <fixture result>
Next: <suggested next task from feature plan>
```
