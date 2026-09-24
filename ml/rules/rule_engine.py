from __future__ import annotations

from pathlib import Path
from typing import Any

import yaml


def load_rules(path: str | Path) -> list[dict[str, Any]]:
    """Load rule definitions from YAML."""

    rule_path = Path(path)

    with rule_path.open("r", encoding="utf-8") as file:
        data = yaml.safe_load(file)

    return data.get("rules", [])


def evaluate_condition(
    actual_value: Any,
    operator: str,
    expected_value: Any,
) -> bool:
    """Evaluate one generic rule condition."""

    if operator == "eq":
        return actual_value == expected_value

    if operator == "neq":
        return actual_value != expected_value

    if operator == "gt":
        return actual_value is not None and actual_value > expected_value

    if operator == "gte":
        return actual_value is not None and actual_value >= expected_value

    if operator == "lt":
        return actual_value is not None and actual_value < expected_value

    if operator == "lte":
        return actual_value is not None and actual_value <= expected_value

    if operator == "contains":
        return expected_value in actual_value

    raise ValueError(f"Unsupported operator: {operator}")


def evaluate_rules(
    features: dict[str, Any],
    rules: list[dict[str, Any]],
) -> list[dict[str, Any]]:
    """Evaluate all configured rules against one feature set."""

    findings = []

    for rule in rules:
        condition = rule["condition"]

        field = condition["field"]
        operator = condition["operator"]
        expected = condition["value"]

        actual = features.get(field)

        triggered = evaluate_condition(
            actual,
            operator,
            expected,
        )

        if triggered:
            findings.append(
                {
                    "rule_id": rule["id"],
                    "rule_name": rule["name"],
                    "category": rule["category"],
                    "severity": rule["severity"],
                    "message": rule["message"],
                    "field": field,
                    "observed_value": actual,
                    "expected_value": expected,
                }
            )

    return findings