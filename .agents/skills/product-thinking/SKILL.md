---
name: product-thinking
description: >-
  Product review before changing vue-doctor public surfaces — CLI flags,
  health score algorithm, JSON report schema, GitHub Action I/O, terminal
  output, npm package API. Not for lint rules (use vue-doctor-rule-writing).
---

# Product Thinking (vue-doctor)

Run this BEFORE coding any user-facing change.

## Public Surfaces

| Surface | Location | Breaking if changed |
|---------|----------|---------------------|
| CLI flag/command | `packages/cli/src/` | Users/scripts depend on it |
| Health score | `packages/core/src/score.ts` | CI gates break |
| JSON report | `packages/core/src/reporter/json.ts` | Tool integrations break |
| schemaVersion | JSON report header | Must bump on shape change |
| Action I/O | `packages/action/action.yml` | Other repos' workflows break |
| Terminal output | `packages/core/src/reporter/terminal.ts` | User expectations |
| Exit codes | `packages/cli/src/` | CI scripts depend on it |

**Not public surface**: internal core utils, rule implementations, tests, docs.

## Steps

```
- [ ] 1. Job + change (2 lines)
- [ ] 2. Search for reuse before adding
- [ ] 3. Default preserves current behavior
- [ ] 4. Compatibility artifacts (schemaVersion / README / --help)
- [ ] 5. Kill metric (when to remove if unused)
```

### 1. Job + Change

- **Job**: who runs vue-doctor, what they're trying to do, what they do today instead
- **Change**: smallest surface that serves the job

If existing flags/output already serve the job → don't add new surface.

### 2. Search Before Adding

```powershell
rg "{flag-name}" packages/
rg "{concept}" packages/core packages/cli
```

Extend existing flag/output before creating new ones.

### 3. Defaults

- New risky features: opt-in (off by default)
- New safe features: opt-out
- Score changes: treat as breaking — document explicitly

### 4. Compatibility Artifacts

| Change type | Required action |
|-------------|-----------------|
| JSON shape changed | Bump `schemaVersion` in report |
| Score algorithm changed | CHANGELOG + README callout |
| Action input changed | Document migration in README |
| New CLI flag | Update `--help` + README |

### 5. Kill Metric

Write one line: "Remove `{feature}` if unused after 2 releases."

## Brief Template

```markdown
## Product brief: {change}

Job: {who / goal / current workaround}
Change: {smallest surface}
Reuse: {what was searched; extended or why new}
Compat: {schemaVersion bump? default? docs updated?}
Kill: {metric + threshold + horizon}
```

## Product Principles

1. **Fewer findings > more findings** — rank, don't dump
2. **Trust > coverage** — one false positive costs more than one miss
3. **Evidence > assertions** — file:line + suggestion always
4. **Workflows > dashboards** — CLI + PR, not Web UI
5. **Deterministic > AI** — never add LLM detection to serve a feature request

## Stop and Ask

- Can't name a job the current surface can't serve → propose reuse or drop
- Would break JSON schema without schemaVersion bump → confirm first
- Scope grows beyond what was asked → get explicit approval
