# 敏感字段护栏

## 目标

确保 React 静态 Demo 只展示安全字段和聚合数据，不泄露真实身份、医疗原文、付款原文、客户备注原文或内部敏感备注。

当前检查脚本为 `scripts/check_frontend_demo_data.py`，只使用 Python 标准库检查本地 `frontend/public/demo-data/*.json`。

## 检查范围

第一阶段必须检查：

```text
frontend/public/demo-data/*.json
```

必要时扩展检查：

```text
frontend/src/**/*.tsx
frontend/src/**/*.ts
```

扩展到源码检查时，只用于确认页面未硬编码敏感字段、未展示禁止字段、未绕过数据合同。

## 敏感字段黑名单

禁止字段包括：

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

## 中文敏感关键词

后续检查脚本应扫描字段名和必要的字符串内容，关键词至少包括：

- 姓名
- 真实姓名
- 手机
- 手机号
- 电话
- 联系方式
- 身份证
- 证件
- 证件号
- 诊疗卡
- 就诊卡
- 医嘱
- 诊断
- 病历
- 检查报告
- 报告
- 诊疗过程
- 治疗过程
- 病情
- 症状
- 用药
- 处方
- 备注原文
- 客户备注
- 内部备注
- 支付原文
- 费用原文

## 英文字段敏感关键词

后续检查脚本应扫描字段名，关键词至少包括：

- `name`
- `real_name`
- `phone`
- `mobile`
- `tel`
- `contact`
- `id_card`
- `identity`
- `certificate`
- `medical_card`
- `patient`
- `diagnosis`
- `doctor_advice`
- `advice`
- `prescription`
- `case`
- `medical_notes`
- `medical_note_text`
- `note_text`
- `notes_raw`
- `raw_note`
- `raw_payment_note`
- `payment_raw`
- `payment_text`
- `report`
- `exam_report`
- `lab_report`
- `internal_note`
- `customer_note`

## 正则检查思路

手机号：

```text
中国大陆手机号：(?<!\d)1[3-9]\d{9}(?!\d)
```

身份证号：

```text
18 位身份证：(?<![0-9A-Za-z])\d{17}[\dXx](?![0-9A-Za-z])
15 位身份证：(?<!\d)\d{15}(?!\d)
```

疑似诊疗卡号或长数字标识：

```text
连续 12 位以上数字：(?<!\d)\d{12,}(?!\d)
```

疑似长段医疗文本：

```text
包含 医嘱|诊断|病历|检查报告|处方|用药|病情|症状 且长度超过阈值的字符串
```

这些正则是后续脚本设计思路，正式脚本需要结合误报白名单和字段上下文。

## 失败处理

敏感字段检查失败时：

- 不应继续生成或发布 Demo JSON。
- 不应输出敏感原文到日志。
- 报告只记录文件、字段路径、规则名称、截断后的安全片段或哈希。
- 需要先修正导出 allowlist 或源数据安全导出，再重新检查。

## 检查脚本设计

本地检查脚本职责为：

1. 读取 `frontend/public/demo-data/*.json`。
2. 遍历字段名和值。
3. 检查字段名黑名单。
4. 检查中文和英文敏感关键词。
5. 检查手机号、身份证、长数字、长段医疗文本。
6. 检查 `unknown`、`undefined`、`NaN`。
7. 生成本地检查报告。
8. 失败时返回非零状态码。

脚本不得读取 `.env`，不得读取任何密钥，不得访问网络。
