from backend.analysis.detector_registry import (
    CASE_LEVEL_DETECTORS,
    DATASET_LEVEL_DETECTORS,
)
from backend.analysis.confidence_engine import ConfidenceEngine
from backend.analysis.signal_fusion_engine import SignalFusionEngine
from backend.analysis.supervisory_signal_catalog import (
    SIGNAL_CATALOG,
)


class AnalysisEngine:

    def __init__(self, data):
        self.data = data
        self.confidence = ConfidenceEngine()
        self.fusion = SignalFusionEngine(data)

    def _enrich_signal(self, signal):
        signal = dict(signal)

        signal_code = signal.get(
            "signal_code",
            "UNKNOWN",
        )

        metadata = SIGNAL_CATALOG.get(
            signal_code
        )

        if metadata:
            signal["supervisory_dimension"] = (
                metadata["dimension"]
            )

            signal["signal_category"] = (
                metadata["category"]
            )

            signal["evidence_sources"] = (
                metadata["evidence_sources"]
            )

        return signal

    def analyze_case(self, case_id):
        signals = []

        # -------------------------
        # Case-level detectors
        # -------------------------
        for detector_class in CASE_LEVEL_DETECTORS:
            detector = detector_class(self.data)

            result = detector.analyze_case(case_id)

            signals.extend(
                self._enrich_signal(signal)
                for signal in result.get(
                    "signals",
                    [],
                )
            )

        # -------------------------
        # Signal fusion
        # -------------------------
        fusion_result = self.fusion.analyze_case(
            case_id
        )

        fused_signals = [
            signal
            for signal in fusion_result.get(
                "signals",
                [],
            )
            if signal.get(
                "signal_code"
            ) == "FUSED_FINDING"
        ]

        signals.extend(
            self._enrich_signal(signal)
            for signal in fused_signals
        )

        # -------------------------
        # Confidence
        # -------------------------
        confidence = self.confidence.score_signals(
            signals
        )

        return {
            "case_id": case_id,
            "signals": signals,
            "signal_count": len(signals),
            "confidence": confidence,
            "fusion": {
                "fused_signal_count": len(
                    fused_signals
                ),
                "findings": fused_signals,
            },
        }

    def analyze_dataset(self):
        dataset_signals = []

        # -------------------------
        # Dataset-level detectors
        # -------------------------
        for detector_class in DATASET_LEVEL_DETECTORS:
            detector = detector_class(self.data)

            result = detector.analyze()

            dataset_signals.extend(
                self._enrich_signal(signal)
                for signal in result.get(
                    "signals",
                    [],
                )
            )

        # -------------------------
        # Signal summary
        # -------------------------
        signal_summary = {}

        for signal in dataset_signals:
            signal_code = signal.get(
                "signal_code",
                "UNKNOWN",
            )

            signal_summary[signal_code] = (
                signal_summary.get(
                    signal_code,
                    0,
                ) + 1
            )

        # Display preview only.
        # ALL signals remain in dataset_signals.
        top_anomalies = dataset_signals[:50]

        return {
            "total_signals": len(
                dataset_signals
            ),
            "signal_summary": signal_summary,
            "dataset_signals": dataset_signals,
            "top_anomalies": top_anomalies,
        }

    def analyze_all(self):
        cases = self.data["cases"]

        case_results = []

        total_case_signals = 0
        case_signal_summary = {}

        # -------------------------
        # Analyze every case
        # -------------------------
        for case_id in cases["case_id"]:

            result = self.analyze_case(
                str(case_id)
            )

            signal_count = result[
                "signal_count"
            ]

            total_case_signals += (
                signal_count
            )

            # Count case-level signals
            for signal in result["signals"]:
                signal_code = signal.get(
                    "signal_code",
                    "UNKNOWN",
                )

                case_signal_summary[
                    signal_code
                ] = (
                    case_signal_summary.get(
                        signal_code,
                        0,
                    ) + 1
                )

            # Preserve complete case result
            if signal_count > 0:
                case_results.append(result)

        # -------------------------
        # Dataset-level analysis
        # -------------------------
        dataset_result = (
            self.analyze_dataset()
        )

        # -------------------------
        # Final summary
        # -------------------------
        summary = {
            "total_cases": len(cases),
            "cases_with_anomalies": len(
                case_results
            ),
            "cases_without_anomalies": (
                len(cases)
                - len(case_results)
            ),
            "total_case_signals": (
                total_case_signals
            ),
            "total_dataset_signals": (
                dataset_result[
                    "total_signals"
                ]
            ),
            "total_signals": (
                total_case_signals
                + dataset_result[
                    "total_signals"
                ]
            ),
            "case_signal_summary": (
                case_signal_summary
            ),
            "dataset_signal_summary": (
                dataset_result[
                    "signal_summary"
                ]
            ),
        }

        return {
            # Layer 1
            "summary": summary,

            # Layer 2
            "case_results": case_results,

            # Layer 3
            "dataset_analysis": (
                dataset_result
            ),
        }