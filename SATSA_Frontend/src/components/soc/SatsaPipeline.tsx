import { SatsaOrbit, stages } from "./SatsaOrbit";

export function SatsaPipeline() {
  return (
    <section id="process" className="relative overflow-hidden px-5 pt-28 pb-16 md:pt-32 md:pb-20">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(55%_50%_at_50%_45%,oklch(0.35_0.15_280/0.3),transparent_70%)]"
      />
      <div className="mx-auto max-w-6xl text-center">
        <p className="eyebrow">The SATSA Process</p>
        <h2 className="mt-4 text-3xl font-semibold leading-tight md:text-5xl">
          End-to-End Security
          <br />
          Data Analysis Pipeline
        </h2>

        <div className="mt-10 hidden lg:block">
          <SatsaOrbit size={620} showLabels showDesc />
        </div>


        <ol className="mt-12 grid gap-3 text-left sm:grid-cols-2 lg:hidden">
          {stages.map((s) => (
            <li key={s.title} className="glass-panel flex gap-3 rounded-xl p-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-violet/35 bg-card/70 text-violet">
                <s.Icon className="h-4 w-4" />
              </span>
              <span>
                <span className="block text-[0.6rem] tracking-[0.2em] text-muted-foreground">
                  {s.n}
                </span>
                <span className="block text-sm font-semibold">{s.title}</span>
                <span className="mt-1 block text-[0.72rem] text-muted-foreground">{s.desc}</span>
              </span>
            </li>
          ))}
        </ol>

        <p className="mx-auto mt-8 max-w-2xl text-xs leading-relaxed text-muted-foreground">
          Built on Python and Pandas for data processing, scikit-learn Isolation Forest for anomaly
          detection, CSV security datasets for input and PostgreSQL for storage — organized into
          modular analysis engines.
        </p>
      </div>
    </section>
  );
}
