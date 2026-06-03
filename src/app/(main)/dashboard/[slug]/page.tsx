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
import { ImageGallery } from "@/components/project/image-gallery";
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
  profiles: Pick<Profile, "display_name" | "email" | "is_blocked" | "avatar_url">;
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

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_520px] xl:h-[calc(100vh-8rem)] xl:min-h-[750px]">
        {/* Left Column */}
        <div className="flex min-h-0 min-w-0 flex-col gap-6">
          <div className="grid shrink-0 gap-8 lg:grid-cols-[450px_minmax(0,1fr)]">
            <div className="w-full">
              <ImageGallery images={images} />
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

          <Tabs defaultValue="overview" className="flex min-h-0 flex-1 flex-col space-y-0">
            <div className="project-type-scroll shrink-0 overflow-x-auto overflow-y-hidden border-b border-border/70">
              <TabsList
                variant="line"
                className="flex h-14 w-max min-w-0 items-end justify-start gap-7 rounded-none bg-transparent p-0 pr-6"
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

            <TabsContent value="overview" className="animate-fade-in flex-1 min-h-0 overflow-y-auto scrollbar-thin pt-6 pr-2 data-[state=inactive]:hidden">
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
            </TabsContent>

            <TabsContent value="features" className="animate-fade-in flex-1 min-h-0 pt-6 data-[state=inactive]:hidden flex flex-col">
              <section className="detail-surface rounded-2xl border p-5 flex-1 min-h-0 flex flex-col">
                <FeatureList features={features} />
              </section>
            </TabsContent>

            <TabsContent value="improvements" className="animate-fade-in flex-1 min-h-0 pt-6 data-[state=inactive]:hidden flex flex-col">
              <section className="detail-surface rounded-2xl border p-5 flex-1 min-h-0 flex flex-col">
                <ImprovementList improvements={improvements} />
              </section>
            </TabsContent>

            <TabsContent value="bugs" className="animate-fade-in flex-1 min-h-0 pt-6 data-[state=inactive]:hidden flex flex-col">
              <section className="detail-surface rounded-2xl border p-5 flex-1 min-h-0 flex flex-col">
                <BugList bugs={bugs} />
              </section>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right Column */}
        <div className="flex min-h-0 flex-col space-y-6">
          <aside className="detail-surface shrink-0 rounded-2xl border p-5">
            <dl className="divide-y divide-border/60">
              <div className="grid grid-cols-[32px_1fr] gap-2 pb-4">
                <CalendarDays className="mt-1 size-6 text-primary" />
                <div>
                  <dd className="mt-1 font-medium">
                    {format(new Date(project.updated_at || project.created_at), "MMM d, yyyy")}
                  </dd>
                </div>
              </div>
              <div className="grid grid-cols-[32px_1fr] gap-2 pt-4">
                <Code2 className="mt-1 size-6 text-primary" />
                <div>
                  <dd className="mt-1 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <TagBadge key={tag.id} tag={tag} />
                    ))}
                  </dd>
                </div>
              </div>
            </dl>
          </aside>

          <aside className="detail-surface flex min-h-0 flex-1 flex-col rounded-2xl border p-6">
            <div className="mb-5 flex items-center gap-3">
              <MessageCircle className="size-5 text-primary" />
              <h2 className="text-lg font-semibold">Comments</h2>
            </div>
            <CommentSectionWrapper
              comments={comments}
              projectId={project.id}
            />
          </aside>
        </div>
      </div>

      <RelatedProjects projects={relatedProjects} />
    </div>
  );
}
