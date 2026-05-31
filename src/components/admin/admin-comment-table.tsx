"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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
import { deleteComment } from "@/app/actions/comments";
import { Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

export type CommentWithDetails = {
  id: string;
  project_id: string;
  user_id: string;
  content: string;
  created_at: string;
  deleted_at: string | null;
  deleted_by: string | null;
  projects: { name: string } | null;
  profiles: { email: string; display_name: string | null } | null;
};

export function AdminCommentTable({ comments: initialComments }: { comments: CommentWithDetails[] }) {
  const [comments, setComments] = useState(initialComments);

  const handleDelete = async (commentId: string) => {
    const result = await deleteComment(commentId);
    if (result.error) {
      toast.error(result.error);
    } else {
      const deletedAt = new Date().toISOString();
      setComments((prev) =>
        prev.map((c) => c.id === commentId ? { ...c, deleted_at: deletedAt } : c)
      );
      toast.success("Comment marked as deleted");
    }
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Project</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Comment</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {comments.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                No comments yet.
              </TableCell>
            </TableRow>
          ) : (
            comments.map((comment) => (
              <TableRow key={comment.id}>
                <TableCell className="font-medium text-sm">
                  {comment.projects?.name || "Unknown"}
                </TableCell>
                <TableCell className="text-sm">
                  {comment.profiles?.display_name || comment.profiles?.email || "Unknown"}
                </TableCell>
                <TableCell className="max-w-xs truncate text-sm text-muted-foreground">
                  {comment.content}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {format(new Date(comment.created_at), "MMM d, yyyy")}
                </TableCell>
                <TableCell className="text-sm whitespace-nowrap">
                  {comment.deleted_at ? (
                    <Badge variant="destructive">
                      Deleted {format(new Date(comment.deleted_at), "MMM d, yyyy")}
                    </Badge>
                  ) : (
                    <Badge variant="outline">Active</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {comment.deleted_at ? null : (
                  <AlertDialog>
                    <AlertDialogTrigger>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete this comment?</AlertDialogTitle>
                        <AlertDialogDescription>
                          The comment will be hidden from users and kept in admin activity.
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
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
