"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { DataTable, type ColumnDef } from "@/components/ui/data-table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { projectsApi } from "@/lib/api-client";
import type { Project, Tag } from "@/types";
import { Pencil, Trash2 } from "lucide-react";
import { LWLoader } from "@/components/ui/lw-loader";
import { format } from "date-fns";

type ProjectWithTags = Project & { tags: Tag[] };

export function AdminProjectList({
  projects,
  total,
  currentPage,
  pageSize = 10,
}: {
  projects: ProjectWithTags[];
  total: number;
  currentPage: number;
  pageSize?: number;
}) {
  const [projectList, setProjectList] = useState(projects);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const handleToggleVisibility = async (projectId: string, current: boolean) => {
    try {
      await projectsApi.toggleVisibility(projectId, !current);
      setProjectList((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, is_visible: !current } : p
        )
      );
      toast.success(current ? "Removed from landing page" : "Added to landing page");
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to toggle visibility"));
    }
  };

  const handleDelete = async () => {
    if (!pendingDeleteId) return;
    setDeletingId(pendingDeleteId);
    try {
      await projectsApi.delete(pendingDeleteId);
      setProjectList((prev) => prev.filter((p) => p.id !== pendingDeleteId));
      toast.success("Project deleted");
      setDeleteDialogOpen(false);
      setPendingDeleteId(null);
    } catch (error: unknown) {
      toast.error(getErrorMessage(error, "Failed to delete project"));
    } finally {
      setDeletingId(null);
    }
  };

  const openDeleteDialog = (projectId: string) => {
    setPendingDeleteId(projectId);
    setDeleteDialogOpen(true);
  };

  const columns: ColumnDef<ProjectWithTags>[] = [
    {
      key: "name",
      header: "Name",
      sortable: true,
      searchable: true,
      searchPlaceholder: "Search projects...",
      cell: (project) => (
        <div>
          <span className="font-medium">{project.name}</span>
          {project.is_deleted && (
            <Badge variant="destructive" className="ml-2 text-xs">
              Deleted
            </Badge>
          )}
          <span className="block text-xs text-muted-foreground">
            /{project.slug}
          </span>
        </div>
      ),
    },
    {
      key: "tags",
      header: "Tags",
      sortable: false,
      cell: (project) => (
        <div className="flex flex-wrap gap-1">
          {project.tags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="text-xs">
              {tag.name}
            </Badge>
          ))}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      sortable: false,
      filterOptions: [
        { label: "Visible", value: "visible" },
        { label: "Hidden", value: "hidden" },
        { label: "Deleted", value: "deleted" },
      ],
      cell: (project) => (
        <Badge
          variant={
            project.is_deleted
              ? "destructive"
              : project.is_visible
                ? "default"
                : "outline"
          }
        >
          {project.is_deleted ? "Deleted" : project.is_visible ? "Visible" : "Hidden"}
        </Badge>
      ),
    },
    {
      key: "is_visible",
      header: "Visible",
      sortable: true,
      cell: (project) => (
        <Switch
          checked={project.is_visible}
          onCheckedChange={() =>
            handleToggleVisibility(project.id, project.is_visible)
          }
          disabled={project.is_deleted}
        />
      ),
    },
    {
      key: "updated_at",
      header: "Updated",
      sortable: true,
      cell: (project) => (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {format(new Date(project.updated_at), "MMM d, yyyy")}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      sortable: false,
      cell: (project) => (
        <div className="flex justify-end gap-2">
          <Link href={`/admin/projects/${project.id}/edit`}>
            <Button variant="ghost" size="icon">
              <Pencil className="h-4 w-4" />
            </Button>
          </Link>
          {!project.is_deleted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => openDeleteDialog(project.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const pendingProject = projectList.find((p) => p.id === pendingDeleteId);

  return (
    <>
      <DataTable
        columns={columns}
        data={projectList}
        total={total}
        pageSize={pageSize}
        currentPage={currentPage}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => {
        if (!deletingId) setDeleteDialogOpen(open);
      }}>
        <AlertDialogContent>
          {deletingId ? (
            <div className="flex items-center justify-center py-8">
              <LWLoader size="lg" />
            </div>
          ) : (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete project?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will hide &quot;{pendingProject?.name}&quot; from all views. The
                  data will be soft-deleted and can be recovered from the
                  database.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
