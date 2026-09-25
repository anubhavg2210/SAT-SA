from pathlib import Path

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse

from backend.ingestion.dataset_loader import load_csv_files
from backend.analysis.analysis_engine import AnalysisEngine


router = APIRouter(
    prefix="/api",
    tags=["Analysis"]
)


DATA_FOLDER = Path("data/uploads")


def make_json_safe(value):
    """
    Convert pandas / numpy values into standard
    Python JSON-compatible values.
    """

    if value is None:
        return None

    if hasattr(value, "item"):
        try:
            return value.item()
        except Exception:
            pass

    if hasattr(value, "to_dict"):
        try:
            return make_json_safe(value.to_dict())
        except Exception:
            pass

    if isinstance(value, dict):
        return {
            str(key): make_json_safe(val)
            for key, val in value.items()
        }

    if isinstance(value, (list, tuple, set)):
        return [
            make_json_safe(item)
            for item in value
        ]

    return value


@router.get("/analysis")
def get_analysis():

    try:

        datasets = load_csv_files(
            str(DATA_FOLDER)
        )

        engine = AnalysisEngine(datasets)

        result = engine.analyze_all()

        safe_result = make_json_safe(result)

        return JSONResponse(
            content=safe_result
        )

    except Exception as exc:

        raise HTTPException(
            status_code=500,
            detail=str(exc)
        )
