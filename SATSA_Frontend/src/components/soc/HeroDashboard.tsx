import {
  Activity,
  AlertTriangle,
  Cloud,
  FileBarChart,
  FolderSearch,
  Monitor,
  Network,
  Radar,
  Search,
  ShieldAlert,
  Waves,
  X,
} from "lucide-react";
import { SatsaOrbit } from "./SatsaOrbit";

const sidebar = [
  { label: "Live Data Feed", Icon: Activity },
  { label: "Network Logs", Icon: Network },
  { label: "Endpoint Events", Icon: Monitor },
  { label: "Cloud Activity", Icon: Cloud },
  { label: "Threat Intel", Icon: Radar },
  { label: "Case Analysis", Icon: FolderSearch },
  { label: "Reports", Icon: FileBarChart },
];

const threats = [
  { label: "Suspicious Login", risk: "High Risk", color: "bg-risk-high" },
  { label: "Data Exfiltration", risk: "Medium Risk", color: "bg-risk-med" },
  { label: "Malware Activity", risk: "High Risk", color: "bg-risk-med" },
  { label: "Policy Violation", risk: "Low Risk", color: "bg-risk-low" },
];

const kpis = [
  { value: "24.8K", label: "Events Today", delta: "+12%", Icon: Waves },
  { value: "386", label: "Active Cases", delta: "+3%", Icon: FolderSearch },
  { value: "12", label: "Critical Alerts", delta: "-25%", Icon: AlertTriangle },
  { value: "99.7%", label: "Analysis Uptime", delta: "+0.2%", Icon: ShieldAlert },
];

export function HeroDashboard() {
  return (
    <div className="relative z-10 mx-auto -mt-2 w-full max-w-6xl px-4 md:px-6">
      <div className="glass-panel rise overflow-hidden rounded-2xl p-3 md:p-4" style={{ animationDelay: "0.45s" }}>
        {/* top bar */}
        <div className="flex items-center gap-3 border-b border-border/60 px-2 pb-3">
          <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.18em]">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            SATSA
            <span className="h-1.5 w-1.5 rounded-full bg-violet animate-soft-pulse" />
          </div>
          <div className="mx-auto hidden w-full max-w-md items-center gap-2 rounded-full border border-border/70 bg-background/50 px-3 py-1.5 text-[0.7rem] text-muted-foreground md:flex">
            <Search className="h-3 w-3" />
            Search events, cases, or indicators...
          </div>
          <span className="ml-auto flex items-center gap-1.5 text-[0.65rem] text-muted-foreground md:ml-0">
            Live Analysis <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-soft-pulse" />
          </span>
        </div>

        <div className="grid gap-3 pt-3 lg:grid-cols-[180px_1fr_230px]">
          {/* sidebar */}
          <div className="hidden flex-col gap-1 rounded-xl border border-border/50 bg-background/30 p-2 lg:flex">
            {sidebar.map((s, i) => (
              <div
                key={s.label}
                className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[0.72rem] ${
                  i === 0
                    ? "border border-primary/40 bg-primary/15 text-foreground"
                    : "text-muted-foreground"
                }`}
              >
                <s.Icon className="h-3.5 w-3.5" />
                {s.label}
              </div>
            ))}
          </div>

          {/* center diagram */}
          <div className="rounded-xl border border-border/50 bg-background/30 p-4">
            <SatsaOrbit size={400} showLabels />
          </div>

          {/* right rail */}
          <div className="flex flex-col gap-3">
            <div className="rounded-xl border border-border/50 bg-background/30 p-3">
              <div className="flex items-center justify-between text-[0.7rem]">
                <span className="text-muted-foreground">Analysis Progress</span>
                <span className="font-semibold">78%</span>
              </div>
              <svg viewBox="0 0 200 48" className="mt-2 h-12 w-full">
                <path
                  d="M0 38 C 30 34, 45 12, 70 18 S 115 40, 140 26 S 180 6, 200 12"
                  fill="none"
                  stroke="oklch(0.65 0.2 285)"
                  strokeWidth="2"
                />
              </svg>
              <p className="text-[0.62rem] text-muted-foreground">12,842 events processed</p>
            </div>

            <div className="rounded-xl border border-border/50 bg-background/30 p-3">
              <div className="flex items-center justify-between text-[0.7rem]">
                <span>Potential Threats</span>
                <X className="h-3 w-3 text-muted-foreground" />
              </div>
              <ul className="mt-2 space-y-2">
                {threats.map((t) => (
                  <li key={t.label} className="flex items-start gap-2">
                    <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${t.color}`} />
                    <span>
                      <span className="block text-[0.68rem] leading-tight">{t.label}</span>
                      <span className="block text-[0.6rem] text-muted-foreground">{t.risk}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* KPI tiles */}
        <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {kpis.map((k) => (
            <div
              key={k.label}
              className="flex items-center gap-3 rounded-xl border border-border/50 bg-background/30 px-3 py-3"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet/30 bg-card/60 text-violet">
                <k.Icon className="h-4 w-4" />
              </span>
              <span>
                <span className="block font-display text-base font-semibold">{k.value}</span>
                <span className="block text-[0.62rem] text-muted-foreground">{k.label}</span>
              </span>
              <span className="ml-auto text-[0.6rem] text-muted-foreground">{k.delta}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
