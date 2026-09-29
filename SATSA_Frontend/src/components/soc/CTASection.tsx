import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
const ctaHorizon = "/assets/cta-horizon.jpeg";

export function CTASection() {
  return (
    <section className="relative isolate overflow-hidden px-5 py-36 text-center md:py-48">
      <img
        src={ctaHorizon}
        alt=""
        aria-hidden
        loading="lazy"
        width={1920}
        height={1008}
        className="absolute inset-0 -z-10 h-full w-full object-cover opacity-85"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-10 bg-[linear-gradient(to_bottom,var(--background),transparent_35%,transparent_60%,var(--background))]"
      />

      <p className="eyebrow">Be a Step Ahead</p>
      <h2 className="mx-auto mt-4 max-w-2xl text-3xl font-semibold leading-tight md:text-5xl">
        Ready to see your security
        <br />
        environment differently?
      </h2>
      <p className="mx-auto mt-4 max-w-md text-sm text-muted-foreground">
        Join SOC Strategy and experience the power of SATSA.
      </p>
      <Link
        to="/login"
        className="btn-cta mt-8 inline-flex items-center gap-2 rounded-full px-7 py-3 text-sm font-semibold"
      >
        Enter SOC Strategy <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
}
