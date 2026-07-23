import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function CollegeUniversitySkeleton() {
  return (
    <div className="space-y-6">
      {/* Header with search icon */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg bg-[hsl(var(--cyan))]" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-8 w-32 rounded-lg bg-gradient-to-r from-[hsl(var(--cyan))] to-[hsl(var(--orange))]" />
      </div>

      {/* Search and Filters - Color-coded */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 flex-1 rounded-lg border border-[hsl(var(--cyan)/0.3)]" />
        <Skeleton className="h-10 w-40 rounded-lg bg-[hsl(var(--orange)/0.2)]" />
        <Skeleton className="h-10 w-40 rounded-lg bg-[hsl(var(--magenta)/0.2)]" />
      </div>

      {/* College Cards - Unique gradient borders */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[
          { border: 'border-t-4 border-t-[hsl(var(--cyan))]', bg: 'from-[hsl(var(--cyan)/0.02)]' },
          { border: 'border-t-4 border-t-[hsl(var(--orange))]', bg: 'from-[hsl(var(--orange)/0.02)]' },
          { border: 'border-t-4 border-t-[hsl(var(--magenta))]', bg: 'from-[hsl(var(--magenta)/0.02)]' },
          { border: 'border-t-4 border-t-[hsl(var(--cyan))]', bg: 'from-[hsl(var(--cyan)/0.02)]' },
          { border: 'border-t-4 border-t-[hsl(var(--orange))]', bg: 'from-[hsl(var(--orange)/0.02)]' },
          { border: 'border-t-4 border-t-[hsl(var(--magenta))]', bg: 'from-[hsl(var(--magenta)/0.02)]' }
        ].map((theme, i) => (
          <Card key={i} className={`${theme.border} border border-border/30 h-full bg-gradient-to-br ${theme.bg} to-transparent`}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-6 rounded-full bg-[hsl(var(--cyan))]" />
                  <Skeleton className="h-6 w-6 rounded-full bg-[hsl(var(--orange))]" />
                  <Skeleton className="h-6 w-16 rounded-full bg-[hsl(var(--magenta))]" />
                </div>
              </div>
              
              <Skeleton className="h-5 w-48 mb-2" />
              <Skeleton className="h-4 w-32 mb-3" />
              
              <div className="space-y-2 mb-3">
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <Skeleton className="h-6 w-16 rounded-full bg-[hsl(var(--cyan)/0.2)]" />
                <Skeleton className="h-6 w-20 rounded-full bg-[hsl(var(--orange)/0.2)]" />
                <Skeleton className="h-6 w-14 rounded-full bg-[hsl(var(--magenta)/0.2)]" />
              </div>
              
              <Skeleton className="h-9 w-full rounded-lg bg-gradient-to-r from-[hsl(var(--cyan))] to-[hsl(var(--orange))]" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
