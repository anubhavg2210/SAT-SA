from backend.analysis.relationship_resolver import RelationshipResolver


class NegativeSpaceDetector:

    def __init__(self, data):
        self.data = data
        self.relationships = RelationshipResolver(data)

    def analyze_case(self, case_id):

        cases = self.relationships.get_case(case_id)

        if not cases:
            raise ValueError(
                f"Case not found: {case_id}"
            )

        case = cases[0]

        alerts = self.relationships.get_alerts(
            case_id
        )

        events = self.relationships.get_events(
            case_id
        )

        signals = []

        # --------------------------------
        # Missing source events
        # --------------------------------
        if alerts and not events:
            signals.append({
                "signal_code": "MISSING_SOURCE_EVENTS",
                "description": (
                    "Alert records exist but expected "
                    "source events are absent."
                ),
            })

        # --------------------------------
        # Critical case with low telemetry
        # --------------------------------
        severity = str(
            case.get("severity", "")
        ).upper()

        if severity == "CRITICAL" and not events:
            signals.append({
                "signal_code": (
                    "LOW_TELEMETRY_CRITICAL_CASE"
                ),
                "description": (
                    "Critical case has little or no "
                    "associated event telemetry."
                ),
            })

        return {
            "case_id": case_id,
            "signals": signals,
            "signal_count": len(signals),
        }