
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Database,
  FileSearch,
  Play,
  Server,
  Upload,
  XCircle,
} from "lucide-react";
import { useEffect, useState } from "react";

import {
  analyzeAll,
  checkBackend,
  setStoredDataset,
  getStoredDataset,
  type UploadResult,
} from "@/lib/satsa-api";

import { AnalysisOverview } from "@/components/analysis/AnalysisOverview";
import { SignalDistribution } from "@/components/analysis/SignalDistribution";
import { DatasetSignals } from "@/components/analysis/DatasetSignals";
import { CriticalFindings } from "@/components/analysis/CriticalFindings";
import { RawAnalysis } from "@/components/analysis/RawAnalysis";

export const Route = createFileRoute("/_workspace/dashboard")({
  head: () => ({
    meta: [
      {
        title: "Dashboard — SOC Strategy",
      },
      {
        name: "description",
        content: "SOC analyst analysis workspace.",
      },
    ],
  }),

  component: Dashboard,
});

type BackendState = "checking" | "online" | "offline";

type AnalysisResponse = {
  summary?: unknown;
  [key: string]: unknown;
};

function Dashboard() {
  const [backend, setBackend] =
    useState<BackendState>("checking");

  const [uploading, setUploading] =
    useState(false);

  const [analyzing, setAnalyzing] =
    useState(false);

  const [uploadResult, setUploadResult] =
    useState<UploadResult | null>(null);

  const [analysis, setAnalysis] =
    useState<AnalysisResponse | null>(null);

  const [error, setError] =
    useState<string | null>(null);

  useEffect(() => {
    const storedDataset = getStoredDataset();

  if (storedDataset) {
    setUploadResult({
      dataset_status: storedDataset.status,
      files_available: storedDataset.filesAvailable,
      files_required: storedDataset.filesRequired,
      uploaded_files: storedDataset.uploadedFiles,
    });
  }
    checkBackend()
      .then(() => setBackend("online"))
      .catch(() => setBackend("offline"));
  }, []);

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();

      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(
        "http://127.0.0.1:8000/upload",
        {
          method: "POST",
          body: formData,
        },
      );

      const text = await response.text();

      if (!response.ok) {
        throw new Error(
          `${response.status} ${response.statusText}: ${text}`,
        );
      }

      const result =
        JSON.parse(text) as UploadResult;

      setUploadResult(result);
      setStoredDataset(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Dataset upload failed.",
      );
    } finally {
      setUploading(false);
    }
  }

  async function runAnalysis() {
    setAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeAll();

      setAnalysis(
        result as AnalysisResponse,
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Analysis failed.",
      );
    } finally {
      setAnalyzing(false);
    }
  }

  const datasetReady =
    uploadResult?.dataset_status === "ready";

  return (
    <div className="mx-auto max-w-[1500px] space-y-8">

      {/* HEADER */}

      <header>
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="eyebrow">
              SECURITY OPERATIONS WORKSPACE
            </p>

            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
              SOC Analysis Command Center
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
              Transform SOC telemetry into explainable security findings,
              anomalies and investigation priorities using the SAT-SA
              analysis engine.
            </p>
          </div>

          <BackendIndicator state={backend} />
        </div>
      </header>

      {/* ERROR */}

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-rose-400/20 bg-rose-500/5 p-4 text-sm">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-400" />

          <div>
            <p className="font-medium text-rose-300">
              Operation failed
            </p>

            <p className="mt-1 text-slate-400">
              {error}
            </p>
          </div>
        </div>
      )}

      {/* SYSTEM STATUS */}

      <section className="grid gap-4 md:grid-cols-3">

        <StatusCard
          icon={Server}
          label="Backend"
          value={
            backend === "online"
              ? "Connected"
              : backend
          }
          good={backend === "online"}
        />

        <StatusCard
          icon={Database}
          label="Dataset"
          value={
            datasetReady
              ? `${uploadResult?.files_available ?? 0}/${uploadResult?.files_required ?? 0} files ready`
              : "Not loaded"
          }
          good={datasetReady}
        />

        <StatusCard
          icon={Activity}
          label="Analysis"
          value={
            analysis
              ? "Completed"
              : "Ready to run"
          }
          good={!!analysis}
        />

      </section>

      {/* INGESTION + ANALYSIS */}

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">

        {/* DATA UPLOAD */}

        <div className="glass-panel rounded-2xl p-6">

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">
                01 · DATA INGESTION
              </p>

              <h2 className="mt-2 text-xl font-semibold text-white">
                Load SOC evidence
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Upload the CSV collection used by the SAT-SA analysis
                engine.
              </p>
            </div>

            <Upload className="h-5 w-5 text-violet-400" />
          </div>

          <label className="mt-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-white/[0.1] bg-white/[0.015] px-6 py-12 text-center transition hover:border-indigo-400/40 hover:bg-indigo-500/[0.03]">

            <Upload className="h-8 w-8 text-slate-500" />

            <p className="mt-4 text-sm font-medium text-slate-200">
              {uploading
                ? "Uploading dataset..."
                : "Drop or select CSV files"}
            </p>

            <p className="mt-1 text-xs text-slate-600">
              cases · alerts · investigations · escalations · evidence ·
              events · assets
            </p>

            <input
              type="file"
              multiple
              accept=".csv"
              className="hidden"
              disabled={uploading}
              onChange={(event) =>
                handleFiles(event.target.files)
              }
            />

          </label>

          {uploadResult && (
            <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">

              <div className="flex items-center gap-2">

                {datasetReady ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-amber-400" />
                )}

                <span className="text-sm font-medium text-slate-200">
                  {uploadResult.message}
                </span>

              </div>

              <p className="mt-3 text-xs text-slate-500">
                Files available:{" "}
                <span className="text-slate-200">
                  {uploadResult.files_available ?? 0}
                </span>
                {" / "}
                {uploadResult.files_required ?? 7}
              </p>

              {uploadResult.missing_files?.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {uploadResult.missing_files.map(
                    (file) => (
                      <span
                        key={file}
                        className="rounded-md border border-white/[0.08] px-2 py-1 font-mono text-[10px] text-slate-400"
                      >
                        {file}
                      </span>
                    ),
                  )}
                </div>
              ) : null}

            </div>
          )}

        </div>

        {/* ANALYSIS ENGINE */}

        <div className="glass-panel rounded-2xl p-6">

          <p className="eyebrow">
            02 · ANALYSIS ENGINE
          </p>

          <h2 className="mt-2 text-xl font-semibold text-white">
            Turn telemetry into findings
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Run the SAT-SA engine to correlate telemetry, identify anomalies
            and generate investigation signals.
          </p>

          <div className="mt-6 space-y-2">

            <PipelineItem
              icon={Database}
              text="Dataset validation"
              active={datasetReady}
            />

            <PipelineItem
              icon={Activity}
              text="Statistical analysis"
              active={!!analysis}
            />

            <PipelineItem
              icon={AlertTriangle}
              text="Anomaly detection"
              active={!!analysis}
            />

            <PipelineItem
              icon={FileSearch}
              text="Case investigation"
              active={!!analysis}
            />

          </div>

          <button
            onClick={runAnalysis}
            disabled={!datasetReady || analyzing}
            className="btn-cta mt-7 flex w-full items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Play className="h-4 w-4" />

            {analyzing
              ? "Running SAT-SA analysis..."
              : "Run Full Analysis"}

            {!analyzing && (
              <ArrowRight className="h-4 w-4" />
            )}
          </button>

          {!datasetReady && (
            <p className="mt-3 text-center text-[11px] text-slate-600">
              Complete the dataset upload before running analysis.
            </p>
          )}

        </div>

      </section>

      {/* SAT-SA RESULTS */}

      {analysis && (
        <section className="space-y-6">

          <AnalysisOverview
            analysis={analysis}
          />

          <section className="grid gap-6 xl:grid-cols-2">

            <SignalDistribution
              analysis={analysis}
            />

            <DatasetSignals
              analysis={analysis}
            />

          </section>

          <CriticalFindings
            analysis={analysis}
          />

          <RawAnalysis
            analysis={analysis}
          />

        </section>
      )}

      {/* WORKFLOW */}

      <section>

        <p className="eyebrow">
          SAT-SA ANALYST WORKFLOW
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-5">

          <WorkflowStep
            number="01"
            title="Ingest"
          />

          <WorkflowStep
            number="02"
            title="Validate"
          />

          <WorkflowStep
            number="03"
            title="Analyze"
          />

          <WorkflowStep
            number="04"
            title="Investigate"
          />

          <WorkflowStep
            number="05"
            title="Report"
          />

        </div>

      </section>

    </div>
  );
}

function BackendIndicator({
  state,
}: {
  state: BackendState;
}) {
  const online = state === "online";

  return (
    <div className="flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.02] px-3 py-2 text-xs text-slate-300">

      <span
        className={`h-2 w-2 rounded-full ${
          online
            ? "bg-emerald-400"
            : "bg-amber-400"
        }`}
      />

      Backend{" "}
      {online
        ? "Connected"
        : "Checking"}

    </div>
  );
}

function StatusCard({
  icon: Icon,
  label,
  value,
  good,
}: {
  icon: typeof Server;
  label: string;
  value: string;
  good: boolean;
}) {
  return (
    <div className="glass-panel rounded-xl p-5">

      <div className="flex items-center justify-between">

        <p className="eyebrow">
          {label}
        </p>

        <Icon
          className={`h-4 w-4 ${
            good
              ? "text-emerald-400"
              : "text-slate-600"
          }`}
        />

      </div>

      <p className="mt-3 text-lg font-semibold text-white">
        {value}
      </p>

    </div>
  );
}

function PipelineItem({
  icon: Icon,
  text,
  active,
}: {
  icon: typeof Database;
  text: string;
  active: boolean;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-white/[0.06] bg-white/[0.015] px-3 py-3">

      {active ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-400" />
      ) : (
        <Icon className="h-4 w-4 text-slate-600" />
      )}

      <span className="text-sm text-slate-300">
        {text}
      </span>

    </div>
  );
}

function WorkflowStep({
  number,
  title,
}: {
  number: string;
  title: string;
}) {
  return (
    <div className="glass-panel rounded-xl p-4">

      <p className="font-mono text-[10px] text-indigo-400">
        {number}
      </p>

      <p className="mt-2 text-sm font-medium text-slate-300">
        {title}
      </p>

    </div>
  );
}