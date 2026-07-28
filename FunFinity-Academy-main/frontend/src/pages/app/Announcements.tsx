import { motion } from "framer-motion";
import { Megaphone, Calendar, Clock, User, Sparkles, AlertCircle, Info, CheckCircle, AlertTriangle, Filter, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { SkeletonLoader } from "@/components/ui/skeleton-loader";
import { Button } from "@/components/ui/button";

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

const categoryConfig = {
  general: { label: "General", color: "bg-primary/10 text-primary border-primary/20" },
  maintenance: { label: "Maintenance", color: "bg-orange-500/10 text-orange-500 border-orange-500/20" },
  feature: { label: "New Feature", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  event: { label: "Event", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  academic: { label: "Academic", color: "bg-cyan/10 text-cyan border-cyan/20" },
};

export default function Announcements() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const data = await apiClient.get<Announcement[]>('/api/announcements');
      return data || [];
    },
    refetchInterval: 60000, // Refetch every minute for real-time updates
  });

  const filteredAnnouncements = announcements?.filter(announcement => {
    if (selectedCategory !== "all" && announcement.announcement_type !== selectedCategory) return false;
    if (selectedPriority !== "all" && announcement.priority !== selectedPriority) return false;
    return true;
  }) || [];

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
    <div className="max-w-4xl mx-auto w-full space-y-6">
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

      {/* Filter Controls */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} 
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-3 items-center"
      >
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">Filters:</span>
        </div>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={selectedCategory === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory("all")}
            className="text-xs"
          >
            All
          </Button>
          {Object.entries(categoryConfig).map(([key, config]) => (
            <Button
              key={key}
              variant={selectedCategory === key ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(key)}
              className={cn("text-xs", selectedCategory === key ? "" : config.color)}
            >
              {config.label}
            </Button>
          ))}
        </div>

        {/* Priority Filter */}
        <div className="flex flex-wrap gap-2 ml-4">
          {Object.keys(priorityConfig).map((priority) => (
            <Button
              key={priority}
              variant={selectedPriority === priority ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedPriority(priority)}
              className="text-xs capitalize"
            >
              {priority}
            </Button>
          ))}
          <Button
            variant={selectedPriority === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedPriority("all")}
            className="text-xs"
          >
            All Priorities
          </Button>
        </div>

        {(selectedCategory !== "all" || selectedPriority !== "all") && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setSelectedCategory("all"); setSelectedPriority("all"); }}
            className="text-xs text-muted-foreground"
          >
            <X className="w-3 h-3 mr-1" />
            Clear Filters
          </Button>
        )}
      </motion.div>

      {filteredAnnouncements.length > 0 ? (
        <div className="space-y-4">
          {filteredAnnouncements.map((announcement, index) => {
            const config = priorityConfig[announcement.priority as keyof typeof priorityConfig] || priorityConfig.info;
            const Icon = config.icon;
            const categoryConfigItem = categoryConfig[announcement.announcement_type as keyof typeof categoryConfig];

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
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="font-display font-semibold text-foreground">{announcement.title}</h3>
                          <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", config.color, config.bg, config.border)}>
                            {announcement.priority}
                          </Badge>
                          {categoryConfigItem && (
                            <Badge variant="outline" className={cn("text-[10px] uppercase tracking-wider", categoryConfigItem.color)}>
                              {categoryConfigItem.label}
                            </Badge>
                          )}
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
          <h3 className="text-xl font-display font-bold text-foreground mb-2">
            {selectedCategory !== "all" || selectedPriority !== "all" ? "No Matching Announcements" : "No Announcements Yet"}
          </h3>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            {selectedCategory !== "all" || selectedPriority !== "all" 
              ? "Try adjusting your filters to see more announcements." 
              : "Check back later for updates and news from the FunFinity Academy team."}
          </p>
        </motion.div>
      )}
    </div>
  );
}
