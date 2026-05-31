import { createAdminClient } from "@/lib/supabase/admin";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { format } from "date-fns";
import { CheckCircle2, Mail, Shield, Calendar, MessageSquare } from "lucide-react";
import { OwnProfileComments, type OwnProfileComment } from "@/components/profile/own-profile-comments";

type CommentRow = {
  id: string;
  content: string;
  created_at: string;
  deleted_at: string | null;
  projects: { name: string; slug: string } | { name: string; slug: string }[] | null;
};

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const supabase = createAdminClient();
  const [{ data: profile }, commentsWithDeleted] = await Promise.all([
    supabase
      .from("profiles")
      .select("*")
      .eq("id", session.userId)
      .maybeSingle(),
    supabase
      .from("comments")
      .select("id, content, created_at, deleted_at, projects(name, slug)")
      .eq("user_id", session.userId)
      .order("created_at", { ascending: false }),
  ]);

  const commentsRes = commentsWithDeleted.error
    ? await supabase
        .from("comments")
        .select("id, content, created_at, projects(name, slug)")
        .eq("user_id", session.userId)
        .order("created_at", { ascending: false })
    : commentsWithDeleted;

  if (!profile) redirect("/login");

  const profileComments: OwnProfileComment[] = ((commentsRes.data || []) as CommentRow[]).map((comment) => ({
    id: comment.id,
    content: comment.content,
    created_at: comment.created_at,
    deleted_at: "deleted_at" in comment ? comment.deleted_at : null,
    projects: Array.isArray(comment.projects) ? comment.projects[0] : comment.projects,
  }));

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">View your account details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
            <Avatar className="h-24 w-24">
              <AvatarFallback className="text-3xl">
                {(profile.display_name || profile.email)[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-4 text-center sm:text-left">
              <div>
                <p className="font-bold text-3xl">
                  {profile.display_name || "No username set"}
                </p>
              </div>
              
              <div className="flex flex-col items-center sm:items-start gap-3">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{profile.email}</span>
                  {profile.email_verified ? (
                    <Badge variant="secondary" className="gap-1 text-xs">
                      <CheckCircle2 className="h-3 w-3" />
                      Verified
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-xs">
                      Unverified
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Shield className="h-4 w-4" />
                  <span className="capitalize">{profile.role}</span>
                </div>

                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Joined {format(new Date(profile.created_at), "MMMM d, yyyy")}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Your Comments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OwnProfileComments comments={profileComments} />
        </CardContent>
      </Card>
    </div>
  );
}
