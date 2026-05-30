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

  revalidatePath(`/dashboard/${projectId}`);
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
    .delete()
    .eq("id", commentId);

  if (error) {
    return { success: false, error: "Failed to delete comment" };
  }

  revalidatePath("/admin/comments");
  return { success: true };
}
