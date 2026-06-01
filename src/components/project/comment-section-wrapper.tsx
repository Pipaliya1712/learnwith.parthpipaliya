"use client";

import { CommentSection } from "@/components/project/comment-section";
import { commentsApi } from "@/lib/api-client";
import { useAuth } from "@/components/providers/auth-provider";
import type { Comment, Profile } from "@/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
  const router = useRouter();

  return (
    <CommentSection
      comments={comments}
      projectId={projectId}
      onAddComment={async (pid, content) => {
        try {
          await commentsApi.add(pid, content);
          toast.success("Comment posted successfully");
          router.refresh();
          return { success: true };
        } catch (error: any) {
          toast.error(error.message || "Failed to post comment");
          return { success: false, error: error.message };
        }
      }}
      onEditComment={async (commentId, content) => {
        try {
          await commentsApi.updateOwn(commentId, content);
          toast.success("Comment updated successfully");
          router.refresh();
          return { success: true };
        } catch (error: any) {
          toast.error(error.message || "Failed to update comment");
          return { success: false, error: error.message };
        }
      }}
      onDeleteComment={async (commentId) => {
        try {
          await commentsApi.deleteOwn(commentId);
          toast.success("Comment deleted successfully");
          router.refresh();
          return { success: true };
        } catch (error: any) {
          toast.error(error.message || "Failed to delete comment");
          return { success: false, error: error.message };
        }
      }}
      canComment={Boolean(profile)}
      currentUserId={profile?.id ?? null}
    />
  );
}
