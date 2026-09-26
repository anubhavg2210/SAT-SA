import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Loader2, Inbox } from "lucide-react";
import { apiFetch, asList } from "@/lib/satsa-api";

export function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="mb-6">
      <h1 className="text-2xl font-semibold">{title}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
    </header>
  );
}

export function useResource(path: string) {
  return useQuery({ queryKey: ["satsa", path], queryFn: () => apiFetch(path), retry: false });
}

export function StateBox({ loading, error, empty }: { loading?: boolean; error?: unknown; empty?: boolean }) {
  const base = "glass-panel flex items-center gap-3 rounded-xl p-5 text-sm";
  if (loading) return <div className={base}><Loader2 className="h-4 w-4 animate-spin text-violet" /> Loading from SATSA backend…</div>;
  if (error) return <div className={base}><AlertTriangle className="h-4 w-4 text-destructive" /> {(error as Error).message}</div>;
  if (empty) return <div className={base}><Inbox className="h-4 w-4 text-muted-foreground" /> No records returned.</div>;
  return null;
}

function cell(v: unknown) {
  if (v == null) return "—";
  if (typeof v === "object") return JSON.stringify(v);
  return String(v);
}

export function DataTable({ rows, onRowClick, max = 200 }: { rows: Record<string, unknown>[]; onRowClick?: (r: Record<string, unknown>) => void; max?: number }) {
  const cols = Array.from(new Set(rows.slice(0, 20).flatMap((r) => Object.keys(r)))).slice(0, 8);
  return (
    <div className="glass-panel overflow-x-auto rounded-xl">
      <table className="w-full text-left text-xs">
        <thead className="border-b border-border font-mono uppercase tracking-wider text-muted-foreground">
          <tr>{cols.map((c) => <th key={c} className="px-4 py-3 font-medium">{c}</th>)}</tr>
        </thead>
        <tbody>
          {rows.slice(0, max).map((r, i) => (
            <tr key={i} onClick={() => onRowClick?.(r)} className={`border-b border-border/50 ${onRowClick ? "cursor-pointer hover:bg-accent/30" : ""}`}>
              {cols.map((c) => <td key={c} className="max-w-xs truncate px-4 py-2.5">{cell(r[c])}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function ResourceList({ path }: { path: string }) {
  const q = useResource(path);
  const rows = asList(q.data);
  if (q.isLoading || q.error || rows.length === 0) return <StateBox loading={q.isLoading} error={q.error} empty />;
  return <DataTable rows={rows} />;
}
