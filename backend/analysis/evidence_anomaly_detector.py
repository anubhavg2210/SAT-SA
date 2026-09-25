class EvidenceAnomalyDetector:

    def __init__(self, data):
        self.data = data

    def analyze(self):
        signals = []

        evidence = self.data.get("evidence")

        if evidence is None or evidence.empty:
            return {
                "signals": [],
                "signal_count": 0
            }

        # Missing evidence references
        if "evidence_reference" in evidence.columns:
            missing = evidence[
                evidence["evidence_reference"]
                .astype(str)
                .str.strip()
                .eq("")
            ]

            for _, row in missing.iterrows():
                signals.append({
                    "signal_code": "MISSING_EVIDENCE_REFERENCE",
                    "case_id": str(row.get("case_id", "")),
                    "description": (
                        "Evidence record exists but has no "
                        "evidence reference."
                    )
                })

        # Evidence marked unavailable
        if "evidence_available" in evidence.columns:
            unavailable = evidence[
                evidence["evidence_available"]
                .astype(str)
                .str.upper()
                .eq("NO")
            ]

            for _, row in unavailable.iterrows():
                signals.append({
                    "signal_code": "EVIDENCE_UNAVAILABLE",
                    "case_id": str(row.get("case_id", "")),
                    "description": (
                        "Evidence record indicates that "
                        "supporting evidence is unavailable."
                    )
                })

        # Evidence reference mismatch with cases
        cases = self.data.get("cases")

        if (
            cases is not None
            and "case_id" in evidence.columns
            and "case_id" in cases.columns
        ):
            case_ids = set(cases["case_id"])

            orphan = evidence[
                ~evidence["case_id"].isin(case_ids)
            ]

            for _, row in orphan.iterrows():
                signals.append({
                    "signal_code": "ORPHAN_EVIDENCE",
                    "case_id": str(row.get("case_id", "")),
                    "description": (
                        "Evidence references a case that "
                        "does not exist."
                    )
                })

        return {
            "signals": signals,
            "signal_count": len(signals)
        }
        