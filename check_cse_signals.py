from collections import defaultdict, Counter

from backend.ingestion.dataset_loader import load_csv_files
from backend.analysis.analysis_engine import AnalysisEngine


data = load_csv_files("data/uploads")

result = AnalysisEngine(data).analyze_all()

cases = (
    data["cases"]
    .set_index("case_id")["cse_id"]
    .astype(str)
    .to_dict()
)

cse_signals = defaultdict(Counter)

for case_result in result["case_results"]:
    for signal in case_result.get("signals", []):
        case_id = str(signal.get("case_id", ""))

        cse_id = cases.get(case_id, "UNKNOWN")

        signal_code = signal.get(
            "signal_code",
            "UNKNOWN"
        )

        cse_signals[cse_id][signal_code] += 1


print("\n===== CSE SIGNAL SUMMARY =====")

for cse_id in sorted(cse_signals):
    print(f"\n{cse_id}")

    for signal_code, count in sorted(
        cse_signals[cse_id].items(),
        key=lambda x: (-x[1], x[0])
    ):
        print(f"  {signal_code}: {count}")