import { useEffect, useMemo, useState } from "react";
import { BrowserRouter, NavLink, Navigate, Route, Routes } from "react-router-dom";
import ReactECharts from "echarts-for-react";
import type { EChartsOption } from "echarts";
import * as Dialog from "@radix-ui/react-dialog";
import {
  type ColumnDef,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Activity,
  ArrowDownUp,
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  Database,
  FileSpreadsheet,
  Filter,
  Info,
  LayoutDashboard,
  ListFilter,
  LockKeyhole,
  Route as RouteIcon,
  Search,
  ShieldCheck,
  TableProperties,
  X,
} from "lucide-react";

type ServiceRecord = {
  service_record_id: string;
  appointment_date: string | null;
  service_type: string;
  service_status_label: string;
  customer_source_label: string;
  hospital_name: string;
  department_name: string;
  guide_staff_label: string;
  is_cancelled: boolean;
  has_payment_note: boolean;
  has_medical_note: boolean;
  has_follow_up: boolean;
};

type ServiceRecordsPayload = {
  records: ServiceRecord[];
};

type Kpis = {
  data_range_start: string | null;
  data_range_end: string | null;
  total_service_records: number;
  uncancelled_service_records: number;
  cancelled_service_records: number;
  records_with_payment_note: number;
  records_with_medical_note: number;
  follow_up_records: number;
};

type CountItem = {
  label: string;
  count: number;
};

type MonthlyTrendItem = {
  month: string;
  total_service_records: number;
  uncancelled_service_records: number;
  cancelled_service_records: number;
};

type AnalyticsSummary = {
  service_type_distribution: CountItem[];
  customer_source_distribution: CountItem[];
  monthly_service_trend: MonthlyTrendItem[];
  hospital_top10: CountItem[];
  department_top10: CountItem[];
  guide_staff_workload: CountItem[];
};

type DemoMetadata = {
  demo_name: string;
  contract_version: string;
  generated_at: string | null;
  data_range_start: string | null;
  data_range_end: string | null;
  source_files: string[];
  allowed_fields: string[];
  prohibited_fields: string[];
  semantic_boundaries: string[];
  demo_boundaries: string[];
};

type DemoData = {
  records: ServiceRecord[];
  kpis: Kpis;
  analytics: AnalyticsSummary;
  metadata: DemoMetadata;
};

type LoadState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: DemoData };

const navItems = [
  { to: "/", label: "总览", icon: LayoutDashboard, end: true },
  { to: "/analytics", label: "运营分析", icon: BarChart3 },
  { to: "/records", label: "服务记录", icon: TableProperties },
  { to: "/security-roadmap", label: "数据安全与后续路线", icon: ShieldCheck },
];

const formatter = new Intl.NumberFormat("zh-CN");

function displayValue(value: string | number | null | undefined) {
  if (value === null || value === undefined) {
    return "待确认";
  }
  const text = String(value).trim();
  if (!text || ["unknown", "null", "undefined", "nan"].includes(text.toLowerCase())) {
    return "待确认";
  }
  return text;
}

function formatNumber(value: number) {
  return formatter.format(value);
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${url} 加载失败：${response.status}`);
  }
  return (await response.json()) as T;
}

function useDemoData(): LoadState {
  const [state, setState] = useState<LoadState>({ status: "loading" });

  useEffect(() => {
    let alive = true;
    Promise.all([
      fetchJson<ServiceRecordsPayload>("/demo-data/service-records.json"),
      fetchJson<Kpis>("/demo-data/kpis.json"),
      fetchJson<AnalyticsSummary>("/demo-data/analytics-summary.json"),
      fetchJson<DemoMetadata>("/demo-data/demo-metadata.json"),
    ])
      .then(([recordsPayload, kpis, analytics, metadata]) => {
        if (!alive) {
          return;
        }
        setState({
          status: "ready",
          data: {
            records: recordsPayload.records,
            kpis,
            analytics,
            metadata,
          },
        });
      })
      .catch((error: unknown) => {
        if (!alive) {
          return;
        }
        setState({
          status: "error",
          message: error instanceof Error ? error.message : "静态 JSON 加载失败",
        });
      });

    return () => {
      alive = false;
    };
  }, []);

  return state;
}

export default function App() {
  const state = useDemoData();

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-background text-foreground">
        <Shell>
          {state.status === "loading" ? (
            <LoadingState />
          ) : state.status === "error" ? (
            <ErrorState message={state.message} />
          ) : (
            <Routes>
              <Route path="/" element={<OverviewPage data={state.data} />} />
              <Route path="/analytics" element={<AnalyticsPage data={state.data} />} />
              <Route path="/records" element={<RecordsPage records={state.data.records} />} />
              <Route
                path="/security-roadmap"
                element={<SecurityRoadmapPage metadata={state.data.metadata} />}
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
        </Shell>
      </div>
    </BrowserRouter>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
                Static Data Demo
              </p>
              <h1 className="text-lg font-semibold text-foreground sm:text-xl">
                健康服务数据治理与运营分析展示台
              </h1>
            </div>
          </div>
          <nav className="flex gap-2 overflow-x-auto pb-1 lg:pb-0" aria-label="主导航">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    [
                      "inline-flex min-h-10 shrink-0 items-center gap-2 rounded-md border px-3 text-sm font-medium transition",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                    ].join(" ")
                  }
                >
                  <Icon className="h-4 w-4" aria-hidden="true" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">{children}</main>
    </>
  );
}

function LoadingState() {
  return (
    <section className="panel flex min-h-72 items-center justify-center">
      <div className="text-center">
        <div className="mx-auto mb-4 h-10 w-10 animate-pulse rounded-md bg-primary/15" />
        <p className="text-sm font-medium text-muted-foreground">正在加载本地静态 Demo 数据</p>
      </div>
    </section>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <section className="panel border-destructive/40 bg-destructive/5">
      <div className="flex items-start gap-3">
        <CircleAlert className="mt-0.5 h-5 w-5 text-destructive" aria-hidden="true" />
        <div>
          <h2 className="text-base font-semibold text-foreground">静态 JSON 加载失败</h2>
          <p className="mt-1 text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </section>
  );
}

function OverviewPage({ data }: { data: DemoData }) {
  const { kpis, metadata } = data;
  const kpiCards = [
    {
      label: "服务记录总数",
      value: kpis.total_service_records,
      note: "记录数，不代表客户数",
      tone: "primary",
    },
    {
      label: "未取消服务记录数",
      value: kpis.uncancelled_service_records,
      note: "不能推断诊疗结果",
      tone: "success",
    },
    {
      label: "已取消服务记录数",
      value: kpis.cancelled_service_records,
      note: "只代表取消标记",
      tone: "warning",
    },
    {
      label: "存在费用/支付归属信息",
      value: kpis.records_with_payment_note,
      note: "不能推断支付状态",
      tone: "neutral",
    },
  ];

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="需求方展示层"
        title="从 Excel 大宽表到健康服务运营分析展示台"
        description="展示数据治理、BI/后台验证到 React 展示层的链路；当前为静态脱敏 Demo，不连接生产数据库，不展示敏感原文。"
      />

      <div className="value-strip" aria-label="展示台价值点">
        {["可查询", "可统计", "可演示", "可扩展"].map((item) => (
          <span key={item}>{item}</span>
        ))}
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="panel">
          <SectionTitle
            icon={RouteIcon}
            title="治理链路"
            description="展示层只读取静态脱敏 JSON；Supabase、Metabase、Appsmith 是已验证的底座与原型分工。"
          />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              {
                icon: FileSpreadsheet,
                title: "Excel 原始宽表",
                text: "作为源头材料，前端不直接读取原始字段。",
              },
              {
                icon: Database,
                title: "Supabase / PostgreSQL",
                text: "结构化数据底座与口径验证，第一版不作为运行依赖。",
              },
              {
                icon: BarChart3,
                title: "Metabase / Appsmith",
                text: "分别承担 BI 看板验证和后台查询原型验证。",
              },
              {
                icon: LayoutDashboard,
                title: "React 静态展示台",
                text: "面向需求方演示，只消费 public/demo-data/*.json。",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-md border border-border bg-card p-4">
                <div className="mb-3 flex items-center gap-2">
                  <item.icon className="h-4 w-4 text-primary" aria-hidden="true" />
                  <h3 className="text-sm font-semibold">{item.title}</h3>
                </div>
                <p className="text-sm leading-6 text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <SectionTitle
            icon={Info}
            title="Demo 边界"
            description={`${displayValue(metadata.data_range_start)} 至 ${displayValue(
              metadata.data_range_end,
            )}，合同版本 ${metadata.contract_version}`}
          />
          <ul className="mt-5 space-y-3">
            {metadata.demo_boundaries.map((item) => (
              <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="panel">
        <SectionTitle
          icon={ShieldCheck}
          title="模块关系"
          description="React 是产品化展示层；它不替代数据底座、BI 看板或后台查询原型。"
        />
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {["Excel", "Supabase/PostgreSQL", "Metabase/Appsmith", "React 静态 Demo"].map(
            (step, index) => (
              <div key={step} className="flow-step">
                <span className="flow-index">{index + 1}</span>
                <span className="text-sm font-semibold">{step}</span>
              </div>
            ),
          )}
        </div>
      </section>
    </div>
  );
}

function AnalyticsPage({ data }: { data: DemoData }) {
  const { analytics } = data;
  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="运营分析"
        title="基于服务记录统计的分布与趋势"
        description="所有图表仅表达服务记录统计口径，不代表医疗结论，也不能推断支付状态或诊疗结果。"
      />
      <AnalysisGroup title="服务结构" description="服务类型与客户来源的结构化分布。">
        <ChartCard
          title="服务类型分布"
          description="按服务记录统计"
          option={barOption(analytics.service_type_distribution, "服务记录数", true)}
        />
        <ChartCard
          title="客户来源分布"
          description="按服务记录统计"
          option={donutOption(analytics.customer_source_distribution)}
        />
      </AnalysisGroup>

      <AnalysisGroup title="运营资源" description="趋势、人员、医院与科室维度的服务记录统计。">
        <ChartCard
          title="月度服务趋势"
          description="未取消服务记录不能推断诊疗结果"
          option={trendOption(analytics.monthly_service_trend)}
        />
        <ChartCard
          title="导诊人员工作量"
          description="按服务记录统计"
          option={barOption(analytics.guide_staff_workload, "服务记录数", true)}
        />
        <ChartCard
          title="医院 Top 10"
          description="按服务记录统计"
          option={barOption(analytics.hospital_top10, "服务记录数", true)}
        />
        <ChartCard
          title="科室 Top 10"
          description="按服务记录统计"
          option={barOption(analytics.department_top10, "服务记录数", true)}
        />
      </AnalysisGroup>
    </div>
  );
}

function RecordsPage({ records }: { records: ServiceRecord[] }) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [sorting, setSorting] = useState<SortingState>([{ id: "appointment_date", desc: true }]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [selectedRecord, setSelectedRecord] = useState<ServiceRecord | null>(null);

  const serviceTypes = useMemo(() => uniqueValues(records, "service_type"), [records]);
  const sources = useMemo(() => uniqueValues(records, "customer_source_label"), [records]);
  const statuses = useMemo(() => uniqueValues(records, "service_status_label"), [records]);

  const columns = useMemo<ColumnDef<ServiceRecord>[]>(
    () => [
      {
        accessorKey: "service_record_id",
        header: "记录 ID",
        cell: ({ row }) => (
          <button className="link-button" type="button" onClick={() => setSelectedRecord(row.original)}>
            {row.original.service_record_id}
          </button>
        ),
      },
      {
        accessorKey: "appointment_date",
        header: "预约日期",
        cell: ({ getValue }) => displayValue(getValue<string | null>()),
      },
      { accessorKey: "service_type", header: "服务类型" },
      {
        accessorKey: "service_status_label",
        header: "服务状态",
        cell: ({ getValue }) => <StatusBadge label={getValue<string>()} />,
      },
      { accessorKey: "customer_source_label", header: "客户来源" },
      { accessorKey: "hospital_name", header: "医院" },
      { accessorKey: "department_name", header: "科室" },
      { accessorKey: "guide_staff_label", header: "导诊人员" },
      {
        accessorKey: "has_payment_note",
        header: "费用/支付归属信息",
        cell: ({ getValue }) => <FlagBadge active={getValue<boolean>()} />,
      },
      {
        accessorKey: "has_medical_note",
        header: "医疗备注标记",
        cell: ({ getValue }) => <FlagBadge active={getValue<boolean>()} />,
      },
      {
        accessorKey: "has_follow_up",
        header: "后续跟进标记",
        cell: ({ getValue }) => <FlagBadge active={getValue<boolean>()} />,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: records,
    columns,
    state: { globalFilter, sorting, columnFilters },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    globalFilterFn: (row, _columnId, filterValue) => {
      const keyword = String(filterValue).trim().toLowerCase();
      if (!keyword) {
        return true;
      }
      return Object.values(row.original)
        .map((value) => String(value).toLowerCase())
        .some((value) => value.includes(keyword));
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: { pageSize: 10 },
    },
  });

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="服务记录"
        title="安全字段检索、筛选、排序与详情查看"
        description="详情抽屉只展示合同允许字段和 flags，不展示真实身份、医疗原文、付款原文或客户备注原文。"
      />

      <section className="panel">
        <div className="grid gap-3 lg:grid-cols-[1.2fr_repeat(3,minmax(0,0.7fr))]">
          <label className="field-label">
            <span>
              <Search className="h-4 w-4" aria-hidden="true" />
              搜索
            </span>
            <input
              className="input"
              value={globalFilter}
              onChange={(event) => setGlobalFilter(event.target.value)}
              placeholder="按记录 ID、服务类型、医院、科室搜索"
            />
          </label>
          <SelectFilter
            label="服务类型"
            options={serviceTypes}
            value={(table.getColumn("service_type")?.getFilterValue() as string) ?? ""}
            onChange={(value) => table.getColumn("service_type")?.setFilterValue(value || undefined)}
          />
          <SelectFilter
            label="客户来源"
            options={sources}
            value={(table.getColumn("customer_source_label")?.getFilterValue() as string) ?? ""}
            onChange={(value) =>
              table.getColumn("customer_source_label")?.setFilterValue(value || undefined)
            }
          />
          <SelectFilter
            label="服务状态"
            options={statuses}
            value={(table.getColumn("service_status_label")?.getFilterValue() as string) ?? ""}
            onChange={(value) =>
              table.getColumn("service_status_label")?.setFilterValue(value || undefined)
            }
          />
        </div>
      </section>

      <section className="panel overflow-hidden p-0">
        <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold">服务记录列表</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              当前筛选结果 {formatNumber(table.getFilteredRowModel().rows.length)} 条；表格字段来自静态 JSON 合同
            </p>
          </div>
          <div className="contract-note">
            <ListFilter className="h-4 w-4" aria-hidden="true" />
            移动端可横向滑动查看完整字段
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th key={header.id}>
                      {header.isPlaceholder ? null : (
                        <button
                          type="button"
                          className="table-sort"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <ArrowDownUp className="h-3.5 w-3.5" aria-hidden="true" />
                        </button>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((row) => (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col gap-3 border-t border-border p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            第 {table.getState().pagination.pageIndex + 1} / {table.getPageCount()} 页
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="icon-button"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              aria-label="上一页"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <button
              type="button"
              className="icon-button"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              aria-label="下一页"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </section>

      <RecordDrawer record={selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)} />
    </div>
  );
}

function SecurityRoadmapPage({ metadata }: { metadata: DemoMetadata }) {
  const prohibitedGroups = groupProhibitedFields(metadata.prohibited_fields);

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="数据安全与后续路线"
        title="脱敏字段、禁止字段和 Demo 边界"
        description="当前展示台是静态脱敏 Demo，不是运行中的业务系统，不用于诊疗判断，也不是正式权限系统。"
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <SectionTitle icon={LockKeyhole} title="允许展示字段" description="服务记录详情只展示这些字段。" />
          <div className="mt-5 flex flex-wrap gap-2">
            {metadata.allowed_fields.map((field) => (
              <span key={field} className="field-chip">
                {field}
              </span>
            ))}
          </div>
        </div>
        <div className="panel">
          <SectionTitle icon={CircleAlert} title="禁止展示字段" description="禁止进入静态 JSON 和详情抽屉。" />
          <div className="mt-5 space-y-4">
            {prohibitedGroups.map((group) => (
              <div key={group.title} className="security-group">
                <h3>{group.title}</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  {group.items.map((field) => (
                    <span key={field} className="danger-chip">
                      {field}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="panel">
        <SectionTitle
          icon={ShieldCheck}
          title="安全展示流程"
          description="从本地材料到前端展示，所有步骤都围绕 allowlist 和敏感字段检查展开。"
        />
        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {[
            "本地 CSV / 安全导出",
            "allowlist 生成 JSON",
            "敏感字段检查",
            "React 只读展示",
          ].map((step, index) => (
            <div key={step} className="security-flow-step">
              <span>{index + 1}</span>
              <strong>{step}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <SectionTitle icon={Info} title="语义边界" description="这些说明必须伴随指标和 flags 理解。" />
          <ul className="mt-5 space-y-3">
            {metadata.semantic_boundaries.map((item) => (
              <li key={item} className="rule-row">
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <SectionTitle icon={RouteIcon} title="后续正式系统路线" description="正式化能力不属于当前静态 Demo。" />
          <ol className="mt-5 space-y-3">
            {[
              "继续使用本地 allowlist JSON 做需求方展示和截图汇报。",
              "补齐正式敏感字段检查、构建验收和页面可访问性检查。",
              "进入正式系统阶段后，才评估 Supabase 安全 view 或后端 API。",
              "正式权限、审计日志和合规流程需要单独设计和验收。",
            ].map((item) => (
              <li key={item} className="rule-row">
                {item}
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}

function PageIntro({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description: string;
}) {
  return (
    <section className="page-intro">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold text-foreground sm:text-3xl">{title}</h2>
      <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
        {description}
      </p>
    </section>
  );
}

function SectionTitle({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <div>
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  note,
  tone,
}: {
  label: string;
  value: number;
  note: string;
  tone: string;
}) {
  return (
    <article className={`kpi-card kpi-${tone}`}>
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <strong className="mt-3 block text-3xl font-semibold text-foreground">{formatNumber(value)}</strong>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">{note}</p>
    </article>
  );
}

function AnalysisGroup({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="analysis-group">
      <div className="analysis-group-header">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">Analysis</p>
          <h2>{title}</h2>
        </div>
        <p>{description}</p>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">{children}</div>
    </section>
  );
}

function ChartCard({
  title,
  description,
  option,
}: {
  title: string;
  description: string;
  option: EChartsOption;
}) {
  return (
    <section className="panel chart-card">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-semibold">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <ReactECharts option={option} notMerge lazyUpdate className="h-80 w-full" />
      <p className="chart-footnote">按服务记录统计，不代表医疗结论。</p>
    </section>
  );
}

function barOption(items: CountItem[], seriesName: string, horizontal = false): EChartsOption {
  const labels = items.map((item) => displayValue(item.label));
  const counts = items.map((item) => item.count);
  const base: EChartsOption = {
    color: ["#247c74"],
    tooltip: {
      trigger: "axis",
      axisPointer: { type: "shadow" },
      valueFormatter: (value) => `${value} 条服务记录`,
    },
    grid: { left: horizontal ? 154 : 46, right: 24, top: 22, bottom: horizontal ? 30 : 44 },
    xAxis: horizontal
      ? { type: "value", axisLabel: { color: "#64726f", fontSize: 12 }, splitLine: { lineStyle: { color: "#e6ece9" } } }
      : { type: "category", data: labels, axisLabel: { color: "#64726f", rotate: 28, fontSize: 12 } },
    yAxis: horizontal
      ? {
          type: "category",
          data: labels,
          axisLabel: { color: "#34423f", fontSize: 12, width: 132, overflow: "truncate" },
        }
      : { type: "value", axisLabel: { color: "#64726f", fontSize: 12 }, splitLine: { lineStyle: { color: "#e6ece9" } } },
    series: [
      {
        name: seriesName,
        type: "bar",
        data: counts,
        barMaxWidth: 18,
        itemStyle: { borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0] },
      },
    ],
  };
  return base;
}

function donutOption(items: CountItem[]): EChartsOption {
  return {
    color: ["#247c74", "#4b8cbd", "#d8a23a", "#8c6bb1", "#6f8f72"],
    tooltip: {
      trigger: "item",
      valueFormatter: (value) => `${value} 条服务记录`,
    },
    legend: {
      bottom: 0,
      type: "scroll",
      textStyle: { color: "#53625f", fontSize: 12 },
    },
    series: [
      {
        name: "服务记录统计",
        type: "pie",
        radius: ["46%", "70%"],
        center: ["50%", "42%"],
        avoidLabelOverlap: true,
        data: items.map((item) => ({ name: displayValue(item.label), value: item.count })),
      },
    ],
  };
}

function trendOption(items: MonthlyTrendItem[]): EChartsOption {
  return {
    color: ["#247c74", "#4b8cbd", "#d8a23a"],
    tooltip: { trigger: "axis" },
    legend: { top: 0, type: "scroll", textStyle: { color: "#53625f", fontSize: 12 } },
    grid: { left: 42, right: 24, top: 48, bottom: 34 },
    xAxis: {
      type: "category",
      data: items.map((item) => item.month),
      axisLabel: { color: "#64726f" },
    },
    yAxis: {
      type: "value",
      axisLabel: { color: "#64726f" },
      splitLine: { lineStyle: { color: "#e6ece9" } },
    },
    series: [
      {
        name: "服务记录总数",
        type: "line",
        smooth: true,
        data: items.map((item) => item.total_service_records),
      },
      {
        name: "未取消服务记录数",
        type: "line",
        smooth: true,
        data: items.map((item) => item.uncancelled_service_records),
      },
      {
        name: "已取消服务记录数",
        type: "bar",
        barMaxWidth: 18,
        data: items.map((item) => item.cancelled_service_records),
      },
    ],
  };
}

function SelectFilter({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="field-label">
      <span>
        <Filter className="h-4 w-4" aria-hidden="true" />
        {label}
      </span>
      <select className="input" value={value} onChange={(event) => onChange(event.target.value)}>
        <option value="">全部</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function FlagBadge({ active }: { active: boolean }) {
  return <span className={active ? "flag-badge flag-active" : "flag-badge"}>{active ? "存在" : "无标记"}</span>;
}

function StatusBadge({ label }: { label: string }) {
  const isCancelled = label.includes("取消");
  return (
    <span className={isCancelled ? "status-badge status-cancelled" : "status-badge status-open"}>
      {displayValue(label)}
    </span>
  );
}

function RecordDrawer({
  record,
  onOpenChange,
}: {
  record: ServiceRecord | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog.Root open={Boolean(record)} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />
        <Dialog.Content className="dialog-content">
          <div className="flex items-start justify-between gap-4 border-b border-border p-5">
            <div>
              <Dialog.Title className="text-lg font-semibold">
                {record ? `${record.service_record_id} · ${record.service_type}` : "服务记录详情"}
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">
                仅展示合同允许字段和 flags，不展示任何敏感原文。
              </Dialog.Description>
            </div>
            <Dialog.Close className="icon-button" aria-label="关闭详情">
              <X className="h-4 w-4" aria-hidden="true" />
            </Dialog.Close>
          </div>
          {record ? (
            <div className="space-y-5 p-5">
              <div className="grid gap-3">
                {[
                  ["记录 ID", record.service_record_id],
                  ["预约日期", displayValue(record.appointment_date)],
                  ["服务类型", record.service_type],
                  ["服务状态", record.service_status_label],
                  ["客户来源", record.customer_source_label],
                  ["医院", record.hospital_name],
                  ["科室", record.department_name],
                  ["导诊人员", record.guide_staff_label],
                ].map(([labelText, value]) => (
                  <div key={labelText} className="detail-row">
                    <span>{labelText}</span>
                    <strong>{value}</strong>
                  </div>
                ))}
              </div>
              <div className="rounded-md border border-border bg-muted/50 p-4">
                <h3 className="text-sm font-semibold">安全 flags</h3>
                <div className="mt-3 flex flex-wrap gap-2">
                  <FlagBadge active={record.has_payment_note} />
                  <span className="flag-label">费用/支付归属信息存在性</span>
                  <FlagBadge active={record.has_medical_note} />
                  <span className="flag-label">医疗备注存在性</span>
                  <FlagBadge active={record.has_follow_up} />
                  <span className="flag-label">后续跟进存在性</span>
                </div>
                <p className="mt-3 text-xs leading-5 text-muted-foreground">
                  费用/支付归属信息存在性不能推断支付状态；未取消服务记录不能推断诊疗结果。
                </p>
              </div>
            </div>
          ) : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function uniqueValues<T extends keyof ServiceRecord>(records: ServiceRecord[], key: T) {
  return Array.from(new Set(records.map((record) => String(record[key])))).sort((a, b) =>
    a.localeCompare(b, "zh-CN"),
  );
}

function groupProhibitedFields(fields: string[]) {
  const groups = [
    {
      title: "身份识别类",
      items: fields.filter((field) =>
        ["真实姓名", "手机号", "证件号", "诊疗卡号"].includes(field),
      ),
    },
    {
      title: "医疗原文类",
      items: fields.filter((field) =>
        ["medical_notes 原文", "诊疗过程", "医嘱", "病历检查报告"].includes(field),
      ),
    },
    {
      title: "支付与备注原文类",
      items: fields.filter((field) =>
        [
          "raw_payment_note",
          "客户备注原文",
          "内部敏感备注",
          "note_text",
          "diagnosis",
          "doctor_advice",
          "report",
          "payment raw text",
        ].includes(field),
      ),
    },
  ];
  const grouped = new Set(groups.flatMap((group) => group.items));
  const other = fields.filter((field) => !grouped.has(field));
  return other.length > 0 ? [...groups, { title: "其他不可展示内容", items: other }] : groups;
}
