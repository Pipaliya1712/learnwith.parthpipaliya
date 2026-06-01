import { getProjectBySlugServer } from "@/lib/server-api";
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

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const projectData = await getProjectBySlugServer(slug);
  if (!projectData) notFound();

  const project = projectData;
  const features = project.features || [];
  const improvements = project.improvements || [];
  const bugs = project.bugs || [];
  const images = project.images || [];
  const tags = project.tags || [];
  
  // Filter out comments from blocked users
  const comments = (project.comments || []).filter((c: any) => c.profiles && !c.profiles.is_blocked);
  const relatedProjects = project.related_projects || [];

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
          {tags.map((tag: any) => (
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
          comments={comments}
          projectId={project.id}
        />
      </div>

      {/* Related Projects */}
      <RelatedProjects projects={relatedProjects} />
    </div>
  );
}
