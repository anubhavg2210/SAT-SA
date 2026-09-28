import { ChevronDown, Code2 } from "lucide-react";

export function RawAnalysis({
  analysis,
}: {
  analysis: Record<string, unknown>;
}) {
  return (
    <details className="glass-panel group rounded-2xl overflow-hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between p-5">
        <div className="flex items-center gap-3">
          <Code2 className="h-4 w-4 text-slate-500" />

          <div>
            <p className="text-sm font-medium text-slate-300">
              Raw Analysis Response
            </p>

            <p className="mt-0.5 text-xs text-slate-600">
              Technical JSON returned by the SAT-SA backend
            </p>
          </div>
        </div>

        <ChevronDown className="h-4 w-4 text-slate-500 transition group-open:rotate-180" />
      </summary>

      <div className="border-t border-white/[0.06] p-5">
        <pre className="max-h-[600px] overflow-auto rounded-xl bg-black/30 p-5 font-mono text-xs leading-6 text-slate-400">
          {JSON.stringify(analysis, null, 2)}
        </pre>
      </div>
    </details>
  );
}