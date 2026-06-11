import { ChallengeForm } from "@/components/admin/challenge-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getAdminProjectsServer } from "@/lib/server-api";

export default async function NewChallengePage() {
  const response = await getAdminProjectsServer({ limit: "100" });
  const projects = response.projects || [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/challenges"
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Challenge</h1>
          <p className="text-muted-foreground">
            Add a new learning task to the platform
          </p>
        </div>
      </div>
      
      <div className="p-6 border rounded-xl bg-card">
        <ChallengeForm projects={projects} />
      </div>
    </div>
  );
}
