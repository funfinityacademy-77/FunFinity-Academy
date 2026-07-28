import { motion } from "framer-motion";
import { BarChart3, Clock, BookOpen, Target, Flame, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useEnrollments } from "@/hooks/use-courses";
import { Skeleton } from "@/components/ui/skeleton";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

export default function Analytics() {
  const { user } = useAuth();

  const { data: enrollments, isLoading: loadingEnroll } = useEnrollments();
  const { data: quizSubs, isLoading: loadingQuiz } = useQuery({
    queryKey: ["quiz-subs-analytics", user?.id],
    queryFn: async () => {
      const data = await apiClient.get<any[]>(`/api/users/${user!.id}/quiz-attempts`);
      return data;
    },
    enabled: !!user,
  });

  const { data: dnaProfile, isLoading: loadingDNA } = useQuery({
    queryKey: ["learning-dna-analytics", user?.id],
    queryFn: async () => {
      const data = await apiClient.get<any | null>(`/api/users/${user!.id}/learning-dna`);
      return data;
    },
    enabled: !!user,
  });

  const isLoading = loadingEnroll || loadingQuiz || loadingDNA;

  const completedCourses = (enrollments || []).filter((e: any) => e.completed).length;
  const avgScore = (quizSubs || []).length > 0
    ? Math.round((quizSubs || []).reduce((sum, s) => sum + (Number(s.score) || 0), 0) / (quizSubs || []).length)
    : 0;
  const totalXP = (quizSubs || []).reduce((sum, s) => sum + (Number(s.score) || 0), 0) * 10;

  const stats = [
    { label: "Courses Enrolled", value: String((enrollments || []).length), icon: BookOpen, color: "cyan" },
    { label: "Courses Completed", value: String(completedCourses), icon: BookOpen, color: "orange" },
    { label: "Average Score", value: `${avgScore}%`, icon: Target, color: "magenta" },
    { label: "Total XP", value: String(totalXP), icon: Flame, color: "cyan" },
  ];

  // Subject breakdown from enrollments
  const subjectMap: Record<string, number> = {};
  (enrollments || []).forEach((e: any) => {
    const subj = e.courses?.subject || "Other";
    subjectMap[subj] = (subjectMap[subj] || 0) + 1;
  });
  const total = (enrollments || []).length || 1;
  const subjectBreakdown = Object.entries(subjectMap).map(([subject, count], i) => ({
    subject,
    percentage: Math.round((count / total) * 100),
    color: ["cyan", "orange", "magenta"][i % 3],
  }));

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6 py-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-xl" />
          ))}
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
          <span className="text-gradient-brand">Performance</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Insights into your learning journey</p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="platform-card p-4"
          >
            <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center mb-2",
              stat.color === "cyan" ? "bg-cyan/10 text-cyan" :
              stat.color === "magenta" ? "bg-magenta/10 text-magenta" :
              "bg-accent/10 text-accent"
            )}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="font-display text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Quiz Performance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="platform-card p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Quiz Performance</h3>
          {(quizSubs || []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No quiz submissions yet</p>
          ) : (
            <div className="space-y-3">
              {(quizSubs || []).map((sub: any) => (
                <div key={sub.id} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                  <span className="text-sm text-foreground">{sub.quizzes?.title || "Quiz"}</span>
                  <span className="text-sm font-medium text-foreground">{sub.score}/{sub.max_score}</span>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Subject Breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="platform-card p-5">
          <h3 className="font-display font-semibold text-foreground mb-4">Subject Breakdown</h3>
          {subjectBreakdown.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Enroll in courses to see breakdown</p>
          ) : (
            <div className="space-y-3">
              {subjectBreakdown.map((s) => (
                <div key={s.subject}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-foreground">{s.subject}</span>
                    <span className="text-muted-foreground">{s.percentage}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all",
                        s.color === "cyan" ? "bg-cyan" : s.color === "magenta" ? "bg-magenta" : "bg-accent"
                      )}
                      style={{ width: `${s.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>

      {/* Learning DNA Summary */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="platform-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Brain className="w-5 h-5 text-cyan" />
          <h3 className="font-display font-semibold text-foreground">Learning DNA Insights</h3>
        </div>
        {dnaProfile?.completed ? (
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="p-3 rounded-xl bg-cyan/5 border border-cyan/10">
              <p className="text-xs text-muted-foreground mb-0.5">Focus Style</p>
              <p className="font-medium text-foreground text-sm capitalize">{dnaProfile.focus_mode || "Steady"}</p>
            </div>
            <div className="p-3 rounded-xl bg-accent/5 border border-accent/10">
              <p className="text-xs text-muted-foreground mb-0.5">Session Length</p>
              <p className="font-medium text-foreground text-sm capitalize">{dnaProfile.session_length || "Medium"}</p>
            </div>
            <div className="p-3 rounded-xl bg-magenta/5 border border-magenta/10">
              <p className="text-xs text-muted-foreground mb-0.5">Break Frequency</p>
              <p className="font-medium text-foreground text-sm capitalize">{dnaProfile.break_frequency || "Normal"}</p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Complete your Learning DNA questionnaire to get personalized insights.</p>
        )}
      </motion.div>
    </div>
  );
}
