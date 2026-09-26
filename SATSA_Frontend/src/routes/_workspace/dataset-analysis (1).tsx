import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Upload, Play, Loader2 } from "lucide-react";
import { PageHeader, ResourceList, DataTable } from "@/components/app/ResourceView";
import { apiFetch, asList } from "@/lib/satsa-api";

export const Route = createFileRoute("/_workspace/dataset-analysis")({
  head: () => ({ meta: [{ title: "Dataset Analysis — SOC Strategy" }, { name: "description", content: "Run SATSA analysis on CSV datasets." }] }),
  component: DatasetAnalysis,
});

function DatasetAnalysis() {
  const qc = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [datasetId, setDatasetId] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [result, setResult] = useState<unknown>(null);

  async function upload() {
    if (!file) return;
    setBusy("upload"); setMsg(null);
    try {
      const fd = new FormData(); fd.append("file", file);
      const r = (await apiFetch("/datasets/upload", { method: "POST", body: fd })) as Record<string, unknown>;
      if (r?.["id"]) setDatasetId(String(r["id"]));
      setMsg("Dataset uploaded."); qc.invalidateQueries({ queryKey: ["satsa", "/datasets"] });
    } catch (e) { setMsg((e as Error).message); } finally { setBusy(null); }
  }

  async function run() {
    setBusy("run"); setMsg(null);
    try {
      setResult(await apiFetch("/analysis/run", { method: "POST", body: JSON.stringify({ dataset_id: datasetId }) }));
    } catch (e) { setMsg((e as Error).message); } finally { setBusy(null); }
  }

  const resRows = asList((result as Record<string, unknown>)?.["anomalies"] ?? result);

  return (
    <>
      <PageHeader title="Dataset Analysis" subtitle="Upload CSV logs and run the SATSA pipeline — Pandas preprocessing, statistics and Isolation Forest." />
      <div className="glass-panel flex flex-wrap items-center gap-3 rounded-xl p-5">
        <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] ?? null)} className="text-xs" />
        <button onClick={upload} disabled={!file || !!busy} className="btn-ghost-glow flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold">
          {busy === "upload" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Upload className="h-3.5 w-3.5" />} Upload CSV
        </button>
        <input value={datasetId} onChange={(e) => setDatasetId(e.target.value)} placeholder="Dataset ID" className="rounded-lg border border-border bg-background/60 px-3 py-2 text-xs" />
        <button onClick={run} disabled={!datasetId || !!busy} className="btn-cta flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold">
          {busy === "run" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />} Run analysis
        </button>
        {msg && <p className="w-full text-xs text-muted-foreground">{msg}</p>}
      </div>
      {result != null && (
        <section className="mt-6">
          <h2 className="mb-3 text-sm font-semibold">Analysis results</h2>
          {resRows.length ? <DataTable rows={resRows} /> : <pre className="glass-panel overflow-auto rounded-xl p-4 font-mono text-xs">{JSON.stringify(result, null, 2)}</pre>}
        </section>
      )}
      <section className="mt-8">
        <h2 className="mb-3 text-sm font-semibold">Datasets</h2>
        <ResourceList path="/datasets" />
      </section>
    </>
  );
}
