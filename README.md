SAT-SA

Security Assessment & Supervisory Analysis

SAT-SA is a locally deployable, air-gapped analytical system designed to assist supervisory examination of SOC/security operational data.

The system does not replace the SOC, SIEM, or examiner. It analyzes submitted operational records and produces traceable findings, identified gaps, confidence information, and supporting evidence for examiner review.

1. Core Objective

SAT-SA analyzes security-operation data across different cases and identifies:

unusual operational patterns

deviations from expected behaviour

missing or incomplete evidence

workflow/process gaps

inconsistencies

recurring patterns

statistically unusual behaviour

ML-based anomalous behaviour

areas requiring examiner attention

Every generated finding should remain traceable to its supporting data and evidence.

2. High-Level Workflow

CSE / SOC Data
      ↓
Data Ingestion
      ↓
Validation & Normalization
      ↓
Common Case Object
      ↓
Feature Generation
      ↓
┌───────────────┬────────────────┬────────────────┐
│ Logical       │ Statistical    │ ML             │
│ Analysis      │ Analysis       │ Analysis       │
└───────────────┴────────────────┴────────────────┘
      ↓
NLP Signals (where applicable)
      ↓
Signal Correlation
      ↓
Gap Identification
      ↓
Confidence / Priority
      ↓
Finding Generation
      ↓
Evidence & Traceability
      ↓
Examiner Review
      ↓
Feedback / Audit Trail

3. Analytical Architecture

SAT-SA uses multiple analytical approaches rather than depending on a single model.

Logical Analysis

A generic configuration-driven rule engine evaluates expected conditions against observed data.

Rules may cover:

detection

investigation

escalation

response

closure

evidence

monitoring

documentation

Rules are maintained separately from the core application code.

Statistical Analysis

Statistical analysis establishes appropriate baselines and identifies deviations.

Candidate methods include:

median

percentile

IQR

MAD

rates

trends

peer-group comparison

The exact statistical method and threshold will depend on the feature and validated dataset.

Machine Learning

SAT-SA uses a separate ML development and training pipeline.

Initial v1 model:

Isolation Forest

The ML pipeline will:

prepare training data

generate features

preprocess features

train the model

evaluate the model

save the validated model artifact

provide inference to SAT-SA

The ML model produces an analytical signal. It does not independently produce the final supervisory finding.

NLP

NLP will be used where useful text exists, such as:

investigation notes

root-cause descriptions

escalation justification

closure comments

NLP outputs structured signals/features that can be correlated with other analytical signals.

4. Evidence & Explainability

Every finding should have a traceable evidence path.

Finding
   ↓
Correlated Signals
   ↓
Features
   ↓
Common Case Object
   ↓
Source Record
   ↓
Supporting Evidence

The examiner should be able to inspect the evidence supporting a finding.

Where available and justified, deeper source information or raw-log references can be used when the available case/alert evidence is insufficient or contradictory.

SAT-SA should distinguish between:

observed evidence

derived features

analytical signals

inferred patterns

final examiner-reviewed findings

5. Air-Gapped Architecture

SAT-SA is designed to run locally without runtime Internet dependency.

Target architecture:

Browser
   ↓
React Frontend
   ↓
FastAPI Backend
   ↓
Local Analysis Engines
   ├── Rule Engine
   ├── Statistical Engine
   ├── ML Inference
   └── NLP
   ↓
PostgreSQL
   ↓
Local Evidence Store

The deployed system should not require:

cloud APIs

cloud-hosted ML inference

runtime model downloads

external Internet access

external SaaS services

6. Technology Stack

Frontend

React

Vite

Tailwind CSS

Backend

Python

FastAPI

Data Processing

Pandas

NumPy

Statistics

SciPy

Pandas

Machine Learning

scikit-learn

Isolation Forest

Joblib

Database

PostgreSQL

Configuration / Rules

YAML

JSON

Python

Deployment

Docker

Docker Compose

Linux

7. Project Structure

SAT-SA/
│
├── backend/
├── frontend/
├── ml/
│   ├── dataset/
│   ├── preprocessing/
│   ├── training/
│   ├── evaluation/
│   ├── models/
│   └── inference/
│
├── data/
├── rules/
├── evidence/
├── tests/
├── docs/
├── deployment/
│
├── .venv/
├── .gitignore
└── README.md

.venv/ is local development infrastructure and is not committed to Git.

8. Build Phases

Phase 1 — Development Environment & Project Skeleton

Set up the development environment, repository, project structure and basic application skeleton.

Phase 2 — Database & Data Schema

Design PostgreSQL tables and relationships for SOC operational data, cases, alerts, investigations, evidence, signals, findings and examiner review.

Phase 3 — Synthetic All-Case SOC Dataset

Create a synthetic dataset covering the different operational case types required for development and testing.

Phase 4 — Data Ingestion, Validation & Normalization

Build the pipeline that accepts structured data, validates it, detects problems and converts it into the SAT-SA standard representation.

Phase 5 — Common Case Object

Create a unified representation of a case so that all analytical engines work on a common structure.

Phase 6 — Feature Engine

Generate analytical features from the common case object.

Feature categories may include:

temporal

workflow

evidence

asset/context

severity

recurrence

completeness

consistency

documentation

text-derived

Phase 7 — Logical Rule Engine

Build the generic configuration-driven rule engine.

Phase 8 — Statistical Engine

Build baseline, deviation, trend and peer-comparison analysis.

Phase 9 — ML Training, Evaluation & Inference Pipeline

Build the separate ML pipeline:

Dataset
   ↓
Feature Preparation
   ↓
Preprocessing
   ↓
Training
   ↓
Evaluation
   ↓
Validated Model
   ↓
Local Model Artifact
   ↓
Inference

Initial v1 model: Isolation Forest.

Phase 10 — NLP Module

Add local NLP processing for relevant operational text.

Phase 11 — Signal Correlation

Combine logical, statistical, ML and applicable NLP signals.

Phase 12 — Gap Identification

Compare expected and observed behaviour and identify potential supervisory gaps.

Phase 13 — Confidence & Priority

Calculate confidence based on evidence quality, data quality, signal agreement and other validated factors.

Phase 14 — Evidence & Raw-log Traceability

Connect findings back to source records and supporting evidence.

Raw-log references may be used for deeper verification when required and available.

Phase 15 — Backend APIs

Expose the analysis and data functionality through FastAPI.

Phase 16 — Examiner Frontend

Build the examiner dashboard and evidence drill-down interface.

Phase 17 — Security & Audit Trail

Implement access control, audit logging, integrity controls and other required security mechanisms.

Phase 18 — Air-gapped Packaging

Package all required software, dependencies, models and local assets for offline deployment.

Phase 19 — Offline End-to-End Testing

Run the complete system without Internet connectivity.

9. Development Principle

SAT-SA should be developed incrementally.

Each phase must be:

implemented

tested

verified

documented

before dependent phases are finalized.

The system should prefer:

traceability over opaque conclusions

evidence over unsupported inference

modular engines over case-specific hard-coding

reproducible analysis

offline operation

examiner review over autonomous decision-making

10. Current Status

Completed

Development environment identified

VS Code verified

Git verified

Python 3.12 verified

Python virtual environment created

Git repository initialized

Project directory structure created

.gitignore created

Initial architecture defined

Current Phase

Phase 1 — Development Environment & Project Skeleton

Next

Create the backend, frontend and ML module skeletons and verify that each development component can run independently.