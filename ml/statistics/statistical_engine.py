from __future__ import annotations

from typing import Any

import numpy as np


def calculate_baseline(values: list[float]) -> dict[str, float | None]:
    """
    Calculate robust statistical baseline for a numeric feature.
    """

    clean_values = [
        float(value)
        for value in values
        if value is not None
    ]

    if not clean_values:
        return {
            "count": 0,
            "median": None,
            "q1": None,
            "q3": None,
            "iqr": None,
            "mad": None,
        }

    array = np.asarray(clean_values, dtype=float)

    median = float(np.median(array))
    q1 = float(np.percentile(array, 25))
    q3 = float(np.percentile(array, 75))
    iqr = q3 - q1

    mad = float(
        np.median(np.abs(array - median))
    )

    return {
        "count": len(clean_values),
        "median": median,
        "q1": q1,
        "q3": q3,
        "iqr": iqr,
        "mad": mad,
    }


def detect_deviation(
    value: float,
    baseline: dict[str, float | None],
) -> dict[str, Any]:
    """
    Compare one observation against a calculated baseline.
    """

    median = baseline.get("median")
    iqr = baseline.get("iqr")
    mad = baseline.get("mad")

    if median is None:
        return {
            "is_deviation": False,
            "deviation_score": None,
            "reason": "No baseline available",
        }

    value = float(value)

    # Robust deviation using MAD where possible.
    if mad is not None and mad > 0:
        deviation_score = abs(value - median) / mad
    elif iqr is not None and iqr > 0:
        deviation_score = abs(value - median) / iqr
    else:
        deviation_score = 0.0

    return {
        "is_deviation": deviation_score >= 3.0,
        "deviation_score": round(
            float(deviation_score),
            4,
        ),
        "reason": (
            "Observation is statistically "
            "far from the baseline"
            if deviation_score >= 3.0
            else "Observation is within baseline range"
        ),
    }