import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function CalendarSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header with date navigation */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-8 w-8 rounded-lg bg-[hsl(var(--cyan))]" />
            <Skeleton className="h-8 w-48" />
          </div>
          <Skeleton className="h-4 w-72" />
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-10 w-10 rounded-lg" />
          <Skeleton className="h-10 w-32 rounded-lg" />
          <Skeleton className="h-10 w-10 rounded-lg" />
        </div>
      </div>

      {/* Today's Schedule - Timeline design */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-6 rounded-full bg-[hsl(var(--orange))]" />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <Card key={i} className="border-l-4 border-l-[hsl(var(--cyan))] border border-border/30 bg-gradient-to-r from-[hsl(var(--cyan)/0.05)] to-transparent">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="text-center">
                    <Skeleton className="h-8 w-8 rounded-lg mb-1 bg-[hsl(var(--orange))]" />
                    <Skeleton className="h-3 w-8" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-4 w-24" />
                    <div className="flex gap-2">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Week View - Calendar grid with color coding */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
          {['cyan', 'orange', 'magenta', 'cyan', 'orange', 'magenta', 'cyan'].map((color, i) => (
            <Card key={i} className={`border-t-4 border-t-[hsl(var(--${color}))] border border-border/30 min-h-[160px] bg-gradient-to-b from-[hsl(var(--${color})/0.03)] to-transparent`}>
              <CardContent className="p-3">
                <div className="flex items-center justify-between mb-3">
                  <Skeleton className={`h-4 w-8 rounded bg-[hsl(var(--${color})/0.3)]`} />
                  <Skeleton className="h-6 w-6 rounded-full bg-[hsl(var(--${color}))]" />
                </div>
                <div className="space-y-2">
                  {[1, 2].map((j) => (
                    <Skeleton key={j} className={`h-8 w-full rounded-lg bg-[hsl(var(--${color})/0.1)]`} />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
