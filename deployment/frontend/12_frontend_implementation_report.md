# React 静态展示台实现报告

生成日期：2026-05-08

## 本轮目标

修复 Vite dev server 空白页问题：

```text
Failed to load url /src/main.tsx (resolved id: /src/main.tsx). Does the file exist?
```

实际检查结果：`frontend/index.html` 已引用 `/src/main.tsx`，但 `frontend/src/` 不存在。

## 新增前端入口

新增：

- `frontend/src/main.tsx`
- `frontend/src/App.tsx`
- `frontend/src/index.css`
- `frontend/src/types/lucide-react.d.ts`

保留并使用：

- `frontend/index.html`
- `frontend/public/demo-data/*.json`
- `frontend/public/_redirects`

## 实现范围

已实现 4 页静态展示台：

1. 总览页
2. 运营分析页
3. 服务记录页
4. 数据安全与后续路线页

已实现：

- 只通过 `fetch("/demo-data/*.json")` 读取本地静态 JSON。
- KPI 展示。
- ECharts 图表。
- TanStack Table 服务记录表格。
- 搜索、筛选、排序、分页。
- 服务记录详情抽屉。
- Cloudflare Pages 子路由刷新 `_redirects`。

## 边界确认

本轮未做：

- 未接 Supabase。
- 未使用 Supabase client。
- 未读取 `.env`。
- 未读取 Supabase / Metabase / Cloudflare 凭据。
- 未增加后端。
- 未增加登录系统。
- 未使用 Workers / R2 / Resend / Neon。
- 未读取线上数据库。

## 验证结果

已执行：

```text
npm run build
npm run lint
npm run check:data
```

结果：

- build 通过。
- lint 通过。
- 静态 JSON 敏感字段检查通过。
- Vite dev server 已在 `http://127.0.0.1:5173/` 启动。
- HTTP 检查 `/`、`/src/main.tsx`、`/demo-data/kpis.json`、`/security-roadmap` 均返回 200。
- Playwright 桌面渲染检查通过，4 个路由可访问，详情抽屉可打开，控制台无错误。
- Playwright 移动端服务记录页渲染检查通过，控制台无错误。

## 已知提示

`npm run build` 会提示 ECharts 相关 chunk 超过 500 kB。当前为静态 Demo，可接受；后续上线前可以按需对 ECharts 做动态 import 或手工分包。

