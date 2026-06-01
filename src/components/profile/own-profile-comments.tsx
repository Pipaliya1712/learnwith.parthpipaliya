"use client";

import { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { Edit2, MoreVertical, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { commentsApi } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { commentSchema } from "@/lib/validations/comment";

export type OwnProfileComment = {
  id: string;
  content: string;
  created_at: string;
  updated_at: string | null;
  projects: {
    name: string;
    slug: string;
  } | null;
};

export function OwnProfileComments({
  comments,
}: {
  comments: OwnProfileComment[];
}) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = async (commentId: string) => {
    try {
      await commentsApi.deleteOwn(commentId);
      toast.success("Comment deleted successfully");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete comment");
    }
  };

  const handleEditSubmit = async (commentId: string) => {
    const result = commentSchema.safeParse({ content: editContent });
    if (!result.success) return;

    setIsEditing(true);
    try {
      await commentsApi.updateOwn(commentId, editContent);
      toast.success("Comment updated successfully");
      setEditingId(null);
      setEditContent("");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Failed to update comment");
    } finally {
      setIsEditing(false);
    }
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
                  {comment.updated_at ? (
                    <span>Edited {format(new Date(comment.updated_at), "MMM d, yyyy 'at' h:mm a")}</span>
                  ) : (
                    <span>Created {format(new Date(comment.created_at), "MMM d, yyyy 'at' h:mm a")}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground outline-none">
                    <MoreVertical className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => {
                        setEditingId(comment.id);
                        setEditContent(comment.content);
                      }}
                    >
                      <Edit2 className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onClick={() => {
                        if (confirm("Are you sure you want to delete this comment?")) {
                          handleDelete(comment.id);
                        }
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            {editingId === comment.id ? (
              <div className="space-y-2 mt-2">
                <Textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={2}
                  maxLength={2000}
                />
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingId(null);
                      setEditContent("");
                    }}
                    disabled={isEditing}
                  >
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleEditSubmit(comment.id)}
                    disabled={isEditing || !editContent.trim()}
                  >
                    Save
                  </Button>
                </div>
              </div>
            ) : (
              <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                {comment.content}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
