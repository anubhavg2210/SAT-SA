import pandas as pd


class RepetitivePatternDetector:

    def __init__(self, data):
        self.data = data

    def analyze(self):
        signals = []

        alerts = self.data.get("alerts")

        if alerts is None or alerts.empty:
            return {
                "signals": [],
                "signal_count": 0
            }

        # Repeated alerts against the same asset
        if {"asset_id", "case_id"}.issubset(alerts.columns):
            counts = (
                alerts.groupby("asset_id")["case_id"]
                .nunique()
                .sort_values(ascending=False)
            )

            for asset_id, count in counts.items():
                if count >= 5:
                    signals.append({
                        "signal_code": "RECURRING_ASSET_ALERTS",
                        "asset_id": str(asset_id),
                        "case_count": int(count),
                        "description": (
                            "Asset has repeated alerts across "
                            "multiple cases."
                        )
                    })

        # Repeated closure patterns
        if {"assigned_team", "closure_reason"}.issubset(
            alerts.columns
        ):
            grouped = (
                alerts.groupby(
                    ["assigned_team", "closure_reason"]
                )
                .size()
                .reset_index(name="count")
            )

            for _, row in grouped.iterrows():
                if row["count"] >= 10:
                    signals.append({
                        "signal_code": "REPETITIVE_CLOSURE_PATTERN",
                        "assigned_team": str(row["assigned_team"]),
                        "closure_reason": str(row["closure_reason"]),
                        "count": int(row["count"]),
                        "description": (
                            "Repeated closure behaviour detected "
                            "for the same team and closure reason."
                        )
                    })

        return {
            "signals": signals,
            "signal_count": len(signals)
        }