import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, ResourceList } from "@/components/app/ResourceView";

export const Route = createFileRoute("/_workspace/reports")({
  head: () => ({ meta: [{ title: "Reports — SOC Strategy" }, { name: "description", content: "Generated SATSA reports." }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Reports" subtitle="Generated SATSA reports." />
      <ResourceList path="/reports" />
    </>
  );
}
