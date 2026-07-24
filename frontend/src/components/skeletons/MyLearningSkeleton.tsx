import { motion } from "framer-motion";

export function MyLearningSkeleton() {
  return (
    <div className="space-y-4 fade-swap fade-swap-enter">
      {/* Header Skeleton */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-2"
      >
        <div className="h-8 w-48 bg-muted/30 rounded animate-pulse" />
        <div className="h-4 w-32 bg-muted/20 rounded animate-pulse" />
      </motion.div>

      {/* Course Cards Skeleton */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="platform-card p-4"
        >
          <div className="flex items-start gap-4">
            {/* Icon Skeleton */}
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 animate-pulse shrink-0" />
            
            {/* Content Skeleton */}
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-5 w-3/4 bg-muted/30 rounded animate-pulse" />
              <div className="h-4 w-1/2 bg-muted/20 rounded animate-pulse" />
              
              {/* Progress Bar Skeleton */}
              <div className="flex items-center gap-2 mt-3">
                <div className="h-2 flex-1 bg-muted/20 rounded-full animate-pulse" />
                <div className="h-4 w-10 bg-muted/20 rounded animate-pulse" />
              </div>
            </div>
            
            {/* Button Skeleton */}
            <div className="h-10 w-10 rounded-lg bg-muted/20 animate-pulse shrink-0" />
          </div>
        </motion.div>
      ))}
    </div>
  );
}
