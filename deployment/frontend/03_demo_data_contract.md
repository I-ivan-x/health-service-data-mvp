# React 静态 Demo 数据合同

## 数据目录

React 第一版只消费静态 JSON：

```text
frontend/public/demo-data/*.json
```

第一版建议文件：

```text
frontend/public/demo-data/service-records.json
frontend/public/demo-data/kpis.json
frontend/public/demo-data/analytics-summary.json
frontend/public/demo-data/demo-metadata.json
```

本文档固定 JSON 合同；后续导出脚本和前端实现都必须遵守本合同。

## 共同规则

- JSON 必须由本地 `data/processed/*.csv` 或已有安全导出文件生成。
- 暂不连接 Supabase。
- Supabase view 只作为数据口径参考，不作为第一版依赖。
- 不读取 `.env`。
- 不读取 Supabase key。
- 不读取 Metabase env。
- 不读取 Cloudflare token。
- 不增加线上依赖。
- 不从线上数据库拉取数据。
- 不把全量原始表导出成 JSON 后再删除字段。
- 必须采用 allowlist，从源头只选择允许字段。
- JSON 中不得出现 `NaN`。
- 前端不得展示 `unknown`、`null`、`undefined`、`NaN`，统一显示为“待确认”。

## `service-records.json`

用途：服务记录表格、筛选、排序、分页和详情抽屉。

建议结构：

```json
{
  "records": []
}
```

允许字段：

| 字段名 | 类型 | 含义 | 展示规则 |
| --- | --- | --- | --- |
| `service_record_id` | `string` | 服务记录 ID，不含真实身份信息 | 必须展示 |
| `appointment_date` | `string \| null` | 预约或服务记录日期，建议 `YYYY-MM-DD` | 空值显示“待确认” |
| `service_type` | `string` | 服务类型标签 | 空值显示“待确认” |
| `service_status_label` | `string` | 服务状态标签 | 空值显示“待确认” |
| `customer_source_label` | `string` | 客户来源标签 | 空值显示“待确认” |
| `hospital_name` | `string` | 医院名称标签 | 空值显示“待确认” |
| `department_name` | `string` | 科室名称标签 | 空值显示“待确认” |
| `guide_staff_label` | `string` | 导诊人员脱敏标签 | 空值显示“待确认” |
| `is_cancelled` | `boolean` | 是否取消服务记录 | `false` 只能解释为“未取消服务记录” |
| `has_payment_note` | `boolean` | 是否存在费用/支付归属说明 | 不能解释为“已支付” |
| `has_medical_note` | `boolean` | 是否存在医疗相关备注 | 不展示原文 |
| `has_follow_up` | `boolean` | 是否存在后续跟进标记 | 不展示原文 |

不得新增敏感字段。新增非敏感字段必须先更新本文档、导出 allowlist 和敏感字段检查规则。

## `kpis.json`

用途：总览页核心 KPI。

建议结构：

```json
{
  "data_range_start": null,
  "data_range_end": null,
  "total_service_records": 0,
  "uncancelled_service_records": 0,
  "cancelled_service_records": 0,
  "records_with_payment_note": 0,
  "records_with_medical_note": 0,
  "follow_up_records": 0
}
```

字段说明：

| 字段名 | 类型 | 含义 | 口径边界 |
| --- | --- | --- | --- |
| `data_range_start` | `string \| null` | 数据范围开始日期 | 空值显示“待确认” |
| `data_range_end` | `string \| null` | 数据范围结束日期 | 空值显示“待确认” |
| `total_service_records` | `number` | 服务记录总数 | 记录数，不代表客户数 |
| `uncancelled_service_records` | `number` | 未取消服务记录数 | 不代表临床完成 |
| `cancelled_service_records` | `number` | 已取消服务记录数 | 只代表取消标记 |
| `records_with_payment_note` | `number` | 存在费用/支付归属说明的记录数 | 不代表已支付 |
| `records_with_medical_note` | `number` | 存在医疗相关备注的记录数 | 不展示医疗原文 |
| `follow_up_records` | `number` | 存在后续跟进标记的记录数 | 不展示跟进原文 |

禁止使用字段名 `active_or_uncancelled_records`。

## `analytics-summary.json`

用途：运营分析页图表。

建议结构：

```json
{
  "service_type_distribution": [],
  "customer_source_distribution": [],
  "monthly_service_trend": [],
  "hospital_top10": [],
  "department_top10": [],
  "guide_staff_workload": []
}
```

通用聚合项：

| 字段名 | 类型 | 含义 |
| --- | --- | --- |
| `label` | `string` | 分类标签，空值统一为“待确认” |
| `count` | `number` | 服务记录统计数 |

月度趋势项：

| 字段名 | 类型 | 含义 |
| --- | --- | --- |
| `month` | `string` | 月份，建议 `YYYY-MM` |
| `total_service_records` | `number` | 当月服务记录数 |
| `uncancelled_service_records` | `number` | 当月未取消服务记录数 |
| `cancelled_service_records` | `number` | 当月已取消服务记录数 |

所有图表标题和 tooltip 必须表达为“服务记录统计”，不能表达为医疗结论。

## `demo-metadata.json`

用途：展示 Demo 元信息、数据边界和安全声明。

建议结构：

```json
{
  "demo_name": "健康服务数据治理与运营分析展示台",
  "contract_version": "v1",
  "generated_at": null,
  "data_range_start": null,
  "data_range_end": null,
  "source_files": [],
  "allowed_fields": [],
  "prohibited_fields": [],
  "semantic_boundaries": [],
  "demo_boundaries": []
}
```

字段说明：

| 字段名 | 类型 | 含义 |
| --- | --- | --- |
| `demo_name` | `string` | Demo 名称 |
| `contract_version` | `string` | 数据合同版本 |
| `generated_at` | `string \| null` | JSON 生成时间 |
| `data_range_start` | `string \| null` | 数据范围开始日期 |
| `data_range_end` | `string \| null` | 数据范围结束日期 |
| `source_files` | `string[]` | 本地来源文件列表，不含密钥路径 |
| `allowed_fields` | `string[]` | 允许字段列表 |
| `prohibited_fields` | `string[]` | 禁止字段列表 |
| `semantic_boundaries` | `string[]` | 指标语义边界 |
| `demo_boundaries` | `string[]` | 当前 Demo 边界 |

## 允许字段清单

第一版服务记录级 JSON 只允许以下字段：

- `service_record_id`
- `appointment_date`
- `service_type`
- `service_status_label`
- `customer_source_label`
- `hospital_name`
- `department_name`
- `guide_staff_label`
- `is_cancelled`
- `has_payment_note`
- `has_medical_note`
- `has_follow_up`

## 禁止字段清单

禁止进入 `frontend/public/demo-data/*.json`：

- 真实姓名
- 手机号
- 证件号
- 诊疗卡号
- `medical_notes` 原文
- 诊疗过程
- 医嘱
- 病历检查报告
- `raw_payment_note`
- 客户备注原文
- 内部敏感备注
- `note_text`
- `diagnosis`
- `doctor_advice`
- `report`
- `payment raw text`
- 任何可识别个人身份或医疗原文的字段

## 语义边界

- `has_payment_note=true` 只能解释为“存在费用/支付归属说明”。
- `has_payment_note=false` 只能解释为“不存在可展示的费用/支付归属说明标记”。
- `has_payment_note` 不能解释为“已支付”或“未支付”。
- `is_cancelled=false` 只能解释为“未取消服务记录”。
- `is_cancelled=false` 不能解释为“已完成诊疗”。
- `payment_records` 不代表已支付。
- 未取消服务记录不代表临床完成。
- `has_medical_note` 只表示存在医疗相关备注标记，不允许展示或推断原文内容。
