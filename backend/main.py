from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import shutil

from backend.ingestion.dataset_loader import (
    load_csv_files,
    validate_dataset,
)
from backend.analysis.analysis_engine import AnalysisEngine
from backend.analysis.case_analysis_engine import CaseAnalysisEngine
from backend.api.analysis_routes import router as analysis_router


app = FastAPI(title="SAT-SA")


# ---------------------------------------------------------
# CORS
# ---------------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(analysis_router)


# ---------------------------------------------------------
# REQUIRED DATASET FILES
# ---------------------------------------------------------

REQUIRED_FILES = {
    "cases.csv",
    "alerts.csv",
    "investigations.csv",
    "escalations.csv",
    "evidence.csv",
    "events.csv",
    "assets.csv",
}


UPLOAD_DIR = Path("data/uploads")


# ---------------------------------------------------------
# ROOT
# ---------------------------------------------------------

@app.get("/")
def root():
    return {
        "message": "SAT-SA backend is running"
    }


# ---------------------------------------------------------
# UPLOAD MULTIPLE CSV FILES
# ---------------------------------------------------------

@app.post("/upload")
async def upload_csv(files: list[UploadFile] = File(...)):

    UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

    uploaded_files = []

    for file in files:

        if not file.filename:
            continue

        if not file.filename.lower().endswith(".csv"):
            raise HTTPException(
                status_code=400,
                detail=f"Only CSV files are allowed: {file.filename}",
            )

        file_path = UPLOAD_DIR / Path(file.filename).name

        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        uploaded_files.append(file_path.name)

    available_files = {
        file.name
        for file in UPLOAD_DIR.glob("*.csv")
    }

    missing_files = REQUIRED_FILES - available_files

    # Dataset is still incomplete
    if missing_files:

        return {
            "message": "Files uploaded successfully.",
            "dataset_status": "partial",
            "uploaded_files": uploaded_files,
            "files_available": len(
                available_files & REQUIRED_FILES
            ),
            "files_required": len(REQUIRED_FILES),
            "missing_files": sorted(missing_files),
        }

    # -----------------------------------------------------
    # Validate complete dataset
    # -----------------------------------------------------

    try:

        data = load_csv_files(str(UPLOAD_DIR))

        validation = validate_dataset(data)

    except (FileNotFoundError, ValueError) as e:

        return {
            "message": "Dataset validation failed.",
            "dataset_status": "invalid",
            "uploaded_files": uploaded_files,
            "validation_error": str(e),
        }

    return {
        "message": "Dataset uploaded and validated successfully.",
        "dataset_status": "ready",
        "uploaded_files": uploaded_files,
        "files_available": len(REQUIRED_FILES),
        "files_required": len(REQUIRED_FILES),
        "missing_files": [],
        "validation": validation,
    }


# ---------------------------------------------------------
# ANALYZE COMPLETE DATASET
# ---------------------------------------------------------

@app.get("/analyze/dataset")
def analyze_dataset():

    try:
        data = load_csv_files(str(UPLOAD_DIR))

    except (FileNotFoundError, ValueError) as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    engine = AnalysisEngine(data)

    return engine.analyze_dataset()


# ---------------------------------------------------------
# ANALYZE EVERYTHING
# ---------------------------------------------------------

@app.get("/analyze/all")
def analyze_all():

    try:
        data = load_csv_files(str(UPLOAD_DIR))

    except (FileNotFoundError, ValueError) as e:

        raise HTTPException(
            status_code=400,
            detail=str(e),
        )

    engine = AnalysisEngine(data)

    return engine.analyze_all()


# ---------------------------------------------------------
# ANALYZE SINGLE CASE
# ---------------------------------------------------------

@app.get("/analyze/{case_id}")
def analyze_case(case_id: str):

    try:
        data = load_csv_files(str(UPLOAD_DIR))

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

    analysis_engine = AnalysisEngine(data)
    case_engine = CaseAnalysisEngine(data)

    analysis_result = analysis_engine.analyze_case(case_id)

    case_context = case_engine.analyze_case(case_id)

    return {
        "case": case_context,
        "analysis": analysis_result,
    }