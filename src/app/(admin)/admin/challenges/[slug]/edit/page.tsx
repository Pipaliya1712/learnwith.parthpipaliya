import { ChallengeForm } from "@/components/admin/challenge-form";
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
    <div className="max-w-6xl mx-auto">
      <ChallengeForm initialData={initialData} projects={projects} />
    </div>
  );
}

