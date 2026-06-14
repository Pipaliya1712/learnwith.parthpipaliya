import { Card, CardContent } from "@/components/ui/card";
import { Users, Target, CheckSquare } from "lucide-react";

interface MetricsWidgetProps {
  metrics: {
    total_challenges: number;
    total_users: number;
    total_submissions: number;
  };
}

export function MetricsWidget({ metrics }: MetricsWidgetProps) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardContent className="p-6 flex flex-row items-center justify-between space-y-0">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-muted-foreground">Total Challenges</span>
            <span className="text-3xl font-bold">{metrics.total_challenges}</span>
          </div>
          <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center text-blue-600 dark:text-blue-400">
            <Target className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex flex-row items-center justify-between space-y-0">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-muted-foreground">Platform Users</span>
            <span className="text-3xl font-bold">{metrics.total_users}</span>
          </div>
          <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400">
            <Users className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 flex flex-row items-center justify-between space-y-0">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-muted-foreground">Total Submissions</span>
            <span className="text-3xl font-bold">{metrics.total_submissions}</span>
          </div>
          <div className="h-12 w-12 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center text-purple-600 dark:text-purple-400">
            <CheckSquare className="h-6 w-6" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
