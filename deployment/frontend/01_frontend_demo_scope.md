# 健康服务数据治理与运营分析展示台：React 静态 Demo 范围

## 定位

“健康服务数据治理与运营分析展示台”是面向需求方的产品化展示层，用静态脱敏数据证明健康服务 Excel 大宽表可以被治理、聚合、检索和安全展示。

React 第一版是静态脱敏数据驱动的展示原型，不是 Supabase、Metabase 或 Appsmith 的替代品。

## 目标用户

- 需求方负责人：快速理解项目价值、系统边界和后续路线。
- 运营管理人员：查看服务记录统计、服务类型分布、客户来源分布、医院/科室/导诊人员工作量。
- 项目演示人员：用截图和演示页面说明 Excel 到结构化数据再到展示层的治理链路。
- 内部实施人员：基于固定数据合同准备后续 JSON 导出和敏感字段检查。

## 第一版范围

第一版固定为 4 页：

1. 总览页
   - 展示 Excel → Supabase/PostgreSQL → Metabase/Appsmith → React 的治理链路。
   - 展示核心 KPI。
   - 说明这是脱敏 Demo，不是正式系统。
   - 展示 Supabase、Metabase、Appsmith、React 的分工关系。
   - 可在页内放“模块关系图”，但不单独开页。
2. 运营分析页
   - 服务类型分布。
   - 客户来源分布。
   - 月度服务趋势。
   - 医院 Top 10。
   - 科室 Top 10。
   - 导诊人员工作量。
   - 所有图表口径统一为“服务记录统计”，不得写成医疗结论。
3. 服务记录页
   - 高级表格。
   - 搜索、筛选、排序、分页。
   - 详情抽屉。
   - 详情只展示允许字段和 flags，不展示敏感原文。
4. 数据安全与后续路线页
   - 脱敏说明。
   - 禁止展示字段。
   - 敏感信息 flags。
   - 当前 Demo 边界。
   - 后续正式系统路线。
   - 明确当前不是生产系统、不是医疗诊断系统、不是正式权限系统。

暂时不要增加更多页面。

## 不做事项

React 第一版明确不做：

- 不创建后端服务。
- 不接 Supabase。
- 不使用 Supabase client。
- 不读取 Supabase env。
- 不配置 Supabase key。
- 不接 Metabase API。
- 不读取 Metabase env。
- 不读取 Cloudflare token。
- 不做登录系统。
- 不做正式权限系统。
- 不使用 Cloudflare Workers。
- 不使用 R2。
- 不使用 Resend。
- 不使用 Neon。
- 不使用后端 API。
- 不购买域名。
- 不绑定域名。
- 不把全量原始表导出成 JSON 后再删除字段。
- 不展示真实姓名、手机号、证件号、诊疗卡号、医疗原文、付款原文、客户备注原文或内部敏感备注。
- 不声称生产级合规、正式上线、真实权限系统或医疗诊断能力已经完成。

## 与既有模块的关系

| 模块 | 当前作用 | React 第一版关系 |
| --- | --- | --- |
| Excel 原始宽表 | 原始业务数据来源 | 只作为治理链路起点展示，不直接暴露原始字段 |
| Supabase/PostgreSQL | 结构化数据底座与口径验证 | 只作为治理链路和数据口径参考，第一版不作为运行依赖 |
| Metabase | BI 看板验证 | 展示其分析分工，不调用 Metabase API |
| Appsmith | 后台查询原型 | 展示其运营后台分工，不嵌入、不调用、不替代 |
| React 静态 Demo | 需求方展示层 | 只消费 `frontend/public/demo-data/*.json` |
| Cloudflare Pages | 静态部署目标 | 仅用于静态页面托管，暂不使用 Workers/R2/域名绑定 |

## 数据路线

第一版数据来源必须是本地文件：

- 优先从 `data/processed/*.csv` 生成 `frontend/public/demo-data/*.json`。
- 也可以从已有安全导出文件生成 JSON。
- Supabase view 只作为数据口径参考，不作为第一版依赖。
- 不需要手工配置数据库连接。
- 不读取 `.env`。
- 不读取任何密钥。
- 不从线上数据库拉取数据。
- 导出必须采用 allowlist，从源头只选择允许字段。

## 演示口径

- `has_payment_note` 只能解释为“存在费用/支付归属说明”，不能解释为“已支付”。
- `is_cancelled=false` 只能解释为“未取消服务记录”，不能解释为“已完成诊疗”。
- 不使用 `active_or_uncancelled_records` 字段名，统一使用 `uncancelled_service_records`。
- 中文展示统一为“未取消服务记录数”，不得写“已完成服务数”或“有效服务数”。
- `payment_records` 不代表已支付。
- 未取消服务记录不代表临床完成。
- 前端不得展示 `unknown`、`null`、`undefined`、`NaN`，统一显示为“待确认”。

