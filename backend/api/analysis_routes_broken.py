from fastapi import APIRouter, HTTPException

from backend.ingestion.dataset_loader import load_csv_files
from backend.analysis.analysis_engine import AnalysisEngine


router = APIRouter(
    prefix="/api",
    tags=["Analysis"]
)


@router.get("/analysis")
def get_analysis():

    upload_dir = "data/uploads"

    try:
        data = load_csv_files(upload_dir)
    except (FileNotFoundError, ValueError) as e:
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

    engine = AnalysisEngine(data)
    result = engine.analyze_all()

    summary = result.get("summary", {})
    dataset_analysis = result.get("dataset_analysis", {})
    cse_assessments = result.get("cse_assessments", {})

    # ---------------------------------------------------------
    # Attach REAL cases to each CSE
    # ---------------------------------------------------------

    cases_df = data.get("cases")

    if cases_df is not None and not cases_df.empty:

        # Make a copy so original dataframe is untouched
        cases = cases_df.copy()

        # Normalize CSE column
        if "cse_id" in cases.columns:

            cases["cse_id"] = cases["cse_id"].astype(str)

            for cse in cse_assessments:

                cse_cases = cases[
                    cases["cse_id"] == str(cse)
                ].copy()

                case_records = []

                for _, row in cse_cases.iterrows():

                    case = {}

                    for column in [
                        "case_id",
                        "cse_id",
                        "asset_id",
                        "severity",
                        "priority",
                        "status",
                    ]:

                        if column in row.index:

                            value = row[column]

                            if hasattr(value, "item"):
                                value = value.item()

                            if value is not None:
                                case[column] = value

                    case_records.append(case)

                cse_assessments[cse]["cases"] = case_records

                cse_assessments[cse]["case_count"] = len(
                    case_records
                )

                # Anomalous case count if available
                cse_assessments[cse].setdefault(
                    "anomalous_case_count",
                    0
                )

        else:

            # Dataset does not contain cse_id
            for cse in cse_assessments:
                cse_assessments[cse]["cases"] = []
                cse_assessments[cse]["case_count"] = 0

    else:

        for cse in cse_assessments:
            cse_assessments[cse]["cases"] = []
            cse_assessments[cse]["case_count"] = 0

    return {
        "summary": summary,
        "dataset_analysis": dataset_analysis,
        "cse_assessments": cse_assessments,
    }
'@ | Set-Content backend\api\analysis_routes.py
