"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { projectSchema } from "@/lib/validations/project";

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

async function requireAuth() {
  const session = await getSession();
  if (!session) return null;
  return session;
}

export async function createProject(formData: FormData) {
  const session = await requireAuth();
  if (!session) return { success: false, error: "Unauthorized" };

  const rawData = {
    name: formData.get("name") as string,
    summary: formData.get("summary") as string,
    live_link: (formData.get("live_link") as string) || "",
    repo_link: formData.get("repo_link") as string,
    additional_info: (formData.get("additional_info") as string) || undefined,
    is_visible: formData.get("is_visible") === "true",
  };

  const result = projectSchema.safeParse(rawData);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const slug = generateSlug(result.data.name);
  const supabase = createAdminClient();

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      ...result.data,
      slug,
      created_by: session.userId,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "A project with this name already exists" };
    }
    return { success: false, error: "Failed to create project" };
  }

  revalidatePath("/admin/projects");
  redirect(`/admin/projects/${project.id}/edit`);
}

export async function updateProject(projectId: string, formData: FormData) {
  const session = await requireAuth();
  if (!session) return { success: false, error: "Unauthorized" };

  const rawData = {
    name: formData.get("name") as string,
    summary: formData.get("summary") as string,
    live_link: (formData.get("live_link") as string) || "",
    repo_link: formData.get("repo_link") as string,
    additional_info: (formData.get("additional_info") as string) || undefined,
    is_visible: formData.get("is_visible") === "true",
  };

  const result = projectSchema.safeParse(rawData);
  if (!result.success) {
    return { success: false, error: result.error.issues[0].message };
  }

  const slug = generateSlug(result.data.name);
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("projects")
    .update({ ...result.data, slug })
    .eq("id", projectId);

  if (error) {
    return { success: false, error: "Failed to update project" };
  }

  // Update features
  const featuresData = JSON.parse(
    (formData.get("features") as string) || "[]"
  );
  await supabase.from("features").delete().eq("project_id", projectId);
  if (featuresData.length > 0) {
    await supabase.from("features").insert(
      featuresData.map(
        (f: { title: string; description: string }, i: number) => ({
          project_id: projectId,
          title: f.title,
          description: f.description,
          display_order: i,
        })
      )
    );
  }

  // Update improvements
  const improvementsData = JSON.parse(
    (formData.get("improvements") as string) || "[]"
  );
  await supabase.from("improvements").delete().eq("project_id", projectId);
  if (improvementsData.length > 0) {
    await supabase.from("improvements").insert(
      improvementsData.map(
        (imp: { title: string; description?: string }, i: number) => ({
          project_id: projectId,
          title: imp.title,
          description: imp.description,
          display_order: i,
        })
      )
    );
  }

  // Update bugs
  const bugsData = JSON.parse((formData.get("bugs") as string) || "[]");
  await supabase.from("bugs").delete().eq("project_id", projectId);
  if (bugsData.length > 0) {
    await supabase.from("bugs").insert(
      bugsData.map(
        (b: { title: string; description?: string; severity: string }, i: number) => ({
          project_id: projectId,
          title: b.title,
          description: b.description,
          severity: b.severity,
          display_order: i,
        })
      )
    );
  }

  // Update tags
  const tagIds = JSON.parse((formData.get("tag_ids") as string) || "[]");
  await supabase.from("project_tags").delete().eq("project_id", projectId);
  if (tagIds.length > 0) {
    await supabase.from("project_tags").insert(
      tagIds.map((tagId: string) => ({
        project_id: projectId,
        tag_id: tagId,
      }))
    );
  }

  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${projectId}/edit`);
  revalidatePath(`/dashboard/${slug}`);
  revalidatePath("/");
  return { success: true };
}

export async function deleteProject(projectId: string) {
  const session = await requireAuth();
  if (!session) return { success: false, error: "Unauthorized" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("projects")
    .update({ is_deleted: true })
    .eq("id", projectId);

  if (error) {
    return { success: false, error: "Failed to delete project" };
  }

  revalidatePath("/admin/projects");
  revalidatePath("/");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function toggleVisibility(projectId: string, visible: boolean) {
  const session = await requireAuth();
  if (!session) return { success: false, error: "Unauthorized" };

  const supabase = createAdminClient();

  if (visible) {
    const { count } = await supabase
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("is_visible", true)
      .eq("is_deleted", false);

    if ((count || 0) >= 10) {
      return {
        success: false,
        error: "Maximum 10 projects can be visible on the landing page",
      };
    }
  }

  const { error } = await supabase
    .from("projects")
    .update({ is_visible: visible })
    .eq("id", projectId);

  if (error) {
    return { success: false, error: "Failed to update visibility" };
  }

  revalidatePath("/admin/projects");
  revalidatePath("/");
  return { success: true };
}

export async function reorderLandingProjects(orderedIds: string[]) {
  const session = await requireAuth();
  if (!session) return { success: false, error: "Unauthorized" };

  const supabase = createAdminClient();

  for (let i = 0; i < orderedIds.length; i++) {
    await supabase
      .from("projects")
      .update({ landing_page_order: i + 1 })
      .eq("id", orderedIds[i]);
  }

  revalidatePath("/");
  revalidatePath("/admin/projects");
  return { success: true };
}

export async function createTag(name: string) {
  const session = await requireAuth();
  if (!session) return { success: false, error: "Unauthorized" };

  const slug = generateSlug(name);
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("tags")
    .insert({ name: name.trim(), slug })
    .select("id, name, slug")
    .single();

  if (error) {
    if (error.code === "23505") {
      return { success: false, error: "Tag already exists" };
    }
    return { success: false, error: "Failed to create tag" };
  }

  return { success: true, data };
}

export async function uploadProjectImage(projectId: string, file: File) {
  const session = await requireAuth();
  if (!session) return { success: false, error: "Unauthorized" };

  const supabase = createAdminClient();
  const ext = file.name.split(".").pop();
  const filePath = `${projectId}/${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("project-images")
    .upload(filePath, file);

  if (uploadError) {
    return { success: false, error: "Failed to upload image" };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("project-images").getPublicUrl(filePath);

  const { data: images } = await supabase
    .from("project_images")
    .select("display_order")
    .eq("project_id", projectId)
    .order("display_order", { ascending: false })
    .limit(1);

  const nextOrder = (images?.[0]?.display_order ?? -1) + 1;

  const { error } = await supabase.from("project_images").insert({
    project_id: projectId,
    image_url: publicUrl,
    alt_text: file.name,
    display_order: nextOrder,
  });

  if (error) {
    return { success: false, error: "Failed to save image record" };
  }

  revalidatePath(`/admin/projects/${projectId}/edit`);
  return { success: true };
}

export async function deleteProjectImage(imageId: string) {
  const session = await requireAuth();
  if (!session) return { success: false, error: "Unauthorized" };

  const supabase = createAdminClient();
  const { error } = await supabase
    .from("project_images")
    .delete()
    .eq("id", imageId);

  if (error) {
    return { success: false, error: "Failed to delete image" };
  }

  return { success: true };
}
