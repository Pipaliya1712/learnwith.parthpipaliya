import { getUserProfileServer } from "@/lib/server-api";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Calendar, MessageSquare, Shield } from "lucide-react";
import { ContributionGraph } from "@/components/profile/contribution-graph";
import { AvatarModal } from "@/components/ui/avatar-modal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type CommentRow = {
  id: string;
  project_id: string;
  content: string;
  created_at: string;
  deleted_at?: string | null;
  projects: { name: string; slug: string; is_deleted?: boolean; is_visible?: boolean } | null;
};

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const data = await getUserProfileServer(id);
  if (!data || !data.user) notFound();

  const { user: profile, comments: rawComments, progress, challenges } = data;

  const comments = ((rawComments || []) as CommentRow[]).filter((comment) => {
    if (!("deleted_at" in comment)) return true;
    return comment.deleted_at === null;
  });

  const displayName = profile.display_name || profile.email;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
                <AvatarModal
                  src={profile.avatar_url}
                  fallback={displayName[0].toUpperCase()}
                  className="h-24 w-24 text-3xl"
                />
                <div className="space-y-3 text-center sm:text-left">
                  <div>
                    <h1 className="text-3xl font-bold tracking-tight">{displayName}</h1>
                    <Badge variant="secondary" className="mt-2 capitalize">
                      {profile.role}
                    </Badge>
                  </div>
                  <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:flex-wrap">
                    <span className="inline-flex items-center justify-center gap-2 sm:justify-start">
                      <Calendar className="h-4 w-4" />
                      Joined {format(new Date(profile.created_at), "MMMM d, yyyy")}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <ContributionGraph challenges={data.challenges as any} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!comments || comments.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No comments yet.
                </p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {comments.map((comment) => {
                    const project = Array.isArray(comment.projects)
                      ? comment.projects[0]
                      : comment.projects;

                    if (!project) return null;

                    return (
                      <Link
                        key={comment.id}
                        href={`/dashboard/${project.slug}`}
                        className="block rounded-lg border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
                      >
                        <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <span className="font-medium">{project.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(comment.created_at), "MMM d, yyyy 'at' h:mm a")}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {comment.content}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Active & Completed Challenges
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!challenges || challenges.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">
                  No challenges attempted yet.
                </p>
              ) : (
                <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                  {challenges.map((claim: any) => {
                    const challenge = claim.challenge;
                    if (!challenge) return null;
                    return (
                      <Link
                        key={claim.id}
                        href={`/challenges/${challenge.slug}`}
                        className="block rounded-lg border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/40"
                      >
                        <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <span className="font-medium">{challenge.title}</span>
                          <Badge variant="outline">{claim.status}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {challenge.points} Points • {challenge.difficulty}
                        </p>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Stats */}
        <div className="md:col-span-1">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle>Dashboard Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center py-4 bg-muted/50 rounded-lg">
                <span className="text-sm font-medium text-muted-foreground mb-1">Rank</span>
                <span className="text-4xl font-bold text-primary">#{progress?.rank || "-"}</span>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Level</span>
                  <Badge variant="default" className="text-sm px-2 py-0.5">{progress?.level || "V1"}</Badge>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Total Points</span>
                  <span className="font-semibold">{progress?.points || 0}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span className="text-muted-foreground">Solved Challenges</span>
                  <span className="font-semibold">{progress?.solved_challenges || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
