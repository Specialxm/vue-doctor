---
name: vue-doctor-rule-writing
description: >-
  Write vue-doctor detection rules from contract to tests to implementation.
  Use when adding or modifying rules in packages/rules, designing adversarial
  tests, or updating rule registration. Stage 2 of the rule pipeline.
---

# vue-doctor Rule Writing

## Pipeline

1. **Plan** — define rule contract (this skill, §Rule Contract)
2. **Test** — write adversarial tests FIRST
3. **Implement** — AST detector matching contract exactly
4. **Validate** — run on fixtures + 1 real open-source project

If no contract exists, write one before coding.

## Rule Contract Template

Fill this before implementation:

```markdown
## Rule: {rule-id}

One sentence: {exactly when this fires}

Severity: error | warn | info
Category: architecture | performance | maintainability | security

Triggers:
- {case 1}
- {case 2}

Stays silent:
- {valid case 1}
- {edge case 1}

Detector: syntax-only | scope-aware | cross-file
AST nodes: {which nodes/bindings matter}

v1 non-goals:
- {unsupported case we intentionally skip}
```

## Implementation Workflow

```
- [ ] Write rule contract
- [ ] Add fixture files (bad-project + good-project)
- [ ] Write __tests__/{rule-id}.test.ts (adversarial matrix)
- [ ] Implement packages/rules/src/{rule-id}.ts
- [ ] Register in packages/rules/src/index.ts
- [ ] pnpm test -- --grep "{rule-id}"
- [ ] pnpm vue-doctor fixtures/bad-project (manual)
- [ ] Verify on 1 real OSS project (manual, check false positives)
```

Pair with `vue-sfc-ast-analysis` skill for AST patterns.

## Adversarial Test Matrix

Every rule needs tests for:

| Category | Example |
|----------|---------|
| Direct violation | obvious bad code |
| Alias violation | imported as different name |
| Valid similar code | looks related but OK |
| Scope shadowing | inner variable same name |
| Wrong file type | composable vs view |
| Edge: empty file | should stay silent |
| Edge: parse error | should stay silent |

```typescript
// packages/rules/src/__tests__/direct-api-in-view.test.ts
import { describe, it, expect } from 'vitest';
import { runRuleOnFixture } from '../../test-utils';

describe('direct-api-in-view', () => {
  it('reports fetch in view component', async () => {
    const issues = await runRuleOnFixture('bad-project/views/Order.vue');
    expect(issues).toHaveLength(1);
    expect(issues[0].ruleId).toBe('direct-api-in-view');
  });

  it('stays silent for API call in composable', async () => {
    const issues = await runRuleOnFixture('good-project/composables/useOrder.ts');
    expect(issues).toHaveLength(0);
  });
});
```

## Detector Rules

- Use AST node fields, NOT source text matching
- Resolve imports when identifier identity matters
- Shadowed bindings = different variables
- Skip dynamic computed properties unless provably static
- When precision uncertain → stay silent
- Message must match exact condition that triggered

## Pseudocode Shape

```typescript
detect(context: ScanContext): Issue[] {
  const issues: Issue[] = [];

  for (const vueFile of context.vueFiles) {
    if (!isTargetFile(vueFile)) continue;

    const candidates = findCandidateNodes(vueFile);
    for (const candidate of candidates) {
      if (!isViolation(candidate, context)) continue;
      if (isExplicitlyAllowed(candidate)) continue;

      issues.push({
        ruleId: 'rule-id',
        severity: 'error',
        file: vueFile.path,
        line: candidate.line,
        message: '...',
        suggestion: '...',
        category: 'architecture',
      });
    }
  }

  return issues;
}
```

## Output When Done

```markdown
Implemented: rule {id} + tests + registration

Reports: {what triggers}
Silent: {what intentionally skipped}

Tests: pnpm test -- --grep "{id}" ✅
Fixture: bad-project triggers, good-project silent ✅

v1 non-goals: {list}
```
