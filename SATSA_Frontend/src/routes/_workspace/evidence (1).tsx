import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, ResourceList } from "@/components/app/ResourceView";

export const Route = createFileRoute("/_workspace/evidence")({
  head: () => ({ meta: [{ title: "Evidence — SOC Strategy" }, { name: "description", content: "Collected evidence artifacts." }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Evidence" subtitle="Collected evidence artifacts." />
      <ResourceList path="/evidence" />
    </>
  );
}
