import { motion } from "framer-motion";
import { User, BookOpen, Calendar, MapPin, Edit, Trophy, Target, Award, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/use-auth";
import { useEnrollments } from "@/hooks/use-courses";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

export default function Profile() {
  const { user } = useAuth();

  const { data: profileData, isLoading } = useQuery({
    queryKey: ["profile-page", user?.id],
    queryFn: async () => {
      const data = await apiClient.get<any | null>(`/api/users/${user!.id}/profile`);
      return data;
    },
    enabled: !!user,
  });

  const { data: enrollments } = useEnrollments();
  const { data: quizSubs } = useQuery({
    queryKey: ["quiz-subs-profile", user?.id],
    queryFn: async () => {
      const data = await apiClient.get<any[]>(`/api/users/${user!.id}/quiz-attempts`);
      return data;
    },
    enabled: !!user,
  });

  const { data: milestones } = useQuery({
    queryKey: ["milestones-profile", user?.id],
    queryFn: async () => {
      const data = await apiClient.get<any[]>(`/api/users/${user!.id}/milestones`);
      return data;
    },
    enabled: !!user,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 py-8">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <div className="grid grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-xl" />
          ))}
        </div>
        <div className="space-y-4">
          <Skeleton className="h-8 w-32" />
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const displayName = profileData?.display_name || user?.email?.split("@")[0] || "User";
  const email = profileData?.email || user?.email || "";
  const coursesCount = (enrollments || []).length;
  const completedMilestones = (milestones || []).filter((m) => m.completed).length;
  const totalXP = (quizSubs || []).reduce((sum, s) => sum + (Number(s.score) || 0), 0) * 10;
  const joinedDate = profileData?.created_at ? new Date(profileData.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="platform-card p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-brand-soft opacity-40" />
        <div className="relative z-10 flex flex-col sm:flex-row items-start gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-brand flex items-center justify-center text-3xl text-primary-foreground font-bold shrink-0">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h1 className="font-display text-2xl font-bold text-foreground">{displayName}</h1>
            </div>
            <p className="text-sm text-muted-foreground mb-3">{email}</p>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Joined {joinedDate}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Courses", value: coursesCount, icon: BookOpen, color: "text-cyan" },
          { label: "Milestones", value: completedMilestones, icon: Trophy, color: "text-magenta" },
          { label: "Quizzes", value: (quizSubs || []).length, icon: Target, color: "text-orange" },
          { label: "Total XP", value: totalXP.toLocaleString(), icon: Award, color: "text-primary" },
        ].map((stat) => (
          <div key={stat.label} className="platform-card p-4 text-center group hover:scale-[1.02] transition-transform">
            <div className={cn("w-10 h-10 rounded-xl bg-secondary/50 flex items-center justify-center mx-auto mb-2", stat.color)}>
              <stat.icon className="w-5 h-5" />
            </div>
            <p className="font-display text-xl font-bold text-foreground">{stat.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Milestones */}
      <div className="platform-card p-6">
        <h3 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
          <Award className="w-5 h-5 text-primary" />
          Achievement Milestones
        </h3>
        {(milestones || []).length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-border/20 rounded-2xl">
            <p className="text-sm text-muted-foreground">No milestones achieved yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(milestones || []).map((m) => (
              <div key={m.id} className={cn(
                "platform-card p-4 flex items-center gap-4 transition-all",
                m.completed ? "border-primary/20 bg-primary/5" : "opacity-60 grayscale"
              )}>
                <div className={cn(
                  "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                  m.completed ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"
                )}>
                  {m.completed ? <CheckCircle2 className="w-5 h-5" /> : <Award className="w-5 h-5" />}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-foreground truncate">{m.label}</p>
                  <p className="text-[10px] text-muted-foreground line-clamp-1">{m.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
