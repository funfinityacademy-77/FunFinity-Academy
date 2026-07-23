import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AcademicProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header with profile icon */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full bg-gradient-to-br from-[hsl(var(--cyan))] to-[hsl(var(--magenta))]" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-32 rounded-lg bg-gradient-to-r from-[hsl(var(--cyan))] to-[hsl(var(--orange))]" />
      </div>

      {/* School Information - Form layout with icons */}
      <Card className="border-2 border-[hsl(var(--cyan)/0.3)] bg-gradient-to-br from-[hsl(var(--cyan)/0.02)] to-transparent">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded bg-[hsl(var(--cyan))]" />
            <Skeleton className="h-6 w-48" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {[
              { icon: 'cyan' },
              { icon: 'orange' },
              { icon: 'magenta' },
              { icon: 'cyan' }
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className={`h-4 w-4 rounded bg-[hsl(var(--${item.icon}))]`} />
                  <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Academic Performance - Score cards */}
      <Card className="border-2 border-[hsl(var(--orange)/0.3)] bg-gradient-to-br from-[hsl(var(--orange)/0.02)] to-transparent">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded bg-[hsl(var(--orange))]" />
            <Skeleton className="h-6 w-48" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { color: 'cyan', label: 'GPA' },
              { color: 'orange', label: 'SAT' },
              { color: 'magenta', label: 'ACT' }
            ].map((item, i) => (
              <div key={i} className={`p-4 rounded-xl border border-[hsl(var(--${item.color})/0.3)] bg-gradient-to-br from-[hsl(var(--${item.color})/0.1)] to-transparent`}>
                <div className="space-y-2">
                  <Skeleton className={`h-4 w-16 bg-[hsl(var(--${item.color})/0.3)]`} />
                  <Skeleton className="h-12 w-full rounded-lg bg-[hsl(var(--${item.color})/0.2)]" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Current Courses - List with progress */}
      <Card className="border-2 border-[hsl(var(--magenta)/0.3)] bg-gradient-to-br from-[hsl(var(--magenta)/0.02)] to-transparent">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded bg-[hsl(var(--magenta))]" />
            <Skeleton className="h-6 w-48" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            {['cyan', 'orange', 'magenta', 'cyan'].map((color, i) => (
              <div key={i} className="space-y-2">
                <Skeleton className={`h-4 w-24 bg-[hsl(var(--${color})/0.3)]`} />
                <Skeleton className="h-10 w-full rounded-lg" />
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-full rounded-lg bg-gradient-to-r from-[hsl(var(--cyan))] to-[hsl(var(--orange))]" />
          
          <div className="space-y-3 mt-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border/30 bg-gradient-to-r from-[hsl(var(--cyan)/0.05)] to-[hsl(var(--orange)/0.05)]">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-8 w-16 rounded-full bg-[hsl(var(--magenta))]" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-12 rounded-full bg-[hsl(var(--cyan))]" />
                  <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-8 w-8 rounded-lg bg-[hsl(var(--orange))]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Extracurricular Activities - Tag cloud */}
      <Card className="border-2 border-[hsl(var(--cyan)/0.3)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded bg-[hsl(var(--cyan))]" />
            <Skeleton className="h-6 w-48" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg bg-[hsl(var(--cyan))]" />
          </div>
          <div className="flex flex-wrap gap-2">
            {['cyan', 'orange', 'magenta', 'cyan'].map((color, i) => (
              <Skeleton key={i} className={`h-8 w-32 rounded-full bg-[hsl(var(--${color})/0.2)] border border-[hsl(var(--${color})/0.3)]`} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements - Trophy list */}
      <Card className="border-2 border-[hsl(var(--orange)/0.3)]">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-6 rounded bg-[hsl(var(--orange))]" />
            <Skeleton className="h-6 w-48" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Skeleton className="h-10 flex-1 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg bg-[hsl(var(--orange))]" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-border/30 bg-gradient-to-r from-[hsl(var(--orange)/0.05)] to-[hsl(var(--magenta)/0.05)]">
                <div className="flex items-center gap-3">
                  <Skeleton className="h-6 w-6 rounded bg-[hsl(var(--magenta))]" />
                  <Skeleton className="h-4 w-48" />
                </div>
                <Skeleton className="h-8 w-8 rounded-lg bg-[hsl(var(--cyan))]" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
