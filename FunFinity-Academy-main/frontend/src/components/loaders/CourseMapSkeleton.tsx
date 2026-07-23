import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export default function CourseMapSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header with map icon */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded-lg bg-[hsl(var(--cyan))]" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Course Selection - Color-coded cards */}
      <div className="space-y-3">
        <Skeleton className="h-6 w-32" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {['cyan', 'orange', 'magenta', 'cyan'].map((color, i) => (
            <Card key={i} className={`border-t-4 border-t-[hsl(var(--${color}))] border border-border/30 bg-gradient-to-br from-[hsl(var(--${color})/0.02)] to-transparent`}>
              <CardContent className="p-4">
                <Skeleton className={`h-12 w-12 rounded-lg mb-2 mx-auto bg-[hsl(var(--${color}))]`} />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-3 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Map Visualization - Central hub design */}
      <Card className="border-2 border-[hsl(var(--cyan)/0.3)] bg-gradient-to-br from-[hsl(var(--cyan)/0.02)] to-transparent">
        <CardContent className="p-6">
          <div className="h-96 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Skeleton className="h-16 w-16 rounded-full mx-auto bg-gradient-to-br from-[hsl(var(--cyan))] to-[hsl(var(--orange))]" />
              <Skeleton className="h-6 w-48 mx-auto" />
              <Skeleton className="h-4 w-64 mx-auto" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Node Details - Split layout */}
      <div className="space-y-4">
        <Skeleton className="h-6 w-32" />
        <Card className="border-2 border-[hsl(var(--orange)/0.3)] bg-gradient-to-br from-[hsl(var(--orange)/0.02)] to-transparent">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Skeleton className="h-24 w-24 rounded-xl bg-[hsl(var(--orange))]" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <div className="flex gap-2 mt-4">
                  <Skeleton className="h-8 w-24 rounded-lg bg-[hsl(var(--cyan))]" />
                  <Skeleton className="h-8 w-24 rounded-lg bg-[hsl(var(--magenta))]" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
