import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function LiveClassesSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header with live indicator */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg bg-[hsl(var(--magenta))]" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Active Users - Live indicator */}
      <Card className="border-2 border-[hsl(var(--magenta)/0.3)] bg-gradient-to-br from-[hsl(var(--magenta)/0.02)] to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6 rounded-full bg-[hsl(var(--magenta))]" />
              <Skeleton className="h-6 w-32" />
            </div>
            <Skeleton className="h-8 w-24 rounded-lg bg-[hsl(var(--magenta)/0.2)]" />
          </div>
          <div className="flex items-center gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-10 w-10 rounded-full bg-[hsl(var(--cyan)/0.2)]" />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Live Class Cards - Video thumbnails */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-6 w-6 rounded-full bg-[hsl(var(--orange))]" />
        </div>
        <div className="grid md:grid-cols-2 gap-4">
          {[
            { color: 'cyan', border: 'border-t-4 border-t-[hsl(var(--cyan))]' },
            { color: 'orange', border: 'border-t-4 border-t-[hsl(var(--orange))]' }
          ].map((theme, i) => (
            <Card key={i} className={`${theme.border} border border-border/30`}>
              <CardContent className="p-6">
                <Skeleton className={`h-40 w-full rounded-lg mb-4 bg-[hsl(var(--${theme.color})/0.1)]`} />
                <Skeleton className="h-6 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-3" />
                <div className="flex items-center gap-2 mb-4">
                  <Skeleton className={`h-4 w-4 bg-[hsl(var(--${theme.color}))]`} />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-10 w-full rounded-lg bg-gradient-to-r from-[hsl(var(--cyan))] to-[hsl(var(--orange))]" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Upcoming Events - Timeline style */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-48" />
        <div className="space-y-3">
          {['cyan', 'orange', 'magenta'].map((color, i) => (
            <Card key={i} className={`border-l-4 border-l-[hsl(var(--${color}))] border border-border/30 bg-gradient-to-r from-[hsl(var(--${color})/0.02)] to-transparent`}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <Skeleton className={`h-16 w-16 rounded-xl bg-[hsl(var(--${color}))]`} />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-64" />
                    <Skeleton className={`h-3 w-32 bg-[hsl(var(--${color})/0.3)]`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
