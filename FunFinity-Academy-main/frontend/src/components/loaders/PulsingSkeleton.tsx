import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface PulsingSkeletonProps {
  className?: string;
  variant?: "card" | "text" | "avatar" | "button" | "stat";
  count?: number;
}

export function PulsingSkeleton({ className, variant = "text", count = 1 }: PulsingSkeletonProps) {
  const variants = {
    card: "h-32 rounded-xl",
    text: "h-4 rounded",
    avatar: "h-10 w-10 rounded-full",
    button: "h-10 w-24 rounded-lg",
    stat: "h-16 rounded-xl",
  };

  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={cn("bg-secondary/50", variants[variant])}
          animate={{
            opacity: [0.4, 0.7, 0.4],
            scale: [1, 1.02, 1],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
}

interface PulsingCardSkeletonProps {
  className?: string;
  showAvatar?: boolean;
  showStats?: boolean;
}

export function PulsingCardSkeleton({ className, showAvatar = false, showStats = false }: PulsingCardSkeletonProps) {
  return (
    <div className={cn("platform-card p-6 space-y-4", className)}>
      {showAvatar && (
        <div className="flex items-center gap-4">
          <PulsingSkeleton variant="avatar" />
          <div className="flex-1 space-y-2">
            <PulsingSkeleton variant="text" className="w-3/4" />
            <PulsingSkeleton variant="text" className="w-1/2" />
          </div>
        </div>
      )}
      
      <PulsingSkeleton variant="text" className="w-full" />
      <PulsingSkeleton variant="text" className="w-5/6" />
      <PulsingSkeleton variant="text" className="w-4/6" />
      
      {showStats && (
        <div className="grid grid-cols-3 gap-4 pt-4">
          <PulsingSkeleton variant="stat" />
          <PulsingSkeleton variant="stat" />
          <PulsingSkeleton variant="stat" />
        </div>
      )}
      
      <PulsingSkeleton variant="button" />
    </div>
  );
}

interface PulsingDashboardSkeletonProps {
  className?: string;
}

export function PulsingDashboardSkeleton({ className }: PulsingDashboardSkeletonProps) {
  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2 w-1/3">
          <PulsingSkeleton variant="text" className="w-full h-8" />
          <PulsingSkeleton variant="text" className="w-2/3" />
        </div>
        <PulsingSkeleton variant="button" />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <PulsingCardSkeleton key={i} showStats={false} />
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid lg:grid-cols-2 gap-6">
        <PulsingSkeleton variant="card" className="h-80" />
        <PulsingSkeleton variant="card" className="h-80" />
      </div>

      {/* Recent Activity */}
      <div className="space-y-4">
        <PulsingSkeleton variant="text" className="w-1/4 h-6" />
        {Array.from({ length: 3 }).map((_, i) => (
          <PulsingCardSkeleton key={i} showAvatar={true} />
        ))}
      </div>
    </div>
  );
}
