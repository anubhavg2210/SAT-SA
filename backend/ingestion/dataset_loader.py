import pandas as pd
from pathlib import Path


REQUIRED_FILES = {
    "cases.csv",
    "alerts.csv",
    "investigations.csv",
    "escalations.csv",
    "evidence.csv",
    "events.csv",
    "assets.csv",
}


def load_csv_files(folder_path: str):
    folder = Path(folder_path)

    if not folder.exists():
        raise FileNotFoundError("Dataset folder does not exist.")

    files = {
        file.name: file
        for file in folder.glob("*.csv")
    }

    missing_files = REQUIRED_FILES - set(files.keys())

    if missing_files:
        raise ValueError(
            f"Missing required files: {sorted(missing_files)}"
        )

    data = {}

    for filename, filepath in files.items():
        data[filename.replace(".csv", "")] = pd.read_csv(
            filepath,
            keep_default_na=False
        )

    return data


def validate_dataset(data: dict):
    if "cases" not in data:
        raise ValueError("cases.csv is required.")

    cases = data["cases"]

    if "case_id" not in cases.columns:
        raise ValueError("cases.csv must contain case_id.")

    if cases["case_id"].duplicated().any():
        raise ValueError("Duplicate case_id found in cases.csv.")

    return {
        "valid": True,
        "case_count": len(cases),
        "files_loaded": list(data.keys()),
    }