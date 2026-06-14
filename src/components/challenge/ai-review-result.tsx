import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, CheckCircle2, AlertTriangle, FileSearch, ArrowRight } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface AiReviewResultProps {
  score: number;
  feedback: string;
}

export function AiReviewResult({ score, feedback }: AiReviewResultProps) {
  const getScoreColor = (s: number) => {
    if (s >= 90) return "text-green-500 bg-green-500/10 border-green-500/20";
    if (s >= 75) return "text-yellow-500 bg-yellow-500/10 border-yellow-500/20";
    return "text-red-500 bg-red-500/10 border-red-500/20";
  };

  const scoreColor = getScoreColor(score);

  return (
    <Card className="border-indigo-500/20 shadow-lg shadow-indigo-500/5 overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-transparent p-4 border-b border-indigo-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-500" />
          <h3 className="font-semibold text-lg flex items-center">
            AI Code Review
            <Badge variant="secondary" className="ml-3 text-xs bg-indigo-500/20 text-indigo-700 hover:bg-indigo-500/30">
              Beta
            </Badge>
          </h3>
        </div>
        
        <div className={`flex items-center gap-3 px-4 py-2 rounded-full border ${scoreColor}`}>
          <FileSearch className="w-4 h-4" />
          <div className="font-bold">
            Score: <span className="text-xl ml-1">{score}</span>
            <span className="text-xs opacity-70 ml-0.5">/100</span>
          </div>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="
          [&>h3]:text-lg [&>h3]:font-semibold [&>h3]:mt-4 [&>h3]:mb-2 [&>h3]:flex [&>h3]:items-center
          [&>ul]:list-disc [&>ul]:pl-5 [&>ul]:mt-2 [&>ul]:mb-4 [&>li]:mb-1 [&>li]:text-sm [&>li]:text-muted-foreground
          [&>h3:first-of-type]:text-green-500 [&>h3:first-of-type]:mt-0
          [&>h3:last-of-type]:text-yellow-500 [&>h3:last-of-type]:mt-6
        ">
          <ReactMarkdown>{feedback}</ReactMarkdown>
        </div>
        
        <div className="mt-6 pt-6 border-t border-dashed flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <p className="text-muted-foreground">
            This is an automated first-pass review. An admin will finalize your result shortly.
          </p>
          <div className="flex items-center text-indigo-500 font-medium">
            Pending Admin Approval <ArrowRight className="w-4 h-4 ml-2 animate-pulse" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
