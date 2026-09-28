import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  CircleDot,
  Database,
  FileSearch,
  Loader2,
  RefreshCw,
  Layers3,
  BarChart3,
  Zap,
  Search,
  ShieldAlert,
  ShieldCheck,
  Activity,
  XCircle,
} from "lucide-react";
import {
  type ReactNode,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  analyzeAll,
  analyzeCase,
} from "@/lib/satsa-api";

export const Route = createFileRoute("/_workspace/case-analysis")({
  head: () => ({
    meta: [
      { title: "Case Analysis — SOC Strategy" },
      {
        name: "description",
        content: "Inspect and understand individual SOC cases.",
      },
    ],
  }),
  component: CaseAnalysis,
});

type AnyRecord = Record<string, unknown>;

type CaseSummary = {
  case_id: string;
  severity: string | undefined;
  priority: string | undefined;
  signal_count: number;
  signals: AnyRecord[];
  confidence: AnyRecord | undefined;
  fusion: AnyRecord | undefined;
  asset_id: string | undefined;
  cse_id: string | undefined;
  finding_type: string | undefined;
  supervisory_dimension: string | undefined;
};

type CaseDetail = AnyRecord;

type CseGroup = {
  id: string;
  cases: CaseSummary[];
  totalSignals: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  signalCounts: Record<string, number>;
  signalTypes: number;
};

function isRecord(value: unknown): value is AnyRecord {
  return (
    value !== null &&
    typeof value === "object" &&
    !Array.isArray(value)
  );
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function stringValue(
  value: unknown,
  fallback = "—",
): string {
  return typeof value === "string" && value.trim()
    ? value
    : fallback;
}

function numberValue(
  value: unknown,
  fallback = 0,
): number {
  return typeof value === "number" ? value : fallback;
}

function formatLabel(value: string): string {
  return value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function severityClass(severity?: string): string {
  switch (severity?.toUpperCase()) {
    case "CRITICAL":
      return "border-rose-400/20 bg-rose-500/10 text-rose-300";
    case "HIGH":
      return "border-orange-400/20 bg-orange-500/10 text-orange-300";
    case "MEDIUM":
      return "border-amber-400/20 bg-amber-500/10 text-amber-300";
    case "LOW":
      return "border-sky-400/20 bg-sky-500/10 text-sky-300";
    default:
      return "border-white/10 bg-white/[0.04] text-slate-300";
  }
}

/**
 * /analyze/all can contain the case-analysis list under different
 * container keys depending on backend version.
 *
 * Instead of depending on one fragile key, walk the response and
 * collect objects that actually look like case analysis records.
 */
function getFirstCase(cases: CaseSummary[]): CaseSummary | undefined {
  return cases[0];
}

function extractCases(
  input: unknown,
  result: CaseSummary[] = [],
  seen = new Set<string>(),
): CaseSummary[] {
  if (Array.isArray(input)) {
    for (const item of input) {
      extractCases(item, result, seen);
    }

    return result;
  }

  if (!isRecord(input)) {
    return result;
  }

  const value = input;

  const caseId =
    typeof value["case_id"] === "string"
      ? value["case_id"]
      : null;

  const signalsValue = value["signals"];

  const confidenceValue = value["confidence"];

  const fusionValue = value["fusion"];

  const looksLikeCase =
    caseId !== null &&
    (
      Array.isArray(signalsValue) ||
      typeof value["signal_count"] === "number" ||
      isRecord(confidenceValue) ||
      isRecord(fusionValue)
    );

  if (looksLikeCase && caseId) {
    if (!seen.has(caseId)) {
      seen.add(caseId);

      const signals = Array.isArray(signalsValue)
        ? signalsValue.filter(isRecord)
        : [];

      const severity =
        typeof value["severity"] === "string"
          ? value["severity"]
          : typeof signals[0]?.["severity"] === "string"
            ? String(signals[0]["severity"])
            : undefined;

      const priority =
        typeof value["priority"] === "string"
          ? value["priority"]
          : isRecord(confidenceValue) &&
              typeof confidenceValue["priority"] === "string"
            ? String(confidenceValue["priority"])
            : undefined;

      result.push({
        case_id: caseId,

        severity,

        priority,

        signal_count:
          typeof value["signal_count"] === "number"
            ? value["signal_count"]
            : signals.length,

        signals,

        confidence: isRecord(confidenceValue)
          ? confidenceValue
          : undefined,

        fusion: isRecord(fusionValue)
          ? fusionValue
          : undefined,

        asset_id:
          typeof value["asset_id"] === "string"
            ? value["asset_id"]
            : typeof signals[0]?.["asset_id"] === "string"
              ? String(signals[0]["asset_id"])
              : undefined,

        cse_id:
          typeof value["cse_id"] === "string"
            ? value["cse_id"]
            : typeof signals[0]?.["cse_id"] === "string"
              ? String(signals[0]["cse_id"])
              : undefined,

        finding_type:
          typeof value["finding_type"] === "string"
            ? value["finding_type"]
            : undefined,

        supervisory_dimension:
          typeof value["supervisory_dimension"] === "string"
            ? value["supervisory_dimension"]
            : undefined,
      });
    }
  }

  for (const child of Object.values(value)) {
    extractCases(child, result, seen);
  }

  return result;
}

function MetricCard({
  label,
  value,
  icon,
  accent = "text-slate-200",
}: {
  label: string;
  value: string;
  icon: ReactNode;
  accent?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
          {label}
        </span>

        <span className="text-slate-500">
          {icon}
        </span>
      </div>

      <div
        className={`mt-3 text-lg font-semibold ${accent}`}
      >
        {value}
      </div>
    </div>
  );
}

function SignalCard({
  signal,
}: {
  signal: AnyRecord;
}) {
  const [open, setOpen] = useState(false);

  const code = stringValue(
    signal["signal_code"] ?? signal["signal"] ?? signal["type"],
    "Unknown Signal",
  );

  const description = stringValue(
    signal["description"],
    "No description available.",
  );

  const category = stringValue(
    signal["signal_category"],
    "Analysis Signal",
  );

  const dimension = stringValue(
    signal["supervisory_dimension"],
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-start gap-3 p-4 text-left transition hover:bg-white/[0.035]"
      >
        <div className="mt-0.5 rounded-lg border border-amber-400/15 bg-amber-500/10 p-2 text-amber-300">
          <AlertTriangle className="h-4 w-4" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-100">
              {formatLabel(code)}
            </span>

            <span className="rounded-full border border-white/[0.07] bg-white/[0.035] px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-500">
              {category}
            </span>
          </div>

          <p className="mt-1 text-xs leading-5 text-slate-400">
            {description}
          </p>

          {dimension !== "—" && (
            <div className="mt-3 flex flex-wrap gap-2">
              <span className="rounded-lg border border-white/[0.06] bg-black/10 px-2.5 py-1 text-[10px] text-slate-500">
                {dimension}
              </span>
            </div>
          )}
        </div>

        <div className="mt-1 text-slate-500">
          {open ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </div>
      </button>

      {open && (
        <div className="border-t border-white/[0.06] bg-black/10 p-4">
          <div className="grid gap-3 sm:grid-cols-2">
            {Object.entries(signal)
              .filter(([key]) => key !== "description")
              .map(([key, value]) => (
                <div
                  key={key}
                  className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3"
                >
                  <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-600">
                    {formatLabel(key)}
                  </div>

                  <div className="mt-1 break-words text-xs text-slate-300">
                    {typeof value === "object"
                      ? JSON.stringify(value, null, 2)
                      : String(value)}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DataSection({
  title,
  value,
  icon,
}: {
  title: string;
  value: unknown;
  icon: ReactNode;
}) {
  const [open, setOpen] = useState(false);

  if (
    value === undefined ||
    value === null ||
    (Array.isArray(value) && value.length === 0)
  ) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.025]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-white/[0.035]"
      >
        <span className="rounded-lg border border-white/[0.07] bg-white/[0.035] p-2 text-slate-400">
          {icon}
        </span>

        <span className="flex-1 text-sm font-semibold text-slate-200">
          {title}
        </span>

        {Array.isArray(value) && (
          <span className="rounded-full bg-white/[0.04] px-2 py-1 text-[10px] text-slate-500">
            {value.length}
          </span>
        )}

        {open ? (
          <ChevronDown className="h-4 w-4 text-slate-500" />
        ) : (
          <ChevronRight className="h-4 w-4 text-slate-500" />
        )}
      </button>

      {open && (
        <div className="border-t border-white/[0.06] p-4">
          <pre className="max-h-[420px] overflow-auto rounded-xl border border-white/[0.05] bg-black/20 p-4 text-[11px] leading-5 text-slate-400">
            {JSON.stringify(value, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

function CaseAnalysis() {
  const [allAnalysis, setAllAnalysis] =
    useState<AnyRecord | null>(null);

  const [selectedCaseId, setSelectedCaseId] =
    useState<string | null>(null);

  const [caseDetail, setCaseDetail] =
    useState<CaseDetail | null>(null);

  const [loadingCases, setLoadingCases] =
    useState(true);

  const [loadingDetail, setLoadingDetail] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [selectedCseId, setSelectedCseId] =
    useState<string | null>(null);

  async function loadCases() {
    setLoadingCases(true);
    setError(null);

    try {
      const result = await analyzeAll();
      setAllAnalysis(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load case analysis.",
      );
    } finally {
      setLoadingCases(false);
    }
  }

  async function loadCase(caseId: string) {
    setSelectedCaseId(caseId);
    setLoadingDetail(true);
    setError(null);

    try {
      const result = await analyzeCase(caseId);
      setCaseDetail(result);
    } catch (err) {
      setCaseDetail(null);
      setError(
        err instanceof Error
          ? err.message
          : `Unable to load ${caseId}.`,
      );
    } finally {
      setLoadingDetail(false);
    }
  }

  useEffect(() => {
    void loadCases();
  }, []);

  const cases = useMemo(
    () => extractCases(allAnalysis),
    [allAnalysis],
  );

  const cseGroups = useMemo<CseGroup[]>(() => {
    const grouped = new Map<string, CaseSummary[]>();

    for (const item of cases) {
      const cse = item.cse_id?.trim() || "UNASSIGNED";
      const bucket = grouped.get(cse) ?? [];
      bucket.push(item);
      grouped.set(cse, bucket);
    }

    return Array.from(grouped.entries())
      .map(([id, groupCases]) => {
        const signalCounts: Record<string, number> = {};

        for (const item of groupCases) {
          for (const signal of item.signals) {
            const name = String(
              signal["signal_code"] ??
                signal["signal"] ??
                signal["type"] ??
                "UNKNOWN_SIGNAL",
            );
            signalCounts[name] = (signalCounts[name] ?? 0) + 1;
          }
        }

        return {
          id,
          cases: [...groupCases].sort((a, b) =>
            (b.signal_count ?? 0) - (a.signal_count ?? 0),
          ),
          totalSignals: groupCases.reduce(
            (sum, item) => sum + item.signal_count,
            0,
          ),
          critical: groupCases.filter(
            (item) => item.severity?.toUpperCase() === "CRITICAL",
          ).length,
          high: groupCases.filter(
            (item) => item.severity?.toUpperCase() === "HIGH",
          ).length,
          medium: groupCases.filter(
            (item) => item.severity?.toUpperCase() === "MEDIUM",
          ).length,
          low: groupCases.filter(
            (item) => item.severity?.toUpperCase() === "LOW",
          ).length,
          signalCounts,
          signalTypes: Object.keys(signalCounts).length,
        };
      })
      .sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  }, [cases]);

  useEffect(() => {
    if (!selectedCseId) {
      const firstCse = cseGroups[0];
      if (firstCse) {
        setSelectedCseId(firstCse.id);
      }
    }
  }, [cseGroups, selectedCseId]);

  const selectedCse =
    cseGroups.find((group) => group.id === selectedCseId);

  const visibleCases = useMemo(() => {
    if (!selectedCse) return [];

    const query = search.trim().toLowerCase();
    if (!query) return selectedCse.cases;

    return selectedCse.cases.filter((item) =>
      item.case_id.toLowerCase().includes(query) ||
      String(item.asset_id ?? "").toLowerCase().includes(query) ||
      item.signals.some((signal: AnyRecord) =>
        String(
          signal["signal_code"] ??
            signal["signal"] ??
            signal["type"] ??
            "",
        )
          .toLowerCase()
          .includes(query),
      ),
    );
  }, [selectedCse, search]);

  useEffect(() => {
    if (!selectedCaseId && cases.length > 0) {
      const firstCase = cases[0];
      if (firstCase) void loadCase(firstCase.case_id);
    }
  }, [cases, selectedCaseId]);

  const selectedSummary =
    cases.find(
      (item) => item.case_id === selectedCaseId,
    ) ?? getFirstCase(cases);

  const detail = isRecord(caseDetail)
    ? caseDetail
    : {};

  const detailSignals: AnyRecord[] = Array.isArray(detail["signals"])
    ? detail["signals"].filter(isRecord)
    : selectedSummary?.signals ?? [];

  const confidence =
    isRecord(detail["confidence"])
      ? detail["confidence"]
      : selectedSummary?.confidence ?? {};

  const fusion =
    isRecord(detail["fusion"])
      ? detail["fusion"]
      : selectedSummary?.fusion ?? {};

  const findings: AnyRecord[] = Array.isArray(fusion["findings"])
    ? fusion["findings"].filter(isRecord)
    : [];

  const confidenceScore = numberValue(
    confidence["confidence_score"],
    0,
  );

  const summary: AnyRecord = isRecord(allAnalysis?.["summary"])
    ? allAnalysis["summary"]
    : {};

  const totalCases = numberValue(
    summary["total_cases"],
    cases.length,
  );

  const anomalousCases = numberValue(
    summary["cases_with_anomalies"],
  );

  const totalSignals = numberValue(
    summary["total_case_signals"],
  );

  return (
    <div className="min-h-full bg-[#050816] text-slate-200">
      <div className="mx-auto max-w-[1800px] space-y-6 p-6 lg:p-8">

        {/* PAGE HEADER */}
        <section className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-xl border border-violet-400/15 bg-violet-500/10 p-2.5 text-violet-300">
                <FileSearch className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
                  Case Analysis
                </h1>

                <p className="mt-1 text-sm text-slate-500">
                  Inspect cases, signals, evidence and analysis findings.
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-4 py-2.5">
              <span className="text-xs text-slate-500">
                Total Cases
              </span>

              <span className="ml-3 text-sm font-semibold text-slate-200">
                {totalCases.toLocaleString()}
              </span>
            </div>

            <div className="rounded-xl border border-rose-400/10 bg-rose-500/[0.06] px-4 py-2.5">
              <span className="text-xs text-slate-500">
                Anomalous
              </span>

              <span className="ml-3 text-sm font-semibold text-rose-300">
                {anomalousCases.toLocaleString()}
              </span>
            </div>

            <button
              type="button"
              onClick={() => {
                void loadCases();
              }}
              disabled={loadingCases}
              className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.035] px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/[0.07] disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  loadingCases ? "animate-spin" : ""
                }`}
              />
              Refresh Analysis
            </button>
          </div>
        </section>

        {error && (
          <div className="flex items-start gap-3 rounded-2xl border border-rose-400/15 bg-rose-500/[0.06] p-4">
            <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-300" />

            <div>
              <p className="text-sm font-medium text-rose-200">
                Case analysis request failed
              </p>

              <p className="mt-1 text-xs text-rose-300/70">
                {error}
              </p>
            </div>
          </div>
        )}

        {/* CSE LANDSCAPE */}
        <section className="rounded-2xl border border-white/[0.07] bg-[#080d1d]/90 p-5">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Layers3 className="h-4 w-4 text-violet-300" />
                <h2 className="text-sm font-semibold text-slate-100">CSE Signal Landscape</h2>
              </div>
              <p className="mt-1 text-xs text-slate-600">Select a Cyber Security Entity to see its cases and signal footprint.</p>
            </div>
            <span className="text-[10px] uppercase tracking-[0.16em] text-slate-600">{cseGroups.length} CSEs detected</span>
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {cseGroups.map((group) => {
              const selected = group.id === selectedCse?.id;
              const topSignals = Object.entries(group.signalCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 3);

              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => {
                    setSelectedCseId(group.id);
                    const firstCase = group.cases[0];
                    if (firstCase) void loadCase(firstCase.case_id);
                  }}
                  className={`group rounded-2xl border p-4 text-left transition ${
                    selected
                      ? "border-violet-400/35 bg-violet-500/[0.09] shadow-[0_0_35px_rgba(124,58,237,0.10)]"
                      : "border-white/[0.07] bg-white/[0.02] hover:border-white/[0.13] hover:bg-white/[0.035]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[10px] uppercase tracking-[0.18em] text-slate-500">CSE</div>
                      <div className="mt-1 text-lg font-semibold text-slate-100">{group.id}</div>
                    </div>
                    <div className={`rounded-xl p-2 ${selected ? "bg-violet-500/15 text-violet-300" : "bg-white/[0.04] text-slate-500"}`}>
                      <BarChart3 className="h-4 w-4" />
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2">
                    <CseMetric label="Cases" value={group.cases.length} />
                    <CseMetric label="Signals" value={group.totalSignals} />
                    <CseMetric label="Types" value={group.signalTypes} />
                  </div>

                  <div className="mt-4 space-y-2">
                    {topSignals.length > 0 ? topSignals.map(([name, count]) => (
                      <div key={name}>
                        <div className="flex items-center justify-between gap-2 text-[10px]">
                          <span className="truncate text-slate-500">{formatLabel(name)}</span>
                          <span className="text-slate-400">{count}</span>
                        </div>
                        <div className="mt-1 h-1 overflow-hidden rounded-full bg-white/[0.05]">
                          <div
                            className="h-full rounded-full bg-violet-400/70"
                            style={{ width: `${Math.max(8, Math.min(100, (count / Math.max(1, group.totalSignals)) * 100))}%` }}
                          />
                        </div>
                      </div>
                    )) : (
                      <div className="text-[10px] text-slate-600">No signals recorded</div>
                    )}
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {group.critical > 0 && <SeverityPill label={`${group.critical} Critical`} className="text-rose-300 bg-rose-500/10 border-rose-400/15" />}
                    {group.high > 0 && <SeverityPill label={`${group.high} High`} className="text-orange-300 bg-orange-500/10 border-orange-400/15" />}
                    {group.medium > 0 && <SeverityPill label={`${group.medium} Medium`} className="text-amber-300 bg-amber-500/10 border-amber-400/15" />}
                    {group.low > 0 && <SeverityPill label={`${group.low} Low`} className="text-sky-300 bg-sky-500/10 border-sky-400/15" />}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* MAIN WORKSPACE */}
        <section className="grid min-h-[720px] gap-5 xl:grid-cols-[360px_minmax(0,1fr)]">
          {/* CSE CASE EXPLORER */}
          <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080d1d]/90">
            <div className="border-b border-white/[0.06] p-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <Layers3 className="h-4 w-4 text-violet-300" />
                    <h2 className="text-sm font-semibold text-slate-100">{selectedCse?.id ?? "CSE"} Cases</h2>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{selectedCse?.cases.length ?? 0} cases · {selectedCse?.totalSignals ?? 0} signals</p>
                </div>
                <Zap className="h-4 w-4 text-slate-600" />
              </div>

              <div className="relative mt-4">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-600" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={`Search ${selectedCse?.id ?? "CSE"} cases...`}
                  className="w-full rounded-xl border border-white/[0.07] bg-black/20 py-2.5 pl-9 pr-3 text-xs text-slate-200 outline-none placeholder:text-slate-600 focus:border-violet-400/30"
                />
              </div>
            </div>

            <div className="border-b border-white/[0.06] px-5 py-4">
              <div className="grid grid-cols-3 gap-2">
                <MiniStat label="Critical" value={selectedCse?.critical ?? 0} />
                <MiniStat label="High" value={selectedCse?.high ?? 0} />
                <MiniStat label="Signal Types" value={selectedCse?.signalTypes ?? 0} />
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-3">
              {loadingCases ? (
                <div className="flex items-center justify-center py-16 text-slate-500"><Loader2 className="h-5 w-5 animate-spin" /></div>
              ) : visibleCases.length === 0 ? (
                <div className="px-4 py-12 text-center">
                  <Search className="mx-auto h-6 w-6 text-slate-700" />
                  <p className="mt-3 text-sm text-slate-500">No matching cases</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {visibleCases.map((item) => {
                    const selected = item.case_id === selectedCaseId;
                    const primarySignal = item.signals[0];
                    const primarySignalName = primarySignal
                      ? String(primarySignal["signal_code"] ?? primarySignal["signal"] ?? primarySignal["type"] ?? "Signal")
                      : "No signal";

                    return (
                      <button
                        key={item.case_id}
                        type="button"
                        onClick={() => void loadCase(item.case_id)}
                        className={`w-full rounded-xl border p-4 text-left transition ${selected ? "border-violet-400/30 bg-violet-500/[0.09]" : "border-white/[0.05] bg-white/[0.015] hover:border-white/[0.10] hover:bg-white/[0.03]"}`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <CircleDot className={`h-3 w-3 ${selected ? "text-violet-300" : "text-slate-600"}`} />
                              <span className="text-sm font-semibold text-slate-200">{item.case_id}</span>
                            </div>
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              <span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold uppercase ${severityClass(item.severity)}`}>{item.severity ?? "UNKNOWN"}</span>
                              <span className="rounded-full border border-white/[0.07] bg-white/[0.035] px-2 py-0.5 text-[9px] font-semibold text-slate-500">{item.priority ?? "—"}</span>
                            </div>
                          </div>
                          <span className="shrink-0 rounded-lg bg-white/[0.04] px-2 py-1 text-[10px] text-slate-500">{item.signal_count} signals</span>
                        </div>
                        <div className="mt-3 flex items-center justify-between gap-3 text-[10px]">
                          <span className="truncate text-slate-600">{item.asset_id ?? "No asset"}</span>
                          <span className="truncate text-slate-500">{formatLabel(primarySignalName)}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-white/[0.06] p-4">
              <div className="flex items-center justify-between text-[10px] text-slate-600">
                <span>Showing {visibleCases.length} of {selectedCse?.cases.length ?? 0}</span>
                <span>{selectedCse?.totalSignals ?? 0} total signals</span>
              </div>
            </div>
          </aside>

          {/* DETAIL */}
          <main className="min-w-0 space-y-5">
            {!selectedSummary ? (
              <div className="flex min-h-[600px] items-center justify-center rounded-2xl border border-white/[0.07] bg-[#080d1d]/90">
                <div className="text-center">
                  <ShieldCheck className="mx-auto h-10 w-10 text-slate-700" />

                  <p className="mt-4 text-sm text-slate-500">
                    Select a case to inspect its analysis.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* CASE HEADER */}
                <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080d1d]/90">
                  <div className="border-b border-white/[0.06] p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="rounded-full border border-violet-400/15 bg-violet-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-violet-300">
                            Case
                          </span>

                          <span className="font-mono text-sm text-slate-400">
                            {selectedSummary.case_id}
                          </span>
                        </div>

                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase ${severityClass(
                              selectedSummary.severity,
                            )}`}
                          >
                            {selectedSummary.severity ?? "UNKNOWN"}
                          </span>

                          <span className="rounded-full border border-white/[0.07] bg-white/[0.035] px-2.5 py-1 text-[10px] font-semibold text-slate-400">
                            {selectedSummary.priority ?? "—"}
                          </span>

                          {selectedSummary.cse_id && (
                            <span className="rounded-full border border-white/[0.07] bg-white/[0.035] px-2.5 py-1 text-[10px] text-slate-500">
                              {selectedSummary.cse_id}
                            </span>
                          )}
                        </div>
                      </div>

                      {loadingDetail && (
                        <div className="inline-flex items-center gap-2 text-xs text-slate-500">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Loading case analysis
                        </div>
                      )}
                    </div>
                  </div>

                  {/* METRICS */}
                  <div className="grid gap-3 p-5 sm:grid-cols-2 xl:grid-cols-4">
                    <MetricCard
                      label="Severity"
                      value={
                        selectedSummary.severity ?? "UNKNOWN"
                      }
                      icon={
                        <ShieldAlert className="h-4 w-4" />
                      }
                      accent="text-rose-300"
                    />

                    <MetricCard
                      label="Signals"
                      value={String(
                        selectedSummary.signal_count ?? 0,
                      )}
                      icon={
                        <Activity className="h-4 w-4" />
                      }
                      accent="text-violet-300"
                    />

                    <MetricCard
                      label="Confidence"
                      value={`${confidenceScore}/10`}
                      icon={
                        <ShieldCheck className="h-4 w-4" />
                      }
                      accent="text-sky-300"
                    />

                    <MetricCard
                      label="Asset"
                      value={
                        selectedSummary.asset_id ??
                        stringValue(
                          detail["asset_id"],
                          "—",
                        )
                      }
                      icon={
                        <Database className="h-4 w-4" />
                      }
                      accent="text-slate-200"
                    />
                  </div>
                </section>

                {/* SIGNALS */}
                <section className="rounded-2xl border border-white/[0.07] bg-[#080d1d]/90 p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <h2 className="text-sm font-semibold text-slate-100">
                        Signals / Findings
                      </h2>

                      <p className="mt-1 text-xs text-slate-600">
                        Analysis signals detected for this case.
                      </p>
                    </div>

                    <span className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[10px] text-slate-500">
                      {detailSignals.length}
                    </span>
                  </div>

                  {detailSignals.length === 0 ? (
                    <div className="rounded-xl border border-white/[0.05] bg-white/[0.015] p-5 text-sm text-slate-500">
                      No case-level signals were returned.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {detailSignals.map((signal: AnyRecord, index) => (
                        <SignalCard
                          key={`${String(
                            signal["signal_code"] ??
                              signal["signal"] ??
                              "signal",
                          )}-${index}`}
                          signal={signal}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* FINDINGS */}
                {findings.length > 0 && (
                  <section className="rounded-2xl border border-violet-400/10 bg-violet-500/[0.035] p-5">
                    <div className="mb-4">
                      <h2 className="text-sm font-semibold text-slate-100">
                        Correlated Findings
                      </h2>

                      <p className="mt-1 text-xs text-slate-600">
                        Composite findings generated by signal fusion.
                      </p>
                    </div>

                    <div className="space-y-3">
                      {findings.map((finding: AnyRecord, index) => (
                        <div
                          key={index}
                          className="rounded-xl border border-white/[0.06] bg-black/10 p-4"
                        >
                          <div className="flex items-start gap-3">
                            <div className="rounded-lg border border-violet-400/15 bg-violet-500/10 p-2 text-violet-300">
                              <Activity className="h-4 w-4" />
                            </div>

                            <div>
                              <p className="text-sm font-semibold text-slate-200">
                                {formatLabel(
                                  stringValue(
                                    finding["finding_type"] ??
                                      finding["signal_code"],
                                    "Fused Finding",
                                  ),
                                )}
                              </p>

                              <p className="mt-1 text-xs leading-5 text-slate-400">
                                {stringValue(
                                  finding["description"],
                                  "No finding description available.",
                                )}
                              </p>

                              {Array.isArray(
                                finding["supporting_signals"],
                              ) && (
                                <div className="mt-3 flex flex-wrap gap-2">
                                  {(finding["supporting_signals"] as unknown[]).map(
                                    (signal: unknown) => (
                                      <span
                                        key={String(signal)}
                                        className="rounded-lg border border-white/[0.06] bg-white/[0.025] px-2.5 py-1 text-[10px] text-slate-500"
                                      >
                                        {formatLabel(
                                          String(signal),
                                        )}
                                      </span>
                                    ),
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* INVESTIGATION TIMELINE */}
                <section className="rounded-2xl border border-white/[0.07] bg-[#080d1d]/90 p-5">
                  <div className="mb-5">
                    <h2 className="text-sm font-semibold text-slate-100">
                      Investigation Timeline
                    </h2>

                    <p className="mt-1 text-xs text-slate-600">
                      Available temporal information returned by the backend.
                    </p>
                  </div>

                  <Timeline
                    selectedSummary={selectedSummary}
                  />
                </section>

                {/* EVIDENCE / EVENTS / INVESTIGATION */}
                <section className="space-y-3">
                  <DataSection
                    title="Evidence"
                    value={
                      detail["evidence"] ??
                      detail["evidence_records"]
                    }
                    icon={
                      <FileSearch className="h-4 w-4" />
                    }
                  />

                  <DataSection
                    title="Events"
                    value={
                      detail["events"] ??
                      detail["event_records"]
                    }
                    icon={
                      <Activity className="h-4 w-4" />
                    }
                  />

                  <DataSection
                    title="Investigation"
                    value={
                      detail["investigation"] ??
                      detail["investigations"]
                    }
                    icon={
                      <Search className="h-4 w-4" />
                    }
                  />

                  <DataSection
                    title="Alerts"
                    value={
                      detail["alerts"] ??
                      detail["alert_records"]
                    }
                    icon={
                      <AlertTriangle className="h-4 w-4" />
                    }
                  />

                  <DataSection
                    title="Escalations"
                    value={
                      detail["escalations"] ??
                      detail["escalation_records"]
                    }
                    icon={
                      <ShieldAlert className="h-4 w-4" />
                    }
                  />

                  <DataSection
                    title="Asset"
                    value={detail["asset"]}
                    icon={
                      <Database className="h-4 w-4" />
                    }
                  />
                </section>

                {/* ASSESSMENT */}
                <section className="rounded-2xl border border-white/[0.07] bg-[#080d1d]/90 p-5">
                  <div className="flex items-start gap-3">
                    <div className="rounded-xl border border-sky-400/15 bg-sky-500/10 p-2.5 text-sky-300">
                      <ShieldCheck className="h-5 w-5" />
                    </div>

                    <div className="min-w-0">
                      <h2 className="text-sm font-semibold text-slate-100">
                        Case Assessment
                      </h2>

                      <p className="mt-1 text-xs text-slate-600">
                        Backend-generated analysis context.
                      </p>

                      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        <InfoRow
                          label="Finding"
                          value={stringValue(
                            detail["finding_type"] ??
                              selectedSummary.finding_type,
                          )}
                        />

                        <InfoRow
                          label="Supervisory Dimension"
                          value={stringValue(
                            detail["supervisory_dimension"] ??
                              selectedSummary.supervisory_dimension,
                          )}
                        />

                        <InfoRow
                          label="Fusion Signals"
                          value={String(
                            numberValue(
                              fusion["fused_signal_count"],
                            ),
                          )}
                        />

                        <InfoRow
                          label="Confidence Score"
                          value={`${confidenceScore}/10`}
                        />

                        <InfoRow
                          label="Confidence Priority"
                          value={stringValue(
                            confidence["priority"],
                          )}
                        />

                        <InfoRow
                          label="Signal Count"
                          value={String(
                            detailSignals.length,
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </section>

                {/* RAW JSON */}
                <details className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#080d1d]/90">
                  <summary className="cursor-pointer list-none p-5">
                    <div className="flex items-center gap-3">
                      <Database className="h-4 w-4 text-slate-600" />

                      <div className="flex-1">
                        <p className="text-sm font-semibold text-slate-300">
                          Raw Analysis Response
                        </p>

                        <p className="mt-1 text-xs text-slate-600">
                          Original backend response for this case.
                        </p>
                      </div>

                      <ChevronRight className="h-4 w-4 text-slate-600" />
                    </div>
                  </summary>

                  <div className="border-t border-white/[0.06] p-5">
                    <pre className="max-h-[600px] overflow-auto rounded-xl bg-black/25 p-5 text-[11px] leading-5 text-slate-500">
                      {JSON.stringify(
                        caseDetail,
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                </details>
              </>
            )}
          </main>
        </section>
      </div>
    </div>
  );
}

function CseMetric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-black/10 px-2.5 py-2">
      <div className="text-[9px] uppercase tracking-[0.12em] text-slate-600">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-200">{value.toLocaleString()}</div>
    </div>
  );
}

function SeverityPill({ label, className }: { label: string; className: string }) {
  return (
    <span className={`rounded-full border px-2 py-0.5 text-[9px] font-semibold ${className}`}>
      {label}
    </span>
  );
}

function MiniStat({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-white/[0.05] bg-white/[0.02] p-2.5 text-center">
      <div className="text-[9px] uppercase tracking-wide text-slate-600">
        {label}
      </div>

      <div className="mt-1 text-xs font-semibold text-slate-400">
        {value.toLocaleString()}
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/[0.05] bg-white/[0.02] p-3">
      <div className="text-[9px] font-semibold uppercase tracking-[0.12em] text-slate-600">
        {label}
      </div>

      <div className="mt-1 text-xs text-slate-300">
        {value}
      </div>
    </div>
  );
}

function Timeline({
  selectedSummary,
}: {
  selectedSummary: CaseSummary;
}) {
  type TimelineItem = {
  id: string;
  title: string;
  description: string;
  meta: string;
  source: string;
  tone: "violet" | "amber" | "sky" | "rose" | "emerald";
};

  const items: TimelineItem[] = [];

  /*
   * 01 — CASE CREATED
   *
   * We always know the selected case itself.
   * This is not a fabricated event timestamp; it represents
   * the case context from the analysis response.
   */
  items.push({
    id: "case-created",
    title: "Case Identified",
    description: `SAT-SA identified ${selectedSummary.case_id} as an analyzable security case.`,
    meta: [
      selectedSummary.severity,
      selectedSummary.priority,
      selectedSummary.cse_id,
    ]
      .filter(Boolean)
      .join(" · "),
    source: "cases",
    tone:
      selectedSummary.severity?.toUpperCase() === "CRITICAL"
        ? "rose"
        : "violet",
  });

  /*
   * 02 — SIGNALS
   *
   * These are real signals returned by /analyze/{case_id}.
   */
  for (const [index, signal] of selectedSummary.signals.entries()) {
    const signalCode = stringValue(
      signal["signal_code"],
      "Security Signal",
    );

    const description = stringValue(
      signal["description"],
      "SAT-SA detected an analytical signal for this case.",
    );

    const sourceList = Array.isArray(
      signal["evidence_sources"],
    )
      ? (signal["evidence_sources"] as unknown[])
          .map((source) => String(source))
          .filter(Boolean)
      : [];

    const signalCategory = stringValue(
      signal["signal_category"],
      "Analysis Signal",
    );

    items.push({
      id: `signal-${index}`,
      title: formatLabel(signalCode),
      description,
      meta: signalCategory,
      source:
        sourceList.length > 0
          ? sourceList.join(" → ")
          : "SAT-SA analysis",
      tone:
        signalCode === "FUSED_FINDING"
          ? "violet"
          : signalCategory === "Negative Space"
            ? "amber"
            : "sky",
    });
  }

  /*
   * 03 — FUSED FINDINGS
   *
   * Fusion is already generated by the backend.
   */
  const fusion = selectedSummary.fusion;

  const findings = isRecord(fusion)
    ? Array.isArray(fusion["findings"])
      ? fusion["findings"].filter(isRecord)
      : []
    : [];

  for (const [index, finding] of findings.entries()) {
    const findingType = stringValue(
      finding["finding_type"] ??
        finding["signal_code"],
      "Composite Finding",
    );

    const description = stringValue(
      finding["description"],
      "Multiple signals were correlated into a composite finding.",
    );

    const supportingSignals = Array.isArray(
      finding["supporting_signals"],
    )
      ? (finding["supporting_signals"] as unknown[])
          .map(String)
          .join(" + ")
      : undefined;

    items.push({
      id: `finding-${index}`,
      title: formatLabel(findingType),
      description,
      meta: supportingSignals
        ? `Supported by ${supportingSignals}`
        : "Composite finding",
      source: "signal correlation",
      tone: "violet",
    });
  }

  /*
   * 04 — CONFIDENCE / ASSESSMENT
   */
  const confidence = selectedSummary.confidence;

  if (isRecord(confidence)) {
    const score = numberValue(
      confidence["confidence_score"],
    );

    const priority = stringValue(
      confidence["priority"],
    );

    items.push({
      id: "assessment",
      title: "SAT-SA Assessment",
      description:
        "The available signals were combined into the final case assessment.",
      meta: `Confidence ${score}/10 · Priority ${priority}`,
      source: "confidence engine",
      tone:
        score >= 7
          ? "rose"
          : score >= 4
            ? "amber"
            : "emerald",
    });
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-white/[0.05] bg-white/[0.015] p-6">
        <p className="text-sm text-slate-400">
          No timeline information is available for this case.
        </p>
      </div>
    );
  }

  function dotClass(
    tone: TimelineItem["tone"],
  ) {
    switch (tone) {
      case "rose":
        return "bg-rose-400 shadow-[0_0_18px_rgba(251,113,133,0.45)]";

      case "amber":
        return "bg-amber-400 shadow-[0_0_18px_rgba(251,191,36,0.4)]";

      case "sky":
        return "bg-sky-400 shadow-[0_0_18px_rgba(56,189,248,0.4)]";

      case "emerald":
        return "bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.4)]";

      default:
        return "bg-violet-400 shadow-[0_0_18px_rgba(167,139,250,0.4)]";
    }
  }

  return (
    <div className="relative">
      {/* vertical timeline rail */}
      <div className="absolute bottom-6 left-[11px] top-6 w-px bg-gradient-to-b from-violet-400/30 via-white/[0.08] to-transparent" />

      <div className="space-y-2">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="group relative flex gap-5 rounded-2xl p-3 transition hover:bg-white/[0.018]"
          >
            {/* timeline node */}
            <div className="relative z-10 flex w-6 shrink-0 justify-center pt-4">
              <div
                className={`h-[10px] w-[10px] rounded-full ring-4 ring-[#080d1d] ${dotClass(
                  item.tone,
                )}`}
              />
            </div>

            {/* content */}
            <div className="min-w-0 flex-1 rounded-xl border border-white/[0.05] bg-white/[0.018] p-4 transition group-hover:border-white/[0.09] group-hover:bg-white/[0.025]">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold text-slate-200">
                      {item.title}
                    </h3>

                    {index === 0 && (
                      <span className="rounded-full border border-violet-400/15 bg-violet-500/10 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-violet-300">
                        Case
                      </span>
                    )}
                  </div>

                  <p className="mt-1.5 max-w-3xl text-xs leading-5 text-slate-500">
                    {item.description}
                  </p>
                </div>

                <span className="shrink-0 rounded-lg border border-white/[0.05] bg-black/10 px-2.5 py-1 text-[9px] text-slate-600">
                  {item.source ?? "SAT-SA"}
                </span>
              </div>

              {item.meta && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {item.meta
                    .split(" · ")
                    .map((meta, metaIndex) => (
                      <span
                        key={`${item.id}-meta-${metaIndex}`}
                        className="rounded-lg border border-white/[0.05] bg-black/10 px-2.5 py-1 text-[10px] text-slate-500"
                      >
                        {formatLabel(meta)}
                      </span>
                    ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

