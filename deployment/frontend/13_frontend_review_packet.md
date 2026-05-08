# 前端 Review Packet

生成日期：2026-05-08

本文件用于人工或外部模型审查当前 React 静态 Demo。当前版本不接 Supabase，不读取 `.env`，不读取任何密钥，不增加后端或线上服务，只读取 `frontend/public/demo-data/*.json`。

## 1. 当前 `frontend/` 项目结构

排除 `node_modules/` 和 `dist/` 后，当前主要文件如下：

```text
frontend/
  eslint.config.js
  index.html
  package-lock.json
  package.json
  postcss.config.js
  tailwind.config.ts
  tsconfig.app.json
  tsconfig.json
  tsconfig.node.json
  vite.config.ts
  public/
    _redirects
    demo-data/
      analytics-summary.json
      demo-metadata.json
      kpis.json
      service-records.json
  src/
    App.tsx
    index.css
    main.tsx
    types/
      lucide-react.d.ts
```

说明：

- `frontend/src/main.tsx` 是 Vite 入口。
- `frontend/src/App.tsx` 包含路由、页面、图表、表格和详情抽屉。
- `frontend/src/index.css` 包含 Tailwind 入口和项目样式。
- `frontend/public/_redirects` 用于 Cloudflare Pages SPA fallback。

## 2. `package.json` 依赖与 scripts

Scripts：

```json
{
  "dev": "vite --host 127.0.0.1",
  "build": "tsc -b && vite build",
  "typecheck": "tsc -b --noEmit",
  "lint": "eslint . --max-warnings=0",
  "preview": "vite preview --host 127.0.0.1",
  "check:data": "python ../scripts/check_frontend_demo_data.py"
}
```

运行依赖：

- `@radix-ui/react-dialog`
- `@radix-ui/react-slot`
- `@tanstack/react-table`
- `class-variance-authority`
- `clsx`
- `echarts`
- `echarts-for-react`
- `lucide-react`
- `react`
- `react-dom`
- `react-router-dom`
- `tailwind-merge`

开发依赖：

- `@eslint/js`
- `@types/react`
- `@types/react-dom`
- `@vitejs/plugin-react`
- `autoprefixer`
- `eslint`
- `eslint-plugin-react-hooks`
- `eslint-plugin-react-refresh`
- `postcss`
- `tailwindcss`
- `typescript`
- `typescript-eslint`
- `vite`

未包含：

- Supabase client。
- 后端 SDK。
- Cloudflare Workers / R2 / Resend / Neon 相关依赖。
- 登录或权限系统依赖。

## 3. 4 个路由及页面

| 路由 | 页面 | 主要内容 |
| --- | --- | --- |
| `/` | 总览页 | Demo 定位、治理链路、核心 KPI、模块关系、当前边界 |
| `/analytics` | 运营分析页 | 服务类型分布、客户来源分布、月度服务趋势、医院 Top 10、科室 Top 10、导诊人员工作量 |
| `/records` | 服务记录页 | 高级表格、搜索、筛选、排序、分页、详情抽屉 |
| `/security-roadmap` | 数据安全与后续路线页 | 允许字段、禁止字段、语义边界、后续正式系统路线 |

兜底路由：

- `*` 会重定向到 `/`。

Cloudflare Pages SPA fallback：

```text
frontend/public/_redirects
/* /index.html 200
```

## 4. `public/demo-data/*.json` 文件、字段与记录数

### `service-records.json`

结构：

```json
{
  "records": []
}
```

记录数：

- `records`: 100

服务记录字段：

- `appointment_date`
- `customer_source_label`
- `department_name`
- `guide_staff_label`
- `has_follow_up`
- `has_medical_note`
- `has_payment_note`
- `hospital_name`
- `is_cancelled`
- `service_record_id`
- `service_status_label`
- `service_type`

说明：

- `service_record_id` 为演示 ID，例如 `SR-0001`。
- 未展示真实姓名、手机号、证件号、诊疗卡号、医疗原文、付款原文、客户备注原文或内部敏感备注。

### `kpis.json`

字段：

- `cancelled_service_records`
- `data_range_end`
- `data_range_start`
- `follow_up_records`
- `records_with_medical_note`
- `records_with_payment_note`
- `total_service_records`
- `uncancelled_service_records`

当前摘要：

- 数据范围：2026-02-03 至 2026-04-30
- 服务记录总数：100
- 未取消服务记录数：95
- 已取消服务记录数：5
- 存在费用/支付归属说明记录数：90
- 存在医疗相关备注记录数：67
- 存在后续跟进标记记录数：25

### `analytics-summary.json`

字段与条目数：

- `service_type_distribution`: 10
- `customer_source_distribution`: 4
- `monthly_service_trend`: 3
- `hospital_top10`: 10
- `department_top10`: 10
- `guide_staff_workload`: 10

通用图表项字段：

- `label`
- `count`

月度趋势项字段：

- `month`
- `total_service_records`
- `uncancelled_service_records`
- `cancelled_service_records`

### `demo-metadata.json`

字段：

- `allowed_fields`
- `contract_version`
- `data_range_end`
- `data_range_start`
- `demo_boundaries`
- `demo_name`
- `generated_at`
- `prohibited_fields`
- `semantic_boundaries`
- `source_files`

用途：

- 展示 Demo 名称、合同版本、数据范围、生成时间。
- 列出允许字段、禁止字段、语义边界和当前 Demo 边界。

## 5. 数据读取方式

前端只通过 `fetch()` 读取本地静态 JSON：

```ts
fetchJson<ServiceRecordsPayload>("/demo-data/service-records.json")
fetchJson<Kpis>("/demo-data/kpis.json")
fetchJson<AnalyticsSummary>("/demo-data/analytics-summary.json")
fetchJson<DemoMetadata>("/demo-data/demo-metadata.json")
```

结论：

- 只读取 `frontend/public/demo-data/*.json`。
- 不读取 `.env`。
- 不读取 Supabase key。
- 不读取 Metabase env。
- 不读取 Cloudflare token。
- 不连接线上数据库。
- 不调用后端 API。

## 6. 图表使用的数据字段

图表组件位于 `frontend/src/App.tsx`。

| 图表 | 数据源 | 字段 |
| --- | --- | --- |
| 服务类型分布 | `analytics.service_type_distribution` | `label`, `count` |
| 客户来源分布 | `analytics.customer_source_distribution` | `label`, `count` |
| 月度服务趋势 | `analytics.monthly_service_trend` | `month`, `total_service_records`, `uncancelled_service_records`, `cancelled_service_records` |
| 导诊人员工作量 | `analytics.guide_staff_workload` | `label`, `count` |
| 医院 Top 10 | `analytics.hospital_top10` | `label`, `count` |
| 科室 Top 10 | `analytics.department_top10` | `label`, `count` |

图表语义：

- 均为“服务记录统计”。
- `uncancelled_service_records` 不代表临床完成。
- `records_with_payment_note` 不代表已支付。

## 7. 表格展示字段

服务记录页表格字段：

- `service_record_id`：记录 ID，点击打开详情抽屉。
- `appointment_date`：预约日期。
- `service_type`：服务类型。
- `service_status_label`：服务状态。
- `customer_source_label`：客户来源。
- `hospital_name`：医院。
- `department_name`：科室。
- `guide_staff_label`：导诊人员。
- `has_payment_note`：费用/支付归属说明存在性。
- `has_medical_note`：医疗备注存在性。
- `has_follow_up`：后续跟进存在性。

表格能力：

- 全局搜索。
- 服务类型筛选。
- 客户来源筛选。
- 服务状态筛选。
- 排序。
- 分页。

## 8. 详情抽屉展示字段

详情抽屉展示：

- 记录 ID。
- 预约日期。
- 服务类型。
- 服务状态。
- 客户来源。
- 医院。
- 科室。
- 导诊人员。
- `has_payment_note` flag。
- `has_medical_note` flag。
- `has_follow_up` flag。

详情抽屉不展示：

- 真实姓名。
- 手机号。
- 证件号。
- 诊疗卡号。
- 医疗原文。
- 付款原文。
- 客户备注原文。
- 内部敏感备注。

## 9. `check:data` 敏感字段检查规则

脚本：

```text
scripts/check_frontend_demo_data.py
```

检查范围：

```text
frontend/public/demo-data/*.json
```

预期文件：

- `service-records.json`
- `kpis.json`
- `analytics-summary.json`
- `demo-metadata.json`

Schema 检查：

- `service-records.json.records[]` 字段必须严格等于服务记录合同字段。
- `kpis.json` 字段必须严格等于 KPI 合同字段。
- `analytics-summary.json` 字段必须严格等于图表摘要合同字段。
- `demo-metadata.json` 字段必须严格等于 metadata 合同字段。
- 禁止 `active_or_uncancelled_records`。

字段名敏感检查：

- 英文 exact keys：`name`, `real_name`, `phone`, `mobile`, `tel`, `contact`, `id_card`, `identity`, `certificate`, `medical_card`, `patient`, `diagnosis`, `doctor_advice`, `prescription`, `medical_notes`, `note_text`, `raw_payment_note`, `payment_raw`, `report`, `internal_note`, `customer_note` 等。
- 英文字段片段：`raw_payment`, `raw_note`, `note_text`, `diagnosis`, `doctor_advice`, `medical_advice`, `treatment_process`, `condition_description`, `medical_report`, `medical_card`, `customer_note`, `internal_note`, `id_card`, `identity`, `certificate`, `phone`, `mobile`。
- 中文字段关键词：姓名、手机号、电话、联系方式、身份证、证件、诊疗卡、就诊卡、医嘱、诊断、病历、检查报告、诊疗过程、治疗过程、处方、备注原文、客户备注、内部备注、支付原文、费用原文。

值敏感检查：

- 手机号正则。
- 18 位身份证正则。
- 15 位身份证正则。
- 连续 12 位以上长数字。
- 长段医疗文本关键词。
- 原始 `unknown`、`undefined`、`NaN`。
- JSON `NaN` 常量。

metadata 中 `prohibited_fields`、`semantic_boundaries`、`demo_boundaries` 作为安全声明文本，不按普通展示值扫描。

## 10. 最新验证输出摘要

### `npm run build`

结果：

- 通过。
- `tsc -b` 通过。
- `vite build` 通过。

输出摘要：

```text
dist/index.html                 0.59 kB │ gzip:   0.41 kB
dist/assets/index-Doxfs4W8.css 15.35 kB │ gzip:   4.00 kB
dist/assets/index-5_s0xj1E.js   1,485.05 kB │ gzip: 486.07 kB
✓ built
```

### `npm run lint`

结果：

- 通过。
- `eslint . --max-warnings=0` 无报错。

### `npm run check:data`

结果：

- 通过。

输出摘要：

```text
Sensitive field check passed for D:\ix\health-service-data-mvp\frontend\public\demo-data
```

## 11. ECharts chunk size warning

存在。

`npm run build` 当前提示：

```text
(!) Some chunks are larger than 500 kB after minification.
```

原因判断：

- 当前 Demo 使用 `echarts` 和 `echarts-for-react`。
- 生产 JS chunk 约 `1,485.05 kB`，gzip 后约 `486.07 kB`。

当前处理建议：

- 静态 Demo 阶段可接受。
- 若后续需要上线优化，可考虑 ECharts 动态 import、按需注册图表组件或 Rollup manual chunks。
- 本轮不为该 warning 增加功能或改业务逻辑。

## 12. Cloudflare Pages SPA fallback

已存在：

```text
frontend/public/_redirects
```

内容：

```text
/* /index.html 200
```

作用：

- 支持 React Router 子路由刷新不 404。
- 适用于 Cloudflare Pages 静态部署。

本轮未部署 Cloudflare Pages。

## 13. 当前已知限制

- 当前是静态 Demo，不是正式系统。
- 不接 Supabase，不实时同步数据。
- 不做登录和正式权限系统。
- 不提供后端 API。
- 不声称生产级合规。
- 不声称医疗诊断能力。
- 不声称 `has_payment_note` 表示已支付。
- 不声称未取消服务记录表示临床完成。
- ECharts bundle 偏大，存在 chunk size warning。
- `lucide-react` 在当前依赖解析下使用本地声明文件 `frontend/src/types/lucide-react.d.ts`。

## 14. 后续建议

不改变当前边界的建议：

- 用外部设计 review prompt 做纯视觉审查，不让外部审查改变结构、字段、指标口径或部署路线。
- 根据审查意见只做 UI polish。
- 如准备部署，人工登录 Cloudflare Pages 并创建静态项目。
- 上线前可考虑优化 ECharts chunk，但不应引入后端或线上服务。

需要继续禁止：

- 不接 Supabase。
- 不读取 `.env`。
- 不碰密钥。
- 不增加后端。
- 不增加线上服务。
- 不改变静态 JSON 路线。

## 15. 外部审查文件路径清单

前端工程：

- `D:\ix\health-service-data-mvp\frontend\package.json`
- `D:\ix\health-service-data-mvp\frontend\vite.config.ts`
- `D:\ix\health-service-data-mvp\frontend\index.html`
- `D:\ix\health-service-data-mvp\frontend\src\main.tsx`
- `D:\ix\health-service-data-mvp\frontend\src\App.tsx`
- `D:\ix\health-service-data-mvp\frontend\src\index.css`
- `D:\ix\health-service-data-mvp\frontend\src\types\lucide-react.d.ts`

静态数据：

- `D:\ix\health-service-data-mvp\frontend\public\demo-data\analytics-summary.json`
- `D:\ix\health-service-data-mvp\frontend\public\demo-data\demo-metadata.json`
- `D:\ix\health-service-data-mvp\frontend\public\demo-data\kpis.json`
- `D:\ix\health-service-data-mvp\frontend\public\demo-data\service-records.json`

数据生成与检查脚本：

- `D:\ix\health-service-data-mvp\scripts\export_frontend_demo_data.py`
- `D:\ix\health-service-data-mvp\scripts\check_frontend_demo_data.py`

文档：

- `D:\ix\health-service-data-mvp\deployment\frontend\12_frontend_implementation_report.md`
- `D:\ix\health-service-data-mvp\deployment\frontend\13_frontend_review_packet.md`

