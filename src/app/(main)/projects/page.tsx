import { getDashboardProjectsServer, getTagsServer } from "@/lib/server-api";
import { DashboardContent } from "@/components/project/dashboard-content";

export default async function ProjectsPage() {
  const { projects, total } = await getDashboardProjectsServer();
  const tags = await getTagsServer();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight text-on-surface">Projects Explorer</h1>
        <p className="text-on-surface-variant">
          Discover open projects, explore outstanding tasks, and kickstart your contribution journey.
        </p>
      </div>
      <DashboardContent projects={projects} total={total || 0} tags={tags} />
    </div>
  );
}
