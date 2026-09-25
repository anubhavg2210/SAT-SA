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
                "features_used": [],
            }

        df = cases.copy()

        features = []

        # ==================================================
        # 1. SEVERITY
        # ==================================================

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
                .str.strip()
                .str.upper()
                .map(severity_map)
                .fillna(0)
            )

            features.append("_severity_score")

        # ==================================================
        # 2. PRIORITY
        # ==================================================

        if "priority" in df.columns:

            priority_map = {
                "P4": 1,
                "P3": 2,
                "P2": 3,
                "P1": 4,
            }

            df["_priority_score"] = (
                df["priority"]
                .astype(str)
                .str.strip()
                .str.upper()
                .map(priority_map)
                .fillna(0)
            )

            features.append("_priority_score")

        # ==================================================
        # 3. STATUS
        # ==================================================

        if "status" in df.columns:

            status_map = {
                "CLOSED": 0,
                "OPEN": 1,
                "IN_PROGRESS": 2,
                "ESCALATED": 3,
            }

            df["_status_score"] = (
                df["status"]
                .astype(str)
                .str.strip()
                .str.upper()
                .map(status_map)
                .fillna(0)
            )

            features.append("_status_score")

        # ==================================================
        # 4. ESCALATION REQUIRED
        # ==================================================

        if "escalation_required" in df.columns:

            df["_escalation_required"] = (
                df["escalation_required"]
                .astype(str)
                .str.strip()
                .str.upper()
                .map({
                    "NO": 0,
                    "YES": 1,
                })
                .fillna(0)
            )

            features.append("_escalation_required")

        # ==================================================
        # 5. EVIDENCE AVAILABLE
        # ==================================================

        if "evidence_available" in df.columns:

            df["_evidence_available"] = (
                df["evidence_available"]
                .astype(str)
                .str.strip()
                .str.upper()
                .map({
                    "NO": 0,
                    "YES": 1,
                })
                .fillna(0)
            )

            features.append("_evidence_available")

        # ==================================================
        # 6. RAW LOG AVAILABLE
        # ==================================================

        if "raw_log_available" in df.columns:

            df["_raw_log_available"] = (
                df["raw_log_available"]
                .astype(str)
                .str.strip()
                .str.upper()
                .map({
                    "NO": 0,
                    "YES": 1,
                })
                .fillna(0)
            )

            features.append("_raw_log_available")

        # ==================================================
        # 7. FALSE POSITIVE
        # ==================================================

        if "false_positive" in df.columns:

            df["_false_positive"] = (
                df["false_positive"]
                .astype(str)
                .str.strip()
                .str.upper()
                .map({
                    "NO": 0,
                    "YES": 1,
                })
                .fillna(0)
            )

            features.append("_false_positive")

        # ==================================================
        # 8. INCIDENT CONFIRMED
        # ==================================================

        if "incident_confirmed" in df.columns:

            df["_incident_confirmed"] = (
                df["incident_confirmed"]
                .astype(str)
                .str.strip()
                .str.upper()
                .map({
                    "NO": 0,
                    "YES": 1,
                })
                .fillna(0)
            )

            features.append("_incident_confirmed")

        # ==================================================
        # 9. TIME FEATURES
        # ==================================================

        timestamp_columns = [
            "timestamp_created",
            "timestamp_detected",
            "timestamp_acknowledged",
            "timestamp_investigation_started",
            "timestamp_escalated",
            "timestamp_resolved",
            "timestamp_closed",
        ]

        for column in timestamp_columns:

            if column in df.columns:

                df[column] = pd.to_datetime(
                    df[column],
                    errors="coerce",
                    utc=True,
                )

        # Detection delay
        if {
            "timestamp_created",
            "timestamp_detected",
        }.issubset(df.columns):

            df["_detection_delay_hours"] = (
                (
                    df["timestamp_detected"]
                    - df["timestamp_created"]
                )
                .dt.total_seconds()
                / 3600
            )

            features.append("_detection_delay_hours")

        # Acknowledgement delay
        if {
            "timestamp_detected",
            "timestamp_acknowledged",
        }.issubset(df.columns):

            df["_ack_delay_hours"] = (
                (
                    df["timestamp_acknowledged"]
                    - df["timestamp_detected"]
                )
                .dt.total_seconds()
                / 3600
            )

            features.append("_ack_delay_hours")

        # Investigation start delay
        if {
            "timestamp_acknowledged",
            "timestamp_investigation_started",
        }.issubset(df.columns):

            df["_investigation_start_delay_hours"] = (
                (
                    df["timestamp_investigation_started"]
                    - df["timestamp_acknowledged"]
                )
                .dt.total_seconds()
                / 3600
            )

            features.append(
                "_investigation_start_delay_hours"
            )

        # Escalation delay
        if {
            "timestamp_investigation_started",
            "timestamp_escalated",
        }.issubset(df.columns):

            df["_escalation_delay_hours"] = (
                (
                    df["timestamp_escalated"]
                    - df["timestamp_investigation_started"]
                )
                .dt.total_seconds()
                / 3600
            )

            features.append(
                "_escalation_delay_hours"
            )

        # Resolution duration
        if {
            "timestamp_created",
            "timestamp_resolved",
        }.issubset(df.columns):

            df["_resolution_duration_hours"] = (
                (
                    df["timestamp_resolved"]
                    - df["timestamp_created"]
                )
                .dt.total_seconds()
                / 3600
            )

            features.append(
                "_resolution_duration_hours"
            )

        # Total case duration
        if {
            "timestamp_created",
            "timestamp_closed",
        }.issubset(df.columns):

            df["_case_duration_hours"] = (
                (
                    df["timestamp_closed"]
                    - df["timestamp_created"]
                )
                .dt.total_seconds()
                / 3600
            )

            features.append(
                "_case_duration_hours"
            )

        # ==================================================
        # FEATURE VALIDATION
        # ==================================================

        if not features:
            return {
                "signals": [],
                "signal_count": 0,
                "features_used": [],
            }

        X = (
            df[features]
            .replace(
                [float("inf"), float("-inf")],
                float("nan"),
            )
            .fillna(0)
        )

        if len(X) < 20:
            return {
                "signals": [],
                "signal_count": 0,
                "features_used": features,
            }

        # ==================================================
        # ISOLATION FOREST
        # ==================================================

        model = IsolationForest(
            n_estimators=200,
            contamination=0.10,
            random_state=42,
        )

        predictions = model.fit_predict(X)
        scores = model.decision_function(X)

        signals = []

        # ==================================================
        # SIGNAL GENERATION
        # ==================================================

        for index, prediction in enumerate(predictions):

            if prediction != -1:
                continue

            row = df.iloc[index]

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

                "anomaly_score": round(
                    float(scores[index]),
                    4,
                ),

                "features_used": features,

                "feature_values": feature_values,

                "description": (
                    "Case exhibits an unusual "
                    "multivariate operational pattern "
                    "relative to the dataset."
                ),
            })

        return {
            "signals": signals,
            "signal_count": len(signals),
            "features_used": features,
        }