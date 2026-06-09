---
name: vue-doctor-ship
description: >-
  Take vue-doctor branch from done-coding to merge-ready — review against
  AGENTS.md, run tests, commit, push, open PR. Use when user asks to ship,
  finalize, commit, or release vue-doctor code.
disable-model-invocation: true
---

# vue-doctor Ship

Run only when explicitly invoked. Will commit and push.

## Checklist

```
Ship progress:
- [ ] 1. Review diff against AGENTS.md
- [ ] 2. Run checks
- [ ] 3. Commit and push
- [ ] 4. Open PR (if requested)
```

## 1. Review Against AGENTS.md

Check diff for violations:

- [ ] No regex-based code detection in rules (AST only)
- [ ] No LLM detection logic added
- [ ] No Web UI / backend added
- [ ] Public surface changes have product-thinking brief
- [ ] New rules have tests in `__tests__/`
- [ ] No duplicate utilities (search packages/ first)
- [ ] Magic numbers in constants.ts
- [ ] kebab-case file names

## 2. Run Checks

```powershell
pnpm typecheck
pnpm test
pnpm build
pnpm vue-doctor fixtures/bad-project
pnpm vue-doctor fixtures/good-project
```

If JSON report changed:
```powershell
pnpm test -- --grep "snapshot"
```

All must pass before commit.

## 3. Commit and Push

- Stage only intended changes; never commit secrets
- Commit message format:
  ```
  feat(rules): add direct-api-in-view detection
  fix(core): handle SFC files without script block
  docs: add product design document
  ```
- Scope: `core`, `rules`, `cli`, `action`, `docs`, `fixtures`
- Push with `-u origin` on first push
- No force push to main, no skipped hooks

## 4. Open PR

Use `gh pr create` with body:

```markdown
## Summary
- {1-3 bullets}

## Product brief (if public surface changed)
{from product-thinking}

## Test plan
- [ ] pnpm test
- [ ] pnpm vue-doctor fixtures/bad-project
- [ ] {manual verification steps}
```

## Release (v0.1.0+)

Only when user explicitly requests release:

1. Update version in `packages/cli/package.json`
2. Write CHANGELOG.md entry
3. `git tag v0.1.0`
4. `pnpm publish --access public` (from packages/cli)
5. GitHub Release with notes

## Stop and Ask

- Tests fail and fix would change behavior
- Merge conflict with conflicting intent
- User didn't ask to push/release
