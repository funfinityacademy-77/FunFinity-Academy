import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header with gradient accent */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-8 rounded-xl bg-gradient-to-br from-[hsl(var(--cyan))] to-[hsl(var(--orange))]" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Welcome Banner - Unique gradient design */}
      <Card className="border-2 border-[hsl(var(--cyan)/0.3)] bg-gradient-to-r from-[hsl(var(--cyan)/0.05)] via-[hsl(var(--orange)/0.05)] to-[hsl(var(--magenta)/0.05)]">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="relative">
              <Skeleton className="h-16 w-16 rounded-xl" />
              <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[hsl(var(--magenta))]" />
            </div>
            <div className="flex-1 space-y-2">
              <Skeleton className="h-6 w-48 bg-gradient-to-r from-[hsl(var(--cyan)/0.5)] to-[hsl(var(--orange)/0.5)]" />
              <Skeleton className="h-4 w-64" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid - Color-coded cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { color: 'from-[hsl(var(--cyan))]', bg: 'from-[hsl(var(--cyan)/0.1)]' },
          { color: 'from-[hsl(var(--orange))]', bg: 'from-[hsl(var(--orange)/0.1)]' },
          { color: 'from-[hsl(var(--magenta))]', bg: 'from-[hsl(var(--magenta)/0.1)]' },
          { color: 'from-[hsl(var(--cyan))]', bg: 'from-[hsl(var(--cyan)/0.1)]' }
        ].map((theme, i) => (
          <Card key={i} className={`border border-[${theme.color}/0.3] bg-gradient-to-br ${theme.bg} to-transparent`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <Skeleton className={`h-9 w-9 rounded-xl bg-gradient-to-br ${theme.color}`} />
                <Skeleton className="h-2 w-8 rounded-full" />
              </div>
              <Skeleton className="h-6 w-16 mb-1" />
              <Skeleton className="h-3 w-24" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Courses Section - Card layout with progress indicators */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-6 rounded-full" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="border border-border/30 overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-[hsl(var(--cyan))] via-[hsl(var(--orange))] to-[hsl(var(--magenta))]" />
              <CardContent className="p-4">
                <div className="flex gap-3 mb-3">
                  <Skeleton className="h-20 w-20 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-16" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Quick Links - Circular icon design */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            'from-[hsl(var(--cyan))]',
            'from-[hsl(var(--orange))]',
            'from-[hsl(var(--magenta))]',
            'from-[hsl(var(--cyan))]'
          ].map((gradient, i) => (
            <Card key={i} className="border border-border/30 hover:shadow-lg transition-shadow">
              <CardContent className="p-4 flex flex-col items-center">
                <Skeleton className={`h-12 w-12 rounded-full bg-gradient-to-br ${gradient} mb-3`} />
                <Skeleton className="h-4 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
