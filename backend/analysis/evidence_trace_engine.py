
from backend.analysis.supervisory_signal_catalog import (
    SIGNAL_CATALOG,
)


class EvidenceTraceEngine:

    def __init__(self, data):
        self.data = data

    def trace_signal(self, signal, all_signals=None):
        """
        Trace one signal back to its supporting records.

        Composite signals such as FUSED_FINDING are
        expanded through their supporting_signals.
        """

        signal_code = signal.get("signal_code")

        catalog_entry = SIGNAL_CATALOG.get(
            signal_code,
            {}
        )

        result = {
            "signal_code": signal_code,
            "case_id": signal.get("case_id"),
            "dimension": catalog_entry.get(
                "dimension"
            ),
            "category": catalog_entry.get(
                "category"
            ),
            "evidence_sources": catalog_entry.get(
                "evidence_sources",
                []
            ),
            "records": {},
        }

        # ---------------------------------
        # Composite signal
        # ---------------------------------
        supporting_signals = signal.get(
            "supporting_signals",
            []
        )

        if supporting_signals and all_signals:
            result["supporting_traces"] = []

            for supporting_code in supporting_signals:

                for candidate in all_signals:

                    if candidate.get(
                        "signal_code"
                    ) != supporting_code:
                        continue

                    if str(
                        candidate.get("case_id", signal.get("case_id"))
                    ) != str(
                        signal.get("case_id")
                    ):
                        continue

                    result["supporting_traces"].append(
                        self.trace_signal(
                            candidate,
                            all_signals,
                        )
                    )

        # ---------------------------------
        # Direct evidence
        # ---------------------------------
        for dataset_name in catalog_entry.get(
            "evidence_sources",
            []
        ):

            # Composite signals are represented
            # through supporting signals.
            if dataset_name == "case_signals":
                continue

            records = self._find_records(
                dataset_name,
                signal.get("case_id"),
            )

            result["records"][
                dataset_name
            ] = records

        return result

    def trace_case(self, case_id, signals):
        """
        Trace every signal belonging to a case.
        """

        traces = []

        for signal in signals:

            signal_case_id = signal.get(
                "case_id",
                case_id,
            )

            if str(signal_case_id) != str(case_id):
                continue

            traces.append(
                self.trace_signal(
                    signal,
                    signals,
                )
            )

        return {
            "case_id": str(case_id),
            "signal_count": len(traces),
            "traces": traces,
        }

    def _find_records(
        self,
        dataset_name,
        case_id,
    ):
        """
        Resolve records using the dataset relationships.
        """

        if dataset_name not in self.data:
            return []

        df = self.data[dataset_name]

        # ---------------------------------
        # Direct case relationship
        # ---------------------------------
        if "case_id" in df.columns:

            rows = df[
                df["case_id"].astype(str)
                == str(case_id)
            ]

            return rows.to_dict(
                orient="records"
            )

        # ---------------------------------
        # events -> alerts -> case
        # ---------------------------------
        if (
            dataset_name == "events"
            and "alert_id" in df.columns
        ):

            alerts = self.data.get("alerts")

            if alerts is None:
                return []

            case_alerts = alerts[
                alerts["case_id"].astype(str)
                == str(case_id)
            ]

            alert_ids = set(
                case_alerts["alert_id"].astype(str)
            )

            rows = df[
                df["alert_id"].astype(str).isin(
                    alert_ids
                )
            ]

            return rows.to_dict(
                orient="records"
            )

        return []