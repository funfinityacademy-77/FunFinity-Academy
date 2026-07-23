import { motion } from "framer-motion";
import { useState } from "react";
import { Search, Download, TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";

const scoreColor = (score: number) => {
  if (score >= 85) return "text-green-600";
  if (score >= 70) return "text-accent";
  return "text-destructive";
};

export default function TeacherGradebook() {
  const { user } = useAuth();

  const { data: courses = [] } = useQuery({
    queryKey: ["teacher-courses-list", user?.id],
    queryFn: async () => {
      const data = await apiClient.get<any[]>(`/api/courses?instructor_id=${user!.id}`);
      return data;
    },
    enabled: !!user,
  });

  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const activeCourseId = selectedCourseId || courses[0]?.id;

  const { data: enrolledStudents = [], isLoading } = useQuery({
    queryKey: ["gradebook-students", activeCourseId],
    queryFn: async () => {
      if (!activeCourseId) return [];
      // Get enrollments for the course
      const enrollments = await apiClient.get<any[]>(`/api/enrollments?course_id=${activeCourseId}`);
      if (!enrollments.length) return [];

      const userIds = enrollments.map((e: any) => e.user_id);

      // Get profiles
      const profiles = await apiClient.get<any[]>('/api/profiles');

      // Get quiz submissions for these users
      const submissions = await apiClient.get<any[]>('/api/quiz-attempts');

      // Aggregate
      return userIds.map((uid: string) => {
        const profile = profiles?.find((p: any) => p.user_id === uid);
        const userSubs = submissions?.filter((s: any) => s.user_id === uid) || [];
        const avgScore = userSubs.length > 0
          ? Math.round(userSubs.reduce((a: number, s: any) => a + ((s.score || 0) / (s.max_score || 100)) * 100, 0) / userSubs.length)
          : 0;
        return {
          id: uid,
          name: profile?.display_name || profile?.email || "Student",
          avatar: (profile?.display_name || "S").slice(0, 2).toUpperCase(),
          avgScore,
          submitted: userSubs.length,
          lastActive: "Recently",
        };
      });
    },
    enabled: !!activeCourseId,
  });

  const classAvg = enrolledStudents.length > 0
    ? Math.round(enrolledStudents.reduce((a, s) => a + s.avgScore, 0) / enrolledStudents.length)
    : 0;
  const atRisk = enrolledStudents.filter(s => s.avgScore > 0 && s.avgScore < 70).length;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Gradebook</h1>
            <p className="text-muted-foreground text-sm mt-1">Track individual student performance and submissions</p>
          </div>
          <Button variant="heroOutline" size="default">
            <Download className="w-4 h-4 mr-2" /> Export CSV
          </Button>
        </div>

        {/* Course Selector */}
        <div className="platform-card p-4 flex flex-wrap items-center gap-3 mb-4">
          <div className="flex gap-2 flex-wrap flex-1">
            {courses.map(c => (
              <button key={c.id} onClick={() => setSelectedCourseId(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${(activeCourseId === c.id) ? "bg-primary/10 text-primary border-primary/30" : "border-border/30 text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                {c.title}
              </button>
            ))}
            {courses.length === 0 && <p className="text-xs text-muted-foreground">No courses found</p>}
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            { label: "Class Average", value: classAvg > 0 ? `${classAvg}%` : "—" },
            { label: "Students", value: enrolledStudents.length.toString() },
            { label: "At Risk", value: `${atRisk} students` },
          ].map((s) => (
            <div key={s.label} className="platform-card p-4 text-center">
              <p className="font-display text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Student Table */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : enrolledStudents.length === 0 ? (
          <div className="platform-card p-12 text-center">
            <p className="text-muted-foreground">No students enrolled in this course yet.</p>
          </div>
        ) : (
          <div className="platform-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border/30 bg-secondary/20">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Student</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Avg Score</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden md:table-cell">Quiz Submissions</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider hidden lg:table-cell">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {enrolledStudents.map((s, i) => (
                    <motion.tr key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      className="border-b border-border/20 hover:bg-secondary/20 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {s.avatar}
                          </div>
                          <span className="text-sm font-medium text-foreground">{s.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-sm font-bold ${s.avgScore > 0 ? scoreColor(s.avgScore) : "text-muted-foreground"}`}>
                          {s.avgScore > 0 ? `${s.avgScore}%` : "—"}
                        </span>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="text-sm text-muted-foreground">{s.submitted}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell w-32">
                        <Progress value={s.avgScore} className="h-1.5" />
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

