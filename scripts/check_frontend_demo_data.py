from __future__ import annotations

import json
import math
import re
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DEMO_DATA_DIR = ROOT / "frontend" / "public" / "demo-data"

SERVICE_RECORD_FIELDS = {
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
}

KPI_FIELDS = {
    "data_range_start",
    "data_range_end",
    "total_service_records",
    "uncancelled_service_records",
    "cancelled_service_records",
    "records_with_payment_note",
    "records_with_medical_note",
    "follow_up_records",
}

ANALYTICS_FIELDS = {
    "service_type_distribution",
    "customer_source_distribution",
    "monthly_service_trend",
    "hospital_top10",
    "department_top10",
    "guide_staff_workload",
}

METADATA_FIELDS = {
    "demo_name",
    "contract_version",
    "generated_at",
    "data_range_start",
    "data_range_end",
    "source_files",
    "allowed_fields",
    "prohibited_fields",
    "semantic_boundaries",
    "demo_boundaries",
}

ALLOWED_KEYS = SERVICE_RECORD_FIELDS | KPI_FIELDS | ANALYTICS_FIELDS | METADATA_FIELDS | {
    "records",
    "label",
    "count",
    "month",
}

FORBIDDEN_EXACT_KEYS = {
    "name",
    "real_name",
    "phone",
    "mobile",
    "tel",
    "contact",
    "id_card",
    "identity",
    "certificate",
    "medical_card",
    "patient",
    "diagnosis",
    "doctor_advice",
    "advice",
    "prescription",
    "case",
    "medical_notes",
    "medical_note_text",
    "note_text",
    "notes_raw",
    "raw_note",
    "raw_payment_note",
    "payment_raw",
    "payment_text",
    "report",
    "exam_report",
    "lab_report",
    "internal_note",
    "customer_note",
}

FORBIDDEN_KEY_PARTS = [
    "raw_payment",
    "raw_note",
    "note_text",
    "diagnosis",
    "doctor_advice",
    "medical_advice",
    "treatment_process",
    "condition_description",
    "medical_report",
    "medical_card",
    "customer_note",
    "internal_note",
    "id_card",
    "identity",
    "certificate",
    "phone",
    "mobile",
]

FORBIDDEN_CN_IN_KEYS = [
    "姓名",
    "手机号",
    "电话",
    "联系方式",
    "身份证",
    "证件",
    "诊疗卡",
    "就诊卡",
    "医嘱",
    "诊断",
    "病历",
    "检查报告",
    "诊疗过程",
    "治疗过程",
    "处方",
    "备注原文",
    "客户备注",
    "内部备注",
    "支付原文",
    "费用原文",
]

SENSITIVE_VALUE_KEYWORDS = [
    "医嘱",
    "诊断",
    "病历",
    "检查报告",
    "处方",
    "用药",
    "病情",
    "症状",
]

PHONE_RE = re.compile(r"(?<!\d)1[3-9]\d{9}(?!\d)")
ID18_RE = re.compile(r"(?<![0-9A-Za-z])\d{17}[\dXx](?![0-9A-Za-z])")
ID15_RE = re.compile(r"(?<!\d)\d{15}(?!\d)")
LONG_DIGITS_RE = re.compile(r"(?<!\d)\d{12,}(?!\d)")


def no_constants(value: str) -> None:
    raise ValueError(f"Invalid JSON constant {value}")


def load_json(path: Path) -> Any:
    return json.loads(path.read_text(encoding="utf-8"), parse_constant=no_constants)


def add_issue(issues: list[str], path: str, message: str) -> None:
    issues.append(f"{path}: {message}")


def validate_schema(filename: str, payload: Any, issues: list[str]) -> None:
    if filename == "service-records.json":
        if not isinstance(payload, dict) or not isinstance(payload.get("records"), list):
            add_issue(issues, filename, "expected object with records array")
            return
        for i, record in enumerate(payload["records"]):
            if set(record) != SERVICE_RECORD_FIELDS:
                add_issue(issues, f"{filename}.records[{i}]", "fields do not match service record contract")
            for field in ["service_record_id", "service_type", "service_status_label", "customer_source_label", "hospital_name", "department_name", "guide_staff_label"]:
                if not isinstance(record.get(field), str) or not record.get(field):
                    add_issue(issues, f"{filename}.records[{i}].{field}", "expected non-empty string")
            for field in ["is_cancelled", "has_payment_note", "has_medical_note", "has_follow_up"]:
                if not isinstance(record.get(field), bool):
                    add_issue(issues, f"{filename}.records[{i}].{field}", "expected boolean")
    elif filename == "kpis.json":
        if not isinstance(payload, dict) or set(payload) != KPI_FIELDS:
            add_issue(issues, filename, "fields do not match KPI contract")
        if isinstance(payload, dict) and "active_or_uncancelled_records" in payload:
            add_issue(issues, filename, "forbidden field active_or_uncancelled_records")
    elif filename == "analytics-summary.json":
        if not isinstance(payload, dict) or set(payload) != ANALYTICS_FIELDS:
            add_issue(issues, filename, "fields do not match analytics contract")
    elif filename == "demo-metadata.json":
        if not isinstance(payload, dict) or set(payload) != METADATA_FIELDS:
            add_issue(issues, filename, "fields do not match metadata contract")


def should_scan_value(path: str) -> bool:
    metadata_safe_lists = [
        ".prohibited_fields",
        ".semantic_boundaries",
        ".demo_boundaries",
    ]
    return not any(part in path for part in metadata_safe_lists)


def walk(value: Any, path: str, issues: list[str]) -> None:
    if isinstance(value, dict):
        for key, child in value.items():
            key_path = f"{path}.{key}"
            key_lower = key.lower()
            if key not in ALLOWED_KEYS:
                if key_lower in FORBIDDEN_EXACT_KEYS:
                    add_issue(issues, key_path, "forbidden exact key")
                if any(part in key_lower for part in FORBIDDEN_KEY_PARTS):
                    add_issue(issues, key_path, "forbidden key pattern")
                if any(part in key for part in FORBIDDEN_CN_IN_KEYS):
                    add_issue(issues, key_path, "forbidden Chinese key pattern")
            walk(child, key_path, issues)
    elif isinstance(value, list):
        for i, child in enumerate(value):
            walk(child, f"{path}[{i}]", issues)
    elif isinstance(value, str):
        lowered = value.strip().lower()
        if lowered in {"unknown", "undefined", "nan"}:
            add_issue(issues, path, "raw unknown/undefined/NaN value should be normalized")
        if not should_scan_value(path):
            return
        if PHONE_RE.search(value):
            add_issue(issues, path, "possible phone number")
        if ID18_RE.search(value) or ID15_RE.search(value):
            add_issue(issues, path, "possible identity document number")
        if LONG_DIGITS_RE.search(value):
            add_issue(issues, path, "possible long sensitive numeric identifier")
        if len(value) > 80 and any(word in value for word in SENSITIVE_VALUE_KEYWORDS):
            add_issue(issues, path, "possible long medical raw text")
    elif isinstance(value, float) and math.isnan(value):
        add_issue(issues, path, "NaN is forbidden")


def main() -> None:
    expected_files = {
        "service-records.json",
        "kpis.json",
        "analytics-summary.json",
        "demo-metadata.json",
    }
    if not DEMO_DATA_DIR.exists():
        raise SystemExit(f"Missing demo data directory: {DEMO_DATA_DIR}")

    files = {path.name: path for path in DEMO_DATA_DIR.glob("*.json")}
    missing = expected_files - set(files)
    extra = set(files) - expected_files
    issues: list[str] = []
    for name in sorted(missing):
        add_issue(issues, name, "missing expected file")
    for name in sorted(extra):
        add_issue(issues, name, "unexpected JSON file")

    for name in sorted(expected_files & set(files)):
        try:
            payload = load_json(files[name])
        except Exception as exc:  # noqa: BLE001
            add_issue(issues, name, f"invalid JSON: {exc}")
            continue
        validate_schema(name, payload, issues)
        walk(payload, name, issues)

    if issues:
        print("Sensitive field check failed:")
        for issue in issues:
            print(f"- {issue}")
        raise SystemExit(1)

    print(f"Sensitive field check passed for {DEMO_DATA_DIR}")


if __name__ == "__main__":
    main()
