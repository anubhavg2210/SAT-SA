class NegativeSpaceDetector:

    def __init__(self, data):
        self.data = data

    def analyze_case(self, case_id):
        cases = self.data["cases"]

        rows = cases[cases["case_id"] == case_id]

        if rows.empty:
            raise ValueError(f"Case not found: {case_id}")

        case = rows.iloc[0]
        signals = []

        investigations = self._find_records(
            "investigations", case_id
        )

        events = self._find_records(
            "events", case_id
        )

        alerts = self._find_records(
            "alerts", case_id
        )

        # Missing source events
        if alerts and not events:
            signals.append({
                "signal_code": "MISSING_SOURCE_EVENTS",
                "description": (
                    "Alert records exist but no source events "
                    "were found for this case."
                )
            })

        # Critical case with no telemetry
        severity = str(
            case.get("severity", "")
        ).upper()

        if severity == "CRITICAL" and not events:
            signals.append({
                "signal_code": "LOW_TELEMETRY_CRITICAL_CASE",
                "description": (
                    "Critical case has no associated event telemetry."
                )
            })

        # Investigation absence
        if not investigations:
            signals.append({
                "signal_code": "INVESTIGATION_ABSENCE",
                "description": (
                    "No investigation record exists for this case."
                )
            })

        return {
            "case_id": case_id,
            "signals": signals,
            "signal_count": len(signals)
        }

    def _find_records(self, dataset_name, case_id):

        if dataset_name not in self.data:
            return []

        df = self.data[dataset_name]

        if "case_id" not in df.columns:
            return []

        rows = df[df["case_id"] == case_id]

        return rows.to_dict(orient="records")