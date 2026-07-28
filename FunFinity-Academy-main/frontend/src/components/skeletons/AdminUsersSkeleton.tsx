import { motion } from "framer-motion";

export function AdminUsersSkeleton() {
  return (
    <div className="space-y-4 fade-swap fade-swap-enter">
      {/* Header and Actions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4"
      >
        <div className="space-y-2">
          <div className="h-7 w-48 bg-muted/30 rounded animate-pulse" />
          <div className="h-4 w-64 bg-muted/20 rounded animate-pulse" />
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-32 bg-primary/20 rounded-lg animate-pulse" />
          <div className="h-10 w-32 bg-muted/20 rounded-lg animate-pulse" />
        </div>
      </motion.div>

      {/* Filters Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-3 p-4 rounded-xl bg-card border border-border/30"
      >
        <div className="flex-1 min-w-64 h-10 bg-secondary/30 rounded-lg animate-pulse" />
        <div className="h-10 w-40 bg-muted/20 rounded-lg animate-pulse" />
        <div className="h-10 w-32 bg-muted/20 rounded-lg animate-pulse" />
      </motion.div>

      {/* User Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl bg-card border border-border/30 overflow-hidden"
      >
        {/* Table Header */}
        <div className="flex items-center gap-3 p-4 border-b border-border/30 bg-secondary/20">
          <div className="h-5 w-8 bg-muted/30 rounded animate-pulse" />
          <div className="h-5 w-32 bg-muted/30 rounded animate-pulse" />
          <div className="h-5 w-24 bg-muted/30 rounded animate-pulse" />
          <div className="h-5 w-20 bg-muted/30 rounded animate-pulse ml-auto" />
          <div className="h-5 w-16 bg-muted/30 rounded animate-pulse" />
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-border/20">
          {Array.from({ length: 8 }).map((_, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.03 }}
              className="flex items-center gap-3 p-4 hover:bg-secondary/10 transition-colors"
            >
              {/* User Avatar and Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="h-10 w-10 rounded-full bg-primary/10 animate-pulse shrink-0" />
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="h-4 w-32 bg-muted/30 rounded animate-pulse" />
                  <div className="h-3 w-48 bg-muted/20 rounded animate-pulse" />
                </div>
              </div>

              {/* Role Badge */}
              <div className="h-7 w-20 bg-muted/20 rounded-full animate-pulse shrink-0" />

              {/* Status */}
              <div className="h-6 w-16 bg-success/20 rounded animate-pulse shrink-0" />

              {/* Join Date */}
              <div className="h-4 w-24 bg-muted/20 rounded animate-pulse shrink-0" />

              {/* Actions */}
              <div className="flex gap-2 shrink-0">
                <div className="h-8 w-8 bg-muted/20 rounded-lg animate-pulse" />
                <div className="h-8 w-8 bg-muted/20 rounded-lg animate-pulse" />
                <div className="h-8 w-8 bg-destructive/20 rounded-lg animate-pulse" />
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* User Detail Panel (Split View) */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-4"
      >
        {/* Identity Card */}
        <div className="p-4 rounded-xl bg-card border border-border/30">
          <div className="h-5 w-28 bg-muted/30 rounded animate-pulse mb-4" />
          <div className="flex flex-col items-center space-y-3">
            <div className="h-20 w-20 rounded-full bg-primary/10 animate-pulse" />
            <div className="space-y-2 w-full">
              <div className="h-5 w-32 bg-muted/30 rounded animate-pulse mx-auto" />
              <div className="h-4 w-48 bg-muted/20 rounded animate-pulse mx-auto" />
            </div>
            <div className="flex gap-2 w-full">
              <div className="h-8 w-16 bg-primary/20 rounded-lg animate-pulse flex-1" />
              <div className="h-8 w-16 bg-muted/20 rounded-lg animate-pulse flex-1" />
            </div>
          </div>
        </div>

        {/* Academic Data */}
        <div className="p-4 rounded-xl bg-card border border-border/30">
          <div className="h-5 w-32 bg-muted/30 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-4 w-24 bg-muted/30 rounded animate-pulse" />
                <div className="h-4 w-16 bg-muted/20 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Enforcement Panel */}
        <div className="p-4 rounded-xl bg-card border border-border/30">
          <div className="h-5 w-28 bg-muted/30 rounded animate-pulse mb-4" />
          <div className="space-y-3">
            {/* Restriction Module */}
            <div className="p-3 rounded-lg bg-secondary/20 border border-border/20">
              <div className="h-4 w-20 bg-muted/30 rounded animate-pulse mb-2" />
              <div className="flex items-center gap-2">
                <div className="h-8 w-16 bg-orange/20 rounded-lg animate-pulse" />
                <div className="h-8 w-16 bg-muted/20 rounded-lg animate-pulse" />
              </div>
            </div>
            {/* Ban Module */}
            <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <div className="h-4 w-16 bg-destructive/30 rounded animate-pulse mb-2" />
              <div className="h-8 w-20 bg-destructive/20 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
