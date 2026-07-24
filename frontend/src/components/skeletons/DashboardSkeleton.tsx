import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function DashboardSkeleton() {
  return (
    <div className="space-y-4 fade-swap fade-swap-enter">
      {/* Welcome Banner Skeleton */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="h-24 rounded-xl bg-gradient-to-r from-primary/10 to-magenta/10 border border-border/30"
      >
        <div className="h-full flex items-center px-6">
          <div className="space-y-2 flex-1">
            <div className="h-6 w-48 bg-muted/50 rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted/30 rounded animate-pulse" />
          </div>
          <div className="h-10 w-32 bg-primary/20 rounded-lg animate-pulse" />
        </div>
      </motion.div>

      {/* Metrics Grid Skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-4 rounded-xl bg-card border border-border/30"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="h-8 w-8 rounded-lg bg-primary/10 animate-pulse" />
              <div className="h-4 w-16 bg-muted/30 rounded animate-pulse" />
            </div>
            <div className="h-8 w-20 bg-muted/50 rounded animate-pulse mb-1" />
            <div className="h-3 w-12 bg-muted/20 rounded animate-pulse" />
          </motion.div>
        ))}
      </div>

      {/* Charts Section Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-xl bg-card border border-border/30"
        >
          <div className="h-5 w-32 bg-muted/30 rounded animate-pulse mb-4" />
          <div className="h-48 bg-muted/10 rounded-lg animate-pulse" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="p-4 rounded-xl bg-card border border-border/30"
        >
          <div className="h-5 w-32 bg-muted/30 rounded animate-pulse mb-4" />
          <div className="h-48 bg-muted/10 rounded-lg animate-pulse" />
        </motion.div>
      </div>

      {/* Courses Section Skeleton */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="p-4 rounded-xl bg-card border border-border/30"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-28 bg-muted/30 rounded animate-pulse" />
          <div className="h-8 w-24 bg-primary/20 rounded-lg animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-3 rounded-lg bg-secondary/30 border border-border/20"
            >
              <div className="h-24 w-full bg-muted/20 rounded-lg mb-3 animate-pulse" />
              <div className="h-4 w-full bg-muted/30 rounded animate-pulse mb-2" />
              <div className="h-3 w-2/3 bg-muted/20 rounded animate-pulse mb-3" />
              <div className="flex items-center gap-2">
                <div className="h-2 w-16 bg-primary/20 rounded-full animate-pulse" />
                <div className="h-2 w-8 bg-muted/20 rounded-full animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Calendar & Activity Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2 p-4 rounded-xl bg-card border border-border/30"
        >
          <div className="h-5 w-32 bg-muted/30 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20"
              >
                <div className="h-10 w-10 rounded-lg bg-primary/10 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-muted/30 rounded animate-pulse" />
                  <div className="h-3 w-32 bg-muted/20 rounded animate-pulse" />
                </div>
                <div className="h-8 w-20 bg-muted/20 rounded-lg animate-pulse shrink-0" />
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-xl bg-card border border-border/30"
        >
          <div className="h-5 w-28 bg-muted/30 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2 rounded-lg bg-secondary/20"
              >
                <div className="h-8 w-8 rounded-full bg-orange/10 animate-pulse shrink-0" />
                <div className="flex-1">
                  <div className="h-3 w-full bg-muted/30 rounded animate-pulse" />
                </div>
                <div className="h-3 w-8 bg-muted/20 rounded animate-pulse shrink-0" />
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
