import pandas as pd


class CaseAnalysisEngine:

    def __init__(self, data: dict):
        self.data = data

    def analyze_case(self, case_id: str):

        if "cases" not in self.data:
            raise ValueError("cases data is not loaded.")

        cases = self.data["cases"]

        case_rows = cases[cases["case_id"] == case_id]

        if case_rows.empty:
            raise ValueError(f"Case not found: {case_id}")

        case = case_rows.iloc[0].to_dict()

        result = {
            "case": case,
            "alerts": self._find_records("alerts", case_id),
            "investigations": self._find_records(
                "investigations", case_id
            ),
            "escalations": self._find_records(
                "escalations", case_id
            ),
            "evidence": self._find_records(
                "evidence", case_id
            ),
            "events": self._find_records(
                "events", case_id
            ),
        }

        # Asset information
        asset_id = case.get("asset_id")

        if asset_id and "assets" in self.data:
            assets = self.data["assets"]

            asset_rows = assets[
                assets["asset_id"] == asset_id
            ]

            result["asset"] = (
                asset_rows.iloc[0].to_dict()
                if not asset_rows.empty
                else None
            )
        else:
            result["asset"] = None

        # Optional raw logs
        if "raw_logs" in self.data:
            result["raw_logs"] = self._find_records(
                "raw_logs", case_id
            )

        return result

    def _find_records(self, dataset_name: str, case_id: str):

        if dataset_name not in self.data:
            return []

        df = self.data[dataset_name]

        if "case_id" not in df.columns:
            return []

        rows = df[df["case_id"] == case_id]

        return rows.to_dict(orient="records")