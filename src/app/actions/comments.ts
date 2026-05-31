"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { commentSchema } from "@/lib/validations/comment";

export async function addComment(projectId: string, content: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "You must be logged in to comment" };

  const result = commentSchema.safeParse({ content });
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("comments").insert({
    project_id: projectId,
    user_id: session.userId,
    content: content.trim(),
  });

  if (error) {
    return { success: false, error: "Failed to post comment" };
  }

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteComment(commentId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  if (session.role !== "admin") {
    return { success: false, error: "Only admins can delete comments" };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("comments")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: session.userId,
    })
    .eq("id", commentId)
    .is("deleted_at", null);

  if (error) {
    return { success: false, error: "Failed to delete comment" };
  }

  revalidatePath("/admin/comments");
  revalidatePath("/dashboard");
  revalidatePath("/profile");
  return { success: true };
}

export async function deleteOwnComment(commentId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  const supabase = createAdminClient();
  const { data: comment } = await supabase
    .from("comments")
    .select("id, user_id, deleted_at")
    .eq("id", commentId)
    .maybeSingle();

  if (!comment || comment.user_id !== session.userId) {
    return { success: false, error: "Comment not found" };
  }

  if (comment.deleted_at) {
    return { success: true };
  }

  const { error } = await supabase
    .from("comments")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: session.userId,
    })
    .eq("id", commentId);

  if (error) {
    return { success: false, error: "Failed to delete comment" };
  }

  revalidatePath("/profile");
  revalidatePath("/dashboard");
  revalidatePath("/admin/comments");
  return { success: true };
}
