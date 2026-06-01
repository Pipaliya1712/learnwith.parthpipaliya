import { getAdminProjectsServer } from "@/lib/server-api";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AdminProjectList } from "@/components/admin/admin-project-list";

export default async function AdminProjectsPage() {
  const { projects: projectsWithTags } = await getAdminProjectsServer();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage all projects and landing page visibility
          </p>
        </div>
        <Link href="/admin/projects/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Project
          </Button>
        </Link>
      </div>

      <AdminProjectList projects={projectsWithTags} />
    </div>
  );
}
