import { motion } from "framer-motion";

export function DNASkeleton() {
  return (
    <div className="space-y-4 fade-swap fade-swap-enter">
      {/* Central DNA Analysis Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="p-6 rounded-xl bg-gradient-to-br from-primary/5 via-cyan/5 to-magenta/5 border border-border/30"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="space-y-2">
            <div className="h-7 w-48 bg-muted/30 rounded animate-pulse" />
            <div className="h-4 w-64 bg-muted/20 rounded animate-pulse" />
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 animate-pulse" />
        </div>

        {/* DNA Visualization Placeholder */}
        <div className="relative h-64 rounded-xl bg-muted/5 border border-border/20 overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="h-16 w-16 mx-auto rounded-full bg-gradient-to-br from-cyan/20 to-magenta/20 animate-pulse" />
              <div className="h-4 w-32 mx-auto bg-muted/30 rounded animate-pulse" />
            </div>
          </div>
          {/* Animated scanning line */}
          <motion.div
            animate={{ y: [0, 256, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan to-transparent"
          />
        </div>
      </motion.div>

      {/* Cognitive Traits Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-3"
      >
        {Array.from({ length: 4 }).map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
            className="p-4 rounded-xl bg-card border border-border/30"
          >
            <div className="h-8 w-8 rounded-lg bg-primary/10 animate-pulse mb-3" />
            <div className="h-4 w-20 bg-muted/30 rounded animate-pulse mb-2" />
            <div className="h-6 w-16 bg-muted/50 rounded animate-pulse" />
          </motion.div>
        ))}
      </motion.div>

      {/* Learning Recommendations */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="p-4 rounded-xl bg-card border border-border/30"
      >
        <div className="h-5 w-40 bg-muted/30 rounded animate-pulse mb-4" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="p-4 rounded-lg bg-secondary/20 border border-border/20"
            >
              <div className="h-10 w-10 rounded-lg bg-orange/10 animate-pulse mb-3" />
              <div className="h-4 w-full bg-muted/30 rounded animate-pulse mb-2" />
              <div className="h-3 w-2/3 bg-muted/20 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </motion.div>

      {/* Study Plan Preview */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-4"
      >
        <div className="p-4 rounded-xl bg-card border border-border/30">
          <div className="h-5 w-32 bg-muted/30 rounded animate-pulse mb-4" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2 rounded-lg bg-secondary/20"
              >
                <div className="h-8 w-8 rounded bg-primary/10 animate-pulse shrink-0" />
                <div className="flex-1">
                  <div className="h-3 w-full bg-muted/30 rounded animate-pulse" />
                </div>
                <div className="h-3 w-12 bg-muted/20 rounded animate-pulse shrink-0" />
              </div>
            ))}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-card border border-border/30">
          <div className="h-5 w-32 bg-muted/30 rounded animate-pulse mb-4" />
          <div className="h-48 bg-muted/10 rounded-lg animate-pulse" />
        </div>
      </motion.div>
    </div>
  );
}
