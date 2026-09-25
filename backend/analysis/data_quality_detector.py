import pandas as pd


class DataQualityDetector:

    def __init__(self, data):
        self.data = data

    def analyze(self):
        signals = []

        cases = self.data.get("cases")

        if cases is None or cases.empty:
            return {
                "signals": [],
                "signal_count": 0
            }

        # Missing timestamps
        timestamp_columns = [
            "created_at",
            "acknowledged_at",
            "investigation_started_at",
            "resolved_at",
            "closed_at",
        ]

        for column in timestamp_columns:
            if column in cases.columns:
                missing = cases[column].astype(str).str.strip().eq("")

                for case_id in cases.loc[missing, "case_id"]:
                    signals.append({
                        "signal_code": "MISSING_TIMESTAMP",
                        "case_id": str(case_id),
                        "column": column,
                        "description": (
                            f"Missing timestamp: {column}."
                        )
                    })

        # Contradictory timestamps
        if {
            "created_at",
            "closed_at"
        }.issubset(cases.columns):

            created = pd.to_datetime(
                cases["created_at"],
                errors="coerce"
            )

            closed = pd.to_datetime(
                cases["closed_at"],
                errors="coerce"
            )

            invalid = (
                created.notna()
                & closed.notna()
                & (closed < created)
            )

            for case_id in cases.loc[invalid, "case_id"]:
                signals.append({
                    "signal_code": "CONTRADICTORY_TIMESTAMPS",
                    "case_id": str(case_id),
                    "description": (
                        "Closed timestamp occurs before "
                        "created timestamp."
                    )
                })

        # Orphan child records
        case_ids = set(cases["case_id"])

        for dataset_name in [
            "alerts",
            "investigations",
            "escalations",
            "evidence",
            "events",
        ]:
            df = self.data.get(dataset_name)

            if df is None or "case_id" not in df.columns:
                continue

            orphan_rows = df[
                ~df["case_id"].isin(case_ids)
            ]

            for case_id in orphan_rows["case_id"].unique():
                signals.append({
                    "signal_code": "ORPHAN_RECORD",
                    "dataset": dataset_name,
                    "case_id": str(case_id),
                    "description": (
                        "Child record references a "
                        "non-existent case."
                    )
                })

        return {
            "signals": signals,
            "signal_count": len(signals)
        }
        