import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, BookOpen, Clock, Star, Calculator, Activity, Bot, Globe, Palette, FlaskConical, History as HistoryIcon, Sparkles, Book, Users, Zap, ChevronRight, Bell, Map, Atom, Microscope, Beaker, PenTool, Music, Globe2, Compass, GraduationCap, BrainCircuit, FileText, Languages } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useCourses } from "@/hooks/use-courses";
import { useRealtimeStats } from "@/hooks/use-realtime-stats";
import { apiClient } from "@/lib/api-client";
import { AIAsset } from "@/components/AIAsset";
import { AIIcon } from "@/components/AIIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";
import { PageLoader } from "@/components/loaders/PageLoader";

const categories = ["All", "Mathematics", "Science", "Coding", "Languages", "Arts", "History", "Biology", "Physics", "Chemistry", "Literature", "Geography", "Music"];

const subjectIcons: Record<string, any> = {
  Mathematics: Calculator,
  Science: FlaskConical,
  Coding: Bot,
  Languages: Globe,
  Arts: Palette,
  History: HistoryIcon,
  Biology: Microscope,
  Physics: Atom,
  Chemistry: Beaker,
  Literature: BookOpen,
  Geography: Globe2,
  Music: Music,
  English: PenTool,
  "Social Studies": Compass,
  "Computer Science": BrainCircuit,
  "General Studies": GraduationCap,
  Statistics: Activity,
  "Data Science": FileText,
  "Foreign Languages": Languages,
};

export default function Courses() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [realtimeCourses, setRealtimeCourses] = useState<any[]>([]);
  const [hasCourses, setHasCourses] = useState(false);

  const { data: courses, isLoading } = useCourses({
    subject: activeCategory,
    search: searchQuery || undefined,
  });

  const { stats } = useRealtimeStats();

  // Initial check for courses
  useEffect(() => {
    checkCoursesCount();
  }, []);

  const checkCoursesCount = async () => {
    try {
      const data = await apiClient.get<{ count: number }>('/api/courses/count?published=true');
      setHasCourses((data?.count || 0) > 0);
    } catch (error) {
      console.error('Unable to verify course availability. Please refresh the page.');
    }
  };

  const triggerCourseNotification = (courseData: any) => {
    // Show notification for new course
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('New Course Available!', {
        body: `${courseData.title} is now available`,
        icon: '/favicon.ico'
      });
    }
  };

  // Request notification permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const displayCourses = hasCourses ? courses : realtimeCourses;

  // Empty State Component
  const EmptyState = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center py-16"
    >
      <div className="max-w-2xl mx-auto">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center"
        >
          <BookOpen className="w-10 h-10 text-purple-500" />
        </motion.div>

        <h2 className="text-3xl font-bold mb-4">
          Courses Are Currently Being Prepared
        </h2>

        <p className="text-muted-foreground text-lg mb-8">
          Our instructors are working hard to create amazing learning experiences for you.
          Be the first to know when new courses are available!
        </p>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border border-blue-500/20"
          >
            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6 text-blue-500" />
            </div>
            <h3 className="font-semibold mb-2">Expert Instructors</h3>
            <p className="text-sm text-muted-foreground">
              Learn from industry professionals and academic experts
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 rounded-xl bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20"
          >
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6 text-green-500" />
            </div>
            <h3 className="font-semibold mb-2">Interactive Learning</h3>
            <p className="text-sm text-muted-foreground">
              Engage with hands-on projects and real-world applications
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.05 }}
            className="p-6 rounded-xl bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border border-orange-500/20"
          >
            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mb-4">
              <Users className="w-6 h-6 text-orange-500" />
            </div>
            <h3 className="font-semibold mb-2">Community Support</h3>
            <p className="text-sm text-muted-foreground">
              Connect with peers and get help when you need it
            </p>
          </motion.div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="hero"
            size="default"
            asChild
            className="rounded-full"
          >
            <Link to="/app/dashboard">
              Explore Dashboard
              <ChevronRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
          <Button
            variant="outline"
            size="default"
            onClick={() => {
              // Request notification for course updates
              if ('Notification' in window && Notification.permission === 'default') {
                Notification.requestPermission();
              }
            }}
            className="rounded-full"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            Notify Me When Available
          </Button>
        </div>

        <div className="mt-12 p-6 bg-muted/50 rounded-xl">
          <div className="flex items-center justify-center gap-8 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-muted-foreground">Real-time updates</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-muted-foreground">Auto-notifications</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
              <span className="text-muted-foreground">Priority access</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
          <span className="text-gradient-brand">Courses</span>
        </h1>
        <p className="text-muted-foreground text-sm mt-1">Explore interconnected learning paths across all domains</p>
      </motion.div>

      {isLoading ? (
        <PageLoader message="Loading courses..." />
      ) : (
        <>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-card flex-1 border-primary/20">
              <AIIcon name="Search" size="sm" />
              <input
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
                aria-label="Search courses"
              />
            </div>
          </motion.div>

      <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Course categories">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            role="tab"
            aria-selected={activeCategory === cat}
            className={cn(
              "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all",
              activeCategory === cat
                ? "glass-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {!hasCourses && displayCourses?.length === 0 ? (
        <EmptyState />
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key="courses-grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {displayCourses?.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * i }}
              >
                <Link to={`/app/courses/${course.id}`} className="block platform-card group overflow-hidden" aria-label={`${course.title} - ${course.difficulty}`}>
                  <div className="h-40 w-full relative overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10">
                    <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent z-10" />
                    <AIAsset
                      context={{ topic: course.title, action: 'course_banner', mood: 'professional' }}
                      type="banner"
                      size="custom"
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute top-3 right-3 z-20">
                      <span className="badge-info text-[10px] bg-background/90 backdrop-blur-md px-2 py-1 rounded-full">{course.difficulty}</span>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                        {(() => {
                          const Icon = subjectIcons[course.subject || ""] || BookOpen;
                          return <Icon className="w-4 h-4 text-primary" />;
                        })()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-display font-semibold text-foreground text-sm group-hover:text-cyan transition-colors line-clamp-1">
                          {course.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-[11px] text-muted-foreground mb-3">{course.subject}</p>
                    <Button size="sm" variant="ghost" className="w-full justify-start text-xs text-cyan hover:text-cyan/80 hover:bg-cyan/10">
                      View Details
                      <ChevronRight className="w-3 h-3 ml-auto" />
                    </Button>
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}
      </>
      )}
    </div>
  );
}
