import pandas as pd


class CaseAnalysisEngine:

    def __init__(self, data: dict):
        self.data = data

    def analyze_case(self, case_id: str):

        if "cases" not in self.data:
            raise ValueError("cases data is not loaded.")

        cases = self.data["cases"].copy()

        # Normalize case_id values
        cases["case_id"] = cases["case_id"].astype(str)

        case_rows = cases[cases["case_id"] == str(case_id)]

        if case_rows.empty:
            raise ValueError(f"Case not found: {case_id}")

        case = self._clean_record(
            case_rows.iloc[0].to_dict()
        )

        # -------------------------------------------------
        # DIRECT CASE-BASED DATA
        # -------------------------------------------------

        alerts = self._find_records(
            "alerts",
            "case_id",
            case_id
        )

        investigations = self._find_records(
            "investigations",
            "case_id",
            case_id
        )

        escalations = self._find_records(
            "escalations",
            "case_id",
            case_id
        )

        evidence = self._find_records(
            "evidence",
            "case_id",
            case_id
        )

        raw_logs = self._find_records(
            "raw_logs",
            "case_id",
            case_id
        )

        # -------------------------------------------------
        # EVENTS
        #
        # events.csv does NOT contain case_id.
        # Join through alert_id and asset_id.
        # -------------------------------------------------

        events = self._find_case_events(
            case,
            alerts
        )

        # -------------------------------------------------
        # ASSET
        # -------------------------------------------------

        asset = self._find_asset(
            case.get("asset_id")
        )

        # -------------------------------------------------
        # RESULT
        # -------------------------------------------------

        return {
            "case": case,

            "alerts": alerts,

            "investigations": investigations,

            "escalations": escalations,

            "evidence": evidence,

            "events": events,

            "asset": asset,

            "raw_logs": raw_logs,

            "record_counts": {
                "alerts": len(alerts),
                "investigations": len(investigations),
                "escalations": len(escalations),
                "evidence": len(evidence),
                "events": len(events),
                "raw_logs": len(raw_logs),
            },

            "evidence_summary": {
                "evidence_available": (
                    len(evidence) > 0
                    or str(case.get("evidence_available", "")).upper()
                    == "YES"
                ),
                "evidence_count": len(evidence),
                "raw_logs_available": (
                    len(raw_logs) > 0
                    or str(case.get("raw_log_available", "")).upper()
                    == "YES"
                ),
                "raw_log_count": len(raw_logs),
            },
        }

    # -----------------------------------------------------
    # GENERIC RECORD LOOKUP
    # -----------------------------------------------------

    def _find_records(
        self,
        dataset_name: str,
        column_name: str,
        value: str
    ):

        if dataset_name not in self.data:
            return []

        df = self.data[dataset_name].copy()

        if column_name not in df.columns:
            return []

        df[column_name] = df[column_name].astype(str)

        rows = df[
            df[column_name] == str(value)
        ]

        return [
            self._clean_record(row)
            for row in rows.to_dict(orient="records")
        ]

    # -----------------------------------------------------
    # EVENTS
    #
    # events -> alert_id
    # alerts -> case_id
    #
    # We therefore resolve:
    #
    # CASE
    #   ↓
    # ALERT
    #   ↓
    # EVENT
    # -----------------------------------------------------

    def _find_case_events(
        self,
        case: dict,
        alerts: list
    ):

        if "events" not in self.data:
            return []

        events_df = self.data["events"].copy()

        if "alert_id" not in events_df.columns:
            return []

        events_df["alert_id"] = (
            events_df["alert_id"].astype(str)
        )

        alert_ids = set()

        # Alert IDs from alerts.csv
        for alert in alerts:

            alert_id = alert.get("alert_id")

            if alert_id:
                alert_ids.add(str(alert_id))

        # Also use alert_id directly from cases.csv
        case_alert_id = case.get("alert_id")

        if case_alert_id:
            alert_ids.add(str(case_alert_id))

        if not alert_ids:
            return []

        rows = events_df[
            events_df["alert_id"].isin(alert_ids)
        ]

        return [
            self._clean_record(row)
            for row in rows.to_dict(orient="records")
        ]

    # -----------------------------------------------------
    # ASSET LOOKUP
    # -----------------------------------------------------

    def _find_asset(self, asset_id):

        if not asset_id:
            return None

        if "assets" not in self.data:
            return None

        assets = self.data["assets"].copy()

        if "asset_id" not in assets.columns:
            return None

        assets["asset_id"] = (
            assets["asset_id"].astype(str)
        )

        rows = assets[
            assets["asset_id"] == str(asset_id)
        ]

        if rows.empty:
            return None

        return self._clean_record(
            rows.iloc[0].to_dict()
        )

    # -----------------------------------------------------
    # CLEAN PANDAS / NUMPY VALUES
    #
    # Prevents JSON serialization problems.
    # -----------------------------------------------------

    def _clean_record(self, record):

        if isinstance(record, dict):

            return {
                key: self._clean_value(value)
                for key, value in record.items()
            }

        return {
            key: self._clean_value(value)
            for key, value in dict(record).items()
        }

    def _clean_value(self, value):

        if pd.isna(value):
            return None

        # Convert pandas/numpy scalar values
        if hasattr(value, "item"):

            try:
                return value.item()
            except (ValueError, TypeError):
                pass

        # Convert timestamps into strings
        if isinstance(value, pd.Timestamp):
            return value.isoformat()

        return value