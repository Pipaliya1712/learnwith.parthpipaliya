"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { commentSchema } from "@/lib/validations/comment";
import { format } from "date-fns";
import { MessageCircle, Send, MoreVertical, Edit2, Trash2 } from "lucide-react";
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
    <div className="space-y-5">
      {canComment ? (
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <Avatar className="size-8 shrink-0">
            <AvatarFallback className="text-xs">R</AvatarFallback>
          </Avatar>
          <div className="relative min-w-0 flex-1">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add a comment about this project..."
              rows={1}
              maxLength={2000}
              className="min-h-14 resize-none rounded-xl bg-background/55 py-4 pr-14"
            />
            <Button
              type="submit"
              size="icon"
              disabled={isSubmitting || !content.trim()}
              className="absolute right-3 top-1/2 size-8 -translate-y-1/2 rounded-full shadow-lg shadow-primary/20"
              aria-label="Post comment"
            >
              <Send className="h-4 w-4" />
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
        <div className="flex min-h-40 flex-col items-center justify-center text-center">
          <div className="relative mb-5 h-14 w-24">
            <span className="absolute bottom-1 left-3 flex h-9 w-12 items-center justify-center rounded-lg bg-primary/80 text-primary-foreground shadow-lg shadow-primary/20">
              <MessageCircle className="size-5" />
            </span>
            <span className="absolute right-2 top-0 flex h-10 w-14 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/25">
              <span className="flex gap-1">
                <span className="size-1.5 rounded-full bg-current" />
                <span className="size-1.5 rounded-full bg-current" />
                <span className="size-1.5 rounded-full bg-current" />
              </span>
            </span>
          </div>
          <p className="font-medium">No comments yet.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Be the first to comment!
          </p>
        </div>
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
