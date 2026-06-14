import { getDashboardProjectsServer, getTagsServer } from "@/lib/server-api";
import { DashboardContent } from "@/components/project/dashboard-content";

export default async function ProjectsPage() {
  const { projects, total } = await getDashboardProjectsServer();
  const tags = await getTagsServer();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Project Explorer</h1>
        <p className="text-muted-foreground text-sm">
          Explore open-source projects, track bugs, features, and contribute solutions.
        </p>
      </div>
      <DashboardContent projects={projects} total={total || 0} tags={tags} />
    </div>
  );
}
