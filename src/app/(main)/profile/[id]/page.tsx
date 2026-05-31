import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { ArrowLeft, Calendar, MessageSquare, Shield } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, display_name, role, is_blocked, created_at")
    .eq("id", id)
    .eq("is_blocked", false)
    .single();

  if (!profile) notFound();

  const { data: comments } = await supabase
    .from("comments")
    .select("id, project_id, content, created_at, projects!inner(name, slug, is_deleted, is_visible)")
    .eq("user_id", profile.id)
    .eq("projects.is_deleted", false)
    .eq("projects.is_visible", true)
    .order("created_at", { ascending: false });

  const displayName = profile.display_name || profile.email;

  return (
    <div className="max-w-3xl space-y-6">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>

      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-3xl">
                {displayName[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
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
                <span className="inline-flex items-center justify-center gap-2 sm:justify-start">
                  <Shield className="h-4 w-4" />
                  Active member
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
            <div className="space-y-3">
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
    </div>
  );
}
