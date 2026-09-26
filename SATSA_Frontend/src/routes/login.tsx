import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowLeft, ShieldHalf, Loader2 } from "lucide-react";
import { login, API_BASE } from "@/lib/satsa-api";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Login — SOC Strategy" },
      { name: "description", content: "Sign in to the SOC Strategy security operations workspace." },
      { property: "og:title", content: "Login — SOC Strategy" },
      { property: "og:description", content: "Sign in to the SOC Strategy security operations workspace." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [u, setU] = useState("");
  const [p, setP] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setBusy(true);
    try {
      await login(u, p);
      navigate({ to: "/dashboard" });
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const input =
    "w-full rounded-lg border border-border bg-background/60 px-3 py-2.5 text-sm outline-none focus:border-violet/60";

  return (
    <div className="flex min-h-screen items-center justify-center px-5">
      <form onSubmit={submit} className="glass-panel w-full max-w-sm rounded-2xl p-8">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl border border-violet/40 bg-card/60 text-violet">
          <ShieldHalf className="h-5 w-5" />
        </span>
        <h1 className="mt-5 text-center text-xl font-semibold">Enter SOC Strategy</h1>
        <p className="mt-1 text-center text-xs text-muted-foreground">Sign in with your SATSA account</p>
        <div className="mt-6 space-y-3">
          <input className={input} placeholder="Username or email" value={u} onChange={(e) => setU(e.target.value)} required autoComplete="username" />
          <input className={input} type="password" placeholder="Password" value={p} onChange={(e) => setP(e.target.value)} required autoComplete="current-password" />
        </div>
        {err && <p className="mt-3 text-xs text-destructive">{err}</p>}
        <button disabled={busy} className="btn-cta mt-5 flex w-full items-center justify-center gap-2 rounded-full py-2.5 text-sm font-semibold">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />} Login
        </button>
        <p className="mt-4 text-center font-mono text-[10px] text-muted-foreground">Backend: {API_BASE}</p>
        <Link to="/" className="mt-4 flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to home
        </Link>
      </form>
    </div>
  );
}
