from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from pathlib import Path
import shutil

from backend.ingestion.dataset_loader import (
    load_csv_files,
    validate_dataset,
)

from backend.analysis.analysis_engine import AnalysisEngine


app = FastAPI(title="SAT-SA")


class CaseData(BaseModel):
    case_id: str
    severity: str
    status: str


@app.get("/")
def root():
    return {
        "message": "SAT-SA backend is running"
    }


@app.post("/ingest")
def ingest_case(case: CaseData):
    return {
        "message": "Case received successfully",
        "case": case.model_dump(),
    }


@app.post("/upload")
async def upload_csv(files: list[UploadFile] = File(...)):
    upload_dir = Path("data/uploads")
    upload_dir.mkdir(parents=True, exist_ok=True)

    uploaded_files = []

    for file in files:
        if not file.filename.lower().endswith(".csv"):
            raise HTTPException(
                status_code=400,
                detail=f"Only CSV files are allowed: {file.filename}",
            )

        file_path = upload_dir / file.filename

        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        uploaded_files.append(file.filename)

    required_files = {
        "cases.csv",
        "alerts.csv",
        "investigations.csv",
        "escalations.csv",
        "evidence.csv",
        "events.csv",
        "assets.csv",
    }

    available_files = {
        file.name
        for file in upload_dir.glob("*.csv")
    }

    missing_files = required_files - available_files

    if missing_files:
        return {
            "message": (
                "Files uploaded successfully, "
                "but dataset is incomplete."
            ),
            "uploaded_files": uploaded_files,
            "dataset_status": "partial",
            "files_available": len(
                available_files & required_files
            ),
            "files_required": len(required_files),
            "missing_files": sorted(missing_files),
        }

    try:
        data = load_csv_files(str(upload_dir))
        validation = validate_dataset(data)

    except (FileNotFoundError, ValueError) as e:
        return {
            "message": (
                "All files are present, "
                "but dataset validation failed."
            ),
            "uploaded_files": uploaded_files,
            "dataset_status": "invalid",
            "validation_error": str(e),
        }

    return {
        "message": (
            "Dataset uploaded and "
            "validated successfully."
        ),
        "uploaded_files": uploaded_files,
        "dataset_status": "ready",
        "files_available": len(required_files),
        "files_required": len(required_files),
        "validation": validation,
    }


@app.get("/analyze/dataset")
def analyze_dataset():
    upload_dir = Path("data/uploads")

    try:
        data = load_csv_files(str(upload_dir))
    except (FileNotFoundError, ValueError) as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    engine = AnalysisEngine(data)

    return engine.analyze_dataset()
@app.get("/analyze/all")
def analyze_all():
    upload_dir = Path("data/uploads")

    try:
        data = load_csv_files(str(upload_dir))
    except (FileNotFoundError, ValueError) as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    engine = AnalysisEngine(data)

    return engine.analyze_all()    


@app.get("/analyze/{case_id}")
def analyze_case(case_id: str):
    upload_dir = Path("data/uploads")

    try:
        data = load_csv_files(str(upload_dir))
    except (FileNotFoundError, ValueError) as e:
        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    if "cases" not in data:
        raise HTTPException(
            status_code=400,
            detail="Cases dataset is not available.",
        )

    case_ids = set(
        data["cases"]["case_id"].astype(str)
    )

    if case_id not in case_ids:
        raise HTTPException(
            status_code=404,
            detail=f"Case not found: {case_id}",
        )

    engine = AnalysisEngine(data)

    return engine.analyze_case(case_id)