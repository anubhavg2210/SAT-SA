SIGNAL_CATALOG = {

    "MISSING_SOURCE_EVENTS": {
        "dimension": "Threat Detection",
        "category": "Negative Space",
        "evidence_sources": [
            "alerts",
            "events",
        ],
        "description": (
            "Alert records exist but expected source "
            "events are absent."
        ),
    },

    "LOW_TELEMETRY_CRITICAL_CASE": {
        "dimension": "Threat Detection",
        "category": "Negative Space",
        "evidence_sources": [
            "cases",
            "assets",
            "events",
        ],
        "description": (
            "Critical case has little or no associated "
            "event telemetry."
        ),
    },

    "ESCALATION_GAP": {
        "dimension": "Escalation",
        "category": "Execution Gap",
        "evidence_sources": [
            "cases",
            "escalations",
        ],
        "description": (
            "Escalation was required but corresponding "
            "escalation evidence is absent."
        ),
    },

    "MISSING_INVESTIGATION_RECORD": {
        "dimension": "Investigation",
        "category": "Negative Space",
        "evidence_sources": [
            "cases",
            "investigations",
        ],
        "description": (
            "Case activity indicates an investigation "
            "was expected but no investigation record exists."
        ),
    },

    "INVESTIGATION_ABSENCE": {
        "dimension": "Investigation",
        "category": "Negative Space",
        "evidence_sources": [
            "cases",
            "investigations",
        ],
        "description": (
            "Expected investigation activity is absent."
        ),
    },

    "INVESTIGATION_EVIDENCE_GAP": {
        "dimension": "Investigation",
        "category": "Execution Gap",
        "evidence_sources": [
            "investigations",
            "evidence",
        ],
        "description": (
            "Investigation exists but supporting evidence "
            "is insufficient or absent."
        ),
    },

    "RECURRING_ASSET_ALERTS": {
        "dimension": "Security Operations",
        "category": "Operational Pattern",
        "evidence_sources": [
            "alerts",
            "assets",
        ],
        "description": (
            "Repeated alerts are associated with the same asset."
        ),
    },

    "ORPHAN_RECORD": {
        "dimension": "Operational Discipline",
        "category": "Data Integrity",
        "evidence_sources": [
            "validation",
        ],
        "description": (
            "A record references a parent record that does not exist."
        ),
    },

    "ORPHAN_EVIDENCE": {
        "dimension": "Investigation",
        "category": "Data Integrity",
        "evidence_sources": [
            "evidence",
            "cases",
        ],
        "description": (
            "Evidence exists without a corresponding case."
        ),
    },

    "PEER_BEHAVIOUR_DEVIATION": {
        "dimension": "Governance and Oversight",
        "category": "Peer Deviation",
        "evidence_sources": [
            "cases",
        ],
        "description": (
            "Operational behaviour differs materially from "
            "the comparison group."
        ),
    },

    "ML_ANOMALY": {
        "dimension": "Security Operations",
        "category": "Statistical/ML Anomaly",
        "evidence_sources": [
            "cases",
        ],
        "description": (
            "Case exhibits an unusual multivariate feature "
            "combination relative to the dataset."
        ),
    },

    "FUSED_FINDING": {
        "dimension": "Cyber Resilience",
        "category": "Composite Finding",
        "evidence_sources": [
            "case_signals",
        ],
        "description": (
            "Multiple signals combine to indicate a broader "
            "supervisory concern."
        ),
    },
}