class PeerComparisonDetector:

    def __init__(self, data):
        self.data = data

    def analyze(self):
        signals = []

        assets = self.data.get("assets")
        alerts = self.data.get("alerts")

        if assets is None or alerts is None:
            return {
                "signals": [],
                "signal_count": 0
            }

        if "asset_id" not in assets.columns:
            return {
                "signals": [],
                "signal_count": 0
            }

        if "asset_id" not in alerts.columns:
            return {
                "signals": [],
                "signal_count": 0
            }

        alert_counts = (
            alerts.groupby("asset_id")
            .size()
            .reset_index(name="alert_count")
        )

        merged = assets.merge(
            alert_counts,
            on="asset_id",
            how="left"
        )

        merged["alert_count"] = (
            merged["alert_count"].fillna(0)
        )

        if "asset_type" not in merged.columns:
            return {
                "signals": [],
                "signal_count": 0
            }

        peer_stats = (
            merged.groupby("asset_type")["alert_count"]
            .agg(["mean", "std"])
            .reset_index()
        )

        for _, row in merged.iterrows():

            peer = peer_stats[
                peer_stats["asset_type"] == row["asset_type"]
            ]

            if peer.empty:
                continue

            mean = float(peer.iloc[0]["mean"])
            std = float(peer.iloc[0]["std"])

            if std <= 0:
                continue

            deviation = (
                (float(row["alert_count"]) - mean) / std
            )

            if abs(deviation) >= 3:
                signals.append({
                    "signal_code": "PEER_BEHAVIOUR_DEVIATION",
                    "asset_id": str(row["asset_id"]),
                    "asset_type": str(row["asset_type"]),
                    "observed_alert_count": int(
                        row["alert_count"]
                    ),
                    "peer_mean": round(mean, 2),
                    "deviation_score": round(deviation, 2),
                    "description": (
                        "Asset alert activity is significantly "
                        "different from its peer group."
                    )
                })

        return {
            "signals": signals,
            "signal_count": len(signals)
        }