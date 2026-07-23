import { motion } from "framer-motion";
import { Users, Clock, BarChart3, BookOpen, Calendar, ArrowRight, PlusCircle, Star, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";

const scoreColor = (s: number) => s >= 80 ? "text-green-600" : s >= 70 ? "text-accent" : "text-destructive";

export default function TeacherClasses() {
  const { user } = useAuth();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["teacher-classes", user?.id],
    queryFn: async () => {
      const data = await apiClient.get<any[]>(`/api/courses?instructor_id=${user!.id}`);
      return data;
    },
    enabled: !!user,
  });

  const { data: enrollmentCounts = {} } = useQuery({
    queryKey: ["teacher-enrollment-counts", user?.id],
    queryFn: async () => {
      const courseIds = courses.map(c => c.id);
      if (!courseIds.length) return {};
      const data = await apiClient.get<any[]>('/api/enrollments');
      const counts: Record<string, number> = {};
      data.forEach((e: any) => { if (courseIds.includes(e.course_id)) counts[e.course_id] = (counts[e.course_id] || 0) + 1; });
      return counts;
    },
    enabled: courses.length > 0,
  });

  const { data: assignmentCounts = {} } = useQuery({
    queryKey: ["teacher-assignment-counts", user?.id],
    queryFn: async () => {
      const courseIds = courses.map(c => c.id);
      if (!courseIds.length) return {};
      const data = await apiClient.get<any[]>('/api/assignments');
      const counts: Record<string, number> = {};
      data.forEach((a: any) => { if (a.course_id && courseIds.includes(a.course_id)) counts[a.course_id] = (counts[a.course_id] || 0) + 1; });
      return counts;
    },
    enabled: courses.length > 0,
  });

  const totalStudents = Object.values(enrollmentCounts).reduce((a, b) => a + b, 0);
  const totalPending = Object.values(assignmentCounts).reduce((a, b) => a + b, 0);

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
            <h1 className="font-display text-2xl font-bold text-foreground">My Classes</h1>
            <p className="text-muted-foreground text-sm mt-1">View schedules, performance, and manage your classes</p>
          </div>
          <Button variant="hero" size="default" asChild>
            <Link to="/admin/courses"><PlusCircle className="w-4 h-4 mr-2" /> New Class</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Students", value: totalStudents.toString(), icon: Users, color: "cyan" },
            { label: "Active Classes", value: courses.length.toString(), icon: BookOpen, color: "primary" },
            { label: "Avg Score", value: "—", icon: BarChart3, color: "accent" },
            { label: "Assignments", value: totalPending.toString(), icon: Clock, color: "magenta" },
          ].map((s) => (
            <div key={s.label} className="platform-card p-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-${s.color}/10 mb-3`}>
                <s.icon className={`w-4 h-4 text-${s.color}`} />
              </div>
              <p className="font-display text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {courses.length === 0 ? (
          <div className="platform-card p-12 text-center">
            <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-muted-foreground">No classes yet. Create your first course!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((cls, i) => {
              const studentCount = enrollmentCounts[cls.id] || 0;
              return (
                <motion.div key={cls.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  className="platform-card p-5 hover:border-primary/30 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-2xl shrink-0">
                      📚
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <div>
                          <h3 className="font-display text-base font-semibold text-foreground">{cls.title}</h3>
                          <p className="text-xs text-muted-foreground">{cls.subject || "General"} · {studentCount} students</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${cls.published ? "bg-green-100 text-green-700" : "bg-secondary text-muted-foreground"}`}>
                            {cls.published ? "Published" : "Draft"}
                          </span>
                        </div>
                      </div>
                      {cls.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{cls.description}</p>
                      )}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Users className="w-3 h-3" />{studentCount} enrolled</span>
                          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{assignmentCounts[cls.id] || 0} assignments</span>
                        </div>
                        <Button variant="ghost" size="sm" asChild>
                          <Link to="/admin/gradebook" className="text-primary">
                            Details <ArrowRight className="w-3 h-3 ml-1" />
                          </Link>
                        </Button>
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

