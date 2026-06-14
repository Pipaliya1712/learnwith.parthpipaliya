import { ChallengeForm } from "@/components/admin/challenge-form";
import { getAdminProjectsServer } from "@/lib/server-api";

export default async function NewChallengePage() {
  const response = await getAdminProjectsServer({ limit: "100" });
  const projects = response.projects || [];

  return (
    <div className="max-w-6xl mx-auto">
      <ChallengeForm projects={projects} />
    </div>
  );
}

