import { getChallengeBySlugServer, getMyChallengesServer } from "@/lib/server-api";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Clock, Trophy, Target, ArrowLeft, Terminal, ShieldAlert, Sparkles, Code2, Cpu } from "lucide-react";
import Link from "next/link";
import { ClaimButton } from "@/components/challenge/claim-button";

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

  const getDifficultyStyles = (diff: string) => {
    switch (diff.toLowerCase()) {
      case "beginner":
        return {
          label: "Novice",
          badge: "bg-green-500/10 text-green-500 border-green-500/20",
        };
      case "intermediate":
      case "advanced":
        return {
          label: "Adept",
          badge: "bg-orange-500/10 text-orange-500 border-orange-500/20",
        };
      case "expert":
        return {
          label: "Expert",
          badge: "bg-violet-500/10 text-violet-500 border-violet-500/20",
        };
      default:
        return {
          label: diff,
          badge: "bg-muted text-muted-foreground border-muted-foreground/20",
        };
    }
  };

  const diffInfo = getDifficultyStyles(challenge.difficulty);

  // Parse acceptance criteria into a checklist
  const criteriaList = challenge.acceptance_criteria
    ? challenge.acceptance_criteria
        .split(/\r?\n/)
        .map((c: string) => c.replace(/^-\s*|^\*\s*|^\[\s*\]\s*/, "").trim())
        .filter((c: string) => c.length > 0)
    : [];

  // Generate dynamic config specs based on difficulty and technology
  const firstTag = challenge.tags?.[0]?.name?.toLowerCase() || "";
  const isRust = firstTag.includes("rust") || challenge.title.toLowerCase().includes("rust");
  const isPython = firstTag.includes("python") || challenge.title.toLowerCase().includes("python");
  
  const envSpecs = {
    language: isRust ? "rust" : isPython ? "python" : "typescript",
    version: isRust ? "1.72" : isPython ? "3.11" : "node-20",
    memory_limit: "256MB",
    test_suite: isRust
      ? "cargo test --release"
      : isPython
      ? "pytest tests/"
      : "npm run test",
    entrypoint: isRust ? "main.rs" : isPython ? "main.py" : "index.ts",
  };

  return (
    <div className="space-y-8 min-h-screen pb-16">
      
      {/* Breadcrumb Navigation */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground uppercase tracking-wider">
          <Link href="/challenges" className="hover:text-primary transition-colors">
            Challenges
          </Link>
          <span>/</span>
          <span className="text-primary font-bold">Details</span>
        </nav>
        
        <Link href="/challenges">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3.5" />
            Back to Explorer
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Main Details (Left Column) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Header Info */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 border ${diffInfo.badge}`}>
                {diffInfo.label}
              </Badge>
              <Badge variant="outline" className="font-mono text-[10px] uppercase font-bold px-2 py-0.5 border-primary/20 text-primary">
                {challenge.estimated_hours ? `${challenge.estimated_hours} hrs` : "N/A"} Est. Time
              </Badge>
              <span className="flex items-center gap-1 font-mono text-xs font-bold text-tertiary ml-auto md:ml-0">
                <Trophy className="h-4 w-4 text-tertiary" />
                {challenge.points} XP
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-foreground">
              {challenge.title}
            </h1>
            {challenge.project && (
              <p className="text-sm text-muted-foreground font-semibold">
                Part of:{" "}
                <Link href={`/projects`} className="text-secondary hover:underline">
                  {challenge.project.name}
                </Link>
              </p>
            )}
          </div>

          <hr className="border-outline-variant/40" />

          {/* Description Section */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Code2 className="size-5 text-primary" />
              Challenge Statement
            </h3>
            <div className="prose prose-stone dark:prose-invert max-w-none text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
              {challenge.description}
            </div>
          </section>

          {/* Acceptance Criteria Checklist */}
          {criteriaList.length > 0 && (
            <section className="space-y-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Target className="size-5 text-primary" />
                Acceptance Criteria
              </h3>
              <div className="bg-[#1b1b23] border border-outline-variant rounded-xl p-6 space-y-3">
                {criteriaList.map((criteria: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      disabled
                      checked={initialStatus === "approved"}
                      className="mt-0.5 size-4 rounded border-outline bg-background text-primary focus:ring-primary focus:ring-1"
                    />
                    <span>{criteria}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Environmental Specs Box */}
          <section className="space-y-4">
            <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
              <Cpu className="size-5 text-primary" />
              Runtime Environment
            </h3>
            <div className="bg-[#0d0d15] rounded-xl border border-outline-variant overflow-hidden">
              <div className="flex items-center px-4 py-2 bg-[#1b1b23] border-b border-outline-variant gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
                  <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
                </div>
                <span className="font-mono text-xs text-muted-foreground">environment_config.json</span>
              </div>
              <pre className="p-4 font-mono text-xs text-primary overflow-x-auto leading-relaxed">
                <code>{JSON.stringify(envSpecs, null, 2)}</code>
              </pre>
            </div>
          </section>

        </div>

        {/* Sidebar panels (Right Column) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Claim/Progress Card */}
          <Card className="glass-panel border-primary/20">
            <CardContent className="pt-6 space-y-6">
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono">
                  Your Progress
                </h4>
                <p className="text-xs text-muted-foreground">
                  Claim this challenge to download the workspace template and begin your implementation.
                </p>
              </div>

              <ClaimButton
                challengeId={challenge.id}
                challengeSlug={challenge.slug}
                initialStatus={initialStatus}
              />
            </CardContent>
          </Card>

          {/* System Specs Card */}
          <Card className="border-outline-variant bg-[#1b1b23]">
            <CardContent className="pt-6 space-y-4">
              <h4 className="text-sm font-bold text-foreground uppercase tracking-wider font-mono flex items-center gap-2">
                <Terminal className="size-4 text-primary" />
                System Specs
              </h4>
              <div className="space-y-3 text-xs text-muted-foreground">
                <div className="flex justify-between border-b border-outline-variant/30 pb-2">
                  <span>Runner OS</span>
                  <span className="font-semibold text-foreground">Alpine-Linux-3.18</span>
                </div>
                <div className="flex justify-between border-b border-outline-variant/30 pb-2">
                  <span>Execution Limit</span>
                  <span className="font-semibold text-foreground">60 Seconds</span>
                </div>
                <div className="flex justify-between pb-2">
                  <span>Network Access</span>
                  <span className="font-semibold text-foreground">Restricted</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Insights Card */}
          <Card className="border-dashed border-primary/20 bg-primary/5">
            <CardContent className="pt-6 space-y-3">
              <h4 className="text-sm font-bold text-primary flex items-center gap-2">
                <Sparkles className="size-4 text-primary" />
                AI Tutor Insights
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Our AI model automatically reviews your pull request code for concurrent deadlocks, memory safety violations, performance spikes, and SQL injection risks upon submission.
              </p>
            </CardContent>
          </Card>

        </div>

      </div>

    </div>
  );
}
