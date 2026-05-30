"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { deleteProject, toggleVisibility } from "@/app/actions/projects";
import type { Project, Tag } from "@/types";
import { Pencil, Trash2 } from "lucide-react";
import { format } from "date-fns";

type ProjectWithTags = Project & { tags: Tag[] };

export function AdminProjectList({ projects }: { projects: ProjectWithTags[] }) {
  const [projectList, setProjectList] = useState(projects);

  const handleToggleVisibility = async (projectId: string, current: boolean) => {
    const result = await toggleVisibility(projectId, !current);
    if (result.error) {
      toast.error(result.error);
    } else {
      setProjectList((prev) =>
        prev.map((p) =>
          p.id === projectId ? { ...p, is_visible: !current } : p
        )
      );
      toast.success(current ? "Removed from landing page" : "Added to landing page");
    }
  };

  const handleDelete = async (projectId: string) => {
    const result = await deleteProject(projectId);
    if (result.error) {
      toast.error(result.error);
    } else {
      setProjectList((prev) => prev.filter((p) => p.id !== projectId));
      toast.success("Project deleted");
    }
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Visible</TableHead>
            <TableHead>Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projectList.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                No projects yet. Click "Add Project" to create one.
              </TableCell>
            </TableRow>
          ) : (
            projectList.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <div>
                    <span className="font-medium">{project.name}</span>
                    {project.is_deleted && (
                      <Badge variant="destructive" className="ml-2 text-xs">
                        Deleted
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    /{project.slug}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {project.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary" className="text-xs">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Switch
                    checked={project.is_visible}
                    onCheckedChange={() =>
                      handleToggleVisibility(project.id, project.is_visible)
                    }
                    disabled={project.is_deleted}
                  />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(project.updated_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/admin/projects/${project.id}/edit`}>
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    {!project.is_deleted && (
                      <AlertDialog>
                        <AlertDialogTrigger>
                          <Button variant="ghost" size="icon">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete project?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will hide &quot;{project.name}&quot; from all views. The
                              data will be soft-deleted and can be recovered from
                              the database.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(project.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
