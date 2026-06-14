import { getUserProfileServer } from "@/lib/server-api";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AvatarModal } from "@/components/ui/avatar-modal";
import { format } from "date-fns";
import { CheckCircle2, Mail, Shield, Calendar, MessageSquare } from "lucide-react";
import { OwnProfileComments, type OwnProfileComment } from "@/components/profile/own-profile-comments";
import { ContributionGraph } from "@/components/profile/contribution-graph";

type CommentRow = {
  id: string;
  content: string;
  created_at: string;
  updated_at: string | null;
  deleted_at: string | null;
  projects: { name: string; slug: string } | null;
};

export default async function ProfilePage() {
  const session = await getSession();
  if (!session) redirect("/login");

  const data = await getUserProfileServer(session.userId);
  if (!data || !data.user) redirect("/login");
  
  const { user: profile, comments, progress } = data;
  const profileComments: OwnProfileComment[] = ((comments || []) as CommentRow[]).map((comment) => ({
    id: comment.id,
    content: comment.content,
    created_at: comment.created_at,
    updated_at: "updated_at" in comment ? comment.updated_at : null,
    deleted_at: "deleted_at" in comment ? comment.deleted_at : null,
    projects: comment.projects,
  }));

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">View your account details</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                <AvatarModal
                  src={profile.avatar_url}
                  fallback={(profile.display_name || profile.email)[0].toUpperCase()}
                  className="h-24 w-24 text-3xl"
                />
                <div className="space-y-4 text-center sm:text-left">
                  <div>
                    <p className="font-bold text-3xl">
                      {profile.display_name || "No username set"}
                    </p>
                  </div>
                  
                  <div className="flex flex-col items-center sm:items-start gap-3">
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

          <ContributionGraph challenges={data.challenges as any} />

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Your Comments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                <OwnProfileComments comments={profileComments} />
              </div>
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
