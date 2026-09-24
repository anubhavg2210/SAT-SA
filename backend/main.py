from fastapi import FastAPI
from pydantic import BaseModel

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