import { motion } from "framer-motion";

export function MyLearningSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header Skeleton - Exact match */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-2"
      >
        <div className="h-10 w-64 bg-muted/30 rounded animate-pulse" />
        <div className="h-5 w-32 bg-muted/20 rounded animate-pulse" />
      </motion.div>

      {/* Course Cards Skeleton - Exact layout match */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className="platform-card p-5"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-start gap-4 flex-1 min-w-0">
              {/* Icon Skeleton - Exact w-14 h-14 rounded-2xl */}
              <div className="w-14 h-14 rounded-2xl bg-primary/10 animate-pulse shrink-0" />
              
              {/* Content Skeleton */}
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-6 w-3/4 bg-muted/30 rounded animate-pulse" />
                
                {/* Progress Bar Skeleton */}
                <div className="flex items-center gap-2">
                  <div className="h-2 flex-1 bg-muted/20 rounded-full animate-pulse" />
                  <div className="h-5 w-10 bg-muted/20 rounded animate-pulse" />
                </div>
                
                {/* Metadata Skeleton */}
                <div className="space-y-1">
                  <div className="h-4 w-48 bg-muted/20 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-muted/20 rounded animate-pulse" />
                </div>
              </div>
            </div>
            
            {/* Buttons Skeleton */}
            <div className="flex sm:flex-col gap-2 shrink-0">
              <div className="h-9 w-24 bg-primary/20 rounded-lg animate-pulse" />
              <div className="h-9 w-20 bg-muted/20 rounded-lg animate-pulse" />
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
