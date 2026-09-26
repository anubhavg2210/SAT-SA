import { Link } from "@tanstack/react-router";
import { ArrowRight, ShieldHalf } from "lucide-react";

const links = [
  { label: "Platform", href: "#platform" },
  { label: "How It Works", href: "#process" },
  { label: "About", href: "#about" },
];

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border/30 bg-background/40 backdrop-blur-md">

      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet/40 bg-card/60 text-violet">
            <ShieldHalf className="h-4 w-4" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-[0.8rem] font-semibold tracking-[0.18em]">
              SOC STRATEGY
            </span>
            <span className="block text-[0.6rem] tracking-[0.16em] text-muted-foreground">
              Security Operations Center
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-9 text-sm text-muted-foreground md:flex">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>

        <Link
          to="/login"
          className="btn-cta inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold"
        >
          Login <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </header>
  );
}
