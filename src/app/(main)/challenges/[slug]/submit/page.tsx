import { getChallengeBySlugServer } from "@/lib/server-api";
import { notFound } from "next/navigation";
import { SubmissionForm } from "@/components/challenge/submission-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function ChallengeSubmitPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const challenge = await getChallengeBySlugServer(slug);

  if (!challenge) {
    notFound();
  }

  return (
    <div className="space-y-8 min-h-screen pb-16">
      
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-1.5 font-mono text-xs text-muted-foreground uppercase tracking-wider">
          <Link href="/challenges" className="hover:text-primary transition-colors">
            Challenges
          </Link>
          <span>/</span>
          <Link href={`/challenges/${slug}`} className="hover:text-primary transition-colors">
            {challenge.title}
          </Link>
          <span>/</span>
          <span className="text-primary font-bold">Submit Solution</span>
        </nav>
        
        <Link href={`/challenges/${slug}`}>
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-3.5" />
            Back to Details
          </Button>
        </Link>
      </div>

      <SubmissionForm
        challengeId={challenge.id}
        challengeSlug={challenge.slug}
        challengeTitle={challenge.title}
      />
      
    </div>
  );
}
