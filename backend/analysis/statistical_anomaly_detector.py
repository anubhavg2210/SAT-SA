import pandas as pd


class StatisticalAnomalyDetector:

    def __init__(self, data):
        self.data = data

    def analyze(self):
        cases = self.data["cases"].copy()

        signals = []

        # ==================================================
        # 1. ALERT VOLUME SPIKE
        # ==================================================

        if "timestamp_created" in cases.columns:

            created = pd.to_datetime(
                cases["timestamp_created"],
                errors="coerce"
            )

            daily_counts = created.dt.date.value_counts()

            if len(daily_counts) >= 7:

                mean = daily_counts.mean()
                std = daily_counts.std()

                if std > 0:

                    threshold = mean + (3 * std)

                    spike_days = daily_counts[
                        daily_counts > threshold
                    ]

                    for day, count in spike_days.items():

                        signals.append({
                            "signal_code": "ALERT_VOLUME_SPIKE",

                            "date": str(day),

                            "observed_count": int(count),

                            "baseline_mean": round(
                                float(mean),
                                2
                            ),

                            "description": (
                                "Daily case volume is significantly "
                                "above the observed baseline."
                            )
                        })

        # ==================================================
        # 2. FAST CRITICAL CLOSURE
        # ==================================================

        required_columns = {
            "timestamp_created",
            "timestamp_closed",
            "severity"
        }

        if required_columns.issubset(cases.columns):

            created = pd.to_datetime(
                cases["timestamp_created"],
                errors="coerce"
            )

            closed = pd.to_datetime(
                cases["timestamp_closed"],
                errors="coerce"
            )

            cases["_duration_hours"] = (
                (closed - created)
                .dt.total_seconds()
                / 3600
            )

            critical = cases[
                (
                    cases["severity"]
                    .astype(str)
                    .str.upper()
                    == "CRITICAL"
                )
                & cases["_duration_hours"].notna()
            ]

            if len(critical) >= 10:

                median_duration = critical[
                    "_duration_hours"
                ].median()

                fast_cases = critical[
                    critical["_duration_hours"]
                    < (median_duration * 0.25)
                ]

                for _, row in fast_cases.iterrows():

                    signals.append({
                        "signal_code": "FAST_CRITICAL_CLOSURE",

                        "case_id": str(
                            row["case_id"]
                        ),

                        "duration_hours": round(
                            float(
                                row["_duration_hours"]
                            ),
                            2
                        ),

                        "severity": str(
                            row["severity"]
                        ),

                        "description": (
                            "Critical case closed substantially "
                            "faster than the critical-case baseline."
                        )
                    })

        return {
            "signals": signals,
            "signal_count": len(signals)
        }