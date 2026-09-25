from backend.analysis.supervisory_assessment_engine import (
    SupervisoryAssessmentEngine,
)
from backend.analysis.detector_registry import (
    CASE_LEVEL_DETECTORS,
    DATASET_LEVEL_DETECTORS,
)

from backend.analysis.confidence_engine import (
    ConfidenceEngine,
)

from backend.analysis.signal_fusion_engine import (
    SignalFusionEngine,
)

from backend.analysis.supervisory_signal_catalog import (
    SIGNAL_CATALOG,
)


class AnalysisEngine:

    def __init__(self, data):
        self.data = data

        self.confidence = ConfidenceEngine()

        self.fusion = SignalFusionEngine(data)

        self.supervisory = SupervisoryAssessmentEngine(data)

    # =====================================================
    # SIGNAL ENRICHMENT
    # =====================================================

    def _enrich_signal(self, signal):

        signal = dict(signal)

        signal_code = signal.get(
            "signal_code",
            "UNKNOWN",
        )

        # -------------------------------------------------
        # Add case/entity context
        # -------------------------------------------------

        case_id = signal.get("case_id")

        if (
            case_id is not None
            and "cases" in self.data
        ):

            cases = self.data["cases"]

            case_rows = cases[
                cases["case_id"].astype(str)
                == str(case_id)
            ]

            if not case_rows.empty:

                case = case_rows.iloc[0]

                signal["case_id"] = str(
                    case.get("case_id")
                )

                signal["cse_id"] = str(
                    case.get("cse_id")
                )

                signal["asset_id"] = str(
                    case.get("asset_id")
                )

                signal["severity"] = str(
                    case.get("severity")
                )

                signal["priority"] = str(
                    case.get("priority")
                )

        # -------------------------------------------------
        # Supervisory metadata
        # -------------------------------------------------

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

    # =====================================================
    # CASE ANALYSIS
    # =====================================================

    def analyze_case(self, case_id):

        signals = []

        # -------------------------------------------------
        # 1. CASE-LEVEL DETECTORS
        # -------------------------------------------------

        for detector_class in CASE_LEVEL_DETECTORS:

            detector = detector_class(
                self.data
            )

            result = detector.analyze_case(
                case_id
            )

            detector_signals = result.get(
                "signals",
                [],
            )

            for signal in detector_signals:

                enriched_signal = (
                    self._enrich_signal(
                        signal
                    )
                )

                signals.append(
                    enriched_signal
                )

        # -------------------------------------------------
        # 2. SIGNAL FUSION
        # -------------------------------------------------

        fusion_result = self.fusion.analyze_case(
            case_id
        )

        fused_signals = []

        for signal in fusion_result.get(
            "signals",
            [],
        ):

            if (
                signal.get("signal_code")
                == "FUSED_FINDING"
            ):

                fused_signals.append(
                    self._enrich_signal(
                        signal
                    )
                )

        signals.extend(
            fused_signals
        )

        # -------------------------------------------------
        # 3. CONFIDENCE
        # -------------------------------------------------

        confidence = (
            self.confidence.score_signals(
                signals
            )
        )

        # -------------------------------------------------
        # 4. RETURN CASE RESULT
        # -------------------------------------------------

        return {
            "case_id": str(case_id),

            "signals": signals,

            "signal_count": len(
                signals
            ),

            "confidence": confidence,

            "fusion": {
                "fused_signal_count": len(
                    fused_signals
                ),

                "findings": fused_signals,
            },
        }

    # =====================================================
    # DATASET ANALYSIS
    # =====================================================

    def analyze_dataset(self):

        dataset_signals = []

        # -------------------------------------------------
        # DATASET-LEVEL DETECTORS
        # -------------------------------------------------

        for detector_class in DATASET_LEVEL_DETECTORS:

            detector = detector_class(
                self.data
            )

            result = detector.analyze()

            detector_signals = result.get(
                "signals",
                [],
            )

            for signal in detector_signals:

                enriched_signal = (
                    self._enrich_signal(
                        signal
                    )
                )

                dataset_signals.append(
                    enriched_signal
                )

        # -------------------------------------------------
        # SIGNAL SUMMARY
        # -------------------------------------------------

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
                )
                + 1
            )

        # Preview only
        top_anomalies = (
            dataset_signals[:50]
        )

        return {
            "total_signals": len(
                dataset_signals
            ),

            "signal_summary": (
                signal_summary
            ),

            "dataset_signals": (
                dataset_signals
            ),

            "top_anomalies": (
                top_anomalies
            ),
        }

    # =====================================================
    # COMPLETE ANALYSIS
    # =====================================================

    def analyze_all(self):

        cases = self.data["cases"]

        case_results = []

        total_case_signals = 0

        case_signal_summary = {}

        # -------------------------------------------------
        # ANALYZE EVERY CASE
        # -------------------------------------------------

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

            # ---------------------------------------------
            # CASE SIGNAL SUMMARY
            # ---------------------------------------------

            for signal in result[
                "signals"
            ]:

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
                    )
                    + 1
                )

            # ---------------------------------------------
            # PRESERVE CASE RESULT
            # ---------------------------------------------

            if signal_count > 0:

                case_results.append(
                    result
                )
                # -------------------------------------------------
        # -------------------------------------------------
        # DATASET-LEVEL ANALYSIS
        # -------------------------------------------------

        dataset_result = (
            self.analyze_dataset()
        )

        # -------------------------------------------------
        # SUPERVISORY CSE-LEVEL ASSESSMENT
        # -------------------------------------------------

        supervisory_result = (
            self.supervisory.analyze(
                case_results
            )
        )

    
        # -------------------------------------------------
        # FINAL SUMMARY
        # -------------------------------------------------

        summary = {

            "total_cases": len(
                cases
            ),

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

        # -------------------------------------------------
        # FINAL RESULT
        # -------------------------------------------------

        return {

    "summary": summary,

    "case_results": (
        case_results
    ),

    "dataset_analysis": (
        dataset_result
    ),

    "cse_assessments": (
        supervisory_result
    ),
}