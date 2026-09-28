import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  ShieldCheck,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type Props = {
  analysis: {
    summary?: unknown;
  };
};

type Summary = {
  case_signal_summary?: Record<string, unknown>;
};

type SignalItem = {
  name: string;
  value: number;
};

function record(value: unknown): Record<string, unknown> {
  return value &&
    typeof value === "object" &&
    !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function formatName(value: string): string {
  return value
    .toLowerCase()
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function Metric({
  icon,
  label,
  value,
  description,
  danger = false,
  success = false,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  description: string;
  danger?: boolean;
  success?: boolean;
}) {
  const iconClass = danger
    ? "bg-rose-500/10 text-rose-300"
    : success
      ? "bg-emerald-500/10 text-emerald-300"
      : "bg-indigo-500/10 text-indigo-300";

  return (
    <div className="glass-panel rounded-xl p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-slate-500">
            {label}
          </p>

          <p className="mt-2 text-2xl font-semibold text-white">
            {value.toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className={`rounded-lg p-2 ${iconClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function SignalDistribution({ analysis }: Props) {
  const summary =
    record(analysis.summary) as Summary;

  const signals =
    record(summary.case_signal_summary);

  const data: SignalItem[] = Object.entries(signals)
    .filter(([, value]) => typeof value === "number")
    .map(([name, value]) => ({
      name: formatName(name),
      value: Number(value),
    }))
    .sort((a, b) => b.value - a.value);

  const totalCaseSignals = data.reduce(
    (sum, item) => sum + item.value,
    0,
  );

  const highestSignal = data[0]?.value ?? 0;
  const signalTypes = data.length;

  return (
    <div className="glass-panel rounded-2xl p-6">
      <div className="mb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-500/10 p-2.5 text-indigo-300">
              <BarChart3 className="h-5 w-5" />
            </div>

            <div>
              <p className="eyebrow">
                CASE ANALYTICS
              </p>

              <h3 className="mt-1 text-lg font-semibold text-white">
                Case-Level Signal Distribution
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Signals detected across individual SOC cases.
              </p>
            </div>
          </div>

          <Activity className="h-4 w-4 text-slate-600" />
        </div>
      </div>

      <div className="mb-5 grid grid-cols-3 gap-3">
        <Metric
          icon={<Activity className="h-4 w-4" />}
          label="Signals"
          value={totalCaseSignals}
          description="Case-level signals"
        />

        <Metric
          icon={<AlertTriangle className="h-4 w-4" />}
          label="Signal Types"
          value={signalTypes}
          description="Detected categories"
          danger
        />

        <Metric
          icon={<ShieldCheck className="h-4 w-4" />}
          label="Highest"
          value={highestSignal}
          description="Largest signal count"
          success
        />
      </div>

      <div className="h-[320px]">
        {data.length === 0 ? (
          <div className="flex h-full items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.015] text-sm text-slate-500">
            No case-level signal data available.
          </div>
        ) : (
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={data}
              layout="vertical"
              margin={{
                top: 5,
                right: 20,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid
                stroke="rgba(255,255,255,0.05)"
                horizontal={false}
              />

              <XAxis
                type="number"
                stroke="#64748b"
                tick={{
                  fontSize: 11,
                }}
              />

              <YAxis
                type="category"
                dataKey="name"
                stroke="#64748b"
                width={150}
                tick={{
                  fontSize: 10,
                }}
              />

              <Tooltip
                contentStyle={{
                  background: "#111827",
                  border:
                    "1px solid rgba(255,255,255,0.1)",
                  borderRadius: 12,
                  color: "#e2e8f0",
                }}
              />

              <Bar
                dataKey="value"
                fill="#6366f1"
                radius={[0, 6, 6, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}