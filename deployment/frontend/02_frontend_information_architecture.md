# React 静态 Demo 信息架构

## 页面与导航

第一版只保留 4 个主导航项：

| 导航名称 | 建议路径 | 页面目标 |
| --- | --- | --- |
| 总览 | `/` | 解释治理链路、模块分工、核心 KPI 和 Demo 边界 |
| 运营分析 | `/analytics` | 用服务记录统计展示运营分布与趋势 |
| 服务记录 | `/records` | 检索、筛选、查看安全字段和 flags |
| 数据安全与后续路线 | `/security-roadmap` | 说明脱敏、安全边界、禁止字段和未来路线 |

路径只是信息架构建议，不代表本轮创建路由或页面代码。

## 总览页

必须展示：

- Demo 名称：健康服务数据治理与运营分析展示台。
- 静态脱敏 Demo 提示。
- Excel → Supabase/PostgreSQL → Metabase/Appsmith → React 的治理链路。
- Supabase、Metabase、Appsmith、React 的分工关系。
- 核心 KPI，口径来自 `kpis.json`。
- “未取消服务记录数”指标，字段名统一为 `uncancelled_service_records`。
- 当前 Demo 不接 Supabase、不接后端、不做登录的说明。

可以展示：

- 模块关系图区块。
- 数据范围、生成时间、数据合同版本。
- 本地静态 JSON 数据来源说明。

禁止展示：

- 真实身份字段。
- 医疗原文。
- 付款原文。
- 客户备注原文。
- “已完成诊疗”“已支付”“生产级合规”“正式上线”等夸大表述。

## 运营分析页

必须展示：

- 服务类型分布。
- 客户来源分布。
- 月度服务趋势。
- 医院 Top 10。
- 科室 Top 10。
- 导诊人员工作量。
- 所有图表标题、图例和说明均使用“服务记录统计”语义。

禁止展示：

- 任何医疗诊断结论。
- 医嘱、病历、检查报告或诊疗过程。
- 单个客户身份。
- 用 `has_payment_note` 推断已支付。
- 用 `is_cancelled=false` 推断临床完成。

## 服务记录页

必须展示：

- 高级表格。
- 搜索。
- 筛选。
- 排序。
- 分页。
- 详情抽屉。
- 安全字段：`service_record_id`、`appointment_date`、`service_type`、`service_status_label`、`customer_source_label`、`hospital_name`、`department_name`、`guide_staff_label`、`is_cancelled`。
- flags：`has_payment_note`、`has_medical_note`、`has_follow_up`。
- 空值统一展示为“待确认”。

详情抽屉只能展示：

- 合同允许字段。
- flags。
- 语义边界说明。

禁止展示：

- 真实姓名。
- 手机号。
- 证件号。
- 诊疗卡号。
- `medical_notes` 原文。
- 诊疗过程。
- 医嘱。
- 病历检查报告。
- `raw_payment_note`。
- 客户备注原文。
- 内部敏感备注。
- `note_text`。
- `diagnosis`。
- `doctor_advice`。
- `report`。
- `payment raw text`。
- 任何可识别个人身份或医疗原文的字段。

## 数据安全与后续路线页

必须展示：

- 第一版只消费 `frontend/public/demo-data/*.json`。
- 数据从 `data/processed/*.csv` 或已有安全导出文件生成。
- 导出采用 allowlist。
- 禁止字段清单。
- 敏感信息 flags 的含义。
- 当前 Demo 边界。
- 后续正式系统才可能切换 Supabase 安全 view 或后端 API。
- 当前不是生产系统、不是医疗诊断系统、不是正式权限系统。

禁止展示：

- 密钥配置方式。
- 线上数据库连接方式。
- Supabase key、Metabase env、Cloudflare token。
- 任何暗示当前已具备正式生产合规或真实权限能力的内容。

## 页面关系

- 总览页负责建立“为什么做”和“各模块怎么分工”。
- 运营分析页负责说明“治理后的数据能支持哪些服务记录统计”。
- 服务记录页负责说明“安全字段可以被检索、筛选、查看详情”。
- 数据安全与后续路线页负责说明“哪些内容不能展示、当前边界在哪里、未来怎么正式化”。

四页共享同一静态 JSON 数据目录，但各页面只能读取自己所需的合同文件，不应扩大字段范围。

