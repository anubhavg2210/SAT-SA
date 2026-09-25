class RelationshipResolver:

    def __init__(self, data):
        self.data = data

    def get_case(self, case_id):
        return self._find_by_column(
            "cases",
            "case_id",
            case_id,
        )

    def get_alerts(self, case_id):
        return self._find_by_column(
            "alerts",
            "case_id",
            case_id,
        )

    def get_investigations(self, case_id):
        return self._find_by_column(
            "investigations",
            "case_id",
            case_id,
        )

    def get_escalations(self, case_id):
        return self._find_by_column(
            "escalations",
            "case_id",
            case_id,
        )

    def get_evidence(self, case_id):
        return self._find_by_column(
            "evidence",
            "case_id",
            case_id,
        )

    def get_assets(self, case_id):
        cases = self.get_case(case_id)

        if not cases:
            return []

        asset_id = cases[0].get("asset_id")

        if not asset_id:
            return []

        return self._find_by_column(
            "assets",
            "asset_id",
            asset_id,
        )

    def get_events(self, case_id):
        """
        Events do not contain case_id.

        Relationship:
            case -> alert -> event
        """

        alerts = self.get_alerts(case_id)

        if not alerts:
            return []

        alert_ids = {
            str(alert.get("alert_id"))
            for alert in alerts
            if alert.get("alert_id") is not None
        }

        events = self.data.get("events")

        if events is None:
            return []

        if "alert_id" not in events.columns:
            return []

        rows = events[
            events["alert_id"]
            .astype(str)
            .isin(alert_ids)
        ]

        return rows.to_dict(
            orient="records"
        )

    def get_case_context(self, case_id):
        """
        Return all records connected to a case.
        """

        return {
            "case": self.get_case(case_id),
            "alerts": self.get_alerts(case_id),
            "investigations": self.get_investigations(
                case_id
            ),
            "escalations": self.get_escalations(
                case_id
            ),
            "evidence": self.get_evidence(
                case_id
            ),
            "events": self.get_events(case_id),
            "assets": self.get_assets(case_id),
        }

    def _find_by_column(
        self,
        dataset_name,
        column_name,
        value,
    ):
        if dataset_name not in self.data:
            return []

        df = self.data[dataset_name]

        if column_name not in df.columns:
            return []

        rows = df[
            df[column_name].astype(str)
            == str(value)
        ]

        return rows.to_dict(
            orient="records"
        )