import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, ResourceList } from "@/components/app/ResourceView";

export const Route = createFileRoute("/_workspace/investigations")({
  head: () => ({ meta: [{ title: "Investigations — SOC Strategy" }, { name: "description", content: "Active and closed investigations." }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Investigations" subtitle="Active and closed investigations." />
      <ResourceList path="/investigations" />
    </>
  );
}
