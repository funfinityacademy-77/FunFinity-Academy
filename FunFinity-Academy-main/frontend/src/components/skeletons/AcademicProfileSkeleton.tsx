import { motion } from "framer-motion";

export function AcademicProfileSkeleton() {
  return (
    <div className="space-y-4 fade-swap fade-swap-enter">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 rounded-xl bg-card border border-border/30"
      >
        <div className="flex items-start gap-4">
          <div className="h-16 w-16 rounded-full bg-primary/10 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-6 w-48 bg-muted/30 rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted/20 rounded animate-pulse" />
          </div>
          <div className="h-10 w-24 bg-primary/20 rounded-lg animate-pulse shrink-0" />
        </div>
      </motion.div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-3 rounded-xl bg-card border border-border/30"
          >
            <div className="h-4 w-20 bg-muted/30 rounded animate-pulse mb-2" />
            <div className="h-7 w-16 bg-muted/50 rounded animate-pulse" />
          </motion.div>
        ))}
      </div>

      {/* Academic Records Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="p-4 rounded-xl bg-card border border-border/30"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="h-5 w-32 bg-muted/30 rounded animate-pulse" />
          <div className="h-8 w-32 bg-primary/20 rounded-lg animate-pulse" />
        </div>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-lg bg-secondary/20"
            >
              <div className="h-10 w-10 rounded-lg bg-primary/10 animate-pulse shrink-0" />
              <div className="flex-1 space-y-1">
                <div className="h-4 w-32 bg-muted/30 rounded animate-pulse" />
                <div className="h-3 w-24 bg-muted/20 rounded animate-pulse" />
              </div>
              <div className="h-6 w-12 bg-success/20 rounded animate-pulse shrink-0" />
              <div className="h-6 w-12 bg-muted/20 rounded animate-pulse shrink-0" />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Subject Breakdown */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <div className="p-4 rounded-xl bg-card border border-border/30">
          <div className="h-5 w-28 bg-muted/30 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-4 w-24 bg-muted/30 rounded animate-pulse" />
                  <div className="h-4 w-12 bg-muted/20 rounded animate-pulse" />
                </div>
                <div className="h-2 w-full bg-muted/10 rounded-full animate-pulse" />
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/30">
          <div className="h-5 w-28 bg-muted/30 rounded animate-pulse mb-4" />
          <div className="h-48 bg-muted/10 rounded-lg animate-pulse" />
        </div>
      </motion.div>
    </div>
  );
}
