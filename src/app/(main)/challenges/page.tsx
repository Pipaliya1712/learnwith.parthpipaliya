import { getChallengesServer } from "@/lib/server-api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Clock, Search, ArrowRight, BookOpen, Layers } from "lucide-react";
import Link from "next/link";
import { EmptyState } from "@/components/ui/empty-state";

export default async function ChallengesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  
  // Resolve difficulty param mapping
  // Stitch has: Novice, Adept, Expert
  // DB has: beginner, intermediate, advanced, expert
  const difficultyParam = params.difficulty as string | undefined;
  
  const response = await getChallengesServer(params);
  const items = response.items || [];

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

  const difficultyFilters = [
    { label: "All", value: undefined },
    { label: "Novice", value: "beginner" },
    { label: "Adept", value: "intermediate" },
    { label: "Expert", value: "expert" },
  ];

  return (
    <div className="space-y-10 min-h-screen pb-16">
      
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-glow-cyan text-primary">
            Challenges Explorer
          </h1>
          <p className="text-muted-foreground text-base max-w-2xl">
            Browse real-world engineering tasks. Earn XP by contributing code and passing tests.
          </p>
        </div>

        {/* Search Bar */}
        <form method="GET" action="/challenges" className="relative w-full max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground size-4" />
          <input
            name="search"
            defaultValue={(params.search as string) || ""}
            className="w-full bg-surface-container border border-outline-variant rounded-full pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all placeholder:text-muted-foreground"
            placeholder="Search challenges..."
            type="text"
          />
        </form>
      </div>

      {/* Difficulty Filter Pills */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs font-mono font-semibold uppercase tracking-wider text-muted-foreground mr-2 flex items-center gap-1">
          <Layers className="size-3.5" /> Filter Level:
        </span>
        {difficultyFilters.map((f) => {
          const isSelected = difficultyParam === f.value;
          
          // Build query URL
          const queryParams = new URLSearchParams();
          if (params.search) queryParams.set("search", params.search as string);
          if (f.value) queryParams.set("difficulty", f.value);

          return (
            <Link key={f.label} href={`/challenges?${queryParams.toString()}`}>
              <Badge
                variant={isSelected ? "default" : "outline"}
                className={`cursor-pointer px-4 py-1.5 text-xs font-semibold rounded-full border transition-all active:scale-95 ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-surface-container hover:bg-muted text-muted-foreground border-border hover:border-muted-foreground/30"
                }`}
              >
                {f.label}
              </Badge>
            </Link>
          );
        })}
      </div>

      {/* Challenges Grid */}
      {items.length === 0 ? (
        <EmptyState
          icon={Trophy}
          title="No challenges found"
          description="There are no challenges available matching your selection. Try adjusting your filters."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((challenge: any) => {
            const diffInfo = getDifficultyStyles(challenge.difficulty);
            return (
              <div
                key={challenge.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-border dark:border-outline-variant bg-card dark:bg-[#1b1b23] p-6 hover:border-primary transition-colors duration-300"
              >
                <div className="space-y-4">
                  {/* Badges */}
                  <div className="flex justify-between items-center">
                    <Badge className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 border ${diffInfo.badge}`}>
                      {diffInfo.label}
                    </Badge>
                    <span className="flex items-center gap-1 font-mono text-xs font-bold text-tertiary">
                      <Trophy className="h-3.5 w-3.5 text-tertiary" />
                      {challenge.points} XP
                    </span>
                  </div>

                  {/* Title & Project Name */}
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors line-clamp-2">
                      {challenge.title}
                    </h3>
                    {challenge.project && (
                      <p className="text-xs font-semibold text-secondary">
                        {challenge.project.name}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {challenge.description}
                  </p>
                </div>

                {/* Footer specs & button */}
                <div className="pt-6 mt-6 border-t border-outline-variant/40 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
                    <Clock className="h-3.5 w-3.5" />
                    {challenge.estimated_hours ? `${challenge.estimated_hours} hrs` : "N/A"}
                  </span>
                  
                  <Link href={`/challenges/${challenge.slug}`}>
                    <Button size="sm" variant="outline" className="group/btn gap-1">
                      Start Challenge
                      <ArrowRight className="size-3.5 opacity-70 group-hover/btn:translate-x-0.5 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Feature Banner at bottom */}
      <section className="relative rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/5 via-secondary/5 to-transparent p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
        <div className="space-y-2 flex-1 relative z-10">
          <div className="flex items-center gap-2 text-primary">
            <BookOpen className="size-5" />
            <span className="font-mono text-xs font-bold uppercase tracking-wider">Featured Deep Dive</span>
          </div>
          <h2 className="text-2xl font-bold text-foreground">
            WebAssembly in Production
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl">
            Compile Rust and C++ to high-performance Wasm binaries. Learn sandboxing, shared memory, and multithreading configurations for production execution.
          </p>
        </div>
        <Link href="/challenges">
          <Button variant="gradient" className="shrink-0 relative z-10">
            Unlock Tutorial
          </Button>
        </Link>
        {/* Background visual cue */}
        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10 bg-radial-gradient pointer-events-none"></div>
      </section>

    </div>
  );
}
