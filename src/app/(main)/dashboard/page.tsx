import { getDashboardProjectsServer, getTagsServer } from "@/lib/server-api";
import { DashboardContent } from "@/components/project/dashboard-content";
import { ProgressWidget } from "@/components/profile/progress-widget";

export default async function DashboardPage() {
  const { projects, total } = await getDashboardProjectsServer();
  const tags = await getTagsServer();

  return (
    <div className="space-y-6">
      <ProgressWidget />
      <DashboardContent projects={projects} total={total || 0} tags={tags} />
    </div>
  );
}
