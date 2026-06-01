"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { commentSchema } from "@/lib/validations/comment";
import { format } from "date-fns";
import { Send, MoreVertical, Edit2, Trash2, X } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Comment, Profile } from "@/types";
import { cn } from "@/lib/utils";

type CommentWithProfile = Comment & {
  profiles: Pick<Profile, "display_name" | "email">;
};

type CommentSectionProps = {
  comments: CommentWithProfile[];
  projectId: string;
  onAddComment: (projectId: string, content: string) => Promise<{ success: boolean; error?: string }>;
  onEditComment?: (commentId: string, content: string) => Promise<{ success: boolean; error?: string }>;
  onDeleteComment?: (commentId: string) => Promise<{ success: boolean; error?: string }>;
  canComment: boolean;
  currentUserId: string | null;
};

export function CommentSection({
  comments,
  projectId,
  onAddComment,
  onEditComment,
  onDeleteComment,
  canComment,
  currentUserId,
}: CommentSectionProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = commentSchema.safeParse({ content });
    if (!result.success) return;

    setIsSubmitting(true);
    await onAddComment(projectId, content);
    setContent("");
    setIsSubmitting(false);
  };

  const handleEditSubmit = async (commentId: string) => {
    const result = commentSchema.safeParse({ content: editContent });
    if (!result.success || !onEditComment) return;

    setIsEditing(true);
    const res = await onEditComment(commentId, editContent);
    if (res.success) {
      setEditingId(null);
      setEditContent("");
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      {canComment ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Add a comment about this project..."
            rows={3}
            maxLength={2000}
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !content.trim()}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {isSubmitting ? "Posting..." : "Post Comment"}
            </Button>
          </div>
        </form>
      ) : (
        <div className="rounded-lg border bg-muted/50 p-4 text-center">
          <p className="mb-3 text-sm text-muted-foreground">
            Sign in to add comments
          </p>
          <Link href="/login">
            <Button variant="outline" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      )}

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => {
            const isOwnComment = comment.user_id === currentUserId;

            return (
            <div
              key={comment.id}
              className={cn(
                "rounded-lg border bg-card p-4",
                isOwnComment && "border-primary/35 bg-primary/5"
              )}
            >
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <Link
                  href={`/profile/${comment.user_id}`}
                  className={cn(
                    "flex items-center gap-2 rounded-md transition-colors hover:text-primary",
                    isOwnComment && "font-semibold text-primary"
                  )}
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {(comment.profiles.display_name || comment.profiles.email)[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {isOwnComment ? "You" : comment.profiles.display_name || comment.profiles.email}
                  </span>
                </Link>
                {isOwnComment && (
                  <span className="rounded-md bg-primary/10 px-1.5 py-0.5 text-xs font-medium text-primary">
                    Your comment
                  </span>
                )}
                <span className="text-xs text-muted-foreground">
                  {comment.updated_at 
                    ? `Edited ${format(new Date(comment.updated_at), "MMM d, yyyy 'at' h:mm a")}` 
                    : format(new Date(comment.created_at), "MMM d, yyyy 'at' h:mm a")}
                </span>
                
                {isOwnComment && onDeleteComment && onEditComment && (
                  <DropdownMenu>
                    <DropdownMenuTrigger className="inline-flex ml-auto h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground outline-none">
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
                            onDeleteComment(comment.id);
                          }
                        }}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
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
                <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
              )}
            </div>
          );
          })}
        </div>
      )}
    </div>
  );
}
