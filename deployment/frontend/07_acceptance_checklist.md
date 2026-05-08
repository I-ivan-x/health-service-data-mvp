# React 静态 Demo 验收清单

## 文档完整性

- [ ] `deployment/frontend/01_frontend_demo_scope.md` 已固定 Demo 定位、范围和不做事项。
- [ ] `deployment/frontend/02_frontend_information_architecture.md` 已固定 4 页信息架构。
- [ ] `deployment/frontend/03_demo_data_contract.md` 已固定 JSON 合同。
- [ ] `deployment/frontend/04_demo_data_export_plan.md` 已固定本地导出路线。
- [ ] `deployment/frontend/05_sensitive_field_guardrails.md` 已固定敏感字段护栏。
- [ ] `deployment/frontend/06_visual_design_direction.md` 已固定视觉方向。
- [ ] `deployment/frontend/08_external_frontend_skill_audit.md` 已完成外部资源审计。
- [ ] `deployment/frontend/09_external_design_review_prompt.md` 可直接复制使用。
- [ ] `deployment/frontend/10_design_system_constraints.md` 已沉淀项目专属设计系统约束。
- [ ] `skills/health-service-demo-frontend/SKILL.md` 已创建。

## 数据合同

- [ ] React 第一版只读取 `frontend/public/demo-data/*.json`。
- [ ] `service-records.json` 只包含合同允许字段。
- [ ] `kpis.json` 只包含安全聚合 KPI。
- [ ] `analytics-summary.json` 只包含图表所需聚合数据。
- [ ] `demo-metadata.json` 记录 Demo 名称、数据范围、生成时间、禁止字段和当前边界。
- [ ] 未使用 `active_or_uncancelled_records` 字段名。
- [ ] 使用 `uncancelled_service_records` 字段名。
- [ ] 中文展示为“未取消服务记录数”。

## 敏感字段检查

- [ ] JSON 中不包含真实姓名。
- [ ] JSON 中不包含手机号。
- [ ] JSON 中不包含证件号。
- [ ] JSON 中不包含诊疗卡号。
- [ ] JSON 中不包含医疗原文。
- [ ] JSON 中不包含付款原文。
- [ ] JSON 中不包含客户备注原文。
- [ ] JSON 中不包含内部敏感备注。
- [ ] 详情抽屉不展示任何敏感原文。
- [ ] 检查失败时阻止继续发布。

## JSON 生成

- [ ] JSON 从本地 `data/processed/*.csv` 或已有安全导出文件生成。
- [ ] 导出采用 allowlist。
- [ ] 不读取 `.env`。
- [ ] 不读取 Supabase key。
- [ ] 不读取 Metabase env。
- [ ] 不读取 Cloudflare token。
- [ ] 不访问线上数据库。
- [ ] 不增加线上依赖。
- [ ] JSON 生成可重复。

## React 构建与页面

后续正式写前端后验收：

- [ ] `build` 通过。
- [ ] `typecheck` 通过。
- [ ] `lint` 通过。
- [ ] 总览页可访问。
- [ ] 运营分析页可访问。
- [ ] 服务记录页可访问。
- [ ] 数据安全与后续路线页可访问。
- [ ] React Router 刷新子页面不 404。
- [ ] 图表非空或显示明确空状态。
- [ ] 表格搜索可用。
- [ ] 表格筛选可用。
- [ ] 表格排序可用。
- [ ] 表格分页可用。
- [ ] 详情抽屉只展示允许字段和 flags。
- [ ] 移动端基本可读。
- [ ] Cloudflare Pages 可静态部署。

## 页面文案

- [ ] `has_payment_note` 只解释为“存在费用/支付归属说明”。
- [ ] `has_payment_note` 不解释为“已支付”。
- [ ] `is_cancelled=false` 只解释为“未取消服务记录”。
- [ ] `is_cancelled=false` 不解释为“已完成诊疗”。
- [ ] `payment_records` 不解释为已支付。
- [ ] 未取消服务记录不解释为临床完成。
- [ ] 不声称生产级合规。
- [ ] 不声称正式上线。
- [ ] 不声称已有真实权限系统。
- [ ] 不声称具备医疗诊断能力。
- [ ] `unknown`、`null`、`undefined`、`NaN` 不直接展示，统一显示为“待确认”。

