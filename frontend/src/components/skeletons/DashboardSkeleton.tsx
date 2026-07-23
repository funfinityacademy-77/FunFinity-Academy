import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function DashboardSkeleton() {
  return (
    <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6">
      {/* Welcome Banner Skeleton - Exact spatial footprint match */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="platform-card p-4 sm:p-6 lg:p-8 relative overflow-hidden min-h-[200px]"
      >
        <div className="absolute inset-0 bg-gradient-brand-soft opacity-50" />
        <div className="absolute top-0 right-0 w-32 h-32 sm:w-48 sm:h-48 md:w-64 md:h-64 bg-glow-cyan opacity-30" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex-1 space-y-4">
            {/* Learning DNA Adaptation Tags Skeleton */}
            <div className="flex flex-wrap gap-2 min-h-[28px]">
              {[1, 2].map((i) => (
                <div key={i} className="h-6 w-32 rounded-full bg-primary/10 border border-primary/20 animate-pulse" />
              ))}
            </div>
            
            {/* Title and subtitle */}
            <div className="space-y-2">
              <div className="h-8 w-64 bg-muted/30 rounded animate-pulse" />
              <div className="h-4 w-96 bg-muted/20 rounded animate-pulse" />
            </div>
            
            {/* Buttons */}
            <div className="flex gap-3">
              <div className="h-10 w-40 bg-primary/20 rounded-lg animate-pulse" />
              <div className="h-10 w-32 bg-muted/20 rounded-lg animate-pulse" />
            </div>
          </div>
          
          {/* XP Card Skeleton */}
          <div className="shrink-0">
            <div className="platform-card p-4 min-w-[160px] text-center bg-gradient-to-br from-cyan/10 to-magenta/10 border-cyan/20 min-h-[120px]">
              <div className="h-3 w-16 bg-muted/30 rounded animate-pulse mx-auto mb-2" />
              <div className="h-8 w-20 bg-muted/50 rounded animate-pulse mx-auto mb-1" />
              <div className="h-3 w-24 bg-muted/20 rounded animate-pulse mx-auto" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* DashboardCharts Section Skeleton - Exact min-h match */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="min-h-[650px] p-4 rounded-xl bg-card border border-border/30"
      >
        <div className="h-full w-full bg-muted/10 rounded-lg animate-pulse" />
      </motion.div>

      {/* Grid Layout Skeleton - Exact lg:grid-cols-4 structure */}
      <div className="grid lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Main Content - lg:col-span-3 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3 space-y-4 sm:space-y-6"
        >
          {/* Continue Learning Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="h-7 w-48 bg-muted/30 rounded animate-pulse" />
              <div className="h-5 w-20 bg-muted/20 rounded animate-pulse" />
            </div>
            
            {/* Course Cards Grid */}
            <div className="grid md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="platform-card p-4 space-y-3">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-xl bg-primary/10 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-5 w-3/4 bg-muted/30 rounded animate-pulse" />
                      <div className="h-4 w-1/2 bg-muted/20 rounded animate-pulse" />
                      <div className="flex items-center gap-2 mt-3">
                        <div className="h-2 flex-1 bg-muted/20 rounded-full animate-pulse" />
                        <div className="h-4 w-10 bg-muted/20 rounded animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional sections placeholder */}
          <div className="space-y-4">
            <div className="h-7 w-40 bg-muted/30 rounded animate-pulse" />
            <div className="platform-card p-6 min-h-[200px]">
              <div className="h-full w-full bg-muted/10 rounded-lg animate-pulse" />
            </div>
          </div>
        </motion.div>

        {/* Sidebar - lg:col-span-1 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="space-y-4 sm:space-y-6"
        >
          {/* Calendar Section */}
          <div className="platform-card p-4 min-h-[250px]">
            <div className="h-5 w-28 bg-muted/30 rounded animate-pulse mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/20">
                  <div className="h-8 w-8 rounded-full bg-orange/10 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-1">
                    <div className="h-3 w-full bg-muted/30 rounded animate-pulse" />
                    <div className="h-2 w-2/3 bg-muted/20 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Section */}
          <div className="platform-card p-4 min-h-[200px]">
            <div className="h-5 w-32 bg-muted/30 rounded animate-pulse mb-4" />
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/20">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 animate-pulse shrink-0" />
                  <div className="flex-1">
                    <div className="h-3 w-full bg-muted/30 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
