"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";

export async function blockUser(userId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  if (session.role !== "admin") {
    return { success: false, error: "Only admins can block users" };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_blocked: true })
    .eq("id", userId);

  if (error) {
    return { success: false, error: "Failed to block user" };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function unblockUser(userId: string) {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  if (session.role !== "admin") {
    return { success: false, error: "Only admins can unblock users" };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ is_blocked: false })
    .eq("id", userId);

  if (error) {
    return { success: false, error: "Failed to unblock user" };
  }

  revalidatePath("/admin/users");
  return { success: true };
}

export async function updateUserRole(userId: string, newRole: "admin" | "developer") {
  const session = await getSession();
  if (!session) return { success: false, error: "Unauthorized" };

  if (session.email !== process.env.SUPER_ADMIN_EMAIL) {
    return { success: false, error: "Only the super admin can change user roles" };
  }

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("profiles")
    .update({ role: newRole })
    .eq("id", userId);

  if (error) {
    return { success: false, error: "Failed to update user role" };
  }

  revalidatePath("/admin/users");
  return { success: true };
}
