# Cloudflare Pages 静态部署说明

生成日期：2026-05-08

本说明用于人工登录 Cloudflare Pages 后创建项目。当前阶段不由 Codex 自动部署，因为首次 Cloudflare 授权和 Pages 项目创建需要人工介入。

## 1. 当前部署方式

- 部署平台：Cloudflare Pages 静态部署。
- 构建目录：`frontend/`。
- 构建产物目录：`frontend/dist`。
- 不使用 Cloudflare Workers。
- 不使用 R2。
- 不使用环境变量。
- 不绑定自定义域名。
- 不接 Supabase。
- 不配置后端 API。
- 不使用 Resend / Neon / 其他线上服务。
- 前端只读取 `frontend/public/demo-data/*.json`，构建后对应为 `/demo-data/*.json`。

## 2. Cloudflare Pages 推荐配置

| 配置项 | 推荐值 |
| --- | --- |
| Project root / Root directory | `frontend` |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Environment variables | 不需要配置 |
| Framework preset | `Vite` 或 `None / Vite` |
| Node version | 先不配置；如 Cloudflare 默认构建失败，再按日志补充 `NODE_VERSION` |

注意：

- 不要配置 Supabase key。
- 不要配置 Metabase env。
- 不要配置 Cloudflare token 到项目环境变量。
- 不要新增后端 API。

## 3. 人工操作步骤

1. 登录 Cloudflare Dashboard。
2. 进入 `Workers & Pages`。
3. 进入 `Pages`。
4. 点击 `Create application` 或 `Create a project`。
5. 选择 Pages 创建方式：
   - 推荐：连接 Git 仓库。
   - 可选：上传静态构建产物。
6. 如果连接 Git 仓库：
   - 选择当前项目仓库。
   - Root directory 填 `frontend`。
   - Build command 填 `npm run build`。
   - Build output directory 填 `dist`。
   - Framework preset 选择 `Vite`，或保持 `None / Vite`。
   - Environment variables 不添加任何内容。
7. 点击 `Save and Deploy`。
8. 部署完成后访问 Cloudflare Pages 自动生成的 `pages.dev` 默认域名。
9. 分别测试：
   - `/`
   - `/analytics`
   - `/records`
   - `/security-roadmap`
10. 在每个子路由刷新页面，确认不 404。

## 4. 部署后人工检查清单

- [ ] 首页可打开。
- [ ] `/analytics` 可打开。
- [ ] `/records` 可打开。
- [ ] `/security-roadmap` 可打开。
- [ ] 子路由刷新不 404。
- [ ] 图表非空。
- [ ] 服务记录表格可用。
- [ ] 搜索、筛选、排序、分页可用。
- [ ] 详情抽屉可打开。
- [ ] 移动端基本可读。
- [ ] 页面无敏感字段。
- [ ] 页面无“已支付”“付款完成”“支付成功”“收款完成”等误导表述。
- [ ] 页面无“已完成诊疗”“已完成服务”等误导表述。
- [ ] 无 Supabase 网络请求。
- [ ] 无后端 API 网络请求。
- [ ] DevTools Network 中只应看到静态资源和 `/demo-data/*.json`。

## 5. 常见问题

### 子路由刷新 404

检查 `_redirects` 是否进入 `dist` 根目录。

本地构建后应存在：

```text
frontend/dist/_redirects
```

内容应为：

```text
/* /index.html 200
```

### build 失败

检查：

- Cloudflare Pages 是否使用 `frontend` 作为 Root directory。
- Cloudflare 构建日志是否能找到 `frontend/package.json`。
- Node/npm 版本是否满足 Vite 构建要求。
- `npm install` 是否成功。

如默认 Node 版本构建失败，再按日志补充 `NODE_VERSION`。

### 图表不显示

检查：

- `/demo-data/analytics-summary.json` 是否加载成功。
- 浏览器 DevTools Console 是否有 JS error。
- DevTools Network 中 JSON 是否返回 200。

### 页面空白

检查：

- 浏览器 Console。
- `dist/assets/*.js` 是否加载成功。
- `dist/assets/*.css` 是否加载成功。
- `index.html` 是否引用正确的构建后 assets。

### 找不到 `package.json`

通常是 Cloudflare Pages 没有把 Root directory 设置为 `frontend`。请回到 Pages 项目构建设置，确认 Root directory 为：

```text
frontend
```

