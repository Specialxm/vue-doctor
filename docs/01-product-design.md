# vue-doctor 产品设计文档（PDR）

> 版本 v1.0 · 2026-06-09  
> 状态：Pre-MVP

---

## 1. 产品概述

### 1.1 一句话定位

**Your AI agent writes bad Vue. This catches it.**

Vue 3 代码库健康扫描 CLI —— 用确定性静态分析（非 LLM）检测 AI 生成代码中的 Vue 反模式、架构违规与可维护性问题。

### 1.2 产品形态

| 形态 | 优先级 | 说明 |
|------|--------|------|
| CLI (`npx vue-doctor`) | P0 | 核心产品 |
| GitHub Action | P0 | 传播 + CI 集成 |
| Cursor Rule 生成 | P1 | AI 叙事 + 修复引导 |
| JSON 报告 | P0 | CI / 工具链集成 |
| Web Dashboard | ❌ | MVP 不做 |

### 1.3 对标产品

| 产品 | 关系 |
|------|------|
| [React Doctor](https://github.com/millionco/react-doctor) | 直接对标，传播路径可复制 |
| Knip | 互补（v0.2 集成死代码） |
| ESLint + eslint-plugin-vue | 互补，vue-doctor 聚焦架构级问题 |
| dependency-cruiser | 互补（v2 架构规则） |

---

## 2. 用户画像

### 2.1 主要用户

|  persona | 场景 | 痛点 | 使用方式 |
|----------|------|------|----------|
| **独立开发者** | Cursor/Copilot 写 Vue 项目 | AI 改崩架构、重复 composable | 本地 `npx vue-doctor` |
| **小团队 Tech Lead** | PR Review 压力大 | 难以发现 AI 引入的反模式 | GitHub Action |
| **开源维护者** | 接受外部 PR | 贡献者代码质量参差 | CI gate + Leaderboard |

### 2.2 非目标用户

- 需要 LLM 语义审查的企业（→ CodeRabbit / Qodo）
- 只做 JS 不用 TS 的 legacy 项目（MVP 聚焦 TS）
- Vue 2 项目（v1 不支持）

---

## 3. 用户旅程

### 3.1 首次使用（Aha Moment）

```
开发者听说 vue-doctor
    ↓
npx vue-doctor@latest .          ← 10 秒内出结果
    ↓
看到健康分 68/100 + 具体问题列表   ← Aha: "原来我有这些问题"
    ↓
按建议修复 2–3 个 error 级问题
    ↓
重新扫描 → 分数提升               ← 正向反馈
    ↓
Star + 加入 CI
```

**Aha Moment 设计原则**：零配置、10 秒内出结果、至少 1 条「我之前不知道」的发现。

### 3.2 CI 集成旅程

```
Tech Lead 在 PR 中收到 vue-doctor 评论
    ↓
只看到本次改动引入的问题（非历史 backlog）
    ↓
开发者修复 → PR 通过
    ↓
团队设置 fail-below: 60 门槛
```

### 3.3 AI Agent 集成旅程（v0.1.x）

```
npx vue-doctor install
    ↓
生成 .cursor/rules/vue-doctor.md
    ↓
Cursor 写 Vue 代码时自动遵循规则
    ↓
vue-doctor 扫描 → Agent 按优先级修复
```

---

## 4. 价值主张

### 4.1 功能价值

| 价值 | 机制 | 差异化 |
|------|------|--------|
| **确定性** | AST 静态分析，非 LLM 猜测 | 零成本、零误报 API 调用 |
| **Vue 专属** | compiler-sfc + Vue 架构规则 | React Doctor 不覆盖 |
| **AI 时代** | 针对 Agent 常见反模式设计规则 | 比通用 ESLint 更贴近 AI 写法 |
| **可集成** | JSON + GitHub Action | 融入现有工作流 |

### 4.2 情感价值

- **掌控感**：AI 改代码不再「开盲盒」
- **专业感**：健康分可截图放 README / 简历
- **社区感**：Leaderboard 排名知名开源项目

---

## 5. 功能架构

```
┌─────────────────────────────────────────────────────┐
│                    vue-doctor CLI                    │
├─────────────┬─────────────┬─────────────────────────┤
│   Scanner   │   Rules     │      Reporter           │
│  (core)     │  (rules)    │  (core)                 │
├─────────────┼─────────────┼─────────────────────────┤
│ project     │ direct-api  │ terminal (picocolors)   │
│ detect      │ unused-comp │ JSON (--json)           │
│ SFC parse   │ missing-key │ score (0-100)           │
│ ts-morph    │ oversized-* │ category stats          │
└─────────────┴─────────────┴─────────────────────────┘
         ↓                              ↓
   GitHub Action                   Cursor Rule
   (PR diff scan)                  (install cmd)
```

---

## 6. 产品原则

开发决策 tie-breaker（借鉴 React Doctor）：

1. **少而准 > 多而噪** — 10 条高置信规则胜过 50 条误报规则
2. **根因 > 表象** — 「direct-api-in-view」比「函数太长」更有行动价值
3. **证据 > 断言** — 报告必须给出文件、行号、修复建议
4. **可行动 > 正确** — 每条 issue 必须有 clear next step
5. **工作流 > 仪表盘** — CLI + PR 评论，不做 Web UI
6. **信任 > 覆盖率** — 1 条误报比漏检 10 条伤害更大

---

## 7. 产品边界（MVP）

### 7.1 做

- Vue 3 + `<script setup>` + TypeScript
- Vite 项目（优先）；Nuxt 3 基础检测（v0.2）
- Pinia 架构规则
- 6–10 条确定性规则
- 健康分 + 终端报告 + JSON
- GitHub Action PR 增量扫描

### 7.2 不做

| 不做 | 原因 | 何时考虑 |
|------|------|----------|
| LLM Review | 成本、误报、6 周做不完 | v2+ |
| Vue 2 | 用户群萎缩 | 不做 |
| Web Dashboard | ROI 低 | 不做 |
| 完整调用图 | 技术难度 | v2 |
| Options API 深度规则 | MVP 聚焦 script setup | v0.2 info 级 |
| 自动 fix（--fix） | 复杂度高 | v0.2 |

---

## 8. 成功指标

### 8.1 MVP 阶段（6 周）

| 指标 | 目标 | 测量方式 |
|------|------|----------|
| GitHub Stars | 200–800 | GitHub |
| npm 周下载 | 100+ | npm stats |
| 规则数 | 10+ | 代码 |
| Leaderboard 项目 | 5–8 | README |
| 自己项目 dogfood | 2+ | 内部 |
| Action 采用 | 10+ repos | GitHub search |

### 8.2 产品健康（上线后持续）

| 指标 | 健康线 | 行动 |
|------|--------|------|
| Issue「误报」标签占比 | < 10% | 收紧规则 |
| CI 复跑率（30 天） | > 40% | 优化 Action UX |
| `--json` 使用占比 | > 15% | 说明工具链集成价值 |

---

## 9. 商业化路径（Post-MVP）

| 阶段 | 模式 | 说明 |
|------|------|------|
| MVP | 完全开源 MIT | 积累 Star 和用户 |
| v0.3 | Pro 规则 pack | 团队自定义规则 |
| v1.0 | SaaS Dashboard | 多 repo 监控（可选） |

MVP 阶段不考虑商业化，专注 Star + 简历。

---

## 10. 风险登记

| 风险 | 概率 | 影响 | 缓解 |
|------|------|------|------|
| React Doctor 出 Vue 版 | 中 | 高 | 加速占坑 npm + Leaderboard |
| 规则误报导致 uninstall | 中 | 高 | 保守规则 + ignore 配置 |
| vue-doctor npm 包名被占 | 低 | 中 | 备选 `@scope/vue-doctor` |
| SFC 解析边界 case | 高 | 中 | fixtures 驱动开发 |
| 15h/周进度落后 | 中 | 中 | 砍 v0.1.x 功能保核心 |

---

*关联文档：[02-feature-plan.md](./02-feature-plan.md) · [03-ai-dev-setup.md](./03-ai-dev-setup.md)*
