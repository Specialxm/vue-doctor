# vue-doctor

> AI 写的 Vue 代码常有隐患，vue-doctor 帮你揪出来。

Vue 3 代码库健康扫描器 — 用确定性 AST 分析检测架构违规、Vue 反模式和可维护性问题，专为 AI 生成代码场景设计。

**English:** [README.md](./README.md)

## 安装

```bash
npx @vue-doctor/cli
```

需要 Node.js 18 及以上。

> npm 包名是 `@vue-doctor/cli`，安装后命令为 `vue-doctor`。scoped 包请使用 `npx @vue-doctor/cli`，不要写成 `npx vue-doctor`。

## 快速开始

在项目根目录扫描：

```bash
npx @vue-doctor/cli .
```

扫描 monorepo 子目录：

```bash
npx @vue-doctor/cli apps/web
```

输出 JSON（适合 CI 或自定义工具消费）：

```bash
npx @vue-doctor/cli . --json
```

仅输出健康分（适合 CI 脚本）：

```bash
npx @vue-doctor/cli . --quiet
```

忽略匹配 glob 的文件：

```bash
npx @vue-doctor/cli . --ignore "**/legacy/**"
```

生成 Cursor Rule，引导 AI 遵循 vue-doctor 规则：

```bash
npx @vue-doctor/cli install
```

健康分低于阈值时让命令失败（用于 CI gate）：

```bash
npx @vue-doctor/cli . --fail-below 70
```

### 示例输出

终端报告包含健康分、按类别分组的 issue 列表，以及每条 issue 的文件路径、行号和修复建议。

## CLI 参数

| 参数 | 说明 |
|------|------|
| `[directory]` | 要扫描的项目目录（默认 `.`） |
| `--json` | 以 JSON 格式输出结果 |
| `--quiet` | 仅输出健康分 |
| `--ignore <pattern>` | 忽略匹配 glob 的文件（可重复） |
| `--fail-below <score>` | 健康分低于该阈值（0–100）时退出码为 1 |
| `--version` | 显示版本号 |
| `-h, --help` | 显示帮助 |

### 子命令

| 命令 | 说明 |
|------|------|
| `vue-doctor [directory]` | 扫描项目（默认） |
| `vue-doctor install [directory]` | 生成 `.cursor/rules/vue-doctor.mdc` |

### 退出码

| 退出码 | 含义 |
|--------|------|
| `0` | 通过（无 error，或分数高于 `--fail-below` 阈值） |
| `1` | 发现问题（存在 error，或分数低于阈值） |
| `2` | 扫描失败（路径无效、非 Vue 项目等） |

## 健康分

每次扫描产出 0–100 的健康分，按**触发的规则种类**计分（不是 issue 条数）：

| 分数 | 状态 |
|------|------|
| 90–100 | Healthy（健康） |
| 70–89 | Needs attention（需关注） |
| 50–69 | Unhealthy（不健康） |
| 0–49 | Critical（严重） |

error 扣分权重高于 warn。分数反映的是规则覆盖面的严重程度，而非单文件 issue 数量。

## Leaderboard

使用 vue-doctor v0.1.x 规则扫描知名 Vue 开源项目（已忽略测试文件）。运行 `node scripts/leaderboard-scan.mjs` 可刷新数据。

| 项目 | 分数 | Issue 数 | 链接 |
|------|-----:|---------:|------|
| [Vue Router](https://github.com/vuejs/router) | 99 | 18 | [repo](https://github.com/vuejs/router) |
| [VueUse](https://github.com/vueuse/vueuse) | 99 | 215 | [repo](https://github.com/vueuse/vueuse) |
| [Pinia](https://github.com/vuejs/pinia) | 97 | 18 | [repo](https://github.com/vuejs/pinia) |
| [VeeValidate](https://github.com/logaretm/vee-validate) | 97 | 87 | [repo](https://github.com/logaretm/vee-validate) |
| [Element Plus](https://github.com/element-plus/element-plus) | 96 | 66 | [repo](https://github.com/element-plus/element-plus) |

扫描日期：2026-06-12。[提交你的项目 →](https://github.com/Specialxm/vue-doctor/issues/new)

## GitHub Pages

Landing 页：**[specialxm.github.io/vue-doctor](https://specialxm.github.io/vue-doctor/)**（源码 [`docs/index.html`](./docs/index.html)）。

由 [`.github/workflows/pages.yml`](./.github/workflows/pages.yml) 自动部署。只需在 **Settings → Pages → Source** 选择 **GitHub Actions**，无需自定义域名或 DNS。

## GitHub Action

在 Pull Request 上自动运行，**只扫描 PR 变更的文件**，并在 PR 中发表评论展示本次引入的新 issue。

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

      - uses: Specialxm/vue-doctor/packages/action@v0.1.1
        with:
          directory: .
          diff: main
          fail-below: '70'
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

### 输入参数

| 参数 | 默认值 | 说明 |
|------|--------|------|
| `directory` | `.` | 相对于仓库根目录的扫描路径 |
| `diff` | `main` | PR diff 对比的基准分支 |
| `fail-below` | `0` | 健康分低于此值时 workflow 失败（0–100） |
| `github-token` | — | 用于发表评论的 token（必填） |

### 输出

| 输出 | 说明 |
|------|------|
| `score` | 本次 PR diff 中新 issue 对应的健康分 |

**注意：**

- 必须设置 `fetch-depth: 0`，否则 git 无法对比基准分支。
- monorepo 子项目扫描：将 `directory` 设为子目录路径，如 `apps/web`。
- Action 引用本仓库子目录 `packages/action`，请 pin 到 release tag（如 `v0.1.1`）。release tag 包含 ncc 打包后的 `dist/index.js`（自包含，无需额外 `node_modules`）。

### 与本仓库 CI 的区别

本仓库 CI 使用本地路径 `uses: ./packages/action`（先 `pnpm build`），适合开发调试。用户项目应引用远程 tag，如上方示例。

## 检测规则（v0.1.1）

所有规则均为确定性 AST 分析，**不使用 LLM**。

| 规则 ID | 严重级别 | 类别 | 检测内容 |
|---------|----------|------|----------|
| `direct-api-in-view` | error | architecture | 在 view 组件（`views/`、`pages/`）中直接调用 `fetch` / `axios` |
| `missing-key-in-vfor` | error | performance | `v-for` 缺少 `key` 或 `:key` |
| `unused-component` | warn | maintainability | `.vue` 文件未被任何文件 import，且未在 router 中注册 |
| `oversized-component` | warn | maintainability | 单文件组件超过 300 行 |
| `oversized-composable` | warn | maintainability | composable（`use*.ts`）超过 150 行 |
| `pinia-store-outside-setup` | warn | architecture | Options API 中在 `setup()` 外使用 Pinia store |
| `sync-watch-abuse` | warn | performance | `watch` 回调修改被监听的值 |
| `deprecated-options-api` | info | maintainability | 使用 Options API 而非 `<script setup>` |
| `empty-script-setup` | info | maintainability | 空的 `<script setup>` 配合超过 50 行的 template |

### 规则设计理念

| 类别 | 目标 |
|------|------|
| architecture | 防止 AI 把 API 调用、状态管理散落在 view 层 |
| performance | 捕获 Vue 模板层常见性能隐患 |
| maintainability | 控制文件体积、清理死代码 |

## JSON 输出

使用 `--json` 时，输出遵循 `schemaVersion: 1`：

```json
{
  "schemaVersion": 1,
  "toolVersion": "0.1.1",
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

字段说明：

| 字段 | 说明 |
|------|------|
| `schemaVersion` | JSON schema 版本，当前为 `1` |
| `toolVersion` | CLI 版本号 |
| `project` | 检测到的项目元信息（框架、Vue 版本等） |
| `score` | 健康分（0–100） |
| `summary` | 按严重级别和类别汇总的 issue 统计 |
| `issues` | issue 列表，含 `ruleId`、`file`、`line`、`message`、`suggestion` |
| `durationMs` | 扫描耗时（毫秒） |

## 适用场景

- **本地开发**：AI agent 改完代码后手动跑一遍，快速发现架构问题
- **CI 门禁**：`--fail-below` 或 GitHub Action `fail-below` 阻止低质量 PR 合并
- **Agent 工具链**：`--json` 输出供 Cursor / Claude 等 agent 读取并自动修复

## 开发

本仓库为 pnpm monorepo，贡献者本地开发：

```bash
pnpm install
pnpm build
pnpm test
pnpm vue-doctor fixtures/bad-project
pnpm vue-doctor fixtures/good-project
pnpm vue-doctor fixtures/bad-project --json
```

### 发布流程

**自动发布（推荐）：**

```bash
pnpm release:prepare              # typecheck + test + build
git add packages/action/dist    # Action 远程引用需要打包产物
git commit -m "chore: prepare v0.1.1 release"
git tag v0.1.1
git push origin main --tags
```

推送 `v*` tag 后，[`.github/workflows/publish.yml`](./.github/workflows/publish.yml) 会自动：

1. 校验 tag 版本与 `packages/cli/package.json` 一致
2. 运行 typecheck + test + build
3. 发布 `@vue-doctor/core`、`@vue-doctor/rules`、`@vue-doctor/cli` 到 npmjs.com
4. 创建 GitHub Release

**前置条件：** 在 GitHub 仓库 Settings → Secrets 中配置 `NPM_TOKEN`（npmjs.com 的 automation token，需有 `@vue-doctor` scope 发布权限）。

**手动发布（本地）：**

```bash
pnpm publish:packages
```

详见 [vue-doctor-ship skill](./.agents/skills/vue-doctor-ship/SKILL.md)。

### 文档索引

| 文档 | 用途 |
|------|------|
| [docs/00-index.md](./docs/00-index.md) | 文档总索引 |
| [docs/01-product-design.md](./docs/01-product-design.md) | 产品设计 |
| [docs/02-feature-plan.md](./docs/02-feature-plan.md) | 功能计划与路线图 |
| [docs/03-ai-dev-setup.md](./docs/03-ai-dev-setup.md) | AI 开发环境配置 |
| [AGENTS.md](./AGENTS.md) | Agent 编码规范 |

## 更新日志

见 [CHANGELOG.md](./CHANGELOG.md)。

## License

MIT
