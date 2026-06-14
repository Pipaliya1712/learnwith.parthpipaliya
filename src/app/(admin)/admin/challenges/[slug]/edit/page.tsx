import { ChallengeForm } from "@/components/admin/challenge-form";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getChallengeBySlugServer, getAdminProjectsServer } from "@/lib/server-api";
import { notFound } from "next/navigation";

export default async function EditChallengePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // Fetch both the challenge and the available projects
  const [challenge, projectsResponse] = await Promise.all([
    getChallengeBySlugServer(slug),
    getAdminProjectsServer({ limit: "100" })
  ]);
  
  const projects = projectsResponse.projects || [];

  if (!challenge) {
    notFound();
  }

  // Format the project_id correctly for the form
  const initialData = {
    ...challenge,
    project_id: challenge.project?.id || "",
  };

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
          <h1 className="text-2xl font-bold tracking-tight">Edit Challenge</h1>
          <p className="text-muted-foreground">
            {challenge.title}
          </p>
        </div>
      </div>
      
      <div className="p-6 border rounded-xl bg-card">
        <ChallengeForm initialData={initialData} projects={projects} />
      </div>
    </div>
  );
}
