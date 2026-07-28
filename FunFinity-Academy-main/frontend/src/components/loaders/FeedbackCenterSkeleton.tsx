import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function FeedbackCenterSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header with icon */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg bg-[hsl(var(--magenta))]" />
          <Skeleton className="h-8 w-64" />
        </div>
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Report Type Cards - Color-coded */}
      <div className="grid md:grid-cols-2 gap-4">
        {[
          { color: 'cyan', border: 'border-l-4 border-l-[hsl(var(--cyan))]', bg: 'from-[hsl(var(--cyan)/0.02)]' },
          { color: 'orange', border: 'border-l-4 border-l-[hsl(var(--orange))]', bg: 'from-[hsl(var(--orange)/0.02)]' },
          { color: 'magenta', border: 'border-l-4 border-l-[hsl(var(--magenta))]', bg: 'from-[hsl(var(--magenta)/0.02)]' },
          { color: 'cyan', border: 'border-l-4 border-l-[hsl(var(--cyan))]', bg: 'from-[hsl(var(--cyan)/0.02)]' }
        ].map((theme, i) => (
          <Card key={i} className={`${theme.border} border border-border/30 h-full bg-gradient-to-br ${theme.bg} to-transparent`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <Skeleton className={`h-12 w-12 rounded-xl bg-[hsl(var(--${theme.color}))]`} />
                <Skeleton className={`h-6 w-16 rounded-full bg-[hsl(var(--${theme.color})/0.3)]`} />
              </div>
              
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-full mb-4" />
              
              <div className="flex items-center">
                <Skeleton className="h-4 w-24" />
                <Skeleton className={`h-4 w-4 ml-2 bg-[hsl(var(--${theme.color}))]`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Tips - Gradient card */}
      <Card className="border-2 border-[hsl(var(--orange)/0.3)] bg-gradient-to-br from-[hsl(var(--orange)/0.02)] to-transparent">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <Skeleton className="h-10 w-10 rounded-xl bg-[hsl(var(--orange))]" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
