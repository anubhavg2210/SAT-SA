import {
  Database,
  Settings,
  BarChart3,
  Brain,
  Search,
  Link2,
  FileText,
  type LucideIcon,
} from "lucide-react";

export type Stage = {
  n: string;
  title: string;
  desc?: string;
  Icon: LucideIcon;
};

export const stages: Stage[] = [
  { n: "01", title: "Data Ingestion", desc: "Ingest security logs, network events and datasets.", Icon: Database },
  { n: "02", title: "Preprocessing", desc: "Clean, transform and enrich data.", Icon: Settings },
  { n: "03", title: "Statistical Analysis", desc: "Pattern analysis and behavioral statistics.", Icon: BarChart3 },
  { n: "04", title: "ML Analysis", desc: "Isolation Forest anomaly detection.", Icon: Brain },
  { n: "05", title: "Anomaly Detection", desc: "Detect suspicious activities and outliers.", Icon: Search },
  { n: "06", title: "Correlation", desc: "Correlate events, alerts and indicators.", Icon: Link2 },
  { n: "07", title: "Visualization & Reporting", desc: "Generate insights and security reports.", Icon: FileText },
];

export function SatsaOrbit({
  size = 420,
  showLabels = true,
  showDesc = false,
}: {
  size?: number;
  showLabels?: boolean;
  showDesc?: boolean;
}) {
  const radius = size * 0.38;

  return (
    <div
      className="relative mx-auto aspect-square w-full"
      style={{ maxWidth: size }}
    >
      {/* radial rings */}
      <div aria-hidden className="absolute inset-0 rounded-full border border-violet/15" />
      <div aria-hidden className="absolute inset-[12%] rounded-full border border-dashed border-primary/20" />
      <div
        aria-hidden
        className="absolute inset-[24%] rounded-full border border-primary/15 animate-orbit"
        style={{ borderStyle: "dashed" }}
      />
      <div
        aria-hidden
        className="absolute inset-[18%] rounded-full blur-2xl"
        style={{ background: "radial-gradient(circle, oklch(0.55 0.2 278 / 0.35), transparent 70%)" }}
      />

      {/* center */}
      <div className="absolute left-1/2 top-1/2 flex aspect-square w-[38%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border border-primary/45 bg-background/70 text-center glow-ring">
        <span className="font-display text-[clamp(0.9rem,2.4vw,1.6rem)] font-semibold tracking-tight">
          SATSA
        </span>
        <span className="mt-1 hidden px-2 text-[0.5rem] leading-[1.35] text-muted-foreground sm:block md:text-[0.58rem]">
          Security Analytics &amp;
          <br />
          Threat Situational
          <br />
          Awareness
        </span>
      </div>

      {/* nodes */}
      {stages.map((s, i) => {
        const angle = (i / stages.length) * Math.PI * 2 - Math.PI / 2;
        const x = 50 + (Math.cos(angle) * radius * 100) / size;
        const y = 50 + (Math.sin(angle) * radius * 100) / size;
        const left = x < 50;
        return (
          <div
            key={s.title}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            <div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-primary/45 bg-card/80 text-primary-foreground shadow-[0_0_24px_-6px_oklch(0.6_0.2_280/0.9)] animate-soft-pulse md:h-12 md:w-12">
              <s.Icon className="h-4 w-4 text-violet md:h-5 md:w-5" />
            </div>
            {showLabels && (
              <div
                className={`absolute top-1/2 hidden w-40 -translate-y-1/2 md:block ${
                  left ? "right-[130%] text-right" : "left-[130%] text-left"
                }`}
              >
                <p className="text-[0.72rem] font-semibold leading-tight">{s.title}</p>
                {showDesc && s.desc && (
                  <p className="mt-1 text-[0.62rem] leading-snug text-muted-foreground">{s.desc}</p>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
