import { motion } from "framer-motion";
import { Megaphone, Calendar, Clock, User, Sparkles, AlertCircle, Info, CheckCircle, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";

interface Announcement {
  id: string;
  title: string;
  content: string;
  announcement_type: string;
  priority: string;
  created_at: string;
  author_id: string;
  profiles?: {
    display_name: string;
    email: string;
  };
}

const priorityConfig = {
  urgent: { icon: AlertCircle, color: "text-destructive", bg: "bg-destructive/10", border: "border-destructive/20" },
  important: { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20" },
  info: { icon: Info, color: "text-cyan", bg: "bg-cyan/10", border: "border-cyan/20" },
  success: { icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
};

export default function Announcements() {
  const { data: announcements, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const data = await apiClient.get<Announcement[]>('/api/announcements');
      return data || [];
    },
    refetchInterval: 60000, // Refetch every minute
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  if (isLoading) {
    return <SkeletonLoader type="dashboard" />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Megaphone className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
            <span className="text-gradient-brand">Announcements</span>
          </h1>
        </div>
        <p className="text-muted-foreground text-sm ml-1">Stay updated with the latest news and updates</p>
      </motion.div>

      {announcements && announcements.length > 0 ? (
        <div className="space-y-4">
          {announcements.map((announcement, index) => {
            const config = priorityConfig[announcement.priority as keyof typeof priorityConfig] || priorityConfig.info;
            const Icon = config.icon;

            return (
              <motion.div
                key={announcement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * index }}
                className={cn(
                  "platform-card p-6 border-l-4",
                  config.border
                )}
              >
                <div className="flex items-start gap-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", config.bg)}>
                    <Icon className={cn("w-5 h-5", config.color)} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-display font-semibold text-foreground">{announcement.title}</h3>
                          <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", config.color, config.bg, config.border)}>
                            {announcement.priority}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            <span>{announcement.profiles?.display_name || 'Admin'}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            <span>{formatDate(announcement.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {announcement.content}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="platform-card p-12 text-center border-dashed border-2 border-border/40 bg-secondary/10"
        >
          <Megaphone className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
          <h3 className="text-xl font-display font-bold text-foreground mb-2">No Announcements Yet</h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            Check back later for updates and news from the FunFinity Academy team.
          </p>
        </motion.div>
      )}
    </div>
  );
}
