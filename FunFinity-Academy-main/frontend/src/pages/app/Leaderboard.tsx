import { motion } from "framer-motion";
import { Trophy, Flame, Award, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";

interface LeaderEntry {
  user_id: string;
  display_name: string;
  totalScore: number;
  quizCount: number;
}

export default function Leaderboard() {
  const { user } = useAuth();

  const { data: leaders, isLoading } = useQuery({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      // Get leaderboard data from API
      const data = await apiClient.get<LeaderEntry[]>('/api/leaderboard?limit=50');
      return data || [];
    },
  });

  const myRank = (leaders || []).findIndex((l) => l.user_id === user?.id) + 1;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
          <span className="text-gradient-brand">Leaderboard</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {myRank > 0 ? `You're ranked #${myRank}!` : "Complete quizzes to appear on the leaderboard"}
        </p>
      </motion.div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : (leaders || []).length === 0 ? (
        <div className="platform-card p-12 text-center">
          <Trophy className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
          <p className="text-muted-foreground">No scores yet — be the first to take a quiz!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Top 3 */}
          {(leaders || []).length >= 1 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {[0, 1, 2].map((i) => {
                const leader = (leaders || [])[i];
                if (!leader) return <div key={i} className="platform-card p-4 bg-secondary/10 border-dashed" />;

                const rankIcons = [Trophy, Award, Award];
                const rankColors = ["text-amber-500", "text-slate-400", "text-amber-700"];
                const Icon = rankIcons[i];

                return (
                  <motion.div
                    key={leader.user_id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * i }}
                    className={cn("platform-card p-4 text-center group transition-all", i === 0 && "ring-2 ring-primary/20 bg-primary/5")}
                  >
                    <div className={cn("w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform", rankColors[i])}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <p className="font-medium text-foreground text-sm truncate">{leader.display_name}</p>
                    <p className="text-xs font-bold text-primary mt-0.5">{(leader.totalScore * 10).toLocaleString()} XP</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-tighter">{leader.quizCount} quizzes</p>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Full list */}
          <div className="platform-card overflow-hidden">
            {(leaders || []).map((leader, idx) => (
              <div
                key={leader.user_id}
                className={cn(
                  "flex items-center gap-4 px-4 py-3 border-b border-border/20 last:border-0",
                  leader.user_id === user?.id && "bg-cyan/5 border-l-2 border-l-cyan"
                )}
              >
                <span className="w-6 text-sm font-bold text-muted-foreground text-center">#{idx + 1}</span>
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center text-sm font-bold">
                  {leader.display_name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-medium truncate", leader.user_id === user?.id ? "text-cyan" : "text-foreground")}>
                    {leader.display_name} {leader.user_id === user?.id ? "(You)" : ""}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Award className="w-3 h-3" />{leader.quizCount}</span>
                  <span className="font-medium text-foreground">{(leader.totalScore * 10).toLocaleString()} XP</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
