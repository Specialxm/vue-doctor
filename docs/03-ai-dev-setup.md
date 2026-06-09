# vue-doctor AI 开发配置指南

> 让 Cursor Agent 高效、准确地开发 vue-doctor  
> 版本 v1.0 · 2026-06-09

---

## 1. 架构总览

```
vue-doctor/
├── AGENTS.md                          ← 全局编码规范（Agent 必读）
├── .cursor/rules/                     ← 文件级规则（按 glob 自动加载）
├── .agents/skills/                    ← 项目 Skills（任务级指引）
│   ├── vue-doctor-dev/                ← 主开发流程
│   ├── vue-sfc-ast-analysis/          ← AST 领域知识
│   ├── vue-doctor-rule-writing/       ← 写规则专用
│   ├── product-thinking/              ← 改 public surface 前
│   └── vue-doctor-ship/               ← 提交/发布
├── docs/                              ← 产品设计 & 功能计划
└── scripts/install-external-skills.ps1 ← 第三方 Skills 安装
```

---

## 2. 第三方 Skills 集成

### 2.1 推荐安装（antfu/skills）

来源：[antfu/skills](https://github.com/antfu/skills) — Vue 生态官方维护的 Agent Skills 标准。

| Skill | 安装目的 | vue-doctor 中的用途 |
|-------|----------|---------------------|
| `vue` | Vue 3 标准写法 | 规则设计参考、fixtures 写法 |
| `vue-best-practices` | 反模式知识库 | 新规则灵感来源 |
| `pinia` | Pinia 最佳实践 | `pinia-store-outside-setup` 等规则 |
| `vite` | Vite 项目结构 | project-detect 逻辑 |

**不安装**：`nuxt`（v0.2 再加）、`react`（无关）

### 2.2 安装方式

**方式 A：脚本（推荐）**

```powershell
cd f:\idea\vue-doctor
./scripts/install-external-skills.ps1
```

**方式 B：手动（npx skills CLI）**

```powershell
npx skills add antfu/skills --skill=vue --agent cursor
npx skills add antfu/skills --skill=vue-best-practices --agent cursor
npx skills add antfu/skills --skill=pinia --agent cursor
npx skills add antfu/skills --skill=vite --agent cursor
```

**方式 C：Cursor Settings**

Settings → Skills → Add GitHub URL → `https://github.com/antfu/skills`

### 2.3 未找到合适第三方的领域（已自建）

| 领域 | 为什么第三方不够 | 自建 Skill |
|------|------------------|------------|
| Vue SFC + ts-morph 静态分析 | 无公开 Skill | `vue-sfc-ast-analysis` |
| vue-doctor 规则编写 pipeline | React Doctor 规则不适用 Vue | `vue-doctor-rule-writing` |
| 项目 monorepo 结构约定 | 项目特有 | `vue-doctor-dev` |
| public surface 变更检查 | 需适配 vue-doctor | `product-thinking` |

### 2.4 ts-morph 参考（无 Skill，已嵌入 vue-sfc-ast-analysis）

- [ts-morph 文档](https://ts-morph.com/)
- [vue-ts-morph](https://github.com/ypresto/vue-ts-morph) — `.vue` 文件 ts-morph 支持（评估是否采用）
- [React Doctor AGENTS.md](https://github.com/millionco/react-doctor/blob/main/AGENTS.md) — 架构参考

---

## 3. 项目自建 Skills 说明

### 3.1 Skill 调用指南

| 你在做什么 | 告诉 Agent 用哪个 Skill | 示例 prompt |
|------------|-------------------------|-------------|
| 任何 vue-doctor 代码 | `vue-doctor-dev` | 「按 vue-doctor-dev 初始化 Week 1 CLI 骨架」 |
| 写/改检测规则 | `vue-doctor-rule-writing` + `vue-sfc-ast-analysis` | 「按 rule-writing 实现 R-03 unused-component」 |
| 解析 .vue AST | `vue-sfc-ast-analysis` | 「用 sfc-ast skill 提取 v-for 节点」 |
| 改 CLI/JSON/Action | `product-thinking` | 「加 --quiet flag，先走 product-thinking」 |
| 提交发版 | `vue-doctor-ship` | 「/ship 当前分支」 |

### 3.2 Skill 文件位置

Cursor 读取路径：`.agents/skills/<name>/SKILL.md`

> 也可 symlink 到 `.cursor/skills/`，但统一放 `.agents/skills/` 与 react-doctor 保持一致。

---

## 4. Cursor Rules 说明

`.cursor/rules/` 下的 `.mdc` 文件按 glob 自动加载，无需手动 invoke。

| 规则文件 | 作用域 | 内容 |
|----------|--------|------|
| `project-core.mdc` | 全局 `alwaysApply: true` | 通用 TS/架构约定 |
| `packages-core.mdc` | `packages/core/**` | Scanner 模块约定 |
| `packages-rules.mdc` | `packages/rules/**` | 规则模块约定 |
| `packages-cli.mdc` | `packages/cli/**` | CLI 模块约定 |

---

## 5. AI 开发工作流

### 5.1 新功能开发

```
1. 读 docs/02-feature-plan.md 确认功能 ID 和验收标准
2. 告诉 Agent：
   「实现 SC-03 SFC 解析，遵循 vue-doctor-dev skill，
    参考 docs/02-feature-plan.md SC-03 验收标准」
3. Agent 应：
   - 读 AGENTS.md
   - 读 vue-doctor-dev skill
   - 先写 fixtures 测试
   - 再写实现
   - 运行 pnpm test && pnpm typecheck
4. 你验收 Definition of Done
```

### 5.2 新规则开发

```
1. 在 docs/02-feature-plan.md 确认规则 ID（如 R-03）
2. 告诉 Agent：
   「实现 R-03 unused-component，走 rule-writing pipeline」
3. Agent 应：
   - 读 vue-doctor-rule-writing（计划 → 测试 → 实现）
   - 读 vue-sfc-ast-analysis（import 图方案）
   - fixtures/bad-project 加触发用例
   - fixtures/good-project 加不触发用例
   - Vitest 单测
4. 手动在 1 个真实开源项目验证误报
```

### 5.3 改 Public Surface

**Public surface 清单**（改之前必须走 product-thinking）：

- CLI 命令 / flags
- 健康分算法
- JSON report schema（`schemaVersion`）
- GitHub Action inputs/outputs
- 终端输出格式
- npm 包 API

```
告诉 Agent：「加 --quiet flag，先执行 product-thinking 再写代码」
```

### 5.4 提交发布

```
告诉 Agent：「/ship」或「按 vue-doctor-ship 提交并发 PR」
```

---

## 6. Prompt 模板

### 6.1 Week 1 启动

```
在 f:\idea\vue-doctor 初始化 monorepo：
- 读 AGENTS.md 和 vue-doctor-dev skill
- 按 docs/02-feature-plan.md Sprint 1 任务
- pnpm workspace: packages/cli, packages/core, packages/rules
- 实现 CL-01 + SC-03 + SC-04 + R-01
- fixtures/bad-project 和 good-project
- 跑通 pnpm test && pnpm vue-doctor fixtures/bad-project
```

### 6.2 实现单条规则

```
实现规则 R-{ID} `{rule-id}`：
1. 读 vue-doctor-rule-writing + vue-sfc-ast-analysis
2. 先写 adversarial tests（positive + negative + edge cases）
3. 再写 detect() 实现
4. 注册到 packages/rules/src/index.ts
5. pnpm test -- --grep "{rule-id}"
```

### 6.3 Code Review 请求

```
Review 当前 diff：
- 对照 AGENTS.md 所有 MUST 规则
- 检查是否有 duplicate utility（搜索 packages/ 现有函数）
- 检查规则是否有 string-matching 反模式（应使用 AST）
- 检查 public surface 变更是否走过 product-thinking
```

---

## 7. Agent 常见错误预防

| 错误 | 正确做法 | 相关 Skill |
|------|----------|------------|
| 用 regex 检测代码 | 用 ts-morph / compiler-sfc AST | vue-sfc-ast-analysis |
| 一次实现 4 条规则 | 一条规则 + 测试 + 验证 | vue-doctor-rule-writing |
| 先做 Web UI | MVP 只有 CLI | product-thinking |
| 用 LLM 做检测 | 确定性 AST only | vue-doctor-dev |
| 改 JSON schema 不 bump version | bump schemaVersion | product-thinking |
| 重复造 utility | 先搜索 packages/ 现有代码 | vue-doctor-dev |
| 过度注释 | 代码自解释，只在 HACK 处注释 | AGENTS.md |

---

## 8. 本地验证命令

```powershell
# 安装依赖
pnpm install

# 构建
pnpm build

# 类型检查
pnpm typecheck

# 测试
pnpm test

# 本地运行 CLI
pnpm vue-doctor fixtures/bad-project

# JSON 输出
pnpm vue-doctor fixtures/bad-project --json

# 格式化
pnpm format
```

---

## 9. 开发环境 Checklist

开始开发前确认：

- [ ] 已读 `docs/00-index.md`
- [ ] 已读 `AGENTS.md`
- [ ] 已执行 `scripts/install-external-skills.ps1`
- [ ] Cursor 已识别 `.cursor/rules/` 和 `.agents/skills/`
- [ ] Node.js >= 18
- [ ] pnpm >= 9

---

## 10. Skills 维护

| 何时更新 Skill | 更新哪个 |
|----------------|----------|
| 新增 packages/ 目录 | vue-doctor-dev |
| 发现 SFC 解析新 pattern | vue-sfc-ast-analysis |
| 规则 pipeline 变更 | vue-doctor-rule-writing |
| 新增 public surface 类型 | product-thinking |
| 发布流程变更 | vue-doctor-ship |

---

*关联文档：[00-index.md](./00-index.md) · [01-product-design.md](./01-product-design.md)*
