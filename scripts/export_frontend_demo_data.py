from __future__ import annotations

import csv
import json
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DATA_DIR = ROOT / "data" / "processed"
OUT_DIR = ROOT / "frontend" / "public" / "demo-data"

CONTRACT_VERSION = "v1"
DEMO_NAME = "健康服务数据治理与运营分析展示台"
UNKNOWN_LABEL = "待确认"

SERVICE_RECORD_FIELDS = [
    "service_record_id",
    "appointment_date",
    "service_type",
    "service_status_label",
    "customer_source_label",
    "hospital_name",
    "department_name",
    "guide_staff_label",
    "is_cancelled",
    "has_payment_note",
    "has_medical_note",
    "has_follow_up",
]

SOURCE_FILES = [
    "service_records.csv",
    "service_types.csv",
    "organizations.csv",
    "medical_resources.csv",
    "staff_users.csv",
    "payment_records.csv",
    "medical_notes.csv",
    "pending_notes.csv",
]

PROHIBITED_FIELDS = [
    "真实姓名",
    "手机号",
    "证件号",
    "诊疗卡号",
    "medical_notes 原文",
    "诊疗过程",
    "医嘱",
    "病历检查报告",
    "raw_payment_note",
    "客户备注原文",
    "内部敏感备注",
    "note_text",
    "diagnosis",
    "doctor_advice",
    "report",
    "payment raw text",
    "任何可识别个人身份或医疗原文的字段",
]

SEMANTIC_BOUNDARIES = [
    "has_payment_note 只能解释为存在费用/支付归属信息，不能推断支付状态。",
    "is_cancelled=false 只能解释为未取消服务记录，不能推断诊疗结果。",
    "payment_records 不能推断支付状态。",
    "未取消服务记录不能推断诊疗结果。",
    "图表口径均为服务记录统计，不是医疗结论。",
]

DEMO_BOUNDARIES = [
    "React 第一版只消费 frontend/public/demo-data/*.json。",
    "第一版不接 Supabase，不使用 Supabase client，不读取 Supabase env 或 key。",
    "第一版不接后端、不做登录、不使用 Workers/R2/Resend/Neon。",
    "当前不是生产系统，不用于诊疗判断，也不是正式权限系统。",
    "JSON 由本地 data/processed/*.csv 或已有安全导出文件生成。",
]


def read_csv(name: str) -> list[dict[str, str]]:
    path = DATA_DIR / name
    if not path.exists():
        raise FileNotFoundError(f"Missing required source file: {path}")
    with path.open("r", encoding="utf-8-sig", newline="") as f:
        return list(csv.DictReader(f))


def is_blank(value: Any) -> bool:
    if value is None:
        return True
    text = str(value).strip()
    if not text:
        return True
    return text.lower() in {"unknown", "null", "undefined", "nan", "none"}


def label(value: Any) -> str:
    return UNKNOWN_LABEL if is_blank(value) else str(value).strip()


def clean_date(value: Any) -> str | None:
    if is_blank(value):
        return None
    text = str(value).strip()
    if len(text) >= 10:
        candidate = text[:10]
        try:
            datetime.strptime(candidate, "%Y-%m-%d")
            return candidate
        except ValueError:
            return None
    return None


def as_bool(value: Any) -> bool:
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in {"true", "1", "yes", "y"}


def has_any_text(row: dict[str, str], fields: list[str]) -> bool:
    return any(not is_blank(row.get(field)) for field in fields)


def by_id(rows: list[dict[str, str]], key: str) -> dict[str, dict[str, str]]:
    return {row[key]: row for row in rows if row.get(key)}


def service_status_label(service_type: dict[str, str]) -> str:
    if not service_type:
        return UNKNOWN_LABEL
    if as_bool(service_type.get("is_cancelled")):
        return "已取消服务记录"
    status = str(service_type.get("service_status", "")).strip().lower()
    if status in {"active", "scheduled", "completed"}:
        return "未取消服务记录"
    if status == "cancelled":
        return "已取消服务记录"
    return UNKNOWN_LABEL


def top_counts(records: list[dict[str, Any]], field: str, limit: int = 10) -> list[dict[str, Any]]:
    counts = Counter(record[field] for record in records)
    return [{"label": name, "count": count} for name, count in counts.most_common(limit)]


def distribution(records: list[dict[str, Any]], field: str) -> list[dict[str, Any]]:
    counts = Counter(record[field] for record in records)
    return [{"label": name, "count": count} for name, count in counts.most_common()]


def build_records() -> list[dict[str, Any]]:
    service_records = read_csv("service_records.csv")
    service_types = by_id(read_csv("service_types.csv"), "service_type_id")
    organizations = by_id(read_csv("organizations.csv"), "organization_id")
    resources = by_id(read_csv("medical_resources.csv"), "medical_resource_id")
    staff = by_id(read_csv("staff_users.csv"), "staff_user_id")
    payment_rows = read_csv("payment_records.csv")
    medical_note_rows = read_csv("medical_notes.csv")
    pending_note_rows = read_csv("pending_notes.csv")

    payment_flags: set[str] = set()
    for row in payment_rows:
        if row.get("service_record_id") and has_any_text(
            row,
            [
                "raw_payment_note",
                "settlement_note",
                "doctor_payment_note",
                "customer_payment_amount",
                "payer_type",
                "billing_project",
                "payment_method_category",
            ],
        ):
            payment_flags.add(row["service_record_id"])

    medical_flags: set[str] = set()
    follow_up_flags: set[str] = set()
    for row in medical_note_rows:
        service_record_id = row.get("service_record_id")
        if not service_record_id:
            continue
        if has_any_text(
            row,
            [
                "condition_description",
                "treatment_process",
                "medical_card_no_masked",
                "medical_advice",
                "follow_up_plan",
                "medical_report_attachment_note",
            ],
        ):
            medical_flags.add(service_record_id)
        if not is_blank(row.get("follow_up_plan")):
            follow_up_flags.add(service_record_id)

    for row in pending_note_rows:
        service_record_id = row.get("service_record_id")
        if service_record_id and str(row.get("note_type", "")).strip().lower() in {
            "follow_up",
            "follow-up",
            "followup",
            "后续跟进",
        }:
            follow_up_flags.add(service_record_id)

    output: list[dict[str, Any]] = []
    for index, row in enumerate(service_records, start=1):
        service_type = service_types.get(row.get("service_type_id", ""), {})
        organization = organizations.get(row.get("organization_id", ""), {})
        resource = resources.get(row.get("medical_resource_id", ""), {})
        guide = staff.get(row.get("guide_staff_user_id", ""), {})
        source_service_record_id = row.get("service_record_id", "")
        service_record_id = f"SR-{index:04d}"
        is_cancelled = as_bool(service_type.get("is_cancelled"))

        record = {
            "service_record_id": service_record_id,
            "appointment_date": clean_date(row.get("appointment_date")),
            "service_type": label(service_type.get("service_type")),
            "service_status_label": service_status_label(service_type),
            "customer_source_label": label(organization.get("customer_source")),
            "hospital_name": label(resource.get("hospital_name")),
            "department_name": label(resource.get("department_name")),
            "guide_staff_label": label(guide.get("staff_label")),
            "is_cancelled": is_cancelled,
            "has_payment_note": source_service_record_id in payment_flags,
            "has_medical_note": source_service_record_id in medical_flags,
            "has_follow_up": source_service_record_id in follow_up_flags,
        }
        if set(record) != set(SERVICE_RECORD_FIELDS):
            raise ValueError("Generated service record fields do not match contract")
        output.append(record)

    output.sort(key=lambda item: (item["appointment_date"] or "9999-99-99", item["service_record_id"]))
    return output


def build_kpis(records: list[dict[str, Any]]) -> dict[str, Any]:
    dates = [record["appointment_date"] for record in records if record["appointment_date"]]
    cancelled = sum(1 for record in records if record["is_cancelled"])
    return {
        "data_range_start": min(dates) if dates else None,
        "data_range_end": max(dates) if dates else None,
        "total_service_records": len(records),
        "uncancelled_service_records": len(records) - cancelled,
        "cancelled_service_records": cancelled,
        "records_with_payment_note": sum(1 for record in records if record["has_payment_note"]),
        "records_with_medical_note": sum(1 for record in records if record["has_medical_note"]),
        "follow_up_records": sum(1 for record in records if record["has_follow_up"]),
    }


def build_analytics(records: list[dict[str, Any]]) -> dict[str, Any]:
    monthly: dict[str, dict[str, int]] = defaultdict(
        lambda: {
            "total_service_records": 0,
            "uncancelled_service_records": 0,
            "cancelled_service_records": 0,
        }
    )
    for record in records:
        if not record["appointment_date"]:
            continue
        month = record["appointment_date"][:7]
        monthly[month]["total_service_records"] += 1
        if record["is_cancelled"]:
            monthly[month]["cancelled_service_records"] += 1
        else:
            monthly[month]["uncancelled_service_records"] += 1

    return {
        "service_type_distribution": distribution(records, "service_type"),
        "customer_source_distribution": distribution(records, "customer_source_label"),
        "monthly_service_trend": [
            {"month": month, **values} for month, values in sorted(monthly.items())
        ],
        "hospital_top10": top_counts(records, "hospital_name"),
        "department_top10": top_counts(records, "department_name"),
        "guide_staff_workload": top_counts(records, "guide_staff_label"),
    }


def build_metadata(kpis: dict[str, Any]) -> dict[str, Any]:
    return {
        "demo_name": DEMO_NAME,
        "contract_version": CONTRACT_VERSION,
        "generated_at": datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z"),
        "data_range_start": kpis["data_range_start"],
        "data_range_end": kpis["data_range_end"],
        "source_files": SOURCE_FILES,
        "allowed_fields": SERVICE_RECORD_FIELDS,
        "prohibited_fields": PROHIBITED_FIELDS,
        "semantic_boundaries": SEMANTIC_BOUNDARIES,
        "demo_boundaries": DEMO_BOUNDARIES,
    }


def write_json(name: str, payload: Any) -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    path = OUT_DIR / name
    text = json.dumps(payload, ensure_ascii=False, indent=2, allow_nan=False)
    path.write_text(text + "\n", encoding="utf-8")


def main() -> None:
    records = build_records()
    kpis = build_kpis(records)
    analytics = build_analytics(records)
    metadata = build_metadata(kpis)

    write_json("service-records.json", {"records": records})
    write_json("kpis.json", kpis)
    write_json("analytics-summary.json", analytics)
    write_json("demo-metadata.json", metadata)

    print(f"Generated {len(records)} safe service records in {OUT_DIR}")


if __name__ == "__main__":
    main()
