# vue-doctor

> Your AI agent writes bad Vue. This catches it.

Vue 3 codebase health scanner — deterministic AST checks for architecture violations, Vue anti-patterns, and maintainability issues in AI-generated code.

**中文文档：** [README.zh-CN.md](./README.zh-CN.md)

## Install

```bash
npx @vue-doctor/cli
```

Requires Node.js 18+.

## Quick Start

Scan your project from the repository root:

```bash
npx @vue-doctor/cli .
```

Scan a subdirectory (monorepo):

```bash
npx @vue-doctor/cli apps/web
```

Output JSON for CI or tooling:

```bash
npx @vue-doctor/cli . --json
```

Fail when the health score is below a threshold:

```bash
npx @vue-doctor/cli . --fail-below 70
```

## CLI Options

| Option | Description |
|--------|-------------|
| `[directory]` | Project directory to scan (default: `.`) |
| `--json` | Print results as JSON |
| `--fail-below <score>` | Exit with code 1 when health score is below threshold (0–100) |
| `--version` | Print CLI version |
| `-h, --help` | Show help |

### Exit codes

| Code | Meaning |
|------|---------|
| `0` | Pass (no errors, or score above `--fail-below` threshold) |
| `1` | Issues found (errors present, or score below threshold) |
| `2` | Scan failed (invalid path, not a Vue project, etc.) |

## Health Score

Each scan produces a score from 0–100 based on unique rules triggered:

| Score | Label |
|-------|-------|
| 90–100 | Healthy |
| 70–89 | Needs attention |
| 50–69 | Unhealthy |
| 0–49 | Critical |

Errors weigh more than warnings. The score reflects rule diversity, not raw issue count.

## GitHub Action

Run on pull requests to scan **only changed files** and post a comment with new issues introduced in the PR.

```yaml
name: vue-doctor

on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]

permissions:
  contents: read
  pull-requests: write
  issues: write

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: Specialxm/vue-doctor/packages/action@v0.1.0
        with:
          directory: .
          diff: main
          fail-below: '70'
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### Action inputs

| Input | Default | Description |
|-------|---------|-------------|
| `directory` | `.` | Project directory relative to repo root |
| `diff` | `main` | Base branch for PR diff comparison |
| `fail-below` | `0` | Fail workflow when health score is below this (0–100) |
| `github-token` | — | Token for posting PR comments (required) |

### Action outputs

| Output | Description |
|--------|-------------|
| `score` | Health score for new issues in the PR diff |

`fetch-depth: 0` is required so git can compare against the base branch.

## Rules (v0.1.0)

All rules use deterministic AST analysis — no LLM involved.

| Rule ID | Severity | Category | What it checks |
|---------|----------|----------|----------------|
| `direct-api-in-view` | error | architecture | `fetch` / `axios` calls inside view components (`views/`, `pages/`) |
| `missing-key-in-vfor` | error | performance | `v-for` without `key` or `:key` |
| `unused-component` | warn | maintainability | `.vue` files not imported anywhere and not registered in router |
| `oversized-component` | warn | maintainability | Single-file component exceeds 300 lines |
| `oversized-composable` | warn | maintainability | Composable (`use*.ts`) exceeds 150 lines |
| `pinia-store-outside-setup` | warn | architecture | Pinia store accessed outside `setup()` in Options API |

## JSON Output

With `--json`, output follows `schemaVersion: 1`:

```json
{
  "schemaVersion": 1,
  "toolVersion": "0.1.0",
  "project": {
    "root": "/path/to/project",
    "name": "my-app",
    "framework": "vite",
    "vueVersion": "^3.5.0"
  },
  "score": 85,
  "summary": {
    "errors": 1,
    "warnings": 2,
    "infos": 0,
    "total": 3,
    "byCategory": { "architecture": 1, "maintainability": 2 }
  },
  "issues": [
    {
      "ruleId": "direct-api-in-view",
      "severity": "error",
      "file": "src/views/Home.vue",
      "line": 12,
      "message": "API call directly in view component",
      "suggestion": "Move to a composable or Pinia action",
      "category": "architecture"
    }
  ],
  "durationMs": 420
}
```

## Release

Maintainers:

```bash
pnpm release:prepare          # typecheck + test + build (includes action bundle)
git add packages/action/dist  # action dist is required for remote Action usage
git commit -m "chore: prepare v0.1.0 release"
git tag v0.1.0
git push origin main --tags
```

Pushing a `v*` tag triggers [`.github/workflows/publish.yml`](./.github/workflows/publish.yml), which validates the tag version, publishes `@vue-doctor/core`, `@vue-doctor/rules`, and `@vue-doctor/cli` to npm, and creates a GitHub Release.

Set the `NPM_TOKEN` repository secret (npmjs.com automation token with publish access to `@vue-doctor`).

## Development

This repository is a pnpm monorepo. For contributors:

```bash
pnpm install
pnpm build
pnpm test
pnpm vue-doctor fixtures/bad-project
```

See [docs/00-index.md](./docs/00-index.md) for product design, feature plan, and AI dev setup.

## Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## License

MIT
