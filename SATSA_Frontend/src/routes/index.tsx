import { createFileRoute } from "@tanstack/react-router";
import { Navbar } from "@/components/soc/Navbar";
import { Hero } from "@/components/soc/Hero";

import { PlatformSection } from "@/components/soc/PlatformSection";

import { InvestigationSection } from "@/components/soc/InvestigationSection";
import { CTASection } from "@/components/soc/CTASection";
import { Footer } from "@/components/soc/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SOC Strategy — See Every Threat. Understand Every Signal." },
      {
        name: "description",
        content:
          "SATSA turns security data into actionable intelligence: detection, anomaly analysis, correlation and case investigation in one security operations platform.",
      },
      { property: "og:title", content: "SOC Strategy — Security Analytics & Threat Situational Awareness" },
      {
        property: "og:description",
        content:
          "Cinematic security operations platform. SATSA turns security data into actionable intelligence.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="relative min-h-screen overflow-x-hidden bg-background">
      <Navbar />
      <main>
        <div className="relative isolate">
          <Hero />
          
        </div>
        <PlatformSection />
        
        <InvestigationSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
