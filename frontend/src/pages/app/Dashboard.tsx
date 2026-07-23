import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen, Clock, Trophy, TrendingUp, Play, Target,
  Calendar, Star, ArrowRight, Flame, CheckCircle2, Brain, Zap, Award, Users, Sparkles,
  BarChart3, FileText, Download, Upload, Lock, Shield, AlertTriangle
} from "lucide-react";
import { FunfinityIcon } from "@/components/brand/FunfinityLogo";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";
import { DashboardSkeleton } from "@/components/skeletons/DashboardSkeleton";
import { useState, useMemo, lazy, Suspense } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useEnrollments } from "@/hooks/use-courses";
import { useGamificationBackend } from "@/hooks/use-gamification-backend";
import { useCalendarEvents } from "@/hooks/use-calendar-events";
import { useStorageQuota } from "@/hooks/use-storage-quota";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { supabase } from "@/lib/supabase";
import { AIAsset } from "@/components/AIAsset";
import { VIS } from "@/lib/visual-intelligence";
import { cn } from "@/lib/utils";

// Lazy load heavy components for performance
const DashboardCharts = lazy(() => import("@/components/charts/DashboardCharts").then(m => ({ default: m.DashboardCharts })));

const fadeIn = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

export default function Dashboard() {
  const [dismissedXP, setDismissedXP] = useState(false);
  const { user } = useAuth();
  const { stats: gamificationStats, isLoading: gamificationLoading } = useGamificationBackend();
  const { events: calendarEvents, isLoading: calendarLoading } = useCalendarEvents();
  const { quota, isNearLimit, isAtLimit } = useStorageQuota();

  console.log('Dashboard rendering v3:', { user: !!user, dismissedXP, userId: user?.id });

  const { data: profileData, isLoading: profileLoading } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      try {
        const data = await apiClient.get<any | null>(`/api/users/${user!.id}/profile`);
        return data;
      } catch (error) {
        console.error('Failed to load profile:', error);
        return null;
      }
    },
    enabled: !!user,
  });

  const { data: learningDNAData, isLoading: learningDNALoading } = useQuery({
    queryKey: ["learning-dna", user?.id],
    queryFn: async () => {
      try {
        const data = await apiClient.get<any | null>(`/api/users/${user!.id}/learning-dna`);
        return data;
      } catch (error) {
        console.error('Failed to load learning DNA:', error);
        return null;
      }
    },
    enabled: !!user,
  });

  const { data: enrollments, isLoading: enrollmentsLoading } = useEnrollments();
  const { data: quizSubmissions, isLoading: quizLoading } = useQuery({
    queryKey: ["quiz-submissions", user?.id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('quiz_submissions')
          .select('*')
          .eq('user_id', user!.id)
          .order('completed_at', { ascending: false });
        
        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Failed to load quiz submissions:', error);
        return [];
      }
    },
    enabled: !!user,
  });

  const isLoading = profileLoading || enrollmentsLoading || quizLoading || learningDNALoading || gamificationLoading || calendarLoading;

  const displayName = profileData?.display_name || user?.email?.split("@")[0] || "Learner";
  const enrolledCourses = enrollments || [];
  const totalXP = gamificationStats?.total_points_earned || quizSubmissions?.reduce((acc, sub) => acc + (sub.score || 0), 0) || 0;
  const coursesCount = enrolledCourses.length;
  const currentStreak = gamificationStats?.current_streak || 0;
  const studyTimeMinutes = gamificationStats?.total_study_time_minutes || 0;
  const studyTimeHours = Math.floor(studyTimeMinutes / 60);
  const studyTimeMins = studyTimeMinutes % 60;
  const upcomingEvents = calendarEvents?.filter(e => new Date(e.start_date) > new Date()).slice(0, 3) || [];
  const storagePercentage = quota?.storage_percentage || 0;

  const getSubjectIcon = (subject?: string | null) => {
    const icons: Record<string, typeof BookOpen> = {
      Mathematics: BookOpen, Biology: Brain, Coding: Zap, Physics: Zap, History: BookOpen, default: BookOpen
    };
    const Icon = icons[subject || ""] || icons.default;
    return <Icon className="w-6 h-6 text-primary" />;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {isLoading ? (
        <DashboardSkeleton />
      ) : (
        <>
      <AnimatePresence>
        {!dismissedXP && totalXP > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-16 right-4 z-50 flex items-center gap-3 bg-background/90 backdrop-blur-xl border border-border/60 rounded-2xl px-4 py-3 shadow-2xl cursor-pointer"
            onClick={() => setDismissedXP(true)}
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-magenta to-purple-600 flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground leading-none">+{totalXP} XP</p>
              <p className="text-xs text-muted-foreground">Total earned!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Welcome Banner */}
      <motion.div {...fadeIn(0)} className="platform-card p-4 sm:p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-brand-soft opacity-50" />
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-glow-cyan opacity-30" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1 min-h-[24px]">
              <AIAsset
                context={{ action: 'welcome', state: 'info', mood: 'playful' }}
                type="emoji"
                size="sm"
              />
              <span className="text-sm text-muted-foreground">Welcome back, {displayName}</span>
            </div>

            {/* Learning DNA Adaptation Tags */}
            <div className="flex flex-wrap gap-2 mb-4 min-h-[28px]">
              {learningDNAData?.completed && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-wider animate-pulse-soft shrink-0">
                  <Sparkles className="w-3 h-3 shrink-0" />
                  DNA Personalized
                </div>
              )}
              {learningDNAData?.has_dyslexia && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-cyan/10 border border-cyan/20 text-[10px] font-bold text-cyan uppercase tracking-wider shrink-0">
                  <BookOpen className="w-3 h-3 shrink-0" />
                  Dyslexia Font
                </div>
              )}
              {learningDNAData?.has_adhd && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-orange/10 border border-orange/20 text-[10px] font-bold text-orange uppercase tracking-wider shrink-0">
                  <Zap className="w-3 h-3 shrink-0" />
                  ADHD Focus
                </div>
              )}
              {learningDNAData?.has_anxiety && (
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-magenta/10 border border-magenta/20 text-[10px] font-bold text-magenta uppercase tracking-wider shrink-0">
                  <TrendingUp className="w-3 h-3 shrink-0" />
                  Calm Mode
                </div>
              )}
            </div>

            <h1 className="font-display text-xl sm:text-2xl lg:text-3xl font-bold text-foreground mb-2">
              Ready to continue your <span className="text-gradient-brand">adventure</span>?
            </h1>
            <p className="text-muted-foreground text-sm max-w-lg mb-4">
              You have {coursesCount} active course{coursesCount !== 1 ? "s" : ""}. Keep up the great work!
            </p>
            <div className="flex gap-3">
              <Button variant="hero" size="default" asChild>
                <Link to="/app/my-learning"><Play className="w-4 h-4 mr-1" /> Continue Learning</Link>
              </Button>
              <Button variant="heroOutline" size="default" asChild>
                <Link to="/app/courses">Explore Courses</Link>
              </Button>
            </div>
          </div>
          <div className="shrink-0 flex flex-col items-center gap-4">
            <div className="platform-card p-4 min-w-[160px] text-center bg-gradient-to-br from-cyan/10 to-magenta/10 border-cyan/20">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">Total XP</p>
              <p className="font-display text-3xl font-bold text-gradient-brand">+{totalXP}</p>
              <p className="text-xs text-muted-foreground">Points earned</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Modern Charts Section */}
      <motion.div {...fadeIn(0.1)} className="min-h-[650px]">
        <Suspense fallback={<SkeletonLoader type="dashboard" />}>
          <DashboardCharts 
            quizSubmissions={quizSubmissions || []}
            studyTimeData={undefined}
            courseProgress={undefined}
          />
        </Suspense>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Main Content - 3 columns */}
        <motion.div {...fadeIn(0.2)} className="lg:col-span-3 space-y-4 sm:space-y-6">
          
          {/* Continue Learning */}
          <div data-tour-courses="true">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-primary" />
                Continue Learning
              </h2>
              <Link to="/app/my-learning" className="text-sm text-cyan hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {enrolledCourses.length === 0 ? (
              <div className="platform-card p-10 text-center border-dashed border-2 border-border/40 bg-secondary/10 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-50 group-hover:opacity-100 transition-opacity" />
                <div className="relative z-10">
                  <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-soft">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-display font-bold text-foreground mb-2">Start Your Learning Journey</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto mb-6 leading-relaxed">
                    Explore our courses and begin your educational adventure today.
                  </p>
                  <Button variant="hero" size="sm" asChild>
                    <Link to="/app/courses">Explore Courses</Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {enrolledCourses.slice(0, 4).map((enrollment: any) => (
                  <div key={enrollment.id} className="platform-card p-4 group hover:border-cyan/30 transition-all hover:shadow-lg">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-2xl shrink-0">
                        {getSubjectIcon(enrollment.courses?.subject)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-foreground text-sm truncate">{enrollment.courses?.title || "Course"}</p>
                        <p className="text-xs text-muted-foreground mb-2">{enrollment.courses?.subject || "General"}</p>
                        <div className="flex items-center gap-2">
                          <Progress value={Number(enrollment.progress) || 0} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground font-medium w-10 text-right">{enrollment.progress || 0}%</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="shrink-0" asChild>
                        <Link to={`/app/courses/${enrollment.course_id}`}><Play className="w-4 h-4" /></Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upcoming Events & Deadlines */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-cyan" />
                Upcoming Events
              </h2>
              <Link to="/app/calendar" className="text-sm text-cyan hover:underline flex items-center gap-1">
                View Calendar <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {upcomingEvents.length === 0 ? (
              <div className="platform-card p-6 text-center border-dashed border-2 border-border/40 bg-secondary/5">
                <Calendar className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event: any) => (
                  <div key={event.id} className="platform-card p-4 flex items-center gap-4 hover:bg-secondary/30 transition-colors">
                    <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center shrink-0">
                      <Calendar className="w-5 h-5 text-cyan" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.start_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary">
                      {event.event_type}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Academic Progress */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-xl font-semibold text-foreground flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-magenta" />
                Academic Progress
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="platform-card p-4 text-center">
                <p className="text-3xl font-bold text-gradient-brand">{gamificationStats?.lessons_completed || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Lessons Completed</p>
              </div>
              <div className="platform-card p-4 text-center">
                <p className="text-3xl font-bold text-gradient-brand">{gamificationStats?.quizzes_completed || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Quizzes Taken</p>
              </div>
              <div className="platform-card p-4 text-center">
                <p className="text-3xl font-bold text-gradient-brand">{gamificationStats?.perfect_quizzes || 0}</p>
                <p className="text-xs text-muted-foreground mt-1">Perfect Scores</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Sidebar - 1 column */}
        <motion.div {...fadeIn(0.3)} className="space-y-4 sm:space-y-6">
          
          {/* Quick Links */}
          <div className="platform-card p-4 sm:p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-accent" />
              Quick Access
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {[
                { label: "My Courses", icon: BookOpen, href: "/app/courses", color: "text-primary", bg: "bg-primary/10" },
                { label: "Live Classes", icon: Play, href: "/app/live-classes", color: "text-cyan", bg: "bg-cyan/10" },
                { label: "Assignments", icon: FileText, href: "/app/assignments", color: "text-magenta", bg: "bg-magenta/10" },
                { label: "Quizzes", icon: Target, href: "/app/quizzes", color: "text-accent", bg: "bg-accent/10" },
                { label: "Forums", icon: Users, href: "/app/forums", color: "text-orange", bg: "bg-orange/10" },
                { label: "Leaderboard", icon: Trophy, href: "/app/leaderboard", color: "text-purple", bg: "bg-purple/10" },
              ].map((q) => {
                const Icon = q.icon;
                return (
                  <Link key={q.label} to={q.href} className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary/50 transition-colors border border-transparent hover:border-border/50">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${q.bg} ${q.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-foreground">{q.label}</span>
                    <ArrowRight className="ml-auto opacity-50 w-4 h-4" />
                  </Link>
                )
              })}
            </div>
          </div>

          {/* Storage Quota */}
          <div className="platform-card p-4 sm:p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-green-500" />
              Storage Usage
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Used</span>
                  <span className={cn(isAtLimit ? "text-red-500" : isNearLimit ? "text-orange-500" : "text-foreground")}>
                    {storagePercentage.toFixed(1)}%
                  </span>
                </div>
                <Progress value={storagePercentage} className={cn("h-2", isAtLimit ? "bg-red-100" : isNearLimit ? "bg-orange-100" : "")} />
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-secondary/30">
                  <p className="text-muted-foreground">Notes</p>
                  <p className="font-semibold">{quota?.notes_count || 0}/{quota?.notes_limit || 1000}</p>
                </div>
                <div className="p-2 rounded-lg bg-secondary/30">
                  <p className="text-muted-foreground">Files</p>
                  <p className="font-semibold">{quota?.files_count || 0}/{quota?.files_limit || 100}</p>
                </div>
              </div>
              {isAtLimit && (
                <div className="flex items-center gap-2 text-xs text-red-500 bg-red-50 p-2 rounded-lg">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Storage limit reached</span>
                </div>
              )}
            </div>
          </div>

          {/* Data Backup & Security */}
          <div className="platform-card p-4 sm:p-6">
            <h3 className="font-display text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-primary" />
              Data & Security
            </h3>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link to="/app/settings/backup">
                  <Download className="w-4 h-4 mr-2" />
                  Encrypted Backup
                </Link>
              </Button>
              <Button variant="outline" size="sm" className="w-full justify-start" asChild>
                <Link to="/app/settings/security">
                  <Shield className="w-4 h-4 mr-2" />
                  Security Settings
                </Link>
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
        </>
      )}
    </div>
  );
}
