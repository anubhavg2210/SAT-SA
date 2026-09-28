import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Activity, Database } from "lucide-react";

type Props = {
  analysis: {
    summary?: unknown;
  };
};

type Summary = {
  dataset_signal_summary?: Record<string, unknown>;
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function formatName(value: string) {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

export function DatasetSignals({ analysis }: Props) {
  const summary = record(analysis.summary) as Summary;
  const signals = record(summary.dataset_signal_summary);

  const data = Object.entries(signals)
    .filter(([, value]) => typeof value === "number")
    .map(([name, value]) => ({
      name: formatName(name),
      value: Number(value),
    }))
    .sort((a, b) => b.value - a.value);

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="mb-6 flex items-start justify-between">
        <div className="flex gap-3">
          <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-300">
            <Database className="h-5 w-5" />
          </div>

          <div>
            <h3 className="font-semibold text-white">
              Dataset-Level Signals
            </h3>

            <p className="text-xs text-slate-500">
              Patterns detected across the entire dataset
            </p>
          </div>
        </div>

        <Activity className="h-4 w-4 text-slate-600" />
      </div>

      <div className="h-[320px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ left: 0, right: 10 }}>
            <CartesianGrid
              stroke="rgba(255,255,255,0.05)"
              vertical={false}
            />

            <XAxis
              dataKey="name"
              stroke="#64748b"
              tick={{ fontSize: 10 }}
              interval={0}
              angle={-25}
              textAnchor="end"
              height={75}
            />

            <YAxis
              stroke="#64748b"
              tick={{ fontSize: 11 }}
            />

            <Tooltip
              contentStyle={{
                background: "#111827",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12,
              }}
            />

            <Bar
              dataKey="value"
              fill="#6366f1"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}