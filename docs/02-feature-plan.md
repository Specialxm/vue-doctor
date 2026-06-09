# vue-doctor 功能计划

> 版本 v1.0 · 2026-06-09  
> 投入：15h/周 · 6 周 MVP

---

## 1. 版本路线图

```
v0.0.1 (W1)  CLI 骨架 + 1 规则 + fixtures
v0.0.5 (W2)  6 条核心规则 + 单测
v0.0.8 (W3)  健康分 + 终端报告 + --json
v0.0.9 (W4)  GitHub Action + PR 评论
v0.1.0 (W5-6) npm 发布 + Leaderboard + Cursor install
v0.2.0 (W7-8) Nuxt / Knip / 追加规则（可选）
```

---

## 2. 功能模块分解

### 2.1 模块：Scanner（packages/core）

| 功能 ID | 功能名 | 版本 | 优先级 | 状态 |
|---------|--------|------|--------|------|
| SC-01 | 项目根目录检测 | v0.0.1 | P0 | 待开发 |
| SC-02 | Vue/Vite/Pinia/Nuxt 自动识别 | v0.0.8 | P0 | 待开发 |
| SC-03 | `.vue` 文件收集与 SFC 解析 | v0.0.1 | P0 | 待开发 |
| SC-04 | ts-morph Project 初始化 | v0.0.1 | P0 | 待开发 |
| SC-05 | 规则批量执行引擎 | v0.0.5 | P0 | 待开发 |
| SC-06 | 健康分计算 | v0.0.8 | P0 | 待开发 |
| SC-07 | import 依赖图构建 | v0.0.5 | P0 | 待开发 |
| SC-08 | `--ignore` 文件/规则配置 | v0.1.0 | P1 | 待开发 |
| SC-09 | monorepo workspace 检测 | v0.2.0 | P2 | 待定 |

**SC-02 检测逻辑**

```
package.json
  ├── dependencies.vue        → Vue 版本
  ├── devDependencies.vite    → Vite 项目
  ├── dependencies.pinia      → Pinia
  ├── dependencies.nuxt       → Nuxt 3
  └── devDependencies.@nuxt/  → Nuxt 3
```

---

### 2.2 模块：Rules（packages/rules）

#### P0 规则（v0.0.5 必交付）

| 规则 ID | 名称 | 级别 | 类别 | Week |
|---------|------|------|------|------|
| R-01 | `direct-api-in-view` | error | architecture | W1 |
| R-02 | `missing-key-in-vfor` | error | performance | W2 |
| R-03 | `unused-component` | warn | maintainability | W2 |
| R-04 | `oversized-composable` | warn | maintainability | W2 |
| R-05 | `oversized-component` | warn | maintainability | W2 |
| R-06 | `pinia-store-outside-setup` | warn | architecture | W2 |

#### P1 规则（v0.1.0）

| 规则 ID | 名称 | 级别 | 类别 |
|---------|------|------|------|
| R-07 | `props-drilling` | warn | architecture |
| R-08 | `sync-watch-abuse` | warn | performance |
| R-09 | `deprecated-options-api` | info | maintainability |
| R-10 | `empty-script-setup` | info | maintainability |

#### P2 规则（v0.2.0）

| 规则 ID | 名称 | 说明 |
|---------|------|------|
| R-11 | `nuxt-missing-define-page-meta` | Nuxt 专属 |
| R-12 | `duplicate-composable-logic` | jscpd 集成 |

#### 规则验收标准（每条规则必须满足）

- [ ] `fixtures/bad-project/` 有触发用例
- [ ] `fixtures/good-project/` 有不触发用例
- [ ] Vitest 单测覆盖 positive + negative
- [ ] 误报率：在 3 个真实开源项目上手动验证 < 5%
- [ ] Issue 含：ruleId, file, line, message, suggestion

---

### 2.3 模块：Reporter（packages/core）

| 功能 ID | 功能名 | 版本 | 优先级 |
|---------|--------|------|--------|
| RP-01 | 终端彩色报告 | v0.0.8 | P0 |
| RP-02 | 分类统计表 | v0.0.8 | P0 |
| RP-03 | 健康分展示 + 状态 emoji | v0.0.8 | P0 |
| RP-04 | `--json` 结构化输出 | v0.0.8 | P0 |
| RP-05 | `--quiet` 仅输出分数 | v0.1.0 | P1 |
| RP-06 | issue 修复建议（hint） | v0.0.8 | P0 |

**JSON Report Schema（v1）**

```typescript
interface JsonReport {
  schemaVersion: 1;
  toolVersion: string;
  project: {
    root: string;
    framework: string;       // "Vue 3.4 + Vite 5 + Pinia"
    vueVersion?: string;
  };
  score: number;             // 0-100
  summary: {
    errors: number;
    warnings: number;
    infos: number;
    byCategory: Record<string, number>;
  };
  issues: Issue[];
  durationMs: number;
}
```

> ⚠️ `schemaVersion` 变更需走 product-thinking 流程。

---

### 2.4 模块：CLI（packages/cli）

| 功能 ID | 命令/选项 | 版本 | 说明 |
|---------|-----------|------|------|
| CL-01 | `vue-doctor [dir]` | v0.0.1 | 默认扫描 |
| CL-02 | `--json` | v0.0.8 | JSON 输出 |
| CL-03 | `--quiet` | v0.1.0 | 仅分数 |
| CL-04 | `--fail-below <n>` | v0.0.9 | CI exit code |
| CL-05 | `vue-doctor install` | v0.1.0 | 生成 Cursor Rule |
| CL-06 | `--version` | v0.0.1 | 版本号 |
| CL-07 | `--no-color` | v0.0.8 | 禁用颜色 |
| CL-08 | `--ignore <pattern>` | v0.1.0 | 忽略文件 |

**Exit codes**

| Code | 含义 |
|------|------|
| 0 | 扫描完成，分数 >= fail-below |
| 1 | 扫描完成，分数 < fail-below |
| 2 | 扫描失败（非 Vue 项目 / 解析错误） |

---

### 2.5 模块：GitHub Action（packages/action）

| 功能 ID | 功能名 | 版本 | 优先级 |
|---------|--------|------|--------|
| AC-01 | PR diff 增量扫描 | v0.0.9 | P0 |
| AC-02 | PR comment（Markdown） | v0.0.9 | P0 |
| AC-03 | `fail-below` input | v0.0.9 | P0 |
| AC-04 | `diff` base branch input | v0.0.9 | P0 |
| AC-05 | `score` output | v0.0.9 | P0 |
| AC-06 | 仅报新增 issue（非 backlog） | v0.0.9 | P0 |

**Action Inputs**

```yaml
inputs:
  diff:
    description: Base branch for diff
    default: main
  fail-below:
    description: Fail if score below threshold
    default: '0'
  github-token:
    description: Token for PR comments
    required: true
```

---

### 2.6 模块：Distribution（传播）

| 功能 ID | 功能名 | 版本 | Week |
|---------|--------|------|------|
| DS-01 | npm 发布 | v0.1.0 | W5 |
| DS-02 | Leaderboard（5-8 项目） | v0.1.0 | W5 |
| DS-03 | README 英文 + GIF | v0.0.8 | W3 |
| DS-04 | GitHub Pages landing | v0.1.0 | W5 |
| DS-05 | Cursor Rule 模板 | v0.1.0 | W6 |
| DS-06 | 社区发帖 | v0.1.0 | W5 |

---

## 3. 6 周 Sprint 计划

### Sprint 1（Week 1）— Foundation

**Goal**：端到端跑通 1 条规则

| 任务 | 功能 ID | 验收标准 |
|------|---------|----------|
| monorepo 初始化 | — | `pnpm install && pnpm build` 成功 |
| CLI 骨架 | CL-01, CL-06 | `pnpm vue-doctor .` 不 crash |
| SFC 解析 | SC-03 | 能解析 fixtures 中所有 .vue |
| ts-morph 初始化 | SC-04 | 能读取 .ts 文件 AST |
| R-01 规则 | R-01 | bad-project 触发，good-project 不触发 |
| fixtures | — | bad-project + good-project 各 3+ 文件 |

**Definition of Done**：`pnpm vue-doctor fixtures/bad-project` 输出至少 1 条 issue。

---

### Sprint 2（Week 2）— Rules

**Goal**：6 条 P0 规则 + 单测

| 任务 | 功能 ID |
|------|---------|
| 规则引擎 SC-05 | SC-05 |
| import 图 SC-07 | SC-07 |
| R-02 ~ R-06 | R-02~R-06 |
| Vitest 全覆盖 | — |

**Definition of Done**：6 条规则各有 ≥2 个单测，`pnpm test` 全绿。

---

### Sprint 3（Week 3）— Experience

**Goal**：完整终端报告体验

| 任务 | 功能 ID |
|------|---------|
| 项目检测 SC-02 | SC-02 |
| 健康分 SC-06 | SC-06 |
| 终端报告 RP-01~03, RP-06 | RP-01~03, RP-06 |
| JSON 输出 RP-04, CL-02 | RP-04, CL-02 |
| README 初版 DS-03 | DS-03 |

**Definition of Done**：输出格式与 PDR §6 示例一致；`--json` 符合 schema。

---

### Sprint 4（Week 4）— CI

**Goal**：GitHub Action 可用

| 任务 | 功能 ID |
|------|---------|
| Action 全部功能 | AC-01~AC-06 |
| `--fail-below` CL-04 | CL-04 |
| dogfood 2 个项目 | — |

**Definition of Done**：在自己 repo 开 PR，Action 自动评论且仅报 diff 引入的问题。

---

### Sprint 5（Week 5）— Launch

**Goal**：公开发布

| 任务 | 功能 ID |
|------|---------|
| npm 发布 DS-01 | DS-01 |
| Leaderboard DS-02 | DS-02 |
| Landing page DS-04 | DS-04 |
| 社区发帖 DS-06 | DS-06 |

**Definition of Done**：`npx vue-doctor@latest .` 全球可用。

---

### Sprint 6（Week 6）— AI Integration

**Goal**：v0.1.0 release

| 任务 | 功能 ID |
|------|---------|
| `install` 命令 CL-05 | CL-05 |
| Cursor Rule DS-05 | DS-05 |
| R-07~R-10 选做 | R-07~R-10 |
| CHANGELOG + tag | — |

**Definition of Done**：Git tag v0.1.0 + GitHub Release。

---

## 4. 功能优先级矩阵

```
        高价值
          │
    P0    │    P1
  ────────┼────────
  CLI     │  --quiet
  6 rules │  4 extra rules
  Score   │  --ignore
  Action  │  install
  JSON    │  landing
          │
        低价值
   低工作量 ────── 高工作量
```

**砍 scope 顺序**（进度落后时）：

1. 砍 R-07~R-10（保留 6 条 P0）
2. 砍 Landing page
3. 砍 `install` 命令
4. **绝不砍**：CLI + 6 规则 + 健康分 + Action

---

## 5. 依赖关系

```mermaid
graph TD
    SC03[SFC 解析] --> SC05[规则引擎]
    SC04[ts-morph] --> SC05
    SC07[import 图] --> R03[unused-component]
    SC05 --> R01~R06[6 条规则]
    SC05 --> SC06[健康分]
    SC06 --> RP01[终端报告]
    SC06 --> RP04[JSON 输出]
    RP04 --> AC01[GitHub Action]
    RP01 --> DS01[npm 发布]
    DS01 --> DS05[Cursor install]
```

---

## 6. 测试策略

| 层级 | 工具 | 覆盖 |
|------|------|------|
| 单元测试 | Vitest | 每条规则 + score + project-detect |
| 集成测试 | Vitest | CLI 端到端（fixtures） |
| 快照测试 | Vitest | JSON report / 终端输出 |
| 手动验证 | 真实开源项目 | Leaderboard 扫描 |

**fixtures 结构**

```
fixtures/
├── bad-project/          # 故意写错，触发规则
│   ├── src/
│   │   ├── views/BadView.vue      # direct-api-in-view
│   │   ├── components/Unused.vue  # unused-component
│   │   └── composables/useBig.ts  # oversized-composable
│   ├── package.json
│   └── tsconfig.json
└── good-project/         # 正确写法，零 issue
    └── ...
```

---

## 7. 配置规划（v0.2）

```typescript
// vue-doctor.config.ts（v0.2，MVP 不实现）
export default {
  rules: {
    'direct-api-in-view': 'error',
    'oversized-composable': ['warn', { maxLines: 150 }],
  },
  ignore: ['**/*.spec.ts', '**/legacy/**'],
  failBelow: 60,
};
```

MVP 阶段用 CLI flags 代替配置文件。

---

*关联文档：[01-product-design.md](./01-product-design.md) · [03-ai-dev-setup.md](./03-ai-dev-setup.md)*
