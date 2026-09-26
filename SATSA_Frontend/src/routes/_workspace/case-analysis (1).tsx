import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader, useResource, DataTable, StateBox } from "@/components/app/ResourceView";
import { asList } from "@/lib/satsa-api";

export const Route = createFileRoute("/_workspace/case-analysis")({
  head: () => ({ meta: [{ title: "Case Analysis — SOC Strategy" }, { name: "description", content: "Inspect security cases." }] }),
  component: CaseAnalysis,
});

function CaseDetail({ id }: { id: string }) {
  const q = useResource(`/cases/${encodeURIComponent(id)}`);
  if (q.isLoading || q.error) return <StateBox loading={q.isLoading} error={q.error} />;
  const c = (q.data ?? {}) as Record<string, unknown>;
  const scalars = Object.entries(c).filter(([, v]) => typeof v !== "object" || v === null);
  const lists = Object.entries(c).filter(([, v]) => Array.isArray(v));
  return (
    <div className="space-y-6">
      <div className="glass-panel grid grid-cols-2 gap-4 rounded-xl p-5 md:grid-cols-4">
        {scalars.map(([k, v]) => (
          <div key={k}><p className="eyebrow">{k}</p><p className="mt-1 truncate text-sm">{String(v ?? "—")}</p></div>
        ))}
      </div>
      {lists.map(([k, v]) => (
        <section key={k}>
          <h3 className="mb-2 text-sm font-semibold capitalize">{k.replace(/_/g, " ")}</h3>
          {(v as unknown[]).length ? <DataTable rows={(v as unknown[]).map((x) => (typeof x === "object" && x ? x : { value: x }) as Record<string, unknown>)} /> : <StateBox empty />}
        </section>
      ))}
    </div>
  );
}

function CaseAnalysis() {
  const q = useResource("/cases");
  const rows = asList(q.data);
  const [sel, setSel] = useState<string | null>(null);
  return (
    <>
      <PageHeader title="Case Analysis" subtitle="Select a case to inspect alerts, events, timeline, evidence and anomaly indicators." />
      {q.isLoading || q.error || !rows.length ? (
        <StateBox loading={q.isLoading} error={q.error} empty />
      ) : (
        <DataTable rows={rows} onRowClick={(r) => setSel(String(r["id"] ?? r["case_id"] ?? ""))} />
      )}
      {sel && <div className="mt-8"><h2 className="mb-3 font-mono text-sm text-violet">Case {sel}</h2><CaseDetail id={sel} /></div>}
    </>
  );
}
