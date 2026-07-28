import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import {
  Play, Clock, BookOpen, Users, Star, CheckCircle2,
  Lock, ChevronDown, ChevronRight, FileText, Video, HelpCircle, Download, UserMinus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { useCourseDetail, useCourseLessons, useEnrollInCourse, useEnrollments, useUnenrollFromCourse } from "@/hooks/use-courses";
import { AIAsset } from "@/components/AIAsset";
import { AIIcon } from "@/components/AIIcon";
import CourseMap from "./CourseMap";

const typeIcons: Record<string, typeof Video> = {
  video: Video,
  reading: FileText,
  quiz: HelpCircle,
  interactive: Play,
};

export default function CourseDetail() {
  const { id } = useParams();
  const { data: course, isLoading } = useCourseDetail(id || "");
  const { data: lessons } = useCourseLessons(id || "");
  const { data: enrollments } = useEnrollments();
  const enrollMutation = useEnrollInCourse();
  const unenrollMutation = useUnenrollFromCourse();
  const [showDeenrollConfirm, setShowDeenrollConfirm] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "map">("details");
  const [openModule, setOpenModule] = useState(0);

  const isEnrolled = enrollments?.some((e: any) => e.course_id === id);
  const enrollment = enrollments?.find((e: any) => e.course_id === id);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6 py-8">
        <div className="space-y-4">
          <Skeleton className="h-64 w-full rounded-2xl" />
          <div className="grid grid-cols-4 gap-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-48" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">Course not found</p>
        <Button variant="outline" className="mt-4" asChild>
          <Link to="/app/courses">Back to Courses</Link>
        </Button>
      </div>
    );
  }

  const totalDuration = (lessons || []).reduce((sum, l) => sum + (l.duration_minutes || 0), 0);

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/app/courses" className="hover:text-foreground transition-colors">Courses</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{course.title}</span>
      </nav>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="platform-card relative overflow-hidden min-h-[320px] flex flex-col justify-end">
        {/* Immersive AI Banner Background */}
        <div className="absolute inset-0 z-0">
          <AIAsset 
            context={{ topic: course.title, action: 'course_banner', mood: 'professional' }} 
            type="banner" 
            size="custom" 
            className="w-full h-full object-cover" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
        </div>

        <div className="relative z-10 p-6 lg:p-8 flex flex-col lg:flex-row gap-6 items-end">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3">
              <span className="badge-info bg-primary/20 text-primary border-primary/30 backdrop-blur-md">
                {course.difficulty || "Beginner"}
              </span>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary/50 backdrop-blur-md border border-border/30">
                <AIIcon name="BookOpen" size="sm" className="w-3 h-3" />
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider">{course.subject}</span>
              </div>
            </div>
            <h1 className="font-display text-3xl lg:text-5xl font-bold text-foreground mb-3 leading-tight tracking-tight">
              {course.title}
            </h1>
            <p className="text-muted-foreground text-sm lg:text-base max-w-2xl mb-6 leading-relaxed">
              {course.description}
            </p>
            
            <div className="flex flex-wrap gap-6 text-sm text-muted-foreground">
              <span className="flex items-center gap-2 font-medium">
                <AIIcon name="Users" size="sm" className="w-4 h-4" />
                {course.enrollment_count || 0} students
              </span>
              <span className="flex items-center gap-2 font-medium">
                <AIIcon name="BookOpen" size="sm" className="w-4 h-4" />
                {(lessons || []).length} lessons
              </span>
              <span className="flex items-center gap-2 font-medium">
                <AIIcon name="Clock" size="sm" className="w-4 h-4" />
                {Math.round(totalDuration / 60)}h {totalDuration % 60}m
              </span>
            </div>
          </div>

          <div className="glass-card rounded-xl p-5 w-full lg:w-72 shrink-0">
            <h3 className="font-display font-semibold text-foreground mb-3">
              {isEnrolled ? "Your Progress" : "Get Started"}
            </h3>
            {isEnrolled && enrollment ? (
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Completion</span>
                  <span className="font-medium text-foreground">{enrollment.progress || 0}%</span>
                </div>
                <Progress value={Number(enrollment.progress) || 0} className="h-2" />
              </div>
            ) : null}
            <div className="space-y-2">
              {isEnrolled ? (
                <>
                  <Button variant="hero" className="w-full" asChild>
                    <Link to={`/app/courses/${id}/learn`}>
                      <Play className="w-4 h-4 mr-1" /> Continue Learning
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-destructive/50 text-destructive hover:bg-destructive/10"
                    onClick={() => setShowDeenrollConfirm(true)}
                    disabled={unenrollMutation.isPending}
                  >
                    <UserMinus className="w-4 h-4 mr-1" />
                    {unenrollMutation.isPending ? "Unenrolling..." : "Unenroll from Course"}
                  </Button>
                </>
              ) : (
                <Button
                  variant="hero"
                  className="w-full"
                  onClick={() => enrollMutation.mutate(id!)}
                  disabled={enrollMutation.isPending}
                >
                  {enrollMutation.isPending ? "Enrolling..." : "Enroll Now — Free"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Lessons */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <h2 className="font-display text-lg font-semibold text-foreground mb-4">
          Lessons ({(lessons || []).length})
        </h2>
        <div className="space-y-2">
          {(lessons || []).map((lesson, idx) => (
            <div key={lesson.id} className="platform-card p-4 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center text-xs font-bold text-muted-foreground">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground text-sm">{lesson.title}</p>
                <p className="text-xs text-muted-foreground">
                  {lesson.duration_minutes ? `${lesson.duration_minutes} min` : ""}
                  {lesson.video_url ? " · Video" : " · Reading"}
                </p>
              </div>
              {isEnrolled && (
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/app/courses/${id}/learn`}><Play className="w-4 h-4" /></Link>
                </Button>
              )}
            </div>
          ))}
          {(lessons || []).length === 0 && (
            <div className="platform-card p-8 text-center text-sm text-muted-foreground">
              No lessons added yet
            </div>
          )}
        </div>
      </motion.div>

      {/* Course Map */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <CourseMap />
      </motion.div>

      {/* De-enroll Confirmation Dialog */}
      {showDeenrollConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="platform-card max-w-md w-full p-6 bg-slate-900/90 border-slate-800"
          >
            <h3 className="font-display text-xl font-bold text-white mb-2">Unenroll from Course</h3>
            <p className="text-slate-300 mb-6">
              Are you sure you want to unenroll from "{course?.title}"? This will remove your progress and you will need to re-enroll to continue.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-slate-700 text-slate-300 hover:bg-slate-800"
                onClick={() => setShowDeenrollConfirm(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  unenrollMutation.mutate(id!, {
                    onSuccess: () => {
                      setShowDeenrollConfirm(false);
                    }
                  });
                }}
                disabled={unenrollMutation.isPending}
              >
                {unenrollMutation.isPending ? "Unenrolling..." : "Yes, Unenroll"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
