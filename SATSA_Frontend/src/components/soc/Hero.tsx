import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
const heroSpace = "/assets/hero-space.jpeg";

export function Hero() {
  return (
    <div className="relative isolate overflow-hidden px-5 pt-36 pb-40 text-center md:pt-44 md:pb-52">
      <img
        src={heroSpace}
        width={1920}
        height={1200}
        alt=""
        aria-hidden
        className="pointer-events-none absolute inset-0 top-0 -z-10 h-[150%] w-full object-cover opacity-95"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 h-[150%] bg-[radial-gradient(70%_45%_at_50%_18%,oklch(0.1_0.03_270/0.55),transparent_70%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[120%] -z-10 h-[40%] bg-gradient-to-b from-transparent to-background"
      />


      <p className="eyebrow rise">Security Operations Center</p>
      <h1
        className="rise mx-auto mt-5 max-w-4xl text-4xl font-semibold leading-[1.08] sm:text-5xl md:text-6xl"
        style={{ animationDelay: "0.1s" }}
      >
        See Every Threat.
        <br />
        Understand <span className="text-signal">Every Signal.</span>
      </h1>
      <p
        className="rise mx-auto mt-5 max-w-xl text-sm text-muted-foreground md:text-base"
        style={{ animationDelay: "0.2s" }}
      >
        SATSA turns security data into actionable intelligence.
      </p>
      <div
        className="rise mt-8 flex flex-wrap items-center justify-center gap-3"
        style={{ animationDelay: "0.3s" }}
      >
        <a
          href="#platform"
          className="btn-cta inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
        >
          Explore SATSA <ArrowRight className="h-4 w-4" />
        </a>
        <Link
          to="/login"
          className="btn-ghost-glow inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold"
        >
          Login
        </Link>
      </div>
    </div>
  );
}
