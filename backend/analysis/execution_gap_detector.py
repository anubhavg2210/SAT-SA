class ExecutionGapDetector:

    def __init__(self, data):
        self.data = data

    def analyze_case(self, case_id):
        cases = self.data["cases"]

        case_rows = cases[cases["case_id"] == case_id]

        if case_rows.empty:
            raise ValueError(f"Case not found: {case_id}")

        case = case_rows.iloc[0]

        signals = []

        # 1. Escalation gap
        escalation_required = str(
            case.get("escalation_required", "")
        ).upper()

        if escalation_required == "YES":
            escalations = self._find_records(
                "escalations",
                case_id
            )

            if not escalations:
                signals.append({
                    "signal_code": "ESCALATION_GAP",
                    "description": (
                        "Escalation was required but "
                        "no escalation record was found."
                    )
                })

        # 2. Investigation evidence gap
        investigations = self._find_records(
            "investigations",
            case_id
        )

        evidence = self._find_records(
            "evidence",
            case_id
        )

        if investigations and not evidence:
            signals.append({
                "signal_code": "INVESTIGATION_EVIDENCE_GAP",
                "description": (
                    "Investigation exists but no evidence "
                    "record was found."
                )
            })

        # 3. Missing investigation record
        if not investigations:
            signals.append({
                "signal_code": "MISSING_INVESTIGATION_RECORD",
                "description": (
                    "No investigation record was found "
                    "for this case."
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