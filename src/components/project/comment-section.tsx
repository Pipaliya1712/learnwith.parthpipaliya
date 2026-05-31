"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { commentSchema } from "@/lib/validations/comment";
import { format } from "date-fns";
import { Send } from "lucide-react";
import type { Comment, Profile } from "@/types";

type CommentWithProfile = Comment & {
  profiles: Pick<Profile, "display_name" | "email">;
};

type CommentSectionProps = {
  comments: CommentWithProfile[];
  projectId: string;
  onAddComment: (projectId: string, content: string) => Promise<{ success: boolean; error?: string }>;
};

export function CommentSection({
  comments,
  projectId,
  onAddComment,
}: CommentSectionProps) {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = commentSchema.safeParse({ content });
    if (!result.success) return;

    setIsSubmitting(true);
    await onAddComment(projectId, content);
    setContent("");
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-4">
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

      {comments.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          No comments yet. Be the first to comment!
        </p>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="rounded-lg border bg-card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Link
                  href={`/profile/${comment.user_id}`}
                  className="flex items-center gap-2 rounded-md transition-colors hover:text-primary"
                >
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {(comment.profiles.display_name || comment.profiles.email)[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium">
                    {comment.profiles.display_name || comment.profiles.email}
                  </span>
                </Link>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(comment.created_at), "MMM d, yyyy 'at' h:mm a")}
                </span>
              </div>
              <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
