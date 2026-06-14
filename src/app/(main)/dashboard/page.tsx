import { getDashboardProjectsServer, getTagsServer, getPlatformMetricsServer } from "@/lib/server-api";
import { DashboardContent } from "@/components/project/dashboard-content";
import { ProgressWidget } from "@/components/profile/progress-widget";
import { MetricsWidget } from "@/components/dashboard/metrics-widget";

export default async function DashboardPage() {
  const { projects, total } = await getDashboardProjectsServer();
  const tags = await getTagsServer();
  const metrics = await getPlatformMetricsServer();

  return (
    <div className="space-y-6">
      <ProgressWidget />
      <MetricsWidget metrics={metrics} />
      <DashboardContent projects={projects} total={total || 0} tags={tags} />
    </div>
  );
}
