import pandas as pd
from pathlib import Path


# ============================================================
# REQUIRED / OPTIONAL FILES
# ============================================================

REQUIRED_FILES = {
    "cases.csv",
    "alerts.csv",
    "investigations.csv",
    "escalations.csv",
    "evidence.csv",
    "events.csv",
    "assets.csv",
}

OPTIONAL_FILES = {
    "raw_logs.csv",
    "data_dictionary.csv",
    "ground_truth.csv",
    "ground_truth_entity_level.csv",
}


# ============================================================
# EXPECTED COLUMNS
# ============================================================

REQUIRED_COLUMNS = {
    "cases": {
        "case_id",
        "cse_id",
        "alert_id",
        "timestamp_created",
        "severity",
        "status",
        "asset_id",
    },
    "alerts": {
        "alert_id",
        "case_id",
        "cse_id",
        "timestamp_created",
        "severity",
        "asset_id",
    },
    "investigations": {
        "investigation_id",
        "case_id",
        "timestamp_started",
    },
    "escalations": {
        "escalation_id",
        "case_id",
        "timestamp_escalated",
    },
    "evidence": {
        "evidence_id",
        "case_id",
        "timestamp_recorded",
    },
    "events": {
        "event_id",
        "alert_id",
        "asset_id",
        "event_timestamp",
    },
    "assets": {
        "asset_id",
        "cse_id",
        "asset_name",
    },
}


# ============================================================
# PRIMARY KEYS
# ============================================================

PRIMARY_KEYS = {
    "cases": "case_id",
    "alerts": "alert_id",
    "investigations": "investigation_id",
    "escalations": "escalation_id",
    "evidence": "evidence_id",
    "events": "event_id",
    "assets": "asset_id",
}


# ============================================================
# FOREIGN KEY RELATIONSHIPS
# ============================================================

FOREIGN_KEYS = [
    {
        "child": "alerts",
        "child_column": "case_id",
        "parent": "cases",
        "parent_column": "case_id",
    },
    {
        "child": "investigations",
        "child_column": "case_id",
        "parent": "cases",
        "parent_column": "case_id",
    },
    {
        "child": "escalations",
        "child_column": "case_id",
        "parent": "cases",
        "parent_column": "case_id",
    },
    {
        "child": "evidence",
        "child_column": "case_id",
        "parent": "cases",
        "parent_column": "case_id",
    },
    {
        "child": "events",
        "child_column": "alert_id",
        "parent": "alerts",
        "parent_column": "alert_id",
    },
    {
        "child": "events",
        "child_column": "asset_id",
        "parent": "assets",
        "parent_column": "asset_id",
    },
    {
        "child": "cases",
        "child_column": "asset_id",
        "parent": "assets",
        "parent_column": "asset_id",
    },
]


# ============================================================
# FILE DISCOVERY
# ============================================================

def get_available_files(folder_path: str):
    folder = Path(folder_path)

    if not folder.exists():
        raise FileNotFoundError(
            "Dataset folder does not exist."
        )

    return {
        file.name: file
        for file in folder.glob("*.csv")
    }


def get_missing_required_files(folder_path: str):
    files = get_available_files(folder_path)

    return sorted(
        REQUIRED_FILES - set(files.keys())
    )


# ============================================================
# FOLDER VALIDATION
# ============================================================

def validate_dataset_folder(folder_path: str):
    files = get_available_files(folder_path)

    available_required = (
        REQUIRED_FILES & set(files.keys())
    )

    missing_required = (
        REQUIRED_FILES - set(files.keys())
    )

    if missing_required:
        return {
            "valid": False,
            "status": "partial",
            "files_available": len(
                available_required
            ),
            "files_required": len(REQUIRED_FILES),
            "missing_files": sorted(
                missing_required
            ),
            "optional_files_available": sorted(
                OPTIONAL_FILES & set(files.keys())
            ),
        }

    cases_path = files["cases.csv"]

    cases_header = pd.read_csv(
        cases_path,
        nrows=0,
        keep_default_na=False,
    )

    if "case_id" not in cases_header.columns:
        raise ValueError(
            "cases.csv must contain case_id."
        )

    case_ids = pd.read_csv(
        cases_path,
        usecols=["case_id"],
        keep_default_na=False,
    )

    if case_ids["case_id"].duplicated().any():
        raise ValueError(
            "Duplicate case_id found in cases.csv."
        )

    return {
        "valid": True,
        "status": "ready",
        "case_count": len(case_ids),
        "files_available": len(
            available_required
        ),
        "files_required": len(REQUIRED_FILES),
        "missing_files": [],
        "optional_files_available": sorted(
            OPTIONAL_FILES & set(files.keys())
        ),
    }


# ============================================================
# CSV LOADING
# ============================================================

def load_csv_files(folder_path: str):
    files = get_available_files(folder_path)

    missing_required = (
        REQUIRED_FILES - set(files.keys())
    )

    if missing_required:
        raise ValueError(
            f"Missing required files: "
            f"{sorted(missing_required)}"
        )

    data = {}

    # Mandatory files
    for filename in REQUIRED_FILES:
        filepath = files[filename]

        data[
            filename.replace(".csv", "")
        ] = pd.read_csv(
            filepath,
            keep_default_na=False,
        )

    # Optional files
    for filename in OPTIONAL_FILES:
        if filename in files:
            filepath = files[filename]

            data[
                filename.replace(".csv", "")
            ] = pd.read_csv(
                filepath,
                keep_default_na=False,
            )

    return data


# ============================================================
# STRUCTURE VALIDATION
# ============================================================

def _validate_required_columns(data: dict):
    errors = []

    for dataset_name, required_columns in (
        REQUIRED_COLUMNS.items()
    ):
        if dataset_name not in data:
            continue

        actual_columns = set(
            data[dataset_name].columns
        )

        missing_columns = (
            required_columns - actual_columns
        )

        if missing_columns:
            errors.append({
                "type": "MISSING_COLUMNS",
                "dataset": dataset_name,
                "columns": sorted(
                    missing_columns
                ),
            })

    return errors


# ============================================================
# PRIMARY KEY VALIDATION
# ============================================================

def _validate_primary_keys(data: dict):
    errors = []

    for dataset_name, primary_key in (
        PRIMARY_KEYS.items()
    ):
        if dataset_name not in data:
            continue

        df = data[dataset_name]

        if primary_key not in df.columns:
            continue

        duplicate_count = int(
            df[primary_key].duplicated().sum()
        )

        empty_count = int(
            (
                df[primary_key]
                .astype(str)
                .str.strip()
                .eq("")
            ).sum()
        )

        if duplicate_count > 0:
            errors.append({
                "type": "DUPLICATE_PRIMARY_KEY",
                "dataset": dataset_name,
                "column": primary_key,
                "count": duplicate_count,
            })

        if empty_count > 0:
            errors.append({
                "type": "EMPTY_PRIMARY_KEY",
                "dataset": dataset_name,
                "column": primary_key,
                "count": empty_count,
            })

    return errors


# ============================================================
# FOREIGN KEY / ORPHAN VALIDATION
# ============================================================

def _validate_foreign_keys(data: dict):
    relationships = []

    for relation in FOREIGN_KEYS:

        child_name = relation["child"]
        parent_name = relation["parent"]

        if (
            child_name not in data
            or parent_name not in data
        ):
            continue

        child = data[child_name]
        parent = data[parent_name]

        child_column = relation["child_column"]
        parent_column = relation["parent_column"]

        if (
            child_column not in child.columns
            or parent_column not in parent.columns
        ):
            continue

        parent_values = set(
            parent[parent_column]
            .astype(str)
            .str.strip()
        )

        child_values = (
            child[child_column]
            .astype(str)
            .str.strip()
        )

        orphan_mask = (
            child_values.ne("")
            & ~child_values.isin(parent_values)
        )

        orphan_count = int(
            orphan_mask.sum()
        )

        relationships.append({
            "child_dataset": child_name,
            "child_column": child_column,
            "parent_dataset": parent_name,
            "parent_column": parent_column,
            "orphan_count": orphan_count,
            "status": (
                "ORPHANS_FOUND"
                if orphan_count > 0
                else "OK"
            ),
        })

    return relationships


# ============================================================
# DATASET VALIDATION
# ============================================================

def validate_dataset(data: dict):
    """
    Validate an already-loaded dataset.

    Validation does NOT delete or modify records.

    It checks:
    - required structure
    - primary-key integrity
    - foreign-key relationships
    - orphan records

    Orphan records are preserved because they may themselves
    represent useful supervisory/data-quality signals.
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

    structure_errors = (
        _validate_required_columns(data)
    )

    primary_key_errors = (
        _validate_primary_keys(data)
    )

    foreign_key_results = (
        _validate_foreign_keys(data)
    )

    validation_errors = (
        structure_errors
        + primary_key_errors
    )

    if validation_errors:
        return {
            "valid": False,
            "case_count": len(cases),
            "files_loaded": sorted(
                data.keys()
            ),
            "optional_files_loaded": sorted(
                set(data.keys())
                & {
                    "raw_logs",
                    "data_dictionary",
                    "ground_truth",
                    "ground_truth_entity_level",
                }
            ),
            "validation_errors": validation_errors,
            "foreign_key_integrity": (
                foreign_key_results
            ),
        }

    orphan_relationships = [
        relationship
        for relationship in foreign_key_results
        if relationship["orphan_count"] > 0
    ]

    return {
        "valid": True,
        "case_count": len(cases),
        "files_loaded": sorted(
            data.keys()
        ),
        "optional_files_loaded": sorted(
            set(data.keys())
            & {
                "raw_logs",
                "data_dictionary",
                "ground_truth",
                "ground_truth_entity_level",
            }
        ),
        "validation_errors": [],
        "foreign_key_integrity": (
            foreign_key_results
        ),
        "orphan_relationships": (
            orphan_relationships
        ),
        "total_orphan_relationships": len(
            orphan_relationships
        ),
    }