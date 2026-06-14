import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy, Star, Target, Zap } from "lucide-react";
import { getMyProgressServer } from "@/lib/server-api";

export async function ProgressWidget() {
  const progress = await getMyProgressServer();

  return (
    <Card className="bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 border-primary/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Developer Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex flex-col items-center justify-center p-3 bg-secondary/30 rounded-lg">
            <Trophy className="h-6 w-6 text-yellow-500 mb-2" />
            <span className="text-2xl font-bold">{progress.level}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Version</span>
          </div>
          
          <div className="flex flex-col items-center justify-center p-3 bg-secondary/30 rounded-lg">
            <Star className="h-6 w-6 text-blue-500 mb-2" />
            <span className="text-2xl font-bold">{progress.points}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Points</span>
          </div>
          
          <div className="flex flex-col items-center justify-center p-3 bg-secondary/30 rounded-lg">
            <Target className="h-6 w-6 text-green-500 mb-2" />
            <span className="text-2xl font-bold">{progress.solved_challenges}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Solved</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
