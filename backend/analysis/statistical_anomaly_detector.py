import pandas as pd


class StatisticalAnomalyDetector:

    def __init__(self, data):
        self.data = data

    def analyze(self):
        cases = self.data["cases"].copy()

        signals = []

        # Alert volume by day
        if "created_at" in cases.columns:
            created = pd.to_datetime(
                cases["created_at"],
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
                            "baseline_mean": round(float(mean), 2),
                            "description": (
                                "Daily case volume is significantly "
                                "above the observed baseline."
                            )
                        })

        # Severity-specific closure-time anomalies
        if {
            "created_at",
            "closed_at",
            "severity"
        }.issubset(cases.columns):

            created = pd.to_datetime(
                cases["created_at"],
                errors="coerce"
            )

            closed = pd.to_datetime(
                cases["closed_at"],
                errors="coerce"
            )

            cases["_duration_hours"] = (
                (closed - created).dt.total_seconds() / 3600
            )

            critical = cases[
                (cases["severity"].str.upper() == "CRITICAL")
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
                        "case_id": row["case_id"],
                        "duration_hours": round(
                            float(row["_duration_hours"]), 2
                        ),
                        "severity": row["severity"],
                        "description": (
                            "Critical case closed substantially "
                            "faster than the critical-case baseline."
                        )
                    })

            cases.drop(
                columns=["_duration_hours"],
                inplace=True,
                errors="ignore"
            )

        return {
            "signals": signals,
            "signal_count": len(signals)
        }