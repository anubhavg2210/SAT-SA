import pandas as pd
from pathlib import Path


# These 7 files are required for the dataset to become READY.
REQUIRED_FILES = {
    "cases.csv",
    "alerts.csv",
    "investigations.csv",
    "escalations.csv",
    "evidence.csv",
    "events.csv",
    "assets.csv",
}


# These files are useful when available, but are not required.
OPTIONAL_FILES = {
    "raw_logs.csv",
    "data_dictionary.csv",
    "ground_truth.csv",
    "ground_truth_entity_level.csv",
}


def get_available_files(folder_path: str):
    folder = Path(folder_path)

    if not folder.exists():
        raise FileNotFoundError("Dataset folder does not exist.")

    return {
        file.name: file
        for file in folder.glob("*.csv")
    }


def get_missing_required_files(folder_path: str):
    files = get_available_files(folder_path)

    return sorted(
        REQUIRED_FILES - set(files.keys())
    )


def validate_dataset_folder(folder_path: str):
    """
    Check whether the 7 mandatory files are available.

    Optional files do not affect READY/PARTIAL status.
    """

    files = get_available_files(folder_path)

    available_required = REQUIRED_FILES & set(files.keys())
    missing_required = REQUIRED_FILES - set(files.keys())

    if missing_required:
        return {
            "valid": False,
            "status": "partial",
            "files_available": len(available_required),
            "files_required": len(REQUIRED_FILES),
            "missing_files": sorted(missing_required),
            "optional_files_available": sorted(
                OPTIONAL_FILES & set(files.keys())
            ),
        }

    # Check cases.csv structure without loading the whole file.
    cases_path = files["cases.csv"]

    cases_header = pd.read_csv(
        cases_path,
        nrows=0,
        keep_default_na=False
    )

    if "case_id" not in cases_header.columns:
        raise ValueError(
            "cases.csv must contain case_id."
        )

    # Only load case_id for duplicate validation.
    case_ids = pd.read_csv(
        cases_path,
        usecols=["case_id"],
        keep_default_na=False
    )

    if case_ids["case_id"].duplicated().any():
        raise ValueError(
            "Duplicate case_id found in cases.csv."
        )

    optional_available = sorted(
        OPTIONAL_FILES & set(files.keys())
    )

    return {
        "valid": True,
        "status": "ready",
        "case_count": len(case_ids),
        "files_available": len(available_required),
        "files_required": len(REQUIRED_FILES),
        "missing_files": [],
        "optional_files_available": optional_available,
    }


def load_csv_files(folder_path: str):
    """
    Load all available CSV files.

    The 7 mandatory files must exist.
    Optional files are loaded automatically when available.
    """

    files = get_available_files(folder_path)

    missing_required = REQUIRED_FILES - set(files.keys())

    if missing_required:
        raise ValueError(
            f"Missing required files: "
            f"{sorted(missing_required)}"
        )

    data = {}

    # Load mandatory files.
    for filename in REQUIRED_FILES:
        filepath = files[filename]

        data[filename.replace(".csv", "")] = pd.read_csv(
            filepath,
            keep_default_na=False
        )

    # Load optional files only if present.
    for filename in OPTIONAL_FILES:
        if filename in files:
            filepath = files[filename]

            data[filename.replace(".csv", "")] = pd.read_csv(
                filepath,
                keep_default_na=False
            )

    return data


def validate_dataset(data: dict):
    """
    Validate an already-loaded dataset.

    Optional files are allowed to be absent.
    """

    if "cases" not in data:
        raise ValueError(
            "cases.csv is required."
        )

    cases = data["cases"]

    if "case_id" not in cases.columns:
        raise ValueError(
            "cases.csv must contain case_id."
        )

    if cases["case_id"].duplicated().any():
        raise ValueError(
            "Duplicate case_id found in cases.csv."
        )

    return {
        "valid": True,
        "case_count": len(cases),
        "files_loaded": sorted(data.keys()),
        "optional_files_loaded": sorted(
            set(data.keys()) & {
                "raw_logs",
                "data_dictionary",
                "ground_truth",
                "ground_truth_entity_level",
            }
        ),
    }