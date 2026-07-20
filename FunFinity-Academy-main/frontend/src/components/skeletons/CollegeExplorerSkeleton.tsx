import { motion } from "framer-motion";

export function CollegeExplorerSkeleton() {
  return (
    <div className="space-y-4 fade-swap fade-swap-enter">
      {/* Search and Filters Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 rounded-xl bg-card border border-border/30"
      >
        <div className="flex flex-col lg:flex-row gap-3">
          <div className="flex-1 h-10 bg-secondary/30 rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-primary/20 rounded-lg animate-pulse shrink-0" />
        </div>
        <div className="flex flex-wrap gap-2 mt-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-24 bg-muted/20 rounded-lg animate-pulse"
            />
          ))}
        </div>
      </motion.div>

      {/* Map View Placeholder */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="h-64 rounded-xl bg-gradient-to-br from-cyan/5 to-magenta/5 border border-border/30 relative overflow-hidden"
      >
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 animate-pulse" />
            <div className="h-4 w-32 mx-auto bg-muted/30 rounded animate-pulse" />
          </div>
        </div>
        {/* Radar scanning effect */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute top-1/2 left-1/2 w-48 h-48 -translate-x-1/2 -translate-y-1/2"
          style={{
            background: 'conic-gradient(from 0deg, transparent 0deg, hsl(var(--cyan) / 0.1) 60deg, transparent 120deg)',
            borderRadius: '50%',
          }}
        />
      </motion.div>

      {/* Results Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-between"
      >
        <div className="h-5 w-48 bg-muted/30 rounded animate-pulse" />
        <div className="flex gap-2">
          <div className="h-8 w-24 bg-muted/20 rounded-lg animate-pulse" />
          <div className="h-8 w-24 bg-muted/20 rounded-lg animate-pulse" />
        </div>
      </motion.div>

      {/* University Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            className="p-4 rounded-xl bg-card border border-border/30"
          >
            {/* Thumbnail */}
            <div className="h-32 w-full bg-gradient-to-br from-primary/5 to-magenta/5 rounded-lg mb-3 animate-pulse relative overflow-hidden">
              <motion.div
                animate={{ x: [-100, 400] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              />
            </div>
            
            {/* Title and Location */}
            <div className="space-y-2 mb-3">
              <div className="h-5 w-full bg-muted/30 rounded animate-pulse" />
              <div className="h-4 w-2/3 bg-muted/20 rounded animate-pulse" />
            </div>

            {/* Stats Row */}
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-16 bg-success/20 rounded animate-pulse" />
              <div className="h-6 w-16 bg-primary/20 rounded animate-pulse" />
              <div className="h-6 w-16 bg-orange/20 rounded animate-pulse" />
            </div>

            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, j) => (
                <div
                  key={j}
                  className="h-6 w-16 bg-muted/10 rounded-full animate-pulse"
                />
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
