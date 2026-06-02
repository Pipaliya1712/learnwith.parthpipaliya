import { getProjectBySlugServer } from "@/lib/server-api";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TagBadge } from "@/components/project/tag-badge";
import { FeatureList } from "@/components/project/feature-list";
import { ImprovementList } from "@/components/project/improvement-list";
import { BugList } from "@/components/project/bug-list";
import { CommentSectionWrapper } from "@/components/project/comment-section-wrapper";
import { RelatedProjects } from "@/components/project/related-projects";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Code2,
  GitFork,
  ImageIcon,
  Info,
  Lightbulb,
  MessageCircle,
  Send,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import type {
  Comment,
  Profile,
  Project,
  ProjectImage,
  ProjectWithDetails,
  Tag,
} from "@/types";
import { cleanImageUrl } from "@/lib/utils";

type CommentWithProfile = Comment & {
  profiles: Pick<Profile, "display_name" | "email" | "is_blocked">;
};

type RelatedProject = Project & {
  tags: Tag[];
  images: ProjectImage[];
};

type ProjectDetail = ProjectWithDetails & {
  comments?: CommentWithProfile[];
  related_projects?: RelatedProject[];
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const projectData = await getProjectBySlugServer(slug);
  if (!projectData) notFound();

  const project = projectData as ProjectDetail;
  const features = project.features || [];
  const improvements = project.improvements || [];
  const bugs = project.bugs || [];
  const images = project.images || [];
  const tags = project.tags || [];
  const comments = (project.comments || []).filter(
    (comment) => comment.profiles && !comment.profiles.is_blocked
  );
  const relatedProjects = project.related_projects || [];
  const primaryImage = images[0];

  const overviewItems = [
    `Responsive UI built with ${tags[0]?.name || "modern tooling"}`,
    `Component based architecture using ${tags[1]?.name || "reusable modules"}`,
    `Deployed with ${tags[2]?.name || "scalable infrastructure"}`,
  ];

  return (
    <div className="space-y-7">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>

      <section className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_520px]">
        <div className="grid gap-8 lg:grid-cols-[300px_minmax(0,1fr)]">
          <div className="relative aspect-[1.3] overflow-hidden rounded-lg border bg-muted shadow-2xl shadow-primary/5 ring-1 ring-foreground/10 lg:aspect-[1.28]">
            {primaryImage ? (
              <Image
                src={cleanImageUrl(primaryImage.image_url)}
                alt={primaryImage.alt_text || project.name}
                fill
                className="object-cover grayscale"
                sizes="(max-width: 1024px) 100vw, 300px"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                <ImageIcon className="size-12 opacity-50" />
              </div>
            )}
            {images.length > 1 && (
              <div className="absolute bottom-3 right-3 inline-flex items-center gap-1 rounded-md bg-background/75 px-2 py-1 text-xs font-semibold text-foreground backdrop-blur">
                <ImageIcon className="size-3.5" />
                {images.length}
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col justify-center space-y-5">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <TagBadge key={tag.id} tag={tag} />
              ))}
            </div>
            <div className="space-y-3">
              <h1 className="text-4xl font-bold tracking-tight text-foreground">
                {project.name}
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                {project.summary}
              </p>
            </div>
            <div className="flex flex-wrap gap-4">
              {project.live_link && (
                <a
                  href={project.live_link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="h-11 gap-2 border border-primary/50 bg-primary/15 px-6 text-primary shadow-lg shadow-primary/15 hover:bg-primary/25">
                    <Send className="h-4 w-4" />
                    Live Demo
                  </Button>
                </a>
              )}
              <a
                href={project.repo_link}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="h-11 gap-2 px-6">
                  <GitFork className="h-4 w-4" />
                  Repository
                </Button>
              </a>
            </div>
          </div>
        </div>

        <aside className="detail-surface rounded-2xl border p-7">
          <dl className="divide-y divide-border/60">
            <div className="grid grid-cols-[32px_1fr] gap-4 pb-5">
              <CalendarDays className="mt-1 size-6 text-primary" />
              <div>
                <dt className="text-sm text-muted-foreground">Created</dt>
                <dd className="mt-1 font-medium">
                  {format(new Date(project.created_at), "MMM d, yyyy")}
                </dd>
              </div>
            </div>
            <div className="grid grid-cols-[32px_1fr] gap-4 py-5">
              <Clock3 className="mt-1 size-6 text-primary" />
              <div>
                <dt className="text-sm text-muted-foreground">Updated</dt>
                <dd className="mt-1 font-medium">
                  {format(new Date(project.updated_at), "MMM d, yyyy")}
                </dd>
              </div>
            </div>
            <div className="grid grid-cols-[32px_1fr] gap-4 pt-5">
              <Code2 className="mt-1 size-6 text-primary" />
              <div>
                <dt className="text-sm text-muted-foreground">Technologies</dt>
                <dd className="mt-2 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <TagBadge key={tag.id} tag={tag} />
                  ))}
                </dd>
              </div>
            </div>
          </dl>
        </aside>
      </section>

      <Tabs defaultValue="overview" className="space-y-0">
        <div className="project-type-scroll overflow-x-auto overflow-y-hidden">
          <TabsList
            variant="line"
            className="flex h-20 w-max min-w-0 items-end justify-start gap-7 rounded-none border-b border-border/70 bg-transparent p-0 pr-6"
          >
          <TabsTrigger value="overview" className="project-tab-trigger flex-none justify-center gap-2 rounded-none bg-transparent px-0 pb-4 pt-3 data-active:bg-transparent data-active:shadow-none">
            <Info className="size-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="features" className="project-tab-trigger flex-none justify-center gap-2 rounded-none bg-transparent px-0 pb-4 pt-3 data-active:bg-transparent data-active:shadow-none">
            <Sparkles className="size-4" />
            Features
            <span className="project-tab-count rounded-full bg-muted px-2 py-0.5 text-xs">
              {features.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="improvements" className="project-tab-trigger flex-none justify-center gap-2 rounded-none bg-transparent px-0 pb-4 pt-3 data-active:bg-transparent data-active:shadow-none">
            <Lightbulb className="size-4" />
            Improvements
            <span className="project-tab-count rounded-full bg-muted px-2 py-0.5 text-xs">
              {improvements.length}
            </span>
          </TabsTrigger>
          <TabsTrigger value="bugs" className="project-tab-trigger flex-none justify-center gap-2 rounded-none bg-transparent px-0 pb-4 pt-3 data-active:bg-transparent data-active:shadow-none">
            <ShieldAlert className="size-4" />
            Bugs
            <span className="project-tab-count rounded-full bg-muted px-2 py-0.5 text-xs">
              {bugs.length}
            </span>
          </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="overview" className="mt-0 animate-fade-in">
          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_520px]">
            <section className="detail-surface rounded-2xl border p-5">
              <div className="mb-4 flex items-center gap-3">
                <Info className="size-5 text-primary" />
                <h2 className="text-lg font-semibold">Project Description</h2>
              </div>
              <div className="rounded-xl border bg-background/35 p-5 shadow-inner shadow-black/10">
                <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
                  {project.additional_info ||
                    `${project.summary} It showcases the integration of modern web technologies, scalable architecture, and responsive UI components.`}
                </p>
                <ul className="mt-5 space-y-2">
                  {overviewItems.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section className="detail-surface flex h-[380px] min-h-0 flex-col rounded-2xl border p-6">
              <div className="mb-5 flex items-center gap-3">
                <MessageCircle className="size-5 text-primary" />
                <h2 className="text-lg font-semibold">Comments</h2>
              </div>
              <CommentSectionWrapper
                comments={comments}
                projectId={project.id}
              />
            </section>
          </div>
        </TabsContent>

        <TabsContent value="features" className="mt-6 animate-fade-in">
          <section className="detail-surface rounded-2xl border p-5">
            <FeatureList features={features} />
          </section>
        </TabsContent>

        <TabsContent value="improvements" className="mt-6 animate-fade-in">
          <section className="detail-surface rounded-2xl border p-5">
            <ImprovementList improvements={improvements} />
          </section>
        </TabsContent>

        <TabsContent value="bugs" className="mt-6 animate-fade-in">
          <section className="detail-surface rounded-2xl border p-5">
            <BugList bugs={bugs} />
          </section>
        </TabsContent>
      </Tabs>

      <RelatedProjects projects={relatedProjects} />
    </div>
  );
}
