class ConfidenceEngine:

    SIGNAL_WEIGHTS = {
        "ESCALATION_GAP": 3,
        "MISSING_INVESTIGATION_RECORD": 3,
        "INVESTIGATION_EVIDENCE_GAP": 2,
        "MISSING_SOURCE_EVENTS": 2,
        "LOW_TELEMETRY_CRITICAL_CASE": 2,
        "INVESTIGATION_ABSENCE": 2,
        "ALERT_VOLUME_SPIKE": 2,
        "FAST_CRITICAL_CLOSURE": 2,
        "RECURRING_ASSET_ALERTS": 1,
        "REPETITIVE_CLOSURE_PATTERN": 1,
        "MISSING_TIMESTAMP": 1,
        "CONTRADICTORY_TIMESTAMPS": 2,
        "ORPHAN_RECORD": 1,
        "MISSING_EVIDENCE_REFERENCE": 1,
        "EVIDENCE_UNAVAILABLE": 2,
        "ORPHAN_EVIDENCE": 2,
        "PEER_BEHAVIOUR_DEVIATION": 2,
        "ML_ANOMALY": 1,
    }

    def score_signals(self, signals):

        total_weight = 0

        for signal in signals:
            code = signal.get("signal_code", "")
            total_weight += self.SIGNAL_WEIGHTS.get(code, 1)

        if total_weight >= 7:
            priority = "HIGH"
        elif total_weight >= 4:
            priority = "MEDIUM"
        elif total_weight > 0:
            priority = "LOW"
        else:
            priority = "NONE"

        return {
            "signal_count": len(signals),
            "confidence_score": total_weight,
            "priority": priority
        }
        