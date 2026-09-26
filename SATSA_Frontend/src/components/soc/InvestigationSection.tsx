import { ArrowRight, ChevronLeft, X } from "lucide-react";

const timeline = [
  { time: "14:23", title: "Initial Alert Detected", desc: "Suspicious PowerShell execution" },
  { time: "14:28", title: "Correlated with Similar Events", desc: "Matched with 3 related alerts" },
  { time: "14:36", title: "Evidence Collected", desc: "Process tree, registry changes" },
  { time: "14:42", title: "Analysis in Progress", desc: "Running ML and statistical analysis" },
  { time: "14:50", title: "Pending Analyst Review", desc: "Escalated due to high risk indicators" },
];

const fields = [
  ["Process", "powershell.exe"],
  ["Command", "iwr -enc"],
  ["User", "DESKTOP\\anubh"],
  ["Source IP", "192.168.1.10"],
  ["Severity", "High"],
  ["Status", "Investigating"],
];

export function InvestigationSection() {
  return (
    <section id="about" className="relative px-5 py-20 md:py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <p className="eyebrow">Investigate Faster</p>
          <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">
            From Alert
            <br />
            to <span className="text-signal">Resolution</span>
          </h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Bring together alerts, logs, assets and intelligence in a unified workspace. Analyze,
            correlate and investigate with complete visibility.
          </p>
          <a
            href="#process"
            className="btn-cta mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
          >
            See Investigation Flow <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <div className="glass-panel rounded-2xl p-4">
          <div className="flex items-center gap-2 border-b border-border/60 pb-3 text-[0.72rem] text-muted-foreground">
            <ChevronLeft className="h-3.5 w-3.5" />
            Case Investigation
            <ArrowRight className="ml-auto h-3.5 w-3.5" />
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-xl border border-border/60 bg-background/40 px-3 py-2.5 text-xs">
            <span className="font-medium">CSE-2847 — Suspicious PowerShell Execution</span>
            <span className="rounded-full bg-risk-high/20 px-2 py-0.5 text-[0.6rem] text-risk-high">
              High
            </span>
            <X className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-[1.15fr_0.85fr]">
            <ol className="relative space-y-4 rounded-xl border border-border/50 bg-background/30 p-4 pl-6">
              <span
                aria-hidden
                className="absolute left-[1.35rem] top-6 bottom-6 w-px bg-gradient-to-b from-risk-high/70 via-violet/60 to-primary/40"
              />
              {timeline.map((t) => (
                <li key={t.time} className="relative flex gap-3">
                  <span className="absolute -left-[0.4rem] top-1.5 h-2 w-2 rounded-full bg-violet shadow-[0_0_10px_oklch(0.65_0.2_290)]" />
                  <span className="ml-3 shrink-0 font-mono text-[0.65rem] text-muted-foreground">
                    {t.time}
                  </span>
                  <span>
                    <span className="block text-[0.72rem] font-medium leading-tight">{t.title}</span>
                    <span className="block text-[0.62rem] text-muted-foreground">{t.desc}</span>
                  </span>
                </li>
              ))}
            </ol>

            <div className="rounded-xl border border-border/50 bg-background/30 p-3">
              <div className="flex gap-1 text-[0.62rem]">
                {["Event Details", "Assets", "Evidence"].map((tab, i) => (
                  <span
                    key={tab}
                    className={`rounded-md px-2 py-1 ${
                      i === 0 ? "bg-primary/20 text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {tab}
                  </span>
                ))}
              </div>
              <dl className="mt-3 space-y-2">
                {fields.map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-2 border-b border-border/40 pb-1.5">
                    <dt className="text-[0.62rem] text-muted-foreground">{k}</dt>
                    <dd
                      className={`font-mono text-[0.62rem] ${
                        v === "High" ? "text-risk-high" : "text-foreground"
                      }`}
                    >
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
