import { Github, Linkedin, ShieldHalf, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border/50 px-5 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 md:flex-row">
        <div className="flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet/40 bg-card/60 text-violet">
            <ShieldHalf className="h-4 w-4" />
          </span>
          <span className="leading-tight">
            <span className="block font-display text-[0.78rem] font-semibold tracking-[0.18em]">
              SOC STRATEGY
            </span>
            <span className="block text-[0.6rem] tracking-[0.14em] text-muted-foreground">
              Security Operations Center
            </span>
          </span>
        </div>

        <nav className="flex gap-7 text-xs text-muted-foreground md:mx-auto">
          <a href="#platform" className="hover:text-foreground">Platform</a>
          <a href="#process" className="hover:text-foreground">How It Works</a>
          <a href="#about" className="hover:text-foreground">About</a>
        </nav>

        <div className="flex items-center gap-4 text-muted-foreground">
          <a href="https://github.com" aria-label="GitHub" className="hover:text-foreground">
            <Github className="h-4 w-4" />
          </a>
          <a href="https://linkedin.com" aria-label="LinkedIn" className="hover:text-foreground">
            <Linkedin className="h-4 w-4" />
          </a>
          <a href="https://youtube.com" aria-label="YouTube" className="hover:text-foreground">
            <Youtube className="h-4 w-4" />
          </a>
        </div>
      </div>
      <p className="mx-auto mt-6 max-w-6xl text-right text-[0.65rem] text-muted-foreground">
        © 2026 SOC Strategy. All rights reserved.
      </p>
    </footer>
  );
}
