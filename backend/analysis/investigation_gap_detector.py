class InvestigationGapDetector:

    def __init__(self, data):
        self.data = data

    def analyze_case(self, case_id):
        cases = self.data["cases"]

        rows = cases[cases["case_id"] == case_id]

        if rows.empty:
            raise ValueError(f"Case not found: {case_id}")

        investigations = self._find_records(
            "investigations",
            case_id
        )

        evidence = self._find_records(
            "evidence",
            case_id
        )

        signals = []

        if not investigations:
            signals.append(
                {
                    "signal_code": "MISSING_INVESTIGATION_RECORD",
                    "description": (
                        "No investigation record was found "
                        "for this case."
                    )
                }
            )

        elif not evidence:
            signals.append(
                {
                    "signal_code": "INVESTIGATION_EVIDENCE_GAP",
                    "description": (
                        "Investigation exists but no evidence "
                        "record was found."
                    )
                }
            )

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
        