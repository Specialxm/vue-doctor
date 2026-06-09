# vue-doctor 项目文档索引

> 开发前准备材料 · 2026-06-09

## 文档清单

| 文档 | 用途 | 何时阅读 |
|------|------|----------|
| [01-product-design.md](./01-product-design.md) | 产品设计：用户、场景、价值主张、边界 | 立项 / 改 public surface 前 |
| [02-feature-plan.md](./02-feature-plan.md) | 功能计划：版本路线图、验收标准、优先级 | 每周规划 / 开新功能前 |
| [03-ai-dev-setup.md](./03-ai-dev-setup.md) | AI 开发配置：Skills 清单、安装、工作流 | **开发第一天必读** |
| [../AGENTS.md](../AGENTS.md) | Agent 编码规范（全局约束） | 每次 AI 写代码前自动加载 |
| [../vue-doctor-mvp.md](../vue-doctor-mvp.md) | MVP 执行计划（6 周工时） | 排期参考 |

## Skills 清单（快速索引）

### 第三方集成（安装即用）

```powershell
# 在 vue-doctor 仓库根目录执行
./scripts/install-external-skills.ps1
```

| Skill | 来源 | 用途 |
|-------|------|------|
| `vue` | antfu/skills | Vue 3 写法标准（规则设计参考） |
| `vue-best-practices` | antfu/skills | Vue 反模式知识库 |
| `pinia` | antfu/skills | Store 规则设计参考 |
| `vite` | antfu/skills | Vite 项目结构检测 |

### 项目自建（已内置 `.agents/skills/`）

| Skill | 触发场景 |
|-------|----------|
| `vue-doctor-dev` | 任何 vue-doctor 代码开发 |
| `vue-sfc-ast-analysis` | 解析 `.vue` / 写 AST 检测逻辑 |
| `vue-doctor-rule-writing` | 新增或修改检测规则 |
| `product-thinking` | 改 CLI / JSON 报告 / Action 等 public surface |
| `vue-doctor-ship` | 提交、发 PR、发布 |

## AI 开发推荐工作流

```
1. 读 AGENTS.md + 对应 .cursor/rules/
2. 开发功能 → 引用 vue-doctor-dev
3. 写规则   → 引用 vue-doctor-rule-writing + vue-sfc-ast-analysis
4. 改 CLI/报告 → 引用 product-thinking
5. 提交发布 → 引用 vue-doctor-ship
```

## 与 react-doctor 对标关系

| react-doctor | vue-doctor 对应 |
|--------------|-----------------|
| oxlint 100+ rules | 自研 ts-morph + compiler-sfc rules（MVP 6–10 条） |
| AGENTS.md | AGENTS.md（简化版） |
| .agents/skills/ | .agents/skills/（5 个自建） |
| doctor.config.ts | vue-doctor.config.ts（v0.2） |
| skills/react-doctor | skills/vue-doctor（Week 6 交付） |
