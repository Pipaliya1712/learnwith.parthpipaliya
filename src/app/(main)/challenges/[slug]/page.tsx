import { getChallengeBySlugServer, getMyChallengesServer } from "@/lib/server-api";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Clock, Trophy, Target, FileText, ExternalLink, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { ClaimButton } from "@/components/challenge/claim-button";
import { AiReviewResult } from "@/components/challenge/ai-review-result";

export default async function ChallengeDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const challenge = await getChallengeBySlugServer(slug);

  if (!challenge) {
    notFound();
  }

  const myChallenges = await getMyChallengesServer();
  const existingClaim = myChallenges.items.find((c: any) => c.challenge?.id === challenge.id);
  const initialStatus = existingClaim ? existingClaim.status : null;

  // Helper for difficulty colors
  const getDifficultyColor = (diff: string) => {
    switch (diff.toLowerCase()) {
      case "beginner":
        return "bg-green-500/10 text-green-500 hover:bg-green-500/20";
      case "intermediate":
        return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20";
      case "advanced":
        return "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20";
      case "expert":
        return "bg-red-500/10 text-red-500 hover:bg-red-500/20";
      default:
        return "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20";
    }
  };

  return (
    <div className="container mx-auto max-w-6xl py-10 px-4 md:px-6">
      {/* Back navigation */}
      <Link
        href="/challenges"
        className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Challenges
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Area */}
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Badge className={getDifficultyColor(challenge.difficulty)} variant="outline">
                {challenge.difficulty.toUpperCase()}
              </Badge>
              {challenge.status === "published" ? (
                <Badge variant="default" className="bg-primary/20 text-primary hover:bg-primary/30 border-none">
                  Active
                </Badge>
              ) : (
                <Badge variant="secondary">{challenge.status}</Badge>
              )}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
              {challenge.title}
            </h1>
            {challenge.project && (
              <p className="text-lg text-muted-foreground flex items-center">
                Part of the <strong className="mx-1 text-foreground">{challenge.project.name}</strong> project
              </p>
            )}
          </div>

          <Separator />

          {/* Description */}
          <div className="space-y-4">
            <div className="flex items-center text-xl font-semibold">
              <FileText className="mr-2 h-5 w-5 text-primary" />
              <h3>Description</h3>
            </div>
            <div className="prose prose-stone dark:prose-invert max-w-none">
              {/* Note: In a real app, use a markdown renderer here */}
              <p className="whitespace-pre-wrap leading-relaxed">{challenge.description}</p>
            </div>
          </div>

          <Separator />

          {/* Acceptance Criteria */}
          {challenge.acceptance_criteria && (
            <div className="space-y-4">
              <div className="flex items-center text-xl font-semibold">
                <Target className="mr-2 h-5 w-5 text-primary" />
                <h3>Acceptance Criteria</h3>
              </div>
              <div className="bg-muted/30 p-6 rounded-xl border">
                <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                  {challenge.acceptance_criteria}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <Card className="border-primary/20 shadow-sm">
            <CardHeader>
              <CardTitle>Challenge Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Trophy className="mr-1.5 h-4 w-4 text-yellow-500" />
                    Points
                  </span>
                  <span className="text-2xl font-bold">{challenge.points}</span>
                </div>
                
                <div className="flex flex-col space-y-1">
                  <span className="text-sm text-muted-foreground flex items-center">
                    <Clock className="mr-1.5 h-4 w-4 text-blue-500" />
                    Est. Time
                  </span>
                  <span className="text-2xl font-bold">
                    {challenge.estimated_hours ? `${challenge.estimated_hours} hrs` : "N/A"}
                  </span>
                </div>
              </div>

              <Separator />

              {/* Tags */}
              {challenge.tags && challenge.tags.length > 0 && (
                <div className="space-y-2">
                  <span className="text-sm text-muted-foreground font-medium">Technologies</span>
                  <div className="flex flex-wrap gap-2">
                    {challenge.tags.map((tag: any) => (
                      <Badge key={tag.id} variant="secondary" className="font-normal">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <ClaimButton challengeId={challenge.id} initialStatus={initialStatus} />
            </CardContent>
          </Card>

          {/* Related Resources Card */}
          {challenge.project && (
            <Card className="bg-muted/20 border-dashed">
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <h4 className="font-semibold flex items-center">
                    Related Resources
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Review the project repository to understand the codebase before starting.
                  </p>
                </div>
                <Link href={`/projects/${challenge.project.slug}`} className="w-full block">
                  <Button variant="outline" className="w-full justify-between group">
                    View Project Context
                    <ExternalLink className="h-4 w-4 ml-2 opacity-50 group-hover:opacity-100 transition-opacity" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  );
}
