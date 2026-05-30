import { createAdminClient } from "@/lib/supabase/admin";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LandingContent } from "@/components/project/landing-content";

export default async function LandingPage() {
  const supabase = createAdminClient();

  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .eq("is_visible", true)
    .eq("is_deleted", false)
    .order("landing_page_order", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false })
    .limit(10);

  const { data: tags } = await supabase
    .from("tags")
    .select("id, name, slug")
    .order("name");

  const projectIds = (projects || []).map((p) => p.id);

  const { data: allImages } = projectIds.length
    ? await supabase
        .from("project_images")
        .select("*")
        .in("project_id", projectIds)
        .order("display_order")
    : { data: [] };

  const { data: allProjectTags } = projectIds.length
    ? await supabase
        .from("project_tags")
        .select("project_id, tags(id, name, slug)")
        .in("project_id", projectIds)
    : { data: [] };

  const projectsWithRelations = (projects || []).map((project) => ({
    ...project,
    images: (allImages || []).filter((img) => img.project_id === project.id),
    tags: (allProjectTags || [])
      .filter((pt) => pt.project_id === project.id)
      .map((pt) => pt.tags),
  }));

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative border-b bg-dot-pattern">
          <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-gradient">Learn By Building</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Discover real-world open-source projects that need your help.
              Clone, contribute, and grow your skills with hands-on experience.
            </p>
            <div className="gradient-accent-line mx-auto mt-8 max-w-xs" />
          </div>
        </section>

        {/* Projects Section */}
        <section className="mx-auto max-w-6xl px-4 py-12">
          <LandingContent
            projects={projectsWithRelations}
            tags={tags || []}
          />
        </section>
      </main>
      <Footer />
    </div>
  );
}
