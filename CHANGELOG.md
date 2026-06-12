# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-06-11

### Added

- **CLI** (`@vue-doctor/cli`) — `vue-doctor [directory]` with `--json`, `--fail-below`, and `--version`
- **Scanner engine** (`@vue-doctor/core`) — Vue project detection, SFC parsing, import graph, health scoring, terminal and JSON reporters
- **6 detection rules** (`@vue-doctor/rules`):
  - `direct-api-in-view` (error) — API calls in view components
  - `missing-key-in-vfor` (error) — `v-for` without key
  - `unused-component` (warn) — orphaned `.vue` files
  - `oversized-component` (warn) — components over 300 lines
  - `oversized-composable` (warn) — composables over 150 lines
  - `pinia-store-outside-setup` (warn) — Pinia store outside `setup()`
- **GitHub Action** — PR diff scanning with automatic PR comment
- **JSON report** — `schemaVersion: 1` with project metadata, score, and issues
- **Health score** — 0–100 score with Healthy / Needs attention / Unhealthy / Critical labels

### Changed

- npm publish metadata and `publishConfig` for `@vue-doctor/cli`, `@vue-doctor/core`, `@vue-doctor/rules`
- CLI version read from `package.json` instead of hardcoded string
- GitHub Action built with `@vercel/ncc` for self-contained remote distribution

### Added (release tooling)

- `.github/workflows/publish.yml` — tag-triggered npm publish and GitHub Release
- `pnpm release:prepare` — typecheck, test, and build before tagging

[0.1.0]: https://github.com/Specialxm/vue-doctor/releases/tag/v0.1.0
