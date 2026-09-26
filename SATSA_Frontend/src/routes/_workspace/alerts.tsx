import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, ResourceList } from "@/components/app/ResourceView";

export const Route = createFileRoute("/_workspace/alerts")({
  head: () => ({ meta: [{ title: "Alerts — SOC Strategy" }, { name: "description", content: "Triage alerts raised by SATSA detections." }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Alerts" subtitle="Triage alerts raised by SATSA detections." />
      <ResourceList path="/alerts" />
    </>
  );
}
