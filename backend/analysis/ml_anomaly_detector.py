import pandas as pd
from sklearn.ensemble import IsolationForest


class MLAnomalyDetector:

    def __init__(self, data):
        self.data = data

    def analyze(self):
        cases = self.data.get("cases")

        if cases is None or cases.empty:
            return {
                "signals": [],
                "signal_count": 0,
            }

        df = cases.copy()

        features = []

        # -------------------------
        # Severity
        # -------------------------
        if "severity" in df.columns:
            severity_map = {
                "LOW": 1,
                "MEDIUM": 2,
                "HIGH": 3,
                "CRITICAL": 4,
            }

            df["_severity_score"] = (
                df["severity"]
                .astype(str)
                .str.upper()
                .map(severity_map)
                .fillna(0)
            )

            features.append("_severity_score")

        # -------------------------
        # Status
        # -------------------------
        if "status" in df.columns:
            status_map = {
                "OPEN": 1,
                "IN_PROGRESS": 2,
                "ESCALATED": 3,
                "CLOSED": 0,
            }

            df["_status_score"] = (
                df["status"]
                .astype(str)
                .str.upper()
                .map(status_map)
                .fillna(0)
            )

            features.append("_status_score")

        # -------------------------
        # Case duration
        # -------------------------
        if {
            "created_at",
            "closed_at",
        }.issubset(df.columns):

            created = pd.to_datetime(
                df["created_at"],
                errors="coerce",
                utc=True,
            )

            closed = pd.to_datetime(
                df["closed_at"],
                errors="coerce",
                utc=True,
            )

            duration = (
                (closed - created)
                .dt.total_seconds()
                / 3600
            )

            median_duration = duration.median()

            if pd.isna(median_duration):
                median_duration = 0

            df["_duration_hours"] = (
                duration.fillna(median_duration)
            )

            features.append("_duration_hours")

        if not features:
            return {
                "signals": [],
                "signal_count": 0,
            }

        X = (
            df[features]
            .replace(
                [float("inf"), float("-inf")],
                0,
            )
            .fillna(0)
        )

        if len(X) < 20:
            return {
                "signals": [],
                "signal_count": 0,
                "features_used": features,
            }

        # -------------------------
        # Isolation Forest
        # -------------------------
        model = IsolationForest(
            n_estimators=100,
            contamination="auto",
            random_state=42,
        )

        predictions = model.fit_predict(X)
        scores = model.decision_function(X)

        signals = []

        for index, prediction in enumerate(predictions):

            if prediction != -1:
                continue

            row = df.iloc[index]

            # Identify which feature values contributed
            # to the unusual case profile.
            feature_values = {}

            for feature in features:
                value = row[feature]

                if pd.notna(value):
                    if isinstance(value, float):
                        feature_values[feature] = round(
                            float(value),
                            3,
                        )
                    else:
                        feature_values[feature] = value

            signals.append({
                "signal_code": "ML_ANOMALY",

                "case_id": str(
                    row["case_id"]
                ),

                # IsolationForest decision_function:
                # lower = more abnormal.
                "anomaly_score": round(
                    float(scores[index]),
                    4,
                ),

                "features_used": features,

                "feature_values": feature_values,

                "description": (
                    "Case has an unusual multivariate "
                    "feature combination compared with "
                    "the dataset."
                ),
            })

        return {
            "signals": signals,
            "signal_count": len(signals),
            "features_used": features,
        }