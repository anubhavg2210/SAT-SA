
from fastapi import FastAPI, UploadFile, File, HTTPException
from pydantic import BaseModel
from pathlib import Path
import shutil
from backend.ingestion.dataset_loader import load_csv_files, validate_dataset

app = FastAPI(title="SAT-SA")


class CaseData(BaseModel):
    case_id: str
    severity: str
    status: str


@app.get("/")
def root():
    return {"message": "SAT-SA backend is running"}


@app.post("/ingest")
def ingest_case(case: CaseData):
    return {
        "message": "Case received successfully",
        "case": case.model_dump()
    }


@app.post("/upload")
async def upload_csv(file: UploadFile = File(...)):
    if not file.filename.lower().endswith(".csv"):
        raise HTTPException(
            status_code=400,
            detail="Only CSV files are allowed."
        )

    upload_dir = Path("data/uploads")
    upload_dir.mkdir(parents=True, exist_ok=True)

    file_path = upload_dir / file.filename

    with file_path.open("wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        data = load_csv_files("data/uploads")
        validation = validate_dataset(data)

    except (FileNotFoundError, ValueError) as e:
        return {
            "message": "File uploaded, but dataset validation is incomplete.",
            "filename": file.filename,
            "validation_error": str(e)
        }

    return {
        "message": "Dataset uploaded and validated successfully",
        "filename": file.filename,
        "validation": validation
    }