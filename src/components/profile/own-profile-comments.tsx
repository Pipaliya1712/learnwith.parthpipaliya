"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteOwnComment } from "@/app/actions/comments";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

export type OwnProfileComment = {
  id: string;
  content: string;
  created_at: string;
  deleted_at: string | null;
  projects: {
    name: string;
    slug: string;
  } | null;
};

export function OwnProfileComments({
  comments: initialComments,
}: {
  comments: OwnProfileComment[];
}) {
  const [comments, setComments] = useState(initialComments);

  const handleDelete = async (commentId: string) => {
    const result = await deleteOwnComment(commentId);

    if (result.error) {
      toast.error(result.error);
      return;
    }

    const deletedAt = new Date().toISOString();
    setComments((prev) =>
      prev.map((comment) =>
        comment.id === commentId ? { ...comment, deleted_at: deletedAt } : comment
      )
    );
    toast.success("Comment marked as deleted");
  };

  if (comments.length === 0) {
    return (
      <p className="py-4 text-center text-sm text-muted-foreground">
        You have not commented on any projects yet.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {comments.map((comment) => {
        const project = comment.projects;
        const isDeleted = Boolean(comment.deleted_at);

        return (
          <div key={comment.id} className="rounded-lg border bg-card p-4">
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-1">
                {project ? (
                  <Link
                    href={`/dashboard/${project.slug}`}
                    className="font-medium transition-colors hover:text-primary"
                  >
                    {project.name}
                  </Link>
                ) : (
                  <span className="font-medium">Unknown project</span>
                )}
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                  <span>{format(new Date(comment.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                  {comment.deleted_at && (
                    <span>
                      Deleted {format(new Date(comment.deleted_at), "MMM d, yyyy 'at' h:mm a")}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {isDeleted ? (
                  <Badge variant="destructive">Deleted</Badge>
                ) : (
                  <>
                    <Badge variant="outline">Active</Badge>
                    <AlertDialog>
                      <AlertDialogTrigger>
                        <Button variant="ghost" size="icon" aria-label="Delete comment">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete this comment?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This hides the comment from users, but keeps the activity for admins.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(comment.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </div>
            <p className="whitespace-pre-wrap text-sm text-muted-foreground">
              {comment.content}
            </p>
          </div>
        );
      })}
    </div>
  );
}
