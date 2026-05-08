# 外部前端/设计类 skills 审计

## 审计结论

本轮只做公开资源的只读审计，不安装、不执行、不让外部 skill 修改代码。

审计日期：2026-05-08。

可借鉴方向：

- Anthropic 官方 `frontend-design`：可作为视觉层级、反模板化、UI polish 的审稿参考。
- mblode `ui-audit`、`typography-audit`：可在后续前端完成后作为视觉和排版审查参考。
- VoltAgent `awesome-claude-design` / DESIGN.md：可参考“设计系统文档如何组织”，但不能复制品牌风格。

只能参考、不能安装执行：

- ComposioHQ `artifacts-builder` / `web-artifacts-builder`。
- ComposioHQ `webapp-testing`。
- Anthropic `webapp-testing`。
- kesslerio `ultimate-frontend-design-openclaw-skill`。

不建议用于当前项目第一版：

- 会初始化项目、安装依赖、执行脚本、切换到 Next.js/Vercel、或生成营销页/大屏风格的外部 skill。
- 会读取 `.env`、连接线上服务、接触 Supabase/Metabase/Cloudflare 凭据、修改部署架构的外部 skill。

正式采用任何外部资源前，仍需人工复核最新内容、许可证和脚本清单。

## 公开来源

- Anthropic skills repo: https://github.com/anthropics/skills
- Anthropic `frontend-design`: https://github.com/anthropics/skills/tree/main/skills/frontend-design
- Anthropic `webapp-testing`: https://github.com/anthropics/skills/tree/main/skills/webapp-testing
- ComposioHQ `awesome-claude-skills`: https://github.com/ComposioHQ/awesome-claude-skills
- ComposioHQ `artifacts-builder`: https://github.com/ComposioHQ/awesome-claude-skills/tree/master/artifacts-builder
- VoltAgent `awesome-claude-design`: https://github.com/VoltAgent/awesome-claude-design
- VoltAgent `awesome-design-md` 关联资源: https://github.com/VoltAgent/awesome-design-md
- kesslerio `ultimate-frontend-design-openclaw-skill`: https://github.com/kesslerio/ultimate-frontend-design-openclaw-skill
- mblode `agent-skills`: https://github.com/mblode/agent-skills

## 审计表

| 名称 | 来源 | 用途 | 是否适合本项目 | 是否包含脚本 | 是否包含安装命令 | 是否可能修改项目结构 | 是否可能引入未知依赖 | 是否可能接触敏感文件 | 许可证 | 推荐使用方式 | 不适合本项目的部分 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Anthropic 官方 `frontend-design` | `anthropics/skills` | 前端视觉方向、排版、空间、反模板化审查 | 适合，但仅限纯视觉审稿和 UI polish | 当前公开目录主要为 `SKILL.md` 和 `LICENSE.txt` | 是，官方页面提供安装方式 | 若直接使用可能生成/修改页面代码 | 低到中，取决于是否安装和执行 | 如果允许读仓库，可能误读非前端文件 | Apache-2.0 | 只把截图、页面描述和本项目约束交给它做审稿，不给它决定结构或字段 | 其“大胆美学”倾向可能过度营销化、过度视觉化，不应决定信息架构 |
| Anthropic `webapp-testing` | `anthropics/skills` | 用 Playwright 检查本地 Web 应用 | 后续可用于前端完成后的浏览器验证，本轮不使用 | 是，含 examples/scripts | 是 | 可能创建测试脚本或启动服务 | 中，可能依赖 Playwright/Python 环境 | 如果测试范围过宽，可能读取页面外文件 | Apache-2.0 | 后续只用于本地已生成静态 Demo 的截图、路由刷新、表格交互检查 | 本轮无前端代码，不应使用；它不是视觉设计 skill |
| ComposioHQ `artifacts-builder` / `web-artifacts-builder` | `ComposioHQ/awesome-claude-skills` | 初始化 React/Tailwind/shadcn artifact 并打包 HTML | 当前不适合 | 是，含 `init-artifact.sh`、`bundle-artifact.sh` | 是 | 高，会初始化前端项目和生成代码 | 高，会安装 bundling 依赖 | 中，脚本执行范围需审计 | Apache-2.0 | 仅可阅读其反模板化提示，禁止安装和执行 | 与本轮“不创建 React 项目、不安装依赖、不执行脚本”直接冲突 |
| ComposioHQ `webapp-testing` | `ComposioHQ/awesome-claude-skills` | 用 Playwright 和 server helper 测试本地 Web 应用 | 后续可参考，不适合本轮 | 是，含 server helper | 是 | 可能新增测试脚本 | 中 | 中 | Apache-2.0 | 后续可参考“先截图再检查交互”的流程 | 本轮无前端可测，且不能执行外部脚本 |
| ComposioHQ 中的 `frontend-design` 相关资源 | `ComposioHQ/awesome-claude-skills` | 公开清单中未确认独立同名目录，需后续人工确认 | 暂不采用 | 未确认 | 未确认 | 未确认 | 未确认 | 未确认 | 需人工确认 | 不安装、不执行；若找到资源，只能纳入视觉审稿 | 来源、内容、许可证和脚本清单未完成确认前不使用 |
| VoltAgent `awesome-claude-design` DESIGN.md | `VoltAgent/awesome-claude-design` | 设计系统文档灵感、色彩/排版/组件分层参考 | 适合参考，不适合直接套用 | 当前公开页面显示主要为 README/LICENSE | 无强制安装命令，但会引导上传 DESIGN.md 到 Claude Design | 若直接使用，可能生成完整 UI kit | 中，取决于下游工具 | 低到中，取决于输入文件 | MIT | 只参考“如何描述视觉规则”和“数据产品设计系统结构” | 不复制品牌风格，不上传项目敏感文件，不让其决定产品结构 |
| VoltAgent `awesome-design-md` 关联资源 | `VoltAgent/awesome-design-md` | 公开品牌 DESIGN.md 集合、设计 token 文档参考 | 只能参考 | 当前仓库含 DESIGN.md/preview 类资源 | 无本项目必需安装命令 | 可能诱导把外部 DESIGN.md 放入项目根目录 | 中，且有品牌/IP 风险 | 低到中 | MIT | 用作设计系统写法参考，避免 1:1 克隆 | 品牌风格/IP 风险，不应用于健康服务数据治理 Demo 的直接视觉来源 |
| kesslerio `ultimate-frontend-design-openclaw-skill` | GitHub | React/Tailwind/shadcn 静态站生成、Vite/Next 工作流 | 当前不适合 | 是，含 scripts/templates/references | 是，含 clone/install/init 命令 | 高，会初始化 Vite/Next 项目 | 高，要求 Node/npm 并可能安装依赖 | 中，执行前需审计 | Apache-2.0 | 只可人工阅读其设计审稿思路，不安装、不执行 | 与本轮不创建项目、不安装依赖、不执行脚本冲突；偏生成器，不适合作为只审稿工具 |
| mblode `ui-design` | `mblode/agent-skills` | 产品 UI 或营销 UI 的视觉方向 | 可有限参考 | 未见强制脚本，但 repo 有多 skill 资源 | 是，README 提供 `npx skills add` | 若直接使用可能定义设计系统和页面布局 | 中，取决于安装方式 | 中，若允许全仓审阅 | MIT | 只参考 Product UI 的审稿维度，不让其决定本项目设计系统 | 不能决定页面范围、字段、路由、指标口径 |
| mblode `ui-audit` | `mblode/agent-skills` | 可访问性、交互、排版、布局、性能和微文案审查 | 后续适合做前端审查 | 有 references/rules，未必有脚本 | 是，README 提供安装命令 | 低到中，审查时可能建议改代码 | 中 | 中，需限定检查范围 | MIT | 后续只审查 `frontend/src` 和截图，不读密钥、不改合同 | 不应越权修改信息架构或安全边界 |
| mblode `ux-audit` | `mblode/agent-skills` | React/Next 功能级 UX 审查 | 后续可参考，但当前不适合 | 有大量 references/rules | 是 | 可能要求 diff 和源码审查 | 中 | 中 | MIT | 前端完成后，可限定在用户流程可用性审查 | 偏代码/PR 审查，不适合本轮纯准备阶段 |
| mblode `typography-audit` | `mblode/agent-skills` | 字体、字号、行高、层级和排版审查 | 后续适合 | 有 references/rules，未必有脚本 | 是 | 低到中，可能建议 CSS 修改 | 中 | 低到中 | MIT | 后续只审排版，不改结构和数据合同 | 不能重设项目产品定位或信息架构 |

## 外部 skill 统一禁止事项

任何外部 frontend/design skill 都不得：

- 决定页面结构。
- 决定数据字段。
- 修改 JSON 数据合同。
- 修改敏感字段白名单/黑名单。
- 读取 `.env`。
- 读取 Supabase / Metabase / Cloudflare 凭据。
- 修改 `database/`。
- 修改 `deployment/supabase/`。
- 修改 `deployment/metabase/`。
- 修改 `deployment/appsmith/`。
- 把页面做成医疗 AI 官网。
- 把页面做成营销页。
- 把页面做成炫光大屏。
- 安装未知依赖。
- 执行外部脚本。
- 改变 React 第一版静态 JSON 路线。

## 使用边界

允许外部 design skill 做：

- 评价视觉层级。
- 评价 typography。
- 评价 spacing。
- 评价 card layout。
- 评价 chart readability。
- 评价 mobile responsiveness。
- 指出 AI 模板感。
- 指出过度营销化。
- 指出是否符合健康服务数据治理产品气质。

不允许外部 design skill 做：

- 改页面范围。
- 改导航结构。
- 改字段名。
- 改指标口径。
- 改敏感字段规则。
- 改部署架构。
- 决定是否接 Supabase。
- 决定是否增加后端。
- 决定是否增加登录权限。

