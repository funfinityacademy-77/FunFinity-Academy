import { motion } from "framer-motion";
import { ClipboardList, PlusCircle, Clock, CheckCircle2, AlertCircle, Users, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";

const typeColor: Record<string, string> = {
  Quiz: "bg-cyan/10 text-cyan border-cyan/20",
  Assignment: "bg-primary/10 text-primary border-primary/20",
  Exam: "bg-magenta/10 text-magenta border-magenta/20",
};

export default function TeacherAssignments() {
  const { user } = useAuth();

  const { data: assignments = [], isLoading } = useQuery({
    queryKey: ["teacher-assignments", user?.id],
    queryFn: async () => {
      const data = await apiClient.get<any[]>(`/api/assignments?created_by=${user!.id}`);
      return data;
    },
    enabled: !!user,
  });

  const active = assignments.filter(a => a.published && a.due_date && new Date(a.due_date) >= new Date());
  const upcoming = assignments.filter(a => !a.published);
  const completed = assignments.filter(a => a.published && a.due_date && new Date(a.due_date) < new Date());

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Assignments</h1>
            <p className="text-muted-foreground text-sm mt-1">Create and manage assignments, quizzes, and exams</p>
          </div>
          <Button variant="hero" size="default">
            <PlusCircle className="w-4 h-4 mr-2" /> Create Assignment
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { label: "Active", value: active.length.toString(), color: "text-accent" },
            { label: "Upcoming", value: upcoming.length.toString(), color: "text-primary" },
            { label: "Completed", value: completed.length.toString(), color: "text-green-600" },
          ].map((s) => (
            <div key={s.label} className="platform-card p-4 text-center">
              <p className={`font-display text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {assignments.length === 0 ? (
          <div className="platform-card p-12 text-center">
            <ClipboardList className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No assignments yet. Create your first one!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {assignments.map((a, i) => {
              const submissionCount = Array.isArray(a.assignment_submissions) ? a.assignment_submissions.length : 0;
              const isActive = a.published && a.due_date && new Date(a.due_date) >= new Date();
              const isDone = a.published && a.due_date && new Date(a.due_date) < new Date();
              const statusLabel = isActive ? "Active" : isDone ? "Completed" : "Upcoming";
              const courseName = (a.courses as any)?.title || "General";

              return (
                <motion.div key={a.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="platform-card p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
                        <ClipboardList className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-medium text-foreground text-sm">{a.title}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground mb-2">{courseName}</p>
                        <div className="flex items-center gap-4">
                          <span className="text-xs text-muted-foreground">
                            {submissionCount} submissions · {a.max_points || 100} pts max
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        {isActive ? <Clock className="w-3 h-3 text-accent" /> : isDone ? <CheckCircle2 className="w-3 h-3 text-green-600" /> : <AlertCircle className="w-3 h-3" />}
                        <span className={`font-medium ${isActive ? "text-accent" : isDone ? "text-green-600" : "text-muted-foreground"}`}>
                          {a.due_date ? (isActive ? `Due ${format(new Date(a.due_date), "MMM d")}` : isDone ? "Closed" : `Opens ${format(new Date(a.due_date), "MMM d")}`) : statusLabel}
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </motion.div>
    </div>
  );
}
