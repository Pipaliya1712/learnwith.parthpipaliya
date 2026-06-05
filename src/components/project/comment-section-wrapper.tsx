"use client";

import { CommentSection } from "@/components/project/comment-section";
import { commentsApi } from "@/lib/api-client";
import { useAuth } from "@/components/providers/auth-provider";
import type { Comment, Profile } from "@/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type CommentWithProfile = Comment & {
  profiles: Pick<Profile, "display_name" | "email" | "avatar_url">;
};

type CommentSectionWrapperProps = {
  comments: CommentWithProfile[];
  total: number;
  projectId: string;
};

export function CommentSectionWrapper({
  comments,
  total,
  projectId,
}: CommentSectionWrapperProps) {
  const { profile } = useAuth();
  const router = useRouter();

  return (
    <CommentSection
      key={`${projectId}-${total}-${comments.map((comment) => comment.id).join(",")}`}
      comments={comments}
      total={total}
      projectId={projectId}
      onLoadMoreComments={async (skip, limit) => {
        try {
          const response = await commentsApi.listByProject(projectId, {
            skip,
            limit,
          });
          return {
            success: true,
            comments: response.comments as CommentWithProfile[],
            total: response.total,
          };
        } catch (error: unknown) {
          toast.error(getErrorMessage(error, "Failed to load comments"));
          return { success: false, comments: [], total };
        }
      }}
      onAddComment={async (pid, content) => {
        try {
          await commentsApi.add(pid, content);
          toast.success("Comment posted successfully");
          router.refresh();
          return { success: true };
        } catch (error: unknown) {
          const message = getErrorMessage(error, "Failed to post comment");
          toast.error(message);
          return { success: false, error: message };
        }
      }}
      onEditComment={async (commentId, content) => {
        try {
          await commentsApi.updateOwn(commentId, content);
          toast.success("Comment updated successfully");
          router.refresh();
          return { success: true };
        } catch (error: unknown) {
          const message = getErrorMessage(error, "Failed to update comment");
          toast.error(message);
          return { success: false, error: message };
        }
      }}
      onDeleteComment={async (commentId) => {
        try {
          await commentsApi.deleteOwn(commentId);
          toast.success("Comment deleted successfully");
          router.refresh();
          return { success: true };
        } catch (error: unknown) {
          const message = getErrorMessage(error, "Failed to delete comment");
          toast.error(message);
          return { success: false, error: message };
        }
      }}
      canComment={Boolean(profile)}
      currentUserId={profile?.id ?? null}
    />
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}
