import { getLandingProjectsServer } from "@/lib/server-api";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { LandingContent } from "@/components/project/landing-content";

export default async function LandingPage() {
  const { projects: projectsWithRelations, tags } = await getLandingProjectsServer();

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative border-b bg-dot-pattern">
          <div className="mx-auto max-w-6xl px-4 py-16 text-center sm:py-24">
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="text-gradient">Learn By Building</span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
              Discover real-world open-source projects that need your help.
              Clone, contribute, and grow your skills with hands-on experience.
            </p>
            <div className="gradient-accent-line mx-auto mt-8 max-w-xs" />
          </div>
        </section>

        {/* Projects Section */}
        <section className="mx-auto max-w-6xl px-4 py-12">
          <LandingContent
            projects={projectsWithRelations}
            tags={tags || []}
          />
        </section>
      </main>
      <Footer />
    </div>
  );
}
