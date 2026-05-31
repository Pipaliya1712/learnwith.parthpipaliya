import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TagBadge } from "@/components/project/tag-badge";
import { ImageGallery } from "@/components/project/image-gallery";
import { FeatureList } from "@/components/project/feature-list";
import { ImprovementList } from "@/components/project/improvement-list";
import { BugList } from "@/components/project/bug-list";
import { CommentSectionWrapper } from "@/components/project/comment-section-wrapper";
import { RelatedProjects } from "@/components/project/related-projects";
import { ExternalLink, GitFork, ArrowLeft } from "lucide-react";
import { format } from "date-fns";
import type { Project, ProjectImage, Tag } from "@/types";

type ProjectTagRow = {
  project_id: string;
  tags: Tag | Tag[] | null;
};

type ProjectWithRelations = Project & {
  images: ProjectImage[];
  tags: Tag[];
};

function normalizeTag(tags: Tag | Tag[] | null) {
  return Array.isArray(tags) ? tags[0] : tags;
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const supabase = createAdminClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("slug", slug)
    .eq("is_deleted", false)
    .single();

  if (!project) notFound();

  const [featuresRes, improvementsRes, bugsRes, imagesRes, tagsRes, commentsRes] =
    await Promise.all([
      supabase
        .from("features")
        .select("*")
        .eq("project_id", project.id)
        .order("display_order"),
      supabase
        .from("improvements")
        .select("*")
        .eq("project_id", project.id)
        .order("display_order"),
      supabase
        .from("bugs")
        .select("*")
        .eq("project_id", project.id)
        .order("display_order"),
      supabase
        .from("project_images")
        .select("*")
        .eq("project_id", project.id)
        .order("display_order"),
      supabase
        .from("project_tags")
        .select("tags(id, name, slug)")
        .eq("project_id", project.id),
      supabase
        .from("comments")
        .select("*, profiles!inner(display_name, email, is_blocked)")
        .eq("project_id", project.id)
        .eq("profiles.is_blocked", false)
        .order("created_at", { ascending: false }),
    ]);

  const features = featuresRes.data || [];
  const improvements = improvementsRes.data || [];
  const bugs = bugsRes.data || [];
  const images = imagesRes.data || [];
  const tags = ((tagsRes.data || []) as ProjectTagRow[])
    .map((pt) => normalizeTag(pt.tags))
    .filter((tag): tag is Tag => Boolean(tag));

  // Get related projects
  const tagIds = tags.map((t) => t.id);
  let relatedProjects: ProjectWithRelations[] = [];
  if (tagIds.length > 0) {
    const { data: relatedPTs } = await supabase
      .from("project_tags")
      .select("project_id, tags(id, name, slug)")
      .in("tag_id", tagIds);

    const relatedProjectIds = [
      ...new Set(
        (relatedPTs || [])
          .map((pt) => pt.project_id)
          .filter((id) => id !== project.id)
      ),
    ];

    if (relatedProjectIds.length > 0) {
      const { data: related } = await supabase
        .from("projects")
        .select("*")
        .in("id", relatedProjectIds)
        .eq("is_deleted", false)
        .limit(4);

      if (related && related.length > 0) {
        const rIds = related.map((r) => r.id);
        const [rImgs, rTags] = await Promise.all([
          supabase
            .from("project_images")
            .select("*")
            .in("project_id", rIds)
            .order("display_order"),
          supabase
            .from("project_tags")
            .select("project_id, tags(id, name, slug)")
            .in("project_id", rIds),
        ]);

        relatedProjects = related.map((p) => ({
          ...p,
          images: (rImgs.data || []).filter((i) => i.project_id === p.id),
          tags: ((rTags.data || []) as ProjectTagRow[])
            .filter((t) => t.project_id === p.id)
            .map((t) => normalizeTag(t.tags))
            .filter((tag): tag is Tag => Boolean(tag)),
        }));
      }
    }
  }

  return (
    <div className="space-y-8">
      {/* Back navigation */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>

      {/* Hero */}
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <TagBadge key={tag.id} tag={tag} />
          ))}
        </div>
        <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
        <p className="text-lg text-muted-foreground max-w-3xl">
          {project.summary}
        </p>
        <div className="flex flex-wrap gap-3">
          {project.live_link && (
            <a
              href={project.live_link}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Live Demo
              </Button>
            </a>
          )}
          <a
            href={project.repo_link}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" className="gap-2">
              <GitFork className="h-4 w-4" />
              Repository
            </Button>
          </a>
        </div>
      </div>

      {/* Images */}
      {images.length > 0 && <ImageGallery images={images} />}

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="features">
            Features ({features.length})
          </TabsTrigger>
          <TabsTrigger value="improvements">
            Improvements ({improvements.length})
          </TabsTrigger>
          <TabsTrigger value="bugs">Bugs ({bugs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 space-y-4">
          {project.additional_info && (
            <div className="rounded-lg border bg-card p-4">
              <h3 className="font-medium mb-2">Additional Information</h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {project.additional_info}
              </p>
            </div>
          )}
          <div className="flex gap-4 text-sm text-muted-foreground">
            <span>
              Created: {format(new Date(project.created_at), "MMM d, yyyy")}
            </span>
            <span>
              Updated: {format(new Date(project.updated_at), "MMM d, yyyy")}
            </span>
          </div>
        </TabsContent>

        <TabsContent value="features" className="mt-6">
          <FeatureList features={features} />
        </TabsContent>

        <TabsContent value="improvements" className="mt-6">
          <ImprovementList improvements={improvements} />
        </TabsContent>

        <TabsContent value="bugs" className="mt-6">
          <BugList bugs={bugs} />
        </TabsContent>
      </Tabs>

      {/* Comments */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight">Comments</h2>
        <CommentSectionWrapper
          comments={commentsRes.data || []}
          projectId={project.id}
        />
      </div>

      {/* Related Projects */}
      <RelatedProjects projects={relatedProjects} />
    </div>
  );
}
