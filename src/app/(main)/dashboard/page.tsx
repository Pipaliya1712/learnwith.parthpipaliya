import { getDashboardProjectsServer, getTagsServer } from "@/lib/server-api";
import { DashboardContent } from "@/components/project/dashboard-content";

export default async function DashboardPage() {
  const { projects, total } = await getDashboardProjectsServer();
  const tags = await getTagsServer();

  return <DashboardContent projects={projects} total={total || 0} tags={tags} />;
}
