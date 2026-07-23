import { motion } from "framer-motion";
import { Play, BookOpen, CheckCircle2, ArrowRight, Loader2, Calculator, FlaskConical, Bot, Zap, History as HistoryIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { useEnrollments } from "@/hooks/use-courses";
import { cn } from "@/lib/utils";
import { MyLearningSkeleton } from "@/components/skeletons/MyLearningSkeleton";

export default function MyLearning() {
  const { data: enrollments, isLoading } = useEnrollments();

  const getSubjectIcon = (subject?: string | null) => {
    const icons: Record<string, typeof BookOpen> = {
      Mathematics: Calculator, Science: FlaskConical, Coding: Bot, Physics: Zap, History: HistoryIcon, default: BookOpen
    };
    const Icon = icons[subject || ""] || icons.default;
    return <Icon className="w-8 h-8 text-primary" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
          My <span className="text-gradient-brand">Learning</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isLoading ? "Loading..." : `${(enrollments || []).length} active course${(enrollments || []).length !== 1 ? "s" : ""}`}
        </p>
      </motion.div>

      {isLoading ? (
        <MyLearningSkeleton />
      ) : (enrollments || []).length === 0 ? (
        <div className="platform-card p-12 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground font-medium">No courses enrolled yet</p>
          <p className="text-sm text-muted-foreground mt-1">Explore our course catalog to get started!</p>
          <Button variant="hero" size="sm" className="mt-4" asChild>
            <Link to="/app/courses">Browse Courses</Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {(enrollments || []).map((enrollment: any, i: number) => (
            <motion.div
              key={enrollment.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="platform-card p-5 group hover:border-primary/20 transition-all"
            >
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                    {getSubjectIcon(enrollment.courses?.subject)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-display font-semibold text-foreground mb-1">
                      {enrollment.courses?.title || "Course"}
                    </h3>
                    <div className="flex items-center gap-2 mb-2">
                      <Progress value={Number(enrollment.progress) || 0} className="h-2 flex-1" />
                      <span className="text-sm font-medium text-foreground">{enrollment.progress || 0}%</span>
                    </div>
                    <div className="text-xs text-muted-foreground space-y-0.5">
                      <p>{enrollment.courses?.subject || "General"} · {enrollment.courses?.difficulty || "Beginner"}</p>
                      <p>Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}</p>
                      {enrollment.completed && (
                        <p className="text-success flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Completed
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex sm:flex-col gap-2 shrink-0">
                  <Button variant="hero" size="sm" asChild>
                    <Link to={`/app/courses/${enrollment.course_id}/learn`}>
                      <Play className="w-3 h-3 mr-1" /> Continue
                    </Link>
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <Link to={`/app/courses/${enrollment.course_id}`}>Details</Link>
                  </Button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
