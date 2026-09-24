from __future__ import annotations

from typing import Any


def build_features(case: dict[str, Any]) -> dict[str, Any]:
    """
    Convert one normalized SAT-SA case into a standard feature dictionary.

    The same feature layer will later be consumed by:
    - Rule Engine
    - Statistical Engine
    - ML Engine
    """

    features: dict[str, Any] = {}

    # -------------------------
    # Case information
    # -------------------------

    features["case_id"] = case.get("case_id")
    features["severity"] = case.get("severity")
    features["status"] = case.get("status")

    # -------------------------
    # Operational timing
    # -------------------------

    features["detection_time_minutes"] = case.get(
        "detection_time_minutes"
    )

    features["investigation_time_minutes"] = case.get(
        "investigation_time_minutes"
    )

    features["escalation_time_minutes"] = case.get(
        "escalation_time_minutes"
    )

    features["resolution_time_minutes"] = case.get(
        "resolution_time_minutes"
    )

    # -------------------------
    # Evidence / documentation
    # -------------------------

    features["evidence_count"] = case.get(
        "evidence_count",
        0
    )

    features["has_investigation_notes"] = bool(
        case.get("investigation_notes")
    )

    features["has_root_cause"] = bool(
        case.get("root_cause")
    )

    features["has_escalation_reason"] = bool(
        case.get("escalation_reason")
    )

    return features