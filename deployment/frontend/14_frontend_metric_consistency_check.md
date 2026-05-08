# 前端指标口径一致性核查

生成日期：2026-05-08

本轮只做本地文件核查。未接 Supabase，未读取 `.env`，未读取任何密钥，未访问线上服务，未修改静态 JSON。

## 核查对象

React 静态 Demo：

- 文件：`frontend/public/demo-data/kpis.json`
- 指标：`records_with_payment_note`
- 当前值：90

Metabase：

- 问题名：`q_mb_payment_note_count`
- 已知显示值：9

## React `records_with_payment_note` 计算方式

来源脚本：

```text
scripts/export_frontend_demo_data.py
```

脚本逻辑：

1. 读取本地 `data/processed/payment_records.csv`。
2. 对每条 payment record 检查以下字段是否存在任一非空值：
   - `raw_payment_note`
   - `settlement_note`
   - `doctor_payment_note`
   - `customer_payment_amount`
   - `payer_type`
   - `billing_project`
   - `payment_method_category`
3. 如果存在任一非空值，则把该行的 `service_record_id` 加入 `payment_flags`。
4. 生成 `service-records.json` 时，如果服务记录源 ID 在 `payment_flags` 中，则输出：

```json
{
  "has_payment_note": true
}
```

5. 生成 `kpis.json` 时统计：

```python
"records_with_payment_note": sum(1 for record in records if record["has_payment_note"])
```

本地复算结果：

- `payment_records.csv` 行数：90
- 命中任一费用/支付归属上下文字段的 payment rows：90
- 命中的 distinct `service_record_id`：90
- `frontend/public/demo-data/service-records.json` 中 `has_payment_note=true`：90
- `frontend/public/demo-data/kpis.json` 中 `records_with_payment_note`：90

字段非空分布：

| 字段 | 非空行数 |
| --- | ---: |
| `raw_payment_note` | 90 |
| `settlement_note` | 90 |
| `doctor_payment_note` | 5 |
| `customer_payment_amount` | 9 |
| `payer_type` | 90 |
| `billing_project` | 90 |
| `payment_method_category` | 90 |

注意：React 只输出 boolean flag，不输出 `raw_payment_note`、`settlement_note`、`doctor_payment_note` 或任何付款原文。

## Metabase `q_mb_payment_note_count` 计算方式

来源文件：

```text
deployment/metabase/dashboard_diagnostic_snapshot.json
```

对应 SQL：

```sql
select count(*) filter (where has_payment_amount)::integer as payment_summary_records
from vw_service_summary;
```

样例结果：

```text
9
```

`has_payment_amount` 的来源：

```text
database/03_views.sql
```

定义：

```sql
(pr.customer_payment_amount is not null) as has_payment_amount
```

本地 CSV 复算结果：

- `data/processed/payment_records.csv` 中 `customer_payment_amount` 非空行数：9
- distinct `service_record_id`：9

另外，`deployment/metabase/12_fix_dashboard_questions_api.py` 已将该问题标题修正为：

```text
有客户支付金额记录数
```

并将描述修正为：

```text
统计有客户支付金额的记录数，不代表已支付记录数。
```

## 二者是否为同一口径

不是同一口径。

| 指标 | 统计对象 | 判断条件 | 当前值 | 语义 |
| --- | --- | --- | ---: | --- |
| React `records_with_payment_note` | 服务记录 | 关联 payment record 中存在任一费用/支付归属上下文字段 | 90 | 存在费用/支付归属信息或说明 |
| Metabase `q_mb_payment_note_count` | 服务记录 | `customer_payment_amount is not null` | 9 | 有客户支付金额记录 |

React 指标是更宽的“费用/支付归属信息存在性”口径。Metabase 指标是更窄的“客户支付金额字段非空”口径。

二者都不能解释为“已支付”。

## 是否可比

不可直接比较。

原因：

- React 的 90 包含 `raw_payment_note`、`settlement_note`、`payer_type`、`billing_project`、`payment_method_category` 等费用/支付归属上下文字段存在性。
- Metabase 的 9 只统计 `customer_payment_amount` 非空。
- React 指标回答“是否存在可归类的费用/支付归属信息”。
- Metabase 指标回答“是否录入客户支付金额字段”。

如果演示时同时提到两者，需要明确说它们是不同层级的字段完整性指标。

## 是否需要调整 React 文案

建议轻微调整，但不建议本轮改代码。

当前 React 文案：

```text
存在费用/支付归属说明
不代表已支付
```

该文案安全，不会把 `has_payment_note` 解释成“已支付”。但“说明”容易让人误以为只统计备注说明字段，而实际 React 的口径还包括 `payer_type`、`billing_project`、`payment_method_category`、`customer_payment_amount` 等结构化费用/支付归属上下文字段。

建议后续 UI polish 时改为：

```text
存在费用/支付归属信息
```

或更完整：

```text
存在费用/支付归属信息记录数
```

保留辅助说明：

```text
不代表已支付
```

服务记录表格列名也可从：

```text
费用/支付归属说明
```

轻微调整为：

```text
费用/支付归属信息
```

## 是否需要调整 `demo-metadata.json` 的 `semantic_boundaries`

不强制需要。

当前语义边界：

```text
has_payment_note 只能解释为存在费用/支付归属说明，不能解释为已支付。
```

安全性是正确的。若后续要避免与 Metabase “有客户支付金额记录数”混淆，可以在下一次生成 JSON 时增强为：

```text
has_payment_note 只能解释为存在费用/支付归属信息或说明，包含结构化归属字段存在性，不能解释为已支付；它不同于 customer_payment_amount 非空统计。
```

本轮不修改 JSON。

## 是否需要重新生成 JSON

不需要。

理由：

- 当前 JSON 与导出脚本一致。
- 当前 `records_with_payment_note=90` 可追溯到本地 `payment_records.csv`。
- 敏感字段没有输出到 JSON。
- 指标语义边界已经明确“不代表已支付”。
- 二者口径不同，但不是数据错误。

## 结论

React 的 `records_with_payment_note=90` 和 Metabase 的 `q_mb_payment_note_count=9` 不是同一口径，不应强行统一。

部署前建议：

- 保持当前 JSON。
- 不修改指标数值。
- 后续轻微调整 React 文案，将“费用/支付归属说明”改成“费用/支付归属信息”，以减少与“客户支付金额记录数”的混淆。
- 继续严禁把 `has_payment_note` 解释为“已支付”。

