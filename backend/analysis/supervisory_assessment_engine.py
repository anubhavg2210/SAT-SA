from collections import defaultdict

from backend.analysis.supervisory_signal_catalog import (
    SIGNAL_CATALOG,
)


class SupervisoryAssessmentEngine:

    def __init__(self, data):
        self.data = data

    def analyze(self, case_results):
        """
        Build an auditable supervisory view from
        already-detected case signals.

        case_results:
            List of outputs from AnalysisEngine.analyze_case().
        """

        cse_summary = defaultdict(
            lambda: {
                "signal_count": 0,
                "signals_by_code": defaultdict(int),
                "dimensions": defaultdict(
                    lambda: {
                        "signal_count": 0,
                        "categories": defaultdict(int),
                        "case_ids": set(),
                    }
                ),
            }
        )

        for case_result in case_results:

            case_id = case_result.get("case_id")

            case = self._get_case(case_id)

            if case is None:
                continue

            cse_id = str(
                case.get("cse_id", "UNKNOWN")
            )

            for signal in case_result.get(
                "signals",
                [],
            ):

                signal_code = signal.get(
                    "signal_code",
                    "UNKNOWN",
                )

                metadata = SIGNAL_CATALOG.get(
                    signal_code
                )

                if metadata is None:
                    continue

                dimension = metadata.get(
                    "dimension",
                    "Unknown",
                )

                category = metadata.get(
                    "category",
                    "Unknown",
                )

                cse = cse_summary[cse_id]

                cse["signal_count"] += 1

                cse["signals_by_code"][
                    signal_code
                ] += 1

                dimension_result = cse[
                    "dimensions"
                ][dimension]

                dimension_result[
                    "signal_count"
                ] += 1

                dimension_result[
                    "categories"
                ][category] += 1

                dimension_result[
                    "case_ids"
                ].add(case_id)

        return self._serialize(
            cse_summary
        )

    def _get_case(self, case_id):
        cases = self.data.get("cases")

        if cases is None:
            return None

        rows = cases[
            cases["case_id"].astype(str)
            == str(case_id)
        ]

        if rows.empty:
            return None

        return rows.iloc[0].to_dict()

    def _serialize(self, cse_summary):

        result = {}

        for cse_id, cse_data in cse_summary.items():

            dimensions = {}

            for (
                dimension,
                dimension_data,
            ) in cse_data[
                "dimensions"
            ].items():

                dimensions[dimension] = {
                    "signal_count": (
                        dimension_data[
                            "signal_count"
                        ]
                    ),
                    "categories": dict(
                        dimension_data[
                            "categories"
                        ]
                    ),
                    "case_ids": sorted(
                        dimension_data[
                            "case_ids"
                        ]
                    ),
                }

            result[cse_id] = {
                "signal_count": (
                    cse_data[
                        "signal_count"
                    ]
                ),
                "signals_by_code": dict(
                    cse_data[
                        "signals_by_code"
                    ]
                ),
                "dimensions": dimensions,
            }

        return result