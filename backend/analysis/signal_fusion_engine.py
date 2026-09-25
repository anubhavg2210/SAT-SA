class SignalFusionEngine:

    def __init__(self, data):
        self.data = data

    def analyze_case(self, case_id):
        all_signals = []

        # -------------------------
        # Case-level detectors
        # -------------------------

        from backend.analysis.execution_gap_detector import (
            ExecutionGapDetector
        )

        execution = ExecutionGapDetector(
            self.data
        ).analyze_case(case_id)

        all_signals.extend(
            execution.get("signals", [])
        )

        from backend.analysis.investigation_gap_detector import (
            InvestigationGapDetector
        )

        investigation = InvestigationGapDetector(
            self.data
        ).analyze_case(case_id)

        all_signals.extend(
            investigation.get("signals", [])
        )

        from backend.analysis.negative_space_detector import (
            NegativeSpaceDetector
        )

        negative_space = NegativeSpaceDetector(
            self.data
        ).analyze_case(case_id)

        all_signals.extend(
            negative_space.get("signals", [])
        )

        # -------------------------
        # Build signal-code index
        # -------------------------

        signal_codes = {
            signal.get("signal_code")
            for signal in all_signals
        }

        fused_signals = []

        # -------------------------
        # Correlation pattern 1
        # Critical/important case with
        # missing telemetry/source events
        # -------------------------

        telemetry_gap_codes = {
            "MISSING_SOURCE_EVENTS",
            "LOW_TELEMETRY_CRITICAL_CASE",
        }

        telemetry_matches = (
            signal_codes
            & telemetry_gap_codes
        )

        if len(telemetry_matches) >= 2:
            fused_signals.append({
                "signal_code": "FUSED_FINDING",
                "case_id": case_id,
                "finding_type": "TELEMETRY_COVERAGE_CONCERN",
                "supporting_signals": sorted(
                    telemetry_matches
                ),
                "description": (
                    "Multiple signals indicate that "
                    "source telemetry may be insufficient "
                    "to fully support analysis of this case."
                ),
            })

        # -------------------------
        # Correlation pattern 2
        # Investigation-related signals
        # -------------------------

        investigation_codes = {
            "MISSING_INVESTIGATION_RECORD",
            "INVESTIGATION_ABSENCE",
            "INVESTIGATION_EVIDENCE_GAP",
        }

        investigation_matches = (
            signal_codes
            & investigation_codes
        )

        if len(investigation_matches) >= 2:
            fused_signals.append({
                "signal_code": "FUSED_FINDING",
                "case_id": case_id,
                "finding_type": "INVESTIGATION_COVERAGE_CONCERN",
                "supporting_signals": sorted(
                    investigation_matches
                ),
                "description": (
                    "Multiple investigation-related "
                    "signals indicate incomplete "
                    "investigation coverage."
                ),
            })

        # -------------------------
        # Correlation pattern 3
        # Escalation + investigation issue
        # -------------------------

        if (
            "ESCALATION_GAP" in signal_codes
            and (
                investigation_codes
                & signal_codes
            )
        ):
            supporting = [
                "ESCALATION_GAP"
            ]

            supporting.extend(
                sorted(
                    investigation_codes
                    & signal_codes
                )
            )

            fused_signals.append({
                "signal_code": "FUSED_FINDING",
                "case_id": case_id,
                "finding_type": "RESPONSE_PROCESS_CONCERN",
                "supporting_signals": supporting,
                "description": (
                    "Escalation and investigation "
                    "signals occur together, indicating "
                    "a broader response-process concern."
                ),
            })

        # -------------------------
        # Preserve original signals
        # -------------------------

        final_signals = (
            all_signals
            + fused_signals
        )

        return {
            "case_id": case_id,
            "signals": final_signals,
            "signal_count": len(final_signals),
            "original_signal_count": len(
                all_signals
            ),
            "fused_signal_count": len(
                fused_signals
            ),
        }

    def analyze_dataset(self):
        cases = self.data["cases"]

        results = []

        total_original_signals = 0
        total_fused_signals = 0

        for case_id in cases["case_id"]:

            result = self.analyze_case(
                str(case_id)
            )

            if result["signal_count"] > 0:
                results.append(result)

            total_original_signals += (
                result["original_signal_count"]
            )

            total_fused_signals += (
                result["fused_signal_count"]
            )

        return {
            "cases_with_signals": len(results),
            "total_original_signals": (
                total_original_signals
            ),
            "total_fused_signals": (
                total_fused_signals
            ),
            "results": results,
        }