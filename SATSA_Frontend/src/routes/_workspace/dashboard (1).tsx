import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, useResource, DataTable, StateBox } from "@/components/app/ResourceView";
import { asList } from "@/lib/satsa-api";

export const Route = createFileRoute("/_workspace/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — SOC Strategy" }, { name: "description", content: "SOC analyst workspace." }] }),
  component: Dashboard,
});

const tiles = [
  ["Cases", "/cases"], ["Alerts", "/alerts"], ["Events", "/events"], ["Investigations", "/investigations"],
  ["Evidence", "/evidence"], ["Assets", "/assets"], ["Datasets", "/datasets"], ["Anomalies", "/anomalies"],
] as const;

function Tile({ label, path }: { label: string; path: string }) {
  const q = useResource(path);
  const n = asList(q.data).length;
  return (
    <div className="glass-panel rounded-xl p-4">
      <p className="eyebrow">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{q.isLoading ? "…" : q.error ? "—" : n}</p>
    </div>
  );
}

function Panel({ title, path }: { title: string; path: string }) {
  const q = useResource(path);
  const rows = asList(q.data);
  return (
    <section>
      <h2 className="mb-3 text-sm font-semibold">{title}</h2>
      {q.isLoading || q.error || !rows.length ? <StateBox loading={q.isLoading} error={q.error} empty /> : <DataTable rows={rows} max={8} />}
    </section>
  );
}

function Dashboard() {
  return (
    <>
      <PageHeader title="Dashboard" subtitle="Live overview from the SATSA analysis engine." />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">{tiles.map(([l, p]) => <Tile key={p} label={l} path={p} />)}</div>
      <div className="mt-8 grid gap-6 xl:grid-cols-2">
        <Panel title="Recent alerts" path="/alerts" />
        <Panel title="Open cases" path="/cases" />
        <Panel title="Anomaly findings" path="/anomalies" />
        <Panel title="Statistical analysis" path="/analysis/statistics" />
      </div>
    </>
  );
}
