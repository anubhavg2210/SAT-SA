import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, ResourceList } from "@/components/app/ResourceView";

export const Route = createFileRoute("/_workspace/assets")({
  head: () => ({ meta: [{ title: "Assets — SOC Strategy" }, { name: "description", content: "Monitored hosts, users and systems." }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Assets" subtitle="Monitored hosts, users and systems." />
      <ResourceList path="/assets" />
    </>
  );
}
