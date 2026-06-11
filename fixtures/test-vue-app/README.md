# test-vue-app

独立的 Vue 3 + Vite 示例项目，用于验证 `vue-doctor` CLI 与 GitHub Action PR 增量扫描。

与 `bad-project` / `good-project` 不同：这里是完整的可运行 Vue 应用结构（`index.html`、`vite.config.ts`、`main.ts`）。

## 本地扫描

```bash
pnpm build
node packages/cli/dist/index.js fixtures/test-vue-app
```

## PR workflow 测试

1. 修改本目录下的 `.vue` 文件（例如引入新的 rule 违规）
2. 开 PR 到 `main`
3. Action 仅扫描 `fixtures/test-vue-app`，并与 merge-base 对比只报告**新增 issue**

`Checkout.vue` 含故意违规（v-for 无 key），用于 PR diff 测试。
