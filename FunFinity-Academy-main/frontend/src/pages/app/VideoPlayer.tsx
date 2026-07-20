import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, Link } from "react-router-dom";
import {
  Play, Pause, Volume2, Maximize,
  MessageSquare, BookOpen, Bookmark, CheckCircle2,
  ThumbsUp, FileText, Loader2, Cpu, HardDrive, Monitor, 
  Keyboard, Mouse, ChevronRight, Info, X, Lightbulb
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useCourseDetail, useCourseLessons } from "@/hooks/use-courses";
import { Skeleton } from "@/components/ui/skeleton";

interface ComputerPart {
  id: string;
  name: string;
  description: string;
  icon: any;
  videoUrl?: string;
}

const computerParts: ComputerPart[] = [
  { id: "cpu", name: "CPU (Processor)", description: "The brain of the computer", icon: Cpu },
  { id: "ram", name: "RAM (Memory)", description: "Temporary fast storage", icon: HardDrive },
  { id: "monitor", name: "Monitor", description: "Visual display output", icon: Monitor },
  { id: "keyboard", name: "Keyboard", description: "Input device", icon: Keyboard },
  { id: "mouse", name: "Mouse", description: "Pointing device", icon: Mouse },
];

export default function VideoPlayer() {
  const { id } = useParams();
  const { data: course } = useCourseDetail(id || "");
  const { data: lessons, isLoading } = useCourseLessons(id || "");
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<"notes" | "transcript" | "discussion" | "computer-parts">("notes");
  const [activeLessonIdx, setActiveLessonIdx] = useState(0);
  const [selectedPart, setSelectedPart] = useState<ComputerPart | null>(null);
  const [showSidebar, setShowSidebar] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [jumpToTimestamp, setJumpToTimestamp] = useState<number | null>(null);

  // Handle jumping to specific timestamp
  useEffect(() => {
    if (jumpToTimestamp !== null) {
      setCurrentTime(jumpToTimestamp);
      setJumpToTimestamp(null);
    }
  }, [jumpToTimestamp]);

  // Expose function to jump to timestamp (can be called from quiz component)
  const handleJumpToTimestamp = (timestamp: number) => {
    setJumpToTimestamp(timestamp);
    setIsPlaying(true);
  };

  // Make the jump function available globally for quiz integration
  useEffect(() => {
    (window as any).videoPlayerJump = handleJumpToTimestamp;
    return () => {
      delete (window as any).videoPlayerJump;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-96 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
          <div className="space-y-4">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const activeLesson = lessons?.[activeLessonIdx];
  const isComputerPartsCourse = course?.subject === "Computer Science" || course?.subject === "Hardware";

  return (
    <div className="max-w-7xl mx-auto">
      <nav className="text-sm text-muted-foreground mb-4" aria-label="Breadcrumb">
        <Link to="/app/courses" className="hover:text-foreground">Courses</Link>
        <span className="mx-2">/</span>
        <Link to={`/app/courses/${id}`} className="hover:text-foreground">{course?.title || "Course"}</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{activeLesson?.title || "Lesson"}</span>
      </nav>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className={cn("space-y-4 transition-all duration-300", showSidebar ? "lg:col-span-2" : "lg:col-span-3")}>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="platform-card overflow-hidden">
            <div className="relative aspect-video bg-foreground/5 flex items-center justify-center" role="region" aria-label="Video player">
              <div className="absolute inset-0 bg-gradient-brand-soft opacity-20" />
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-16 h-16 rounded-full glass-card-heavy flex items-center justify-center hover:scale-105 transition-transform"
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? <Pause className="w-6 h-6 text-foreground" /> : <Play className="w-6 h-6 text-foreground ml-1" />}
              </button>
              <div className="absolute bottom-0 left-0 right-0 px-4 py-3 bg-gradient-to-t from-foreground/30 to-transparent">
                <div className="w-full h-1 bg-muted/30 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-brand rounded-full" style={{ width: "35%" }} />
                </div>
                <div className="flex items-center justify-between mt-2 text-primary-foreground text-xs">
                  <span>{activeLesson?.duration_minutes || 0} min</span>
                  <div className="flex items-center gap-3">
                    <button aria-label="Volume"><Volume2 className="w-4 h-4" /></button>
                    <button aria-label="Fullscreen"><Maximize className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <h1 className="font-display text-lg font-semibold text-foreground">{activeLesson?.title || "Select a lesson"}</h1>
                <p className="text-sm text-muted-foreground">{course?.title}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowSidebar(!showSidebar)}>
                  <Info className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="sm"><Bookmark className="w-4 h-4" /></Button>
                <Button variant="ghost" size="sm"><ThumbsUp className="w-4 h-4" /></Button>
              </div>
            </div>
          </motion.div>

          <div className="platform-card">
            <div className="flex border-b border-border/30" role="tablist">
              {[
                { key: "notes", label: "Notes", icon: FileText },
                { key: "transcript", label: "Content", icon: BookOpen },
                { key: "discussion", label: "Discussion", icon: MessageSquare },
                ...(isComputerPartsCourse ? [{ key: "computer-parts", label: "Computer Parts", icon: Cpu }] : []),
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={activeTab === key}
                  onClick={() => setActiveTab(key as typeof activeTab)}
                  className={cn(
                    "flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2",
                    activeTab === key ? "border-cyan text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
            <div className="p-4">
              {activeTab === "transcript" && (
                <div className="prose prose-sm max-w-none">
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {activeLesson?.content || "No content available for this lesson yet."}
                  </p>
                </div>
              )}
              {activeTab === "notes" && (
                <div className="text-center py-6">
                  <FileText className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Take notes while watching — they'll be saved to your Notes page.</p>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link to="/app/notes">Open Notes</Link>
                  </Button>
                </div>
              )}
              {activeTab === "discussion" && (
                <div className="text-center py-6">
                  <MessageSquare className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Discuss this lesson in the forums!</p>
                  <Button variant="outline" size="sm" className="mt-3" asChild>
                    <Link to="/app/forums">Go to Forums</Link>
                  </Button>
                </div>
              )}
              {activeTab === "computer-parts" && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-4">
                    <Lightbulb className="w-5 h-5 text-amber-400" />
                    <p className="text-sm font-medium text-foreground">Learn about computer hardware components</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {computerParts.map((part) => (
                      <button
                        key={part.id}
                        onClick={() => setSelectedPart(part)}
                        className={cn(
                          "p-4 rounded-xl border border-border/30 transition-all text-left",
                          "hover:border-cyan/50 hover:bg-cyan/5"
                        )}
                      >
                        <part.icon className="w-6 h-6 text-cyan mb-2" />
                        <p className="text-sm font-semibold text-foreground">{part.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{part.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Important Information & Playlist */}
        <AnimatePresence>
          {showSidebar && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              {/* Important Information */}
              <div className="platform-card p-4">
                <h3 className="font-display font-semibold text-foreground mb-3 flex items-center gap-2">
                  <Info className="w-4 h-4 text-cyan" />
                  Important Information
                </h3>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl bg-cyan/5 border border-cyan/20">
                    <p className="text-xs font-medium text-cyan mb-1">Key Concept</p>
                    <p className="text-xs text-muted-foreground">
                      {activeLesson?.content?.substring(0, 100) || "Focus on understanding the core principles before moving to advanced topics."}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-amber/5 border border-amber/20">
                    <p className="text-xs font-medium text-amber mb-1">Pro Tip</p>
                    <p className="text-xs text-muted-foreground">
                      Take notes while watching to reinforce your learning.
                    </p>
                  </div>
                  {isComputerPartsCourse && (
                    <div className="p-3 rounded-xl bg-purple/5 border border-purple/20">
                      <p className="text-xs font-medium text-purple mb-1">Hardware Focus</p>
                      <p className="text-xs text-muted-foreground">
                        Click on Computer Parts tab to explore components.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Lesson Playlist */}
              <div className="platform-card p-4">
                <h3 className="font-display font-semibold text-foreground mb-3">Lesson Playlist</h3>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {(lessons || []).map((lesson, idx) => (
                    <button
                      key={lesson.id}
                      onClick={() => setActiveLessonIdx(idx)}
                      className={cn(
                        "w-full text-left p-3 rounded-xl flex items-center gap-3 transition-all",
                        idx === activeLessonIdx ? "glass-card shadow-soft" : "hover:bg-secondary/30"
                      )}
                    >
                      {idx === activeLessonIdx ? (
                        <Play className="w-4 h-4 text-cyan shrink-0" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-muted-foreground/30 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-medium truncate", idx === activeLessonIdx ? "text-foreground" : "text-muted-foreground")}>{lesson.title}</p>
                        <p className="text-xs text-muted-foreground">{lesson.duration_minutes || 0} min</p>
                      </div>
                    </button>
                  ))}
                  {(lessons || []).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No lessons available</p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Computer Part Detail Modal */}
      <AnimatePresence>
        {selectedPart && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPart(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="platform-card max-w-lg w-full p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center">
                    <selectedPart.icon className="w-6 h-6 text-cyan" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg font-bold text-foreground">{selectedPart.name}</h3>
                    <p className="text-sm text-muted-foreground">{selectedPart.description}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setSelectedPart(null)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="aspect-video bg-slate-900/50 rounded-xl flex items-center justify-center mb-4 border border-border/30">
                <div className="text-center">
                  <Play className="w-12 h-12 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Video coming soon</p>
                </div>
              </div>

              <Button variant="hero" size="default" className="w-full">
                Watch Video
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
