# 静态 Demo JSON 生成报告

生成日期：2026-05-08

## 本轮产物

新增本地脚本：

- `scripts/export_frontend_demo_data.py`
- `scripts/check_frontend_demo_data.py`

生成静态 JSON：

- `frontend/public/demo-data/service-records.json`
- `frontend/public/demo-data/kpis.json`
- `frontend/public/demo-data/analytics-summary.json`
- `frontend/public/demo-data/demo-metadata.json`

## 执行边界

本轮只使用本地 `data/processed/*.csv`。

未执行：

- 未创建 React 项目。
- 未安装依赖。
- 未接 Supabase。
- 未使用 Supabase client。
- 未读取 `.env`。
- 未读取 Supabase / Metabase / Cloudflare 凭据。
- 未访问线上数据库。
- 未增加线上服务。
- 未使用 Cloudflare Workers / R2 / Resend / Neon。

## 导出方式

`scripts/export_frontend_demo_data.py` 使用 allowlist 生成服务记录安全字段：

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

源 `service_record_id` 只用于脚本内部关联 flags。对外 JSON 使用稳定演示 ID，例如 `SR-0001`，避免展示疑似长数字标识。

付款、医疗、跟进相关字段只导出 boolean flags，不导出原文。

## 生成结果

- 服务记录数：100
- 数据范围：2026-02-03 至 2026-04-30
- 服务记录总数：100
- 未取消服务记录数：95
- 已取消服务记录数：5
- 存在费用/支付归属说明记录数：90
- 存在医疗相关备注记录数：67
- 存在后续跟进标记记录数：25

图表摘要：

- 服务类型分布：10 项
- 客户来源分布：4 项
- 月度服务趋势：3 项
- 医院 Top 10：10 项
- 科室 Top 10：10 项
- 导诊人员工作量：10 项

## 验证结果

已执行：

```text
python scripts/export_frontend_demo_data.py
python scripts/check_frontend_demo_data.py
python -m py_compile scripts/export_frontend_demo_data.py scripts/check_frontend_demo_data.py
```

结果：

- JSON 生成成功。
- 敏感字段检查通过。
- 脚本语法检查通过。
- 未发现 `active_or_uncancelled_records`。
- 未直接展示 `unknown`、`undefined`、`NaN`。

## 语义边界

- `has_payment_note` 只表示“存在费用/支付归属说明”，不表示“已支付”。
- `is_cancelled=false` 只表示“未取消服务记录”，不表示“已完成诊疗”。
- `payment_records` 不代表已支付。
- 未取消服务记录不代表临床完成。
- 图表口径为“服务记录统计”，不是医疗结论。

