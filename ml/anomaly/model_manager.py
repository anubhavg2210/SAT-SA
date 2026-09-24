from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib


def save_model(
    model: Any,
    model_path: str | Path,
) -> None:
    """Save a trained model locally."""

    path = Path(model_path)
    path.parent.mkdir(parents=True, exist_ok=True)

    joblib.dump(model, path)


def load_model(
    model_path: str | Path,
) -> Any:
    """Load a locally stored model."""

    path = Path(model_path)

    if not path.exists():
        raise FileNotFoundError(
            f"Model file not found: {path}"
        )

    return joblib.load(path)


def model_exists(
    model_path: str | Path,
) -> bool:
    """Check whether a model artifact exists."""

    return Path(model_path).exists()


def get_model_metadata(
    model: Any,
) -> dict[str, Any]:
    """Return basic metadata for traceability."""

    metadata = {
        "model_type": type(model).__name__,
    }

    if hasattr(model, "feature_names"):
        metadata["feature_names"] = model.feature_names

    if hasattr(model, "is_fitted"):
        metadata["is_fitted"] = model.is_fitted

    return metadata