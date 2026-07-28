import { useState } from "react";
import { motion } from "framer-motion";
import {
  Clock, Target, Award, Zap, Play, Loader2, RotateCcw
} from "lucide-react";
import { FunfinityIcon } from "@/components/brand/FunfinityLogo";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useQuizzes, useQuizSubmissions } from "@/hooks/use-quizzes";
import { Skeleton } from "@/components/ui/skeleton";

export default function Quizzes() {
  const [tab, setTab] = useState<"quizzes" | "practice" | "results">("quizzes");
  const { data: quizzes, isLoading } = useQuizzes();
  const { data: submissions } = useQuizSubmissions();

  const getQuizBestScore = (quizId: string) => {
    const qSubs = submissions?.filter((s: any) => s.quiz_id === quizId) || [];
    if (!qSubs.length) return null;
    return Math.max(...qSubs.map((s: any) => (s.max_score ? (s.score / s.max_score) * 100 : s.score || 0)));
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
          Quizzes & <span className="text-gradient-brand">Tests</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Test your understanding with adaptive assessments</p>
      </motion.div>

      <div className="flex gap-2" role="tablist">
        {[
          { key: "quizzes", label: "Quizzes", icon: Award },
          { key: "practice", label: "Practice Tests", icon: Target },
          { key: "results", label: "Results", icon: Zap },
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key as typeof tab)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all",
              tab === key ? "glass-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="w-4 h-4" />
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
      ) : tab === "quizzes" ? (
        <div className="grid grid-cols-1 gap-4">
          <div className="platform-card p-16 text-center border-dashed">
            <Target className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <p className="text-foreground font-semibold text-lg">No courses enrolled</p>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              You are currently not enrolled in any courses, so there are no quizzes, assessments, or practice materials available right now. Please enroll in a course to access these features.
            </p>
          </div>
        </div>
      ) : tab === "results" ? (
        <div className="space-y-4">
          {submissions?.length ? (
            <div className="space-y-2">
              {submissions.map((sub: any) => (
                <div key={sub.id} className="platform-card p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm">{(sub as any).quizzes?.title || "Quiz"}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(sub.submitted_at).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="font-bold text-foreground">
                    {sub.score}/{sub.max_score}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Complete quizzes to see your results here.</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-8">Practice tests coming soon!</p>
      )}
    </div>
  );
}
