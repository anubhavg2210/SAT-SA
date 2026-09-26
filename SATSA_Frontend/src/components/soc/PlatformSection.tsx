import { ArrowRight, Crosshair, Lightbulb, Radar, Search, type LucideIcon } from "lucide-react";

type Feature = {
  title: string;
  desc: string;
  Icon: LucideIcon;
  viz: "line" | "bars" | "rows" | "wave";
};

const features: Feature[] = [
  {
    title: "Threat Detection",
    desc: "Identify and detect suspicious activities across your environment.",
    Icon: Crosshair,
    viz: "line",
  },
  {
    title: "Anomaly Analysis",
    desc: "Use statistical analysis and machine learning to identify unusual behavior.",
    Icon: Radar,
    viz: "bars",
  },
  {
    title: "Case Investigation",
    desc: "Analyze alerts with context, timeline and evidence.",
    Icon: Search,
    viz: "rows",
  },
  {
    title: "Security Insights",
    desc: "Turn complex security data into clear, actionable intelligence.",
    Icon: Lightbulb,
    viz: "wave",
  },
];

function Viz({ kind }: { kind: Feature["viz"] }) {
  if (kind === "bars") {
    const heights = [30, 55, 38, 70, 48, 86, 60, 95, 44];
    return (
      <div className="flex h-20 items-end gap-1.5">
        {heights.map((h, i) => (
          <span
            key={i}
            className="flex-1 rounded-sm bg-gradient-to-t from-primary/25 to-violet/80"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
    );
  }
  if (kind === "rows") {
    return (
      <div className="grid h-20 grid-cols-2 gap-1.5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-md border border-border/60 bg-background/40 p-1.5">
            <span className="block h-1 w-2/3 rounded-full bg-violet/60" />
            <span className="mt-1.5 block h-1 w-full rounded-full bg-muted-foreground/25" />
            <span className="mt-1 block h-1 w-4/5 rounded-full bg-muted-foreground/20" />
          </div>
        ))}
      </div>
    );
  }
  const d =
    kind === "line"
      ? "M0 62 C 30 58, 55 44, 80 48 S 130 30, 160 20 S 190 12, 200 6"
      : "M0 40 C 25 10, 50 66, 75 34 S 125 8, 150 42 S 185 18, 200 30";
  return (
    <svg viewBox="0 0 200 72" className="h-20 w-full">
      <defs>
        <linearGradient id={`g-${kind}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="oklch(0.65 0.2 288)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="oklch(0.65 0.2 288)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${d} L200 72 L0 72 Z`} fill={`url(#g-${kind})`} />
      <path d={d} fill="none" stroke="oklch(0.72 0.16 280)" strokeWidth="2" />
    </svg>
  );
}

export function FeatureCard({ feature }: { feature: Feature }) {
  return (
    <article className="glass-panel group flex flex-col rounded-2xl p-5 transition-transform duration-500 hover:-translate-y-1.5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-violet/35 bg-card/70 text-violet">
        <feature.Icon className="h-4.5 w-4.5" />
      </span>
      <h3 className="mt-5 text-base font-semibold">{feature.title}</h3>
      <p className="mt-2 text-[0.78rem] leading-relaxed text-muted-foreground">{feature.desc}</p>
      <div className="mt-6 flex items-end gap-3">
        <ArrowRight className="mb-1 h-4 w-4 shrink-0 text-muted-foreground transition-colors group-hover:text-violet" />
        <div className="w-full opacity-80">
          <Viz kind={feature.viz} />
        </div>
      </div>
    </article>
  );
}

export function PlatformSection() {
  return (
    <section id="platform" className="relative px-5 py-28 md:py-36">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-96 bg-[radial-gradient(50%_60%_at_50%_0%,oklch(0.4_0.16_285/0.25),transparent)]"
      />
      <div className="mx-auto max-w-6xl text-center">
        <p className="eyebrow">Our Platform</p>
        <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold leading-tight md:text-5xl">
          All Your Security Operations
          <br />
          In <span className="text-signal">One Place.</span>
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-sm text-muted-foreground">
          From data ingestion to investigation and response — everything needed for modern threat
          detection and analysis.
        </p>

        <div className="mt-14 grid gap-4 text-left sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f) => (
            <FeatureCard key={f.title} feature={f} />
          ))}
        </div>
      </div>
    </section>
  );
}
