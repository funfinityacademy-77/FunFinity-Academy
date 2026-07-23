import { motion } from "framer-motion";
import {
  Users, BookOpen, BarChart3, Play, ArrowRight,
  Clock, TrendingUp, Video, MessageSquare, ClipboardList, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

const fadeIn = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

// Teacher Dashboard Skeleton - Exact spatial footprint match
function TeacherDashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner Skeleton */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="platform-card p-6 lg:p-8 relative overflow-hidden min-h-[180px]"
      >
        <div className="absolute inset-0 bg-gradient-brand-soft opacity-30" />
        <div className="relative z-10 space-y-4">
          <div className="h-5 w-40 bg-muted/30 rounded animate-pulse" />
          <div className="h-10 w-72 bg-muted/50 rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted/20 rounded animate-pulse" />
          <div className="flex gap-3">
            <div className="h-10 w-36 bg-primary/20 rounded-lg animate-pulse" />
            <div className="h-10 w-28 bg-muted/20 rounded-lg animate-pulse" />
          </div>
        </div>
      </motion.div>

      {/* Stats Grid Skeleton */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="platform-card p-4">
            <div className="w-9 h-9 rounded-xl bg-primary/10 animate-pulse mb-3" />
            <div className="h-7 w-16 bg-muted/50 rounded animate-pulse mb-1" />
            <div className="h-3 w-24 bg-muted/20 rounded animate-pulse" />
          </div>
        ))}
      </motion.div>

      {/* Two-Column Layout Skeleton */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* My Courses Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="h-7 w-32 bg-muted/30 rounded animate-pulse" />
            <div className="h-5 w-20 bg-muted/20 rounded animate-pulse" />
          </div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="platform-card p-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <div className="h-5 w-48 bg-muted/30 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-muted/20 rounded animate-pulse" />
                </div>
                <div className="h-6 w-20 rounded-full bg-secondary animate-pulse" />
              </div>
            </div>
          ))}
        </motion.div>

        {/* Recent Quizzes Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          <div className="h-7 w-40 bg-muted/30 rounded animate-pulse" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="platform-card p-4">
              <div className="h-5 w-56 bg-muted/30 rounded animate-pulse mb-1" />
              <div className="h-4 w-40 bg-muted/20 rounded animate-pulse" />
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export default function TeacherDashboard() {
  const { user } = useAuth();

  const { data: myCourses, isLoading } = useQuery({
    queryKey: ["teacher-courses", user?.id],
    queryFn: async () => {
      const data = await apiClient.get<any[]>(`/api/courses?instructor_id=${user!.id}`);
      return data;
    },
    enabled: !!user,
  });


  const { data: myQuizzes } = useQuery({
    queryKey: ["teacher-quizzes", user?.id],
    queryFn: async () => {
      const data = await apiClient.get<any[]>(`/api/quizzes?created_by=${user!.id}`);
      return data;
    },
    enabled: !!user,
  });

  const totalStudents = (myCourses || []).reduce((sum, c) => sum + (c.enrollment_count || 0), 0);

  const classStats = [
    { label: "Total Students", value: String(totalStudents), icon: Users, colorClass: "bg-cyan/10 text-cyan" },
    { label: "My Courses", value: String((myCourses || []).length), icon: BookOpen, colorClass: "bg-primary/10 text-primary" },
    { label: "Quizzes", value: String((myQuizzes || []).length), icon: BarChart3, colorClass: "bg-magenta/10 text-magenta" },
  ];

  if (isLoading) {
    return <TeacherDashboardSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div {...fadeIn(0)} className="platform-card p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-brand-soft opacity-30" />
        <div className="relative z-10">
          <span className="text-sm text-muted-foreground">Teacher Dashboard</span>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2">
            Welcome to your <span className="text-gradient-brand">Classroom</span>
          </h1>
          <p className="text-muted-foreground text-sm mb-4">
            {(myCourses || []).length} courses · {totalStudents} total students
          </p>
          <div className="flex gap-3">
            <Button variant="hero" size="default" asChild>
              <Link to="/admin/courses">Course Builder</Link>
            </Button>
            <Button variant="heroOutline" size="default" asChild>
              <Link to="/admin/gradebook">Gradebook</Link>
            </Button>
          </div>
        </div>
      </motion.div>

      <motion.div {...fadeIn(0.1)} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {classStats.map((stat) => (
          <div key={stat.label} className="platform-card p-4">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.colorClass}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <p className="font-display text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div {...fadeIn(0.2)} className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold text-foreground">My Courses</h2>
            <Link to="/admin/courses" className="text-sm text-primary hover:underline flex items-center gap-1">
              Manage <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {(myCourses || []).length === 0 ? (
            <div className="platform-card p-8 text-center text-sm text-muted-foreground">
              No courses yet — create your first course!
            </div>
          ) : (
            (myCourses || []).map((course) => (
              <div key={course.id} className="platform-card p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-foreground text-sm">{course.title}</p>
                    <p className="text-xs text-muted-foreground">{course.subject} · {course.enrollment_count || 0} students</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${course.published ? "bg-cyan/10 text-cyan" : "bg-secondary text-muted-foreground"}`}>
                    {course.published ? "Published" : "Draft"}
                  </span>
                </div>
              </div>
            ))
          )}
        </motion.div>

        <motion.div {...fadeIn(0.3)} className="space-y-4">
          <h2 className="font-display text-lg font-semibold text-foreground">Recent Quizzes</h2>
          {(myQuizzes || []).length === 0 ? (
            <div className="platform-card p-8 text-center text-sm text-muted-foreground">No quizzes created yet</div>
          ) : (
            (myQuizzes || []).slice(0, 5).map((quiz: any) => (
              <div key={quiz.id} className="platform-card p-4">
                <p className="font-medium text-foreground text-sm">{quiz.title}</p>
                <p className="text-xs text-muted-foreground">
                  {quiz.quiz_attempts?.length || 0} submissions
                  {quiz.created_at ? ` · Created ${new Date(quiz.created_at).toLocaleDateString()}` : ""}
                </p>
              </div>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
