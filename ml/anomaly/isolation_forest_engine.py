from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest


class IsolationForestEngine:
    """Generic SAT-SA anomaly detection engine."""

    def __init__(
        self,
        contamination: float = 0.05,
        random_state: int = 42,
        n_estimators: int = 200,
    ) -> None:
        self.model = IsolationForest(
            n_estimators=n_estimators,
            contamination=contamination,
            random_state=random_state,
        )

        self.feature_names: list[str] = []
        self.is_fitted = False

    def fit(
        self,
        features: pd.DataFrame,
    ) -> "IsolationForestEngine":
        """Train the anomaly detector."""

        numeric_features = self._prepare_features(features)

        self.feature_names = list(numeric_features.columns)

        self.model.fit(numeric_features)

        self.is_fitted = True

        return self

    def predict(
        self,
        features: pd.DataFrame,
    ) -> pd.DataFrame:
        """Generate anomaly predictions."""

        if not self.is_fitted:
            raise RuntimeError(
                "Model must be fitted before prediction."
            )

        numeric_features = self._prepare_features(
            features,
            expected_columns=self.feature_names,
        )

        labels = self.model.predict(numeric_features)

        scores = self.model.decision_function(
            numeric_features
        )

        result = features.copy()

        result["anomaly_label"] = labels
        result["anomaly_score"] = scores

        return result

    @staticmethod
    def _prepare_features(
        features: pd.DataFrame,
        expected_columns: list[str] | None = None,
    ) -> pd.DataFrame:
        """Prepare numeric features for the ML model."""

        numeric = features.select_dtypes(
            include=np.number
        ).copy()

        if numeric.empty:
            raise ValueError(
                "No numeric features available for ML analysis."
            )

        if expected_columns is not None:
            missing_columns = [
                column
                for column in expected_columns
                if column not in numeric.columns
            ]

            if missing_columns:
                raise ValueError(
                    "Missing expected ML features: "
                    f"{missing_columns}"
                )

            numeric = numeric[expected_columns]

        numeric = numeric.replace(
            [np.inf, -np.inf],
            np.nan,
        )

        numeric = numeric.fillna(
            numeric.median()
        )

        numeric = numeric.fillna(0.0)

        return numeric

    def get_model_info(self) -> dict[str, Any]:
        """Return model metadata."""

        return {
            "model_type": "IsolationForest",
            "is_fitted": self.is_fitted,
            "feature_names": self.feature_names,
            "n_estimators": self.model.n_estimators,
            "contamination": self.model.contamination,
            "random_state": self.model.random_state,
        }