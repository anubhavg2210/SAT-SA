from backend.analysis.execution_gap_detector import ExecutionGapDetector
from backend.analysis.investigation_gap_detector import InvestigationGapDetector
from backend.analysis.negative_space_detector import NegativeSpaceDetector
from backend.analysis.statistical_anomaly_detector import StatisticalAnomalyDetector
from backend.analysis.repetitive_pattern_detector import RepetitivePatternDetector
from backend.analysis.data_quality_detector import DataQualityDetector
from backend.analysis.evidence_anomaly_detector import EvidenceAnomalyDetector
from backend.analysis.peer_comparison_detector import PeerComparisonDetector
from backend.analysis.ml_anomaly_detector import MLAnomalyDetector


CASE_LEVEL_DETECTORS = [
    ExecutionGapDetector,
    InvestigationGapDetector,
    NegativeSpaceDetector,
]


DATASET_LEVEL_DETECTORS = [
    StatisticalAnomalyDetector,
    RepetitivePatternDetector,
    DataQualityDetector,
    EvidenceAnomalyDetector,
    PeerComparisonDetector,
    MLAnomalyDetector,
]