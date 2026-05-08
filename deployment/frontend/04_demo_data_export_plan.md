# 静态 Demo JSON 导出计划

## 目标

后续生成以下静态文件，供 React 第一版读取：

```text
frontend/public/demo-data/service-records.json
frontend/public/demo-data/kpis.json
frontend/public/demo-data/analytics-summary.json
frontend/public/demo-data/demo-metadata.json
```

当前导出脚本为 `scripts/export_frontend_demo_data.py`，只使用 Python 标准库读取本地 CSV，并按 allowlist 生成静态 JSON。

## 数据来源

第一版优先来源：

- `data/processed/*.csv`
- 已有安全导出文件

第一版不使用：

- Supabase 连接。
- Supabase client。
- Supabase env。
- Supabase key。
- Metabase env。
- Cloudflare token。
- 线上数据库。
- 后端 API。

Supabase view 可以作为字段口径和聚合口径参考，但不能成为第一版运行依赖。

## 导出原则

必须采用 allowlist：

1. 从源头读取本地 CSV 或安全导出文件。
2. 只选择 `03_demo_data_contract.md` 中允许的字段。
3. 不读取禁止字段。
4. 不把全量原始表导出成 JSON 后再删除字段。
5. 对标签字段做空值归一化：`unknown`、空字符串、`null`、`undefined`、`NaN` 对外显示为“待确认”。
6. 对日期字段保留可解释日期；无法确认时由前端显示“待确认”。
7. 对 flags 只输出 boolean，不输出原文。
8. 对 KPI 和图表只输出聚合后的安全数据。

## 计划中的导出步骤

导出脚本分为 4 步：

1. 读取本地 CSV 或已有安全导出文件。
2. 应用字段 allowlist，生成安全服务记录数组。
3. 从安全服务记录数组聚合 KPI 和图表摘要。
4. 生成 metadata，记录合同版本、生成时间、来源文件和边界声明。

导出脚本默认在本地运行，不访问网络，不读取 `.env`，不读取密钥。

## 文件生成职责

| 输出文件 | 来源 | 生成方式 |
| --- | --- | --- |
| `service-records.json` | 本地 CSV 或已有安全导出 | allowlist 选择服务记录安全字段 |
| `kpis.json` | 安全服务记录数组 | 本地聚合服务记录统计 |
| `analytics-summary.json` | 安全服务记录数组 | 本地聚合图表摘要 |
| `demo-metadata.json` | 导出上下文和合同 | 写入生成时间、范围、允许/禁止字段、边界说明 |

## 失败处理

导出阶段发现以下情况时必须失败，不应生成可用 JSON：

- 输入文件不存在。
- allowlist 字段缺失且无法安全推导。
- 输出 JSON 中出现禁止字段名。
- 输出 JSON 中出现疑似手机号、身份证、诊疗卡号。
- 输出 JSON 中出现长段医疗原文或付款原文。
- 数值字段出现 `NaN`。
- 标签字段输出 `unknown`、`undefined` 或空字符串。

失败后应输出本地报告，说明触发原因和字段位置；报告不得包含敏感原文。

## 未来正式化路线

如果未来从静态 Demo 进入正式系统，才可能考虑：

- 使用 Supabase 安全 view。
- 通过后端 API 输出脱敏数据。
- 引入正式权限系统。
- 引入审计日志。
- 引入正式合规流程。

这些都不属于 React 第一版。
