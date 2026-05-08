---
name: health-service-demo-frontend
description: Use when building, reviewing, or planning the React static demo for the health service data governance and operational analytics showcase. Enforces project-specific boundaries: static demo-data JSON only, no Supabase connection in v1, no backend/login/cloud services, strict allowlisted fields, sensitive-field guardrails, four-page scope, and restrained data-product visual direction.
---

# Health Service Demo Frontend

## When To Use

Use this skill for the React static Demo named “健康服务数据治理与运营分析展示台”.

It applies to planning, data contracts, JSON export design, sensitive-field checks, UI implementation, review, and visual polish for this Demo.

## Product Positioning

- React is the demand-side product showcase layer.
- React does not replace Supabase, Metabase, or Appsmith.
- The first version is a static desensitized data Demo.
- Do not present it as a production system.
- Do not claim production-grade compliance.
- Do not claim real permission control is complete.
- Do not build or imply medical diagnosis, treatment advice, or clinical decision support.

## Technical Boundary

Planned stack for the first implementation:

- Vite + React + TypeScript.
- Tailwind CSS.
- shadcn/ui.
- ECharts.
- TanStack Table.
- React Router.
- lucide-react.

Hard boundaries:

- Consume only `frontend/public/demo-data/*.json`.
- First version does not connect to Supabase.
- Do not use Supabase client.
- Do not read Supabase env.
- Do not configure Supabase keys.
- Do not create a backend.
- Do not add login.
- Do not use Cloudflare Workers, R2, Resend, Neon, backend APIs, or online services.
- Cloudflare Pages is only a static deployment target.

## Data Source Boundary

- Generate Demo JSON from local `data/processed/*.csv` or existing safe export files.
- Do not require manual database configuration.
- Do not touch secrets.
- Do not add online dependencies.
- Do not read `.env`.
- Do not read Supabase, Metabase, or Cloudflare credentials.
- Do not pull data from an online database.
- Do not export the full raw table and then remove fields.
- Use allowlists from the start.

## Data Safety Rules

Allowed service-record fields:

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

Forbidden content:

- Real names.
- Phone numbers.
- Identity document numbers.
- Medical card numbers.
- Medical notes raw text.
- Diagnosis, doctor advice, clinical process, case records, reports.
- Raw payment notes.
- Customer note raw text.
- Internal sensitive notes.
- Any personally identifying or medical raw text fields.

Semantic rules:

- `has_payment_note` means only “存在费用/支付归属说明”.
- Never interpret `has_payment_note` as “已支付”.
- `is_cancelled=false` means only “未取消服务记录”.
- Never interpret uncancelled records as clinical completion.
- Do not use `active_or_uncancelled_records`.
- Use `uncancelled_service_records`.
- Chinese display: “未取消服务记录数”.
- Do not show `unknown`, `null`, `undefined`, or `NaN`; display “待确认”.

## Page Rules

The first version has exactly 4 pages:

1. 总览页.
2. 运营分析页.
3. 服务记录页.
4. 数据安全与后续路线页.

Do not add more pages unless the project owner explicitly changes scope.

Do not build:

- A marketing website.
- A medical AI website.
- A glowing command-center dashboard.
- A production admin system.

## Visual Rules

Design for:

- Professional.
- Restrained.
- Trustworthy.
- Data-product feel.
- Information density.
- Readability.
- Credibility.
- Screenshots for stakeholder demos.

Avoid:

- Exaggerated gradients.
- Decorative hero imagery.
- Empty slogans.
- Over-animation.
- Medical-AI visual tropes.
- Marketing-site composition.
- Big-screen neon styling.

## External Skill Rules

External frontend/design skills may only help with visual review and UI polish.

They must not decide:

- Product structure.
- Page scope.
- Routes.
- Data fields.
- JSON contract.
- Metric definitions.
- Sensitive-field allowlists or blocklists.
- Security boundaries.
- Deployment architecture.
- Whether to connect Supabase.
- Whether to add backend, login, Workers, R2, Resend, Neon, or online services.

Do not install or execute unaudited external scripts.

## Acceptance Rules

Before considering the Demo ready:

- Documentation is complete.
- JSON contract is explicit.
- Sensitive-field checks pass.
- JSON generation is repeatable.
- Build, typecheck, and lint pass after frontend implementation exists.
- Charts are non-empty or have clear empty states.
- Table search, filter, sort, pagination, and detail drawer work.
- Mobile reading is acceptable.
- Detail drawer leaks no sensitive raw text.
- Copy does not overclaim production readiness, compliance, real permission control, payment status, clinical completion, or medical diagnosis.

