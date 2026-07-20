import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Circle, User, Compass, Search, Clock, FileText, Target, Award, Rocket, Briefcase, ChevronRight, Sparkles, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useCareer } from "@/hooks/use-career";
import { cn } from "@/lib/utils";

const iconMap: Record<string, React.ComponentType<any>> = {
  User, Compass, Search, Clock, FileText, Target, Award, Rocket, Briefcase
};

import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CareerRoadmap() {
  const { profile, getCompletionPercentage, resetRoadmap } = useCareer();
  const completion = getCompletionPercentage();
  const { toast } = useToast();

  const handleReset = async () => {
    if (confirm("Are you sure you want to reset your roadmap progress?")) {
      await resetRoadmap();
      toast({ title: "Progress reset to 0%" });
    }
  };

  // Calculate progress between milestones
  const getProgressBetween = (currentIndex: number) => {
    if (currentIndex === 0) return 0;
    const completedBefore = profile.milestones.slice(0, currentIndex).filter(m => m.completed).length;
    return (completedBefore / currentIndex) * 100;
  };

  // Find the next incomplete milestone
  const nextMilestoneIndex = profile.milestones.findIndex(m => !m.completed);
  const currentProgress = nextMilestoneIndex === -1 ? 100 : (nextMilestoneIndex / profile.milestones.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header with fluid progress */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="text-center space-y-4"
      >
        <div className="flex items-center justify-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h1 className="text-3xl font-display font-bold text-foreground">Success Roadmap</h1>
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <p className="text-sm text-muted-foreground">Your journey to career readiness</p>
        
        {/* Fluid Progress Bar */}
        <div className="max-w-md mx-auto space-y-3 mt-6">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="font-medium">Journey Progress</span>
            <span className="font-bold text-primary">{Math.round(currentProgress)}%</span>
          </div>
          <div className="relative h-4 bg-secondary rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${currentProgress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary via-accent to-primary rounded-full"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Start</span>
            <span>Complete</span>
          </div>
        </div>
      </motion.div>

      {/* Fluid Path Tracker */}
      <div className="relative py-8">
        {/* Animated path line */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
          <motion.path
            d="M 100 50 Q 400 50 400 150 T 700 250 T 1000 350 T 1300 450"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            className="text-border/30"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
          <motion.path
            d="M 100 50 Q 400 50 400 150 T 700 250 T 1000 350 T 1300 450"
            stroke="url(#gradient)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: currentProgress / 100 }}
            transition={{ duration: 1.5, ease: "easeInOut", delay: 0.2 }}
          />
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="currentColor" className="text-primary" />
              <stop offset="100%" stopColor="currentColor" className="text-accent" />
            </linearGradient>
          </defs>
        </svg>

        {/* Milestones */}
        <div className="relative space-y-8" style={{ zIndex: 1 }}>
          <AnimatePresence>
            {profile.milestones.map((milestone, i) => {
              const Icon = iconMap[milestone.icon] || Circle;
              const isNext = i === nextMilestoneIndex;
              const isCompleted = milestone.completed;
              const isLocked = i > nextMilestoneIndex;
              
              // Calculate position along the path
              const positions = [
                { x: 100, y: 50 },
                { x: 400, y: 150 },
                { x: 700, y: 250 },
                { x: 1000, y: 350 },
                { x: 1300, y: 450 },
              ];
              const pos = positions[i % positions.length] || { x: 100 + (i * 200), y: 50 + (i * 100) };

              return (
                <motion.div
                  key={milestone.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.15, type: "spring", damping: 20 }}
                  className="absolute"
                  style={{ 
                    left: `${(pos.x / 1400) * 100}%`,
                    top: `${(pos.y / 500) * 100}%`,
                    transform: 'translate(-50%, -50%)'
                  }}
                >
                  {/* Milestone Node */}
                  <motion.div
                    whileHover={{ scale: 1.1 }}
                    className={cn(
                      "relative flex items-center justify-center w-16 h-16 rounded-2xl border-2 transition-all shadow-lg",
                      isCompleted 
                        ? "bg-gradient-brand border-primary/30 shadow-soft" 
                        : isNext 
                          ? "bg-card border-primary/50 ring-4 ring-primary/20" 
                          : "bg-card border-border/50 opacity-50"
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="w-8 h-8 text-primary-foreground" />
                    ) : isLocked ? (
                      <Lock className="w-6 h-6 text-muted-foreground" />
                    ) : (
                      <Icon className="w-7 h-7 text-primary" />
                    )}
                    
                    {/* Pulse effect for next milestone */}
                    {isNext && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl bg-primary/20"
                        animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                    )}
                  </motion.div>

                  {/* Milestone Label Card */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15 + 0.2 }}
                    className={cn(
                      "absolute left-20 top-1/2 -translate-y-1/2 w-64 glass-card border-border/30 rounded-xl p-4",
                      isCompleted && "border-primary/20 bg-primary/5"
                    )}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {isCompleted && <CheckCircle2 className="w-4 h-4 text-primary" />}
                      {isNext && <Sparkles className="w-4 h-4 text-accent" />}
                      <h3 className={cn("font-semibold text-sm", isCompleted ? "text-foreground" : "text-muted-foreground")}>
                        {milestone.label}
                      </h3>
                    </div>
                    <p className="text-xs text-muted-foreground">{milestone.description}</p>
                    {isCompleted && milestone.completed_at && (
                      <p className="text-[10px] text-primary mt-1">
                        Completed {new Date(milestone.completed_at).toLocaleDateString()}
                      </p>
                    )}
                    {isNext && (
                      <div className="flex items-center gap-1 mt-2 text-[10px] text-accent font-medium">
                        <span>Next step</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    )}
                  </motion.div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Reset Button */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 1 }}
        className="text-center"
      >
        <Button variant="outline" size="sm" onClick={handleReset} className="gap-2">
          <RotateCcw className="w-4 h-4" /> Reset Journey
        </Button>
      </motion.div>
    </div>
  );
}
