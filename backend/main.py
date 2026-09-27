from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path
import shutil
from pydantic import BaseModel
from secrets import compare_digest
from datetime import datetime, timedelta,timezone
import secrets
import base64
import hashlib
import hmac
import json
import os
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
        "http://10.12.68.51:5173",
        "http://10.12.68.51:8080",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1|10\.12\.68\.51)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------
# AUTHENTICATION
# ---------------------------------------------------------

class LoginRequest(BaseModel):
    username: str
    password: str


# Demo users for local development
USERS = {
    "admin": "admin123",
    "anubh": "satsa123",
}


# ---------------------------------------------------------
# PERSISTENT TOKEN AUTHENTICATION
# ---------------------------------------------------------

# Stable secret: survives FastAPI reloads/restarts.
# For production, set SATSA_SECRET_KEY as an environment variable.
AUTH_SECRET = os.getenv(
    "SATSA_SECRET_KEY",
    "satsa-local-development-secret-change-in-production",
).encode()


def _b64url(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()


def _create_token(username: str) -> str:
    payload = {
        "username": username,
        "created_at": datetime.now(timezone.utc).isoformat(),
    }

    payload_bytes = json.dumps(
        payload,
        separators=(",", ":"),
    ).encode()

    payload_part = _b64url(payload_bytes)

    signature = hmac.new(
        AUTH_SECRET,
        payload_part.encode(),
        hashlib.sha256,
    ).digest()

    signature_part = _b64url(signature)

    return f"{payload_part}.{signature_part}"


def _verify_token(token: str) -> dict:
    try:
        payload_part, signature_part = token.split(".", 1)

        expected_signature = hmac.new(
            AUTH_SECRET,
            payload_part.encode(),
            hashlib.sha256,
        ).digest()

        supplied_signature = base64.urlsafe_b64decode(
            signature_part + "=" * (-len(signature_part) % 4)
        )

        if not hmac.compare_digest(
            expected_signature,
            supplied_signature,
        ):
            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token",
            )

        payload = json.loads(
            base64.urlsafe_b64decode(
                payload_part + "=" * (-len(payload_part) % 4)
            )
        )

        return payload

    except (ValueError, KeyError, json.JSONDecodeError):
        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token",
        )


@app.post("/auth/login")
def login(request: LoginRequest):

    username = request.username.strip()

    if username not in USERS:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )

    if not compare_digest(USERS[username], request.password):
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password",
        )

    token = _create_token(username)

    return {
        "access_token": token,
        "token_type": "bearer",
        "username": username,
    }

@app.post("/auth/logout")
def logout():
    return {
        "message": "Logged out successfully"
    }
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