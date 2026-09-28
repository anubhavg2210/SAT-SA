import { AlertTriangle } from "lucide-react";

type Props = {
  analysis: {
    summary?: unknown;
  };
};

type Summary = {
  cases_with_anomalies?: number;
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export function CriticalFindings({ analysis }: Props) {
  const summary = record(analysis.summary) as Summary;

  const anomalousCases =
    typeof summary.cases_with_anomalies === "number"
      ? summary.cases_with_anomalies
      : 0;

  return (
    <section className="glass-panel overflow-hidden rounded-2xl">
      <div className="border-b border-white/[0.06] p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-rose-500/10 p-2.5 text-rose-300">
              <AlertTriangle className="h-5 w-5" />
            </div>

            <div>
              <p className="eyebrow">
                PRIORITY FINDINGS
              </p>

              <h3 className="mt-1 text-lg font-semibold text-white">
                Critical Findings
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Cases requiring analyst attention.
              </p>
            </div>
          </div>

          <span className="rounded-full border border-rose-400/20 bg-rose-400/5 px-3 py-1 text-xs text-rose-300">
            {anomalousCases.toLocaleString()} anomalous cases
          </span>
        </div>
      </div>

      <div className="p-6">
        <p className="text-sm text-slate-400">
          SAT-SA identified{" "}
          <span className="font-semibold text-white">
            {anomalousCases.toLocaleString()}
          </span>{" "}
          cases requiring further investigation.
        </p>
      </div>
    </section>
  );
}