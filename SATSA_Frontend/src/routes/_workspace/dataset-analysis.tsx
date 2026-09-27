import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Upload, Play, Loader2, CheckCircle2, AlertCircle } from "lucide-react";

import {
  PageHeader,
  ResourceList,
  DataTable,
} from "@/components/app/ResourceView";

import { apiFetch, asList } from "@/lib/satsa-api";

export const Route = createFileRoute("/_workspace/dataset-analysis")({
  head: () => ({
    meta: [
      {
        title: "Dataset Analysis — SOC Strategy",
      },
      {
        name: "description",
        content: "Run SATSA analysis on CSV datasets.",
      },
    ],
  }),

  component: DatasetAnalysis,
});

function DatasetAnalysis() {
  const qc = useQueryClient();

  const [file, setFile] = useState<File | null>(null);
  const [datasetId, setDatasetId] = useState("");

  const [busy, setBusy] = useState<string | null>(null);

  const [msg, setMsg] = useState<string | null>(null);

  const [result, setResult] = useState<unknown>(null);

  // ---------------------------------------------------------
  // UPLOAD DATASET
  // ---------------------------------------------------------

  async function upload() {
    if (!file) {
      setMsg("Please select a CSV file first.");
      return;
    }

    setBusy("upload");
    setMsg(null);
    setResult(null);

    try {
      const fd = new FormData();

      fd.append("file", file);

      const response = (await apiFetch("/upload", {
        method: "POST",
        body: fd,
      })) as Record<string, unknown>;

      /*
       * Backend /upload returns information about the uploaded
       * dataset rather than a normal dataset ID.
       *
       * So we don't force an ID here.
       */

      setMsg(
        String(
          response?.["message"] ??
            "Dataset uploaded and validated successfully.",
        ),
      );

      // Refresh datasets/resource information
      qc.invalidateQueries({
        queryKey: ["satsa", "/datasets"],
      });
    } catch (e) {
      setMsg(
        e instanceof Error
          ? e.message
          : "Dataset upload failed.",
      );
    } finally {
      setBusy(null);
    }
  }

  // ---------------------------------------------------------
  // RUN DATASET ANALYSIS
  // ---------------------------------------------------------

  async function run() {
    setBusy("run");
    setMsg(null);
    setResult(null);

    try {
      /*
       * Your backend currently exposes:
       *
       * GET /analyze/dataset
       *
       * This loads the uploaded CSV files and runs
       * AnalysisEngine.analyze_dataset().
       */

      const data = await apiFetch("/analyze/dataset", {
        method: "GET",
      });

      setResult(data);

      setMsg("Dataset analysis completed successfully.");
    } catch (e) {
      setMsg(
        e instanceof Error
          ? e.message
          : "Dataset analysis failed.",
      );
    } finally {
      setBusy(null);
    }
  }

  // ---------------------------------------------------------
  // PREPARE RESULT TABLE
  // ---------------------------------------------------------

  const resultObject =
    result &&
    typeof result === "object"
      ? (result as Record<string, unknown>)
      : null;

  const resRows = asList(
    resultObject?.["anomalies"] ??
      resultObject?.["signals"] ??
      resultObject?.["top_anomalies"] ??
      result,
  );

  // ---------------------------------------------------------
  // UI
  // ---------------------------------------------------------

  return (
    <>
      <PageHeader
        title="Dataset Analysis"
        subtitle="Upload CSV logs and run the SATSA pipeline — Pandas preprocessing, statistical analysis and anomaly detection."
      />

      {/* =====================================================
          ACTION PANEL
      ===================================================== */}

      <div className="glass-panel rounded-xl p-5">
        <div className="flex flex-wrap items-center gap-3">

          {/* FILE SELECTOR */}

          <input
            type="file"
            accept=".csv"
            onChange={(e) => {
              setFile(
                e.target.files?.[0] ?? null,
              );

              setMsg(null);
            }}
            className="text-xs"
          />

          {/* UPLOAD BUTTON */}

          <button
            onClick={upload}
            disabled={!file || !!busy}
            className="btn-ghost-glow flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy === "upload" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}

            {busy === "upload"
              ? "Uploading..."
              : "Upload CSV"}
          </button>

          {/* DATASET ID
              Kept for UI compatibility.
              Current /analyze/dataset endpoint does not require it.
          */}

          <input
            value={datasetId}
            onChange={(e) =>
              setDatasetId(e.target.value)
            }
            placeholder="Dataset ID (optional)"
            className="rounded-lg border border-border bg-background/60 px-3 py-2 text-xs outline-none"
          />

          {/* RUN ANALYSIS BUTTON */}

          <button
            onClick={run}
            disabled={!!busy}
            className="btn-cta flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy === "run" ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5" />
            )}

            {busy === "run"
              ? "Running analysis..."
              : "Run analysis"}
          </button>
        </div>

        {/* =================================================
            STATUS MESSAGE
        ================================================= */}

        {msg && (
          <div className="mt-4 flex items-start gap-2 rounded-lg border border-border bg-background/40 px-3 py-2">
            {msg.toLowerCase().includes("failed") ||
            msg.toLowerCase().includes("error") ? (
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-400" />
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
            )}

            <p className="text-xs text-muted-foreground">
              {msg}
            </p>
          </div>
        )}
      </div>

      {/* =====================================================
          ANALYSIS RESULTS
      ===================================================== */}

      {result != null && (
        <section className="mt-6">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold">
                Analysis Results
              </h2>

              <p className="mt-1 text-xs text-muted-foreground">
                Results generated by the SATSA analysis engine.
              </p>
            </div>
          </div>

          {resRows.length > 0 ? (
            <DataTable rows={resRows} />
          ) : (
            <pre className="glass-panel max-h-[600px] overflow-auto rounded-xl p-4 font-mono text-xs">
              {JSON.stringify(
                result,
                null,
                2,
              )}
            </pre>
          )}
        </section>
      )}

      {/* =====================================================
          DATASETS
      ===================================================== */}

      <section className="mt-8">
        <h2 className="mb-1 text-sm font-semibold">
          Datasets
        </h2>

        <p className="mb-3 text-xs text-muted-foreground">
          Uploaded dataset information.
        </p>

        <ResourceList path="/datasets" />
      </section>
    </>
  );
}