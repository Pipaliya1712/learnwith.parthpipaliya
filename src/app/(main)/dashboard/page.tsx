import { getMyProgressServer, getMySubmissionsServer, getCurrentUserServer } from "@/lib/server-api";
import { redirect } from "next/navigation";
import { GalaxyShader } from "@/components/visuals/galaxy-shader";
import { SequenceShader } from "@/components/visuals/sequence-shader";
import { CrystalModel } from "@/components/visuals/crystal-model";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
  Trophy,
  Activity,
  Diamond,
  Terminal,
  Database,
  Palette,
  Bolt,
  Info,
  Flame,
  Sparkles,
  Stars,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

function calculateActiveStreak(submissions: any[]) {
  if (!submissions || submissions.length === 0) return 0;

  // Filter approved or submitted
  const activeSubs = submissions.filter(
    (s) => s.status === "approved" || s.status === "submitted"
  );
  if (activeSubs.length === 0) return 0;

  const dates = Array.from(
    new Set(
      activeSubs.map((s) => {
        const d = new Date(s.updated_at || s.created_at);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
          d.getDate()
        ).padStart(2, "0")}`;
      })
    )
  )
    .sort()
    .reverse() as string[];

  if (dates.length === 0) return 0;

  const todayStr = new Date().toISOString().split("T")[0];
  const yesterdayStr = new Date(Date.now() - 86400000).toISOString().split("T")[0];

  // If the last submission is not today or yesterday, streak is broken
  if (dates[0] !== todayStr && dates[0] !== yesterdayStr) {
    return 0;
  }

  let streak = 1;
  let currentRef = new Date(dates[0]);

  for (let i = 1; i < dates.length; i++) {
    const diffTime = currentRef.getTime() - new Date(dates[i]).getTime();
    const diffDays = Math.round(diffTime / 86400000);

    if (diffDays === 1) {
      streak++;
      currentRef = new Date(dates[i]);
    } else if (diffDays > 1) {
      break;
    }
  }

  return streak;
}

const GEM_RANKS = [
  { name: "Quartz", threshold: 0, nextThreshold: 5000 },
  { name: "Amethyst", threshold: 5000, nextThreshold: 10000 },
  { name: "Citrine", threshold: 10000, nextThreshold: 20000 },
  { name: "Garnet", threshold: 20000, nextThreshold: 40000 },
  { name: "Peridot", threshold: 40000, nextThreshold: 60000 },
  { name: "Aquamarine", threshold: 60000, nextThreshold: 80000 },
  { name: "Topaz", threshold: 80000, nextThreshold: 100000 },
  { name: "Emerald", threshold: 100000, nextThreshold: 150000 },
  { name: "Sapphire", threshold: 150000, nextThreshold: 200000 },
  { name: "Diamond", threshold: 200000, nextThreshold: 500000 },
  { name: "Ruby", threshold: 500000, nextThreshold: 500000 },
];

function getMilestoneInfo(points: number) {
  let currentRank = GEM_RANKS[0];
  let nextRank = GEM_RANKS[1];

  for (let i = 0; i < GEM_RANKS.length; i++) {
    if (points >= GEM_RANKS[i].threshold) {
      currentRank = GEM_RANKS[i];
      nextRank = GEM_RANKS[i + 1] || GEM_RANKS[i];
    } else {
      break;
    }
  }

  const prevPoints = currentRank.threshold;
  const nextPoints = currentRank.nextThreshold;
  const currentLevel = currentRank.name;
  const nextLevel = currentRank === nextRank ? "MAX" : nextRank.name;

  let percent = 100;
  if (currentRank !== nextRank) {
    const range = nextPoints - prevPoints;
    const earned = points - prevPoints;
    percent = Math.min(100, Math.max(0, Math.round((earned / range) * 100)));
  }

  return { prevPoints, nextPoints, currentLevel, nextLevel, percent };
}

export default async function DashboardPage() {
  const user = await getCurrentUserServer();
  if (!user) {
    redirect("/login");
  }

  const progress = await getMyProgressServer();
  const submissionsData = await getMySubmissionsServer({ limit: "50" });
  const submissions = submissionsData.items || [];

  const streak = calculateActiveStreak(submissions);
  const milestone = getMilestoneInfo(progress.points);
  
  // Daily Momentum: calculated as percentage of progress to next level
  const momentum = milestone.percent;

  // Filter approved or submitted achievements
  const achievements = submissions.filter(
    (s: any) => s.status === "approved" || s.status === "submitted"
  );

  return (
    <div className="space-y-8 min-h-screen pb-12">
      {/* Hero Section with WebGL background */}
      <section className="relative h-[480px] w-full rounded-2xl overflow-hidden bg-[#0a0a0f] border border-border p-10 flex flex-col justify-between dark">
        <GalaxyShader />
        
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none p-8 text-center z-10">
          <h2 className="font-sans text-4xl font-bold text-glow-cyan text-primary tracking-tighter mb-2 uppercase">
            Crystal Journey
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl">
            Every day of progress forms your learning constellation.
          </p>

          <div className="mt-12 w-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center pointer-events-auto">
            {/* Left Col: Streak */}
            <div className="text-left space-y-1">
              <div className="flex items-center gap-2">
                <Flame className="text-orange-500 fill-orange-500 w-9 h-9" />
                <span className="text-3xl font-extrabold text-foreground">{streak} Days</span>
              </div>
              <p className="text-muted-foreground text-sm">Consistency builds mastery</p>
            </div>

            {/* Right Col: Level */}
            <div className="text-right space-y-2">
              <div className="flex flex-col items-end">
                <span className="text-3xl font-extrabold text-primary uppercase">{milestone.currentLevel}</span>
                <Badge variant="secondary" className="bg-secondary/20 text-secondary-foreground mt-1">
                  +{progress.points} XP
                </Badge>
              </div>
              <div className="w-full max-w-[200px] ml-auto space-y-1">
                <div className="flex justify-between text-[10px] font-semibold text-muted-foreground uppercase">
                  <span>Next: {milestone.nextLevel}</span>
                  <span>{milestone.percent}%</span>
                </div>
                <div className="w-full h-1.5 bg-background/60 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary"
                    style={{ width: `${milestone.percent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left column: Metrics & Feed */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Metrics grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            {/* Daily Momentum */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-4">
                Daily Momentum
              </span>
              <div className="relative w-24 h-24 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    className="text-muted/20"
                    cx="48"
                    cy="48"
                    fill="transparent"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <circle
                    className="text-primary transition-all duration-500"
                    cx="48"
                    cy="48"
                    fill="transparent"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="6"
                    strokeDasharray="251.2"
                    strokeDashoffset={251.2 - (251.2 * momentum) / 100}
                  />
                </svg>
                <div className="absolute text-xl font-bold text-primary">{momentum}%</div>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Level Milestone Progress</p>
            </div>

            {/* Current Streak */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center justify-center">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-4">
                Current Streak
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Flame className="text-orange-500 fill-orange-500 w-10 h-10 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                <span className="text-3xl font-bold text-orange-500">{streak}</span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">Days consistent</p>
            </div>

            {/* Crystal Level */}
            <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center justify-center">
              <span className="text-xs font-semibold tracking-wider text-muted-foreground uppercase mb-4">
                Crystal Level
              </span>
              <div className="flex items-center gap-2 mt-1">
                <Diamond className="text-primary w-9 h-9 fill-primary/10" />
                <span className="text-2xl font-bold text-primary uppercase">{milestone.currentLevel}</span>
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                {progress.points >= 150000 ? "Master Architect" : "Evolving Developer"}
              </p>
            </div>

          </div>

          {/* Galaxy Explorer Feed */}
          <div className="glass-panel p-8 rounded-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Stars className="text-primary w-5 h-5" />
                Galaxy Explorer Feed
              </h3>
              <Link href="/my-journey" className="text-primary text-xs hover:underline">
                View All Nodes
              </Link>
            </div>

            <div className="space-y-4">
              {achievements.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground text-sm border border-dashed rounded-xl">
                  No achievement nodes unlocked. Complete a challenge to populate your feed!
                </div>
              ) : (
                achievements.slice(0, 5).map((sub: any) => {
                  const isApproved = sub.status === "approved";
                  return (
                    <div
                      key={sub.id}
                      className="flex items-center gap-4 p-4 hover:bg-muted/40 rounded-xl transition-all border border-transparent hover:border-primary/10"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
                        {isApproved ? (
                          <Terminal className="text-primary w-5 h-5" />
                        ) : (
                          <Activity className="text-amber-500 w-5 h-5" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-bold truncate">
                          {sub.challenge?.title || "Challenge Node"}
                        </h4>
                        <p className="text-xs text-muted-foreground truncate">
                          {isApproved
                            ? "Successfully verified and approved."
                            : "Solution submitted and pending review."}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-primary text-xs font-mono font-bold">
                          +{sub.challenge?.points || 0} XP
                        </span>
                        <p className="text-[10px] text-muted-foreground opacity-60">
                          {formatDistanceToNow(new Date(sub.updated_at || sub.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right column: Level Evolution & Three.js Crystal */}
        <div className="lg:col-span-4 space-y-8">
          
          <div className="glass-panel p-8 rounded-2xl flex flex-col h-full">
            <h3 className="text-lg font-bold text-foreground mb-4">Growth Trajectory</h3>
            
            <div className="relative flex-1 min-h-[300px] flex items-center justify-center rounded-xl bg-background/50 border overflow-hidden">
              <CrystalModel points={progress.points} />
              
              <div className="absolute bottom-4 left-4 right-4 bg-background/85 backdrop-blur-md p-4 rounded-lg border border-primary/10">
                <div className="flex justify-between items-center mb-1 text-[10px] font-semibold text-primary uppercase">
                  <span>Crystal Growth</span>
                  <span>
                    {progress.points} / {milestone.nextPoints} XP
                  </span>
                </div>
                <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary shadow-[0_0_8px_rgba(192,193,255,0.5)]"
                    style={{ width: `${milestone.percent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Your crystal node is resonating at{" "}
                <span className="text-primary font-bold">{milestone.percent}% capacity</span>. Complete more
                challenges to reach the next level.
              </p>
              
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex items-center gap-3">
                <Sparkles className="text-primary w-5 h-5" />
                <div>
                  <p className="text-xs font-bold">Next Milestone</p>
                  <p className="text-[10px] text-muted-foreground uppercase">
                    Level {milestone.nextLevel} State
                  </p>
                </div>
              </div>

              <Link href="/challenges" className="block w-full">
                <Button className="w-full" variant="xp">
                  Explore Challenges
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
