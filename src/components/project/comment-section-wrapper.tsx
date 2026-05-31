"use client";

import { CommentSection } from "@/components/project/comment-section";
import { addComment } from "@/app/actions/comments";
import { useAuth } from "@/components/providers/auth-provider";
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

  return (
    <CommentSection
      comments={comments}
      projectId={projectId}
      onAddComment={addComment}
      canComment={Boolean(profile)}
      currentUserId={profile?.id ?? null}
    />
  );
}
