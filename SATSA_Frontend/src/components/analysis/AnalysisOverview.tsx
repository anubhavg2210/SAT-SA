import type { ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  Database,
  ShieldCheck,
} from "lucide-react";

type Props = {
  analysis: {
    summary?: unknown;
  };
};

type Summary = {
  total_cases?: number;
  cases_with_anomalies?: number;
  cases_without_anomalies?: number;
  total_signals?: number;
  total_case_signals?: number;
  total_dataset_signals?: number;
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function number(value: unknown): number {
  return typeof value === "number" ? value : 0;
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
    <div className="glass-panel rounded-2xl p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>

          <p className="mt-3 text-3xl font-semibold tracking-tight text-white">
            {value.toLocaleString()}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            {description}
          </p>
        </div>

        <div className={`rounded-xl p-2.5 ${iconClass}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

export function AnalysisOverview({ analysis }: Props) {
  const summary = record(analysis.summary) as Summary;

  const totalCases = number(summary.total_cases);
  const anomalousCases = number(summary.cases_with_anomalies);
  const normalCases = number(summary.cases_without_anomalies);
  const totalSignals = number(summary.total_signals);
  const caseSignals = number(summary.total_case_signals);
  const datasetSignals = number(summary.total_dataset_signals);

  const anomalyRate =
    totalCases > 0
      ? (anomalousCases / totalCases) * 100
      : 0;

  return (
    <section className="space-y-5">
      <div>
        <p className="eyebrow">
          SECURITY OVERVIEW
        </p>

        <h2 className="mt-1 text-2xl font-semibold text-white">
          SAT-SA Analysis Overview
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Executive view of the signals and anomalies identified
          across the SOC dataset.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <Metric
          icon={<Database className="h-5 w-5" />}
          label="Total Cases"
          value={totalCases}
          description="Cases analyzed"
        />

        <Metric
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Anomalous Cases"
          value={anomalousCases}
          description={`${anomalyRate.toFixed(1)}% of cases`}
          danger
        />

        <Metric
          icon={<ShieldCheck className="h-5 w-5" />}
          label="Normal Cases"
          value={normalCases}
          description="No anomaly detected"
          success
        />

        <Metric
          icon={<Activity className="h-5 w-5" />}
          label="Total Signals"
          value={totalSignals}
          description="All detected signals"
        />

        <Metric
          icon={<AlertTriangle className="h-5 w-5" />}
          label="Case Signals"
          value={caseSignals}
          description="Case-level findings"
        />

        <Metric
          icon={<Activity className="h-5 w-5" />}
          label="Dataset Signals"
          value={datasetSignals}
          description="Dataset-level patterns"
        />
      </div>

      <div className="glass-panel rounded-2xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.16em] text-slate-500">
              Anomaly Coverage
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Percentage of cases requiring further investigation
            </p>
          </div>

          <span className="text-2xl font-semibold text-white">
            {anomalyRate.toFixed(1)}%
          </span>
        </div>

        <div className="mt-5 h-3 overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500"
            style={{
              width: `${Math.min(anomalyRate, 100)}%`,
            }}
          />
        </div>
      </div>
    </section>
  );
}