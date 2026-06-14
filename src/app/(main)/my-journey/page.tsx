import { getMyProgressServer, getMyChallengesServer, getCurrentUserServer } from "@/lib/server-api";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Clock, Trophy, CheckCircle2, Flame, MapPin, ArrowRight, GitPullRequest, ShieldAlert, Sparkles, BookOpen } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default async function MyJourneyPage() {
  const currentUser = await getCurrentUserServer();
  if (!currentUser) {
    redirect("/login");
  }

  const progress = await getMyProgressServer();
  const claimsData = await getMyChallengesServer();
  const items = claimsData.items || [];

  // Categorize challenges
  const activeClaims = items.filter((item: any) => item.status !== "approved");
  const completedClaims = items.filter((item: any) => item.status === "approved");

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "in_progress":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20 font-bold uppercase tracking-wide text-[10px]">Claimed</Badge>;
      case "submitted":
        return <Badge className="bg-amber-500/10 text-amber-500 border-amber-500/20 font-bold uppercase tracking-wide text-[10px]">Under Review</Badge>;
      case "rejected":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20 font-bold uppercase tracking-wide text-[10px]">Changes Requested</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getInitials = (name: string | null | undefined) => {
    if (!name) return "U";
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-10 min-h-screen pb-16">
      
      {/* Header Section */}
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-glow-cyan text-primary">
          My Journey
        </h1>
        <p className="text-muted-foreground text-base max-w-2xl">
          Track your progress, milestones, claimed challenges, and completed technical skills.
        </p>
      </div>

      {/* Grid: User Profile Summary & Active Claims */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Progress Card */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="glass-panel border-primary/20">
            <CardContent className="pt-6 space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14 border border-primary">
                  <AvatarImage src={currentUser?.avatar_url || ""} />
                  <AvatarFallback className="text-sm font-bold">
                    {getInitials(currentUser?.display_name || currentUser?.email)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-extrabold text-foreground">
                    {currentUser?.display_name || "You"}
                  </h3>
                  <p className="text-xs text-muted-foreground font-semibold">
                    Level {progress.level} Architect
                  </p>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-outline-variant/30 text-xs text-muted-foreground">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><Trophy className="size-4 text-tertiary" /> Total Score</span>
                  <span className="font-bold text-foreground font-mono text-sm">{progress.points} XP</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1.5"><CheckCircle2 className="size-4 text-primary" /> Solved Challenges</span>
                  <span className="font-bold text-foreground font-mono text-sm">{progress.solved_challenges}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Active Challenges */}
        <div className="lg:col-span-8 space-y-6">
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Clock className="size-5 text-primary" />
            Active Challenges
          </h3>

          {activeClaims.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm border border-dashed rounded-xl bg-[#1b1b23]/30">
              No active challenges. Explore the Challenges tab to claim and start your first task!
            </div>
          ) : (
            <div className="space-y-4">
              {activeClaims.map((claim: any) => (
                <div
                  key={claim.id}
                  className="bg-[#1b1b23] border border-outline-variant rounded-xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-primary/50 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2.5">
                      {getStatusBadge(claim.status)}
                      {claim.challenge?.project?.name && (
                        <span className="text-xs font-semibold text-secondary">
                          {claim.challenge.project.name}
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-bold text-foreground">
                      {claim.challenge?.title || "Challenge Claim"}
                    </h4>
                    {claim.github_pr_url && (
                      <a
                        href={claim.github_pr_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-primary font-mono flex items-center gap-1 hover:underline"
                      >
                        <GitPullRequest className="size-3" />
                        Pull Request Link
                      </a>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 self-end md:self-auto shrink-0">
                    <span className="font-mono text-xs font-bold text-tertiary">
                      +{claim.challenge?.points || 0} XP
                    </span>
                    
                    <Link href={`/challenges/${claim.challenge?.slug}`}>
                      <Button size="sm" variant="outline" className="gap-1.5 text-xs">
                        {claim.status === "in_progress" ? "Continue Work" : "View Details"}
                        <ArrowRight className="size-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Completed Milestones Timeline */}
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
          <MapPin className="size-5 text-primary" />
          Completed Milestones
        </h3>

        {completedClaims.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm border border-dashed rounded-xl bg-[#1b1b23]/30">
            No completed milestones yet. Complete a claimed challenge and get approved to build your timeline!
          </div>
        ) : (
          <div className="relative border-l border-outline-variant/60 ml-3 pl-6 space-y-8">
            {completedClaims.map((claim: any) => (
              <div key={claim.id} className="relative group">
                {/* Timeline Dot */}
                <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-primary border-4 border-[#13131b] shadow-[0_0_8px_rgba(192,193,255,0.6)]" />
                
                <div className="bg-[#1b1b23] border border-outline-variant/60 hover:border-primary/40 rounded-xl p-5 space-y-3 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono text-muted-foreground">
                        {format(new Date(claim.updated_at || claim.created_at), "MMMM d, yyyy")}
                      </span>
                      <h4 className="text-base font-bold text-foreground mt-0.5">
                        {claim.challenge?.title || "Challenge Node Unlocked"}
                      </h4>
                      {claim.challenge?.project?.name && (
                        <p className="text-xs font-semibold text-secondary">
                          {claim.challenge.project.name}
                        </p>
                      )}
                    </div>
                    
                    <span className="bg-primary/10 text-primary px-2 py-1 rounded text-xs font-mono font-bold">
                      +{claim.challenge?.points || 0} XP
                    </span>
                  </div>

                  {claim.ai_feedback && (
                    <div className="p-3 bg-[#0d0d15] rounded-lg border border-outline-variant/40 space-y-1.5">
                      <div className="flex items-center gap-1 text-[10px] font-bold text-primary uppercase font-mono tracking-wider">
                        <Sparkles className="size-3" />
                        AI Verification Report (Score: {claim.ai_score}/100)
                      </div>
                      <p className="text-xs text-muted-foreground font-mono leading-relaxed">
                        {claim.ai_feedback}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
