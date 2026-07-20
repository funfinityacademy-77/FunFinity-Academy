import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Loader2, Sparkles, BookOpen, Target, TrendingUp } from 'lucide-react';
import { FunfinityIcon } from '@/components/brand/FunfinityLogo';

interface SkeletonLoaderProps {
  type?: 'page' | 'card' | 'list' | 'table' | 'dashboard';
  count?: number;
  className?: string;
  showIcon?: boolean;
}

export function SkeletonLoader({ type = 'page', count = 1, className, showIcon = true }: SkeletonLoaderProps) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonItem key={i} type={type} index={i} showIcon={showIcon} />
      ))}
    </div>
  );
}

function SkeletonItem({ type, index, showIcon }: { type: string; index: number; showIcon: boolean }) {
  const delay = index * 0.05;

  switch (type) {
    case 'page':
      return <PageSkeleton delay={delay} showIcon={showIcon} />;
    case 'card':
      return <CardSkeleton delay={delay} showIcon={showIcon} />;
    case 'list':
      return <ListSkeleton delay={delay} showIcon={showIcon} />;
    case 'table':
      return <TableSkeleton delay={delay} />;
    case 'dashboard':
      return <DashboardSkeleton delay={delay} showIcon={showIcon} />;
    default:
      return <PageSkeleton delay={delay} showIcon={showIcon} />;
  }
}

function PageSkeleton({ delay, showIcon }: { delay: number; showIcon: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      className="space-y-6"
    >
      {/* Header with animated icon */}
      <div className="flex items-center gap-4">
        {showIcon && (
          <motion.div
            animate={{ 
              rotate: 360,
              scale: [1, 1.1, 1]
            }}
            transition={{ 
              rotate: { duration: 2, repeat: Infinity, ease: "linear" },
              scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
            }}
            className="relative"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
            <motion.div
              className="absolute -top-1 -right-1"
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Sparkles className="w-4 h-4 text-accent" />
            </motion.div>
          </motion.div>
        )}
        <div className="flex-1 space-y-3">
          <div className="skeleton-premium h-8 w-48 rounded-lg" />
          <div className="skeleton-premium h-4 w-64 rounded-lg" />
        </div>
      </div>

      {/* Content blocks with staggered animation */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: delay + (i * 0.1), ease: [0.4, 0, 0.2, 1] }}
            className="skeleton-premium h-32 rounded-xl relative overflow-hidden"
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: delay + 0.4, ease: [0.4, 0, 0.2, 1] }}
        className="skeleton-premium h-64 rounded-xl relative overflow-hidden"
      >
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          animate={{ x: ['-100%', '100%'] }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    </motion.div>
  );
}

function CardSkeleton({ delay, showIcon }: { delay: number; showIcon: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      className="p-6 rounded-xl border border-border/20 bg-card relative overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5 opacity-0"
        animate={{ opacity: [0, 0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <div className="flex items-start gap-4 relative z-10">
        {showIcon && (
          <motion.div
            animate={{ 
              scale: [1, 1.1, 1],
              rotate: [-5, 5, -5]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="skeleton-premium w-12 h-12 rounded-xl flex items-center justify-center"
          >
            <BookOpen className="w-6 h-6 text-muted-foreground/50" />
          </motion.div>
        )}
        <div className="flex-1 space-y-3">
          <div className="skeleton-premium h-5 w-3/4 rounded-lg" />
          <div className="skeleton-premium h-4 w-full rounded-lg" />
          <div className="skeleton-premium h-4 w-2/3 rounded-lg" />
        </div>
      </div>
    </motion.div>
  );
}

function ListSkeleton({ delay, showIcon }: { delay: number; showIcon: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      className="p-4 rounded-xl border border-border/20 bg-card space-y-3"
    >
      <div className="flex items-center gap-3">
        {showIcon && (
          <motion.div
            animate={{ 
              scale: [1, 1.15, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="skeleton-premium w-10 h-10 rounded-lg flex items-center justify-center"
          >
            <Target className="w-5 h-5 text-muted-foreground/50" />
          </motion.div>
        )}
        <div className="flex-1 space-y-2">
          <div className="skeleton-premium h-4 w-1/2 rounded-lg" />
          <div className="skeleton-premium h-3 w-1/3 rounded-lg" />
        </div>
      </div>
    </motion.div>
  );
}

function TableSkeleton({ delay }: { delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      className="space-y-3"
    >
      {/* Header */}
      <div className="flex gap-4 p-4 rounded-lg bg-muted/30">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: delay + (i * 0.05), ease: [0.4, 0, 0.2, 1] }}
            className="skeleton-premium h-4 flex-1 rounded"
          />
        ))}
      </div>

      {/* Rows */}
      {Array.from({ length: 5 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: delay + 0.2 + (i * 0.08), ease: [0.4, 0, 0.2, 1] }}
          className="flex gap-4 p-4 rounded-lg border border-border/10"
        >
          {[1, 2, 3, 4, 5].map((j) => (
            <div key={j} className="skeleton-premium h-4 flex-1 rounded" />
          ))}
        </motion.div>
      ))}
    </motion.div>
  );
}

function DashboardSkeleton({ delay, showIcon }: { delay: number; showIcon: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay, ease: [0.4, 0, 0.2, 1] }}
      className="space-y-6"
    >
      {/* Stats cards with icons */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { icon: BookOpen, color: 'text-primary' },
          { icon: TrendingUp, color: 'text-cyan' },
          { icon: Target, color: 'text-accent' },
          { icon: Sparkles, color: 'text-magenta' }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20, rotate: -5 }}
            animate={{ opacity: 1, y: 0, rotate: 0 }}
            transition={{ duration: 0.5, delay: delay + (i * 0.1), ease: [0.4, 0, 0.2, 1] }}
            className="skeleton-premium p-4 rounded-xl h-24 relative overflow-hidden flex items-center gap-3"
          >
            {showIcon && (
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className={`w-10 h-10 rounded-lg bg-background/50 flex items-center justify-center ${item.color}`}
              >
                <item.icon className="w-5 h-5" />
              </motion.div>
            )}
            <div className="flex-1 space-y-2">
              <div className="skeleton-premium h-4 w-20 rounded" />
              <div className="skeleton-premium h-6 w-16 rounded" />
            </div>
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
              animate={{ x: ['-100%', '100%'] }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            />
          </motion.div>
        ))}
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: delay + 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="skeleton-premium md:col-span-2 h-64 rounded-xl relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: delay + 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="skeleton-premium h-64 rounded-xl relative overflow-hidden"
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: 0.5 }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
