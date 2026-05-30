"use client";

import { CommentSection } from "@/components/project/comment-section";
import { addComment } from "@/app/actions/comments";
import { useAuth } from "@/components/providers/auth-provider";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { Comment, Profile } from "@/types";

type CommentWithProfile = Comment & {
  profiles: Pick<Profile, "display_name" | "email">;
};

type CommentSectionWrapperProps = {
  comments: CommentWithProfile[];
  projectId: string;
};

export function CommentSectionWrapper({
  comments,
  projectId,
}: CommentSectionWrapperProps) {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className="rounded-lg border bg-muted/50 p-6 text-center">
        <p className="text-sm text-muted-foreground mb-3">
          Sign in to add comments
        </p>
        <Link href="/login">
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        </Link>
      </div>
    );
  }

  const userComments = comments.filter((c) => c.user_id === profile.id);

  return (
    <CommentSection
      comments={userComments}
      projectId={projectId}
      onAddComment={addComment}
    />
  );
}
