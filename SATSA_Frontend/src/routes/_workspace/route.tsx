import { createFileRoute, Link, Outlet, redirect, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard, FolderSearch, Database, Bell, Search, FileArchive, Server, FileText, LogOut, ShieldHalf,
} from "lucide-react";
import { getToken, setToken, API_BASE } from "@/lib/satsa-api";

export const Route = createFileRoute("/_workspace")({
  ssr: false,
  beforeLoad: () => {
    if (!getToken()) throw redirect({ to: "/login" });
  },
  component: WorkspaceLayout,
});

const nav = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/dataset-analysis", label: "Dataset Analysis", icon: Database },
  { to: "/case-analysis", label: "Case Analysis", icon: FolderSearch },
  { to: "/reports", label: "Reports", icon: FileText },
] as const;

function WorkspaceLayout() {
  const navigate = useNavigate();
  return (
    <div className="flex min-h-screen">
      <aside className="sticky top-0 flex h-screen w-60 shrink-0 flex-col border-r border-border bg-card/40 backdrop-blur-md">
        <div className="flex items-center gap-2 px-5 py-5">
          <ShieldHalf className="h-5 w-5 text-violet" />
          <span className="font-semibold tracking-wide">SOC STRATEGY</span>
        </div>
        <nav className="flex-1 space-y-0.5 px-3">
          {nav.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent/40 hover:text-foreground"
              activeProps={{ className: "bg-accent/60 !text-foreground glow-ring" }}
            >
              <Icon className="h-4 w-4" /> {label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <p className="truncate px-3 pb-2 font-mono text-[10px] text-muted-foreground">{API_BASE}</p>
          <button
            onClick={() => { setToken(null); navigate({ to: "/login", replace: true }); }}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent/40 hover:text-foreground"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-6 md:p-8"><Outlet /></main>
    </div>
  );
}
