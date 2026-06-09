# vue-doctor

> Your AI agent writes bad Vue. This catches it.

Vue 3 codebase health scanner — deterministic checks for AI-generated code anti-patterns, architecture violations, and maintainability issues.

## Quick Start

```bash
pnpm install
pnpm build
pnpm vue-doctor fixtures/bad-project
```

## Development

```bash
pnpm typecheck
pnpm test
pnpm vue-doctor fixtures/bad-project
pnpm vue-doctor fixtures/good-project
pnpm vue-doctor fixtures/bad-project --json
```

## Week 1 Status

- [x] pnpm monorepo (`core`, `rules`, `cli`)
- [x] SFC parser + project scanner
- [x] Rule: `direct-api-in-view`
- [x] Terminal + JSON reporter
- [x] Fixtures (`bad-project`, `good-project`)
- [x] Vitest for first rule

## Docs

See [docs/00-index.md](./docs/00-index.md) for product design, feature plan, and AI dev setup.

## License

MIT
