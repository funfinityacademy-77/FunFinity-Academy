import { useState } from "react";
import { motion } from "framer-motion";
import { Megaphone, PlusCircle, Users, Globe, User, Trash2, CheckCircle2, Loader2, Award, AlertTriangle, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchAnnouncements } from "@/lib/data-service";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

const targetIcon: Record<string, React.ReactNode> = {
  All: <Globe className="w-3 h-3" />,
  Students: <User className="w-3 h-3" />,
  Teachers: <Award className="w-3 h-3" />,
  Parents: <Users className="w-3 h-3" />,
};

const targetColor: Record<string, string> = {
  All: "bg-primary/10 text-primary border-primary/20",
  Students: "bg-cyan/10 text-cyan border-cyan/20",
  Teachers: "bg-orange/10 text-orange border-orange/20",
  Parents: "bg-magenta/10 text-magenta border-magenta/20",
};

type Target = "All" | "Students" | "Teachers" | "Parents";
type Priority = "normal" | "urgent" | "system_wide";

const priorityConfig: Record<Priority, { icon: React.ReactNode; color: string; label: string; bgClass: string }> = {
  normal: { icon: null, color: "text-muted-foreground", label: "Normal", bgClass: "bg-secondary/50" },
  urgent: { icon: <AlertTriangle className="w-3 h-3" />, color: "text-destructive", label: "URGENT", bgClass: "bg-destructive/10" },
  system_wide: { icon: <Radio className="w-3 h-3" />, color: "text-primary", label: "SYSTEM WIDE", bgClass: "bg-primary/10" },
};

export default function AdminAnnouncements() {
  const queryClient = useQueryClient();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [target, setTarget] = useState<Target>("All");
  const [priority, setPriority] = useState<Priority>("normal");
  const [urgencyFilter, setUrgencyFilter] = useState<"all" | "urgent" | "normal" | "system_wide">("all");

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: async () => {
      const result = await fetchAnnouncements();
      return result?.data || [];
    },
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  const addMutation = useMutation({
    mutationFn: async (newAnnouncement: any) => {
      const { data, error } = await supabase
        .from('announcements')
        .insert(newAnnouncement)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      toast.success("Announcement published!");
      setTitle("");
      setBody("");
      setTarget("All");
      setPriority("normal");
    },
    onError: (error) => {
      toast.error("Failed to publish announcement");
      console.error(error);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('announcements')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });
      toast.success("Announcement deleted");
    },
    onError: (error) => {
      toast.error("Failed to delete announcement");
      console.error(error);
    },
  });

  const handlePublish = () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Please fill in both title and message.");
      return;
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString("en-US", { month: "short", day: "numeric" });

    addMutation.mutate({
      title: title.trim(),
      body: body.trim(),
      target,
      date: dateStr,
      priority,
      author: "Super Admin",
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
        </div>
      ) : (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Announcements</h1>
            <p className="text-muted-foreground text-sm mt-1">Broadcast messages to students, teachers, and parents</p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20">Admin Only</span>
        </div>

        {/* Urgency Filter Tags */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setUrgencyFilter("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              urgencyFilter === "all"
                ? "bg-primary/10 border-primary/30 text-primary"
                : "border-border/30 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setUrgencyFilter("urgent")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              urgencyFilter === "urgent"
                ? "bg-destructive/10 border-destructive/30 text-destructive"
                : "border-border/30 text-muted-foreground hover:text-destructive hover:bg-destructive/5"
            }`}
          >
            🚨 Urgent
          </button>
          <button
            onClick={() => setUrgencyFilter("system_wide")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              urgencyFilter === "system_wide"
                ? "bg-primary/10 border-primary/30 text-primary"
                : "border-border/30 text-muted-foreground hover:text-primary hover:bg-primary/5"
            }`}
          >
            📡 System Wide
          </button>
          <button
            onClick={() => setUrgencyFilter("normal")}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              urgencyFilter === "normal"
                ? "bg-secondary/50 border-border/30 text-foreground"
                : "border-border/30 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            }`}
          >
            Normal
          </button>
        </div>

        {/* Compose Box */}
        <div className="platform-card p-6 mb-6">
          <h2 className="font-display text-base font-semibold text-foreground mb-4">New Announcement</h2>
          <div className="space-y-3">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Announcement title..."
              className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
            />
            <textarea
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message..."
              className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/30 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50 resize-none"
            />
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex gap-2 flex-wrap">
                {(["All", "Students", "Teachers", "Parents"] as Target[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTarget(t)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      target === t
                        ? "bg-primary/10 border-primary/30 text-primary"
                        : "border-border/30 text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    }`}
                  >
                    {t}
                  </button>
                ))}
                {(["normal", "urgent", "system_wide"] as Priority[]).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPriority(p)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                      priority === p
                        ? `${priorityConfig[p].bgClass} ${priorityConfig[p].color}`
                        : "border-border/30 text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {priorityConfig[p].icon && <span className="mr-1">{priorityConfig[p].icon}</span>}
                    {priorityConfig[p].label}
                  </button>
                ))}
              </div>
              <Button variant="hero" size="sm" onClick={handlePublish} disabled={addMutation.isPending}>
                {addMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <PlusCircle className="w-3 h-3 mr-1" />} Publish
              </Button>
            </div>
          </div>
        </div>

        {/* Announcements List */}
        <div className="space-y-3">
          {!announcements || announcements.length === 0 ? (
            <div className="platform-card p-8 text-center text-muted-foreground">No announcements yet. Create one above!</div>
          ) : (
            announcements
              .filter((a) => {
                if (urgencyFilter === "all") return true;
                if (urgencyFilter === "urgent") return a.priority === "urgent";
                if (urgencyFilter === "system_wide") return a.priority === "system_wide";
                if (urgencyFilter === "normal") return a.priority === "normal" || !a.priority;
                return true;
              })
              .map((a, i) => {
                const announcementPriority = (a.priority || "normal") as Priority;
                const config = priorityConfig[announcementPriority];
              return (
              <motion.div
                key={a.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className={`platform-card p-5 ${announcementPriority !== "normal" ? `border-${announcementPriority === "urgent" ? "destructive" : "primary"}/20 ${config.bgClass}` : ""}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${announcementPriority !== "normal" ? config.bgClass : "bg-secondary"}`}>
                      <Megaphone className={`w-4 h-4 ${announcementPriority !== "normal" ? config.color : "text-muted-foreground"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <h3 className="font-semibold text-foreground text-sm">{a.title}</h3>
                        {announcementPriority !== "normal" && (
                          <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1 ${config.bgClass} ${config.color}`}>
                            {config.icon} {config.label}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed">{a.body}</p>
                      <p className="text-[10px] text-muted-foreground mt-1">By {a.author}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${targetColor[a.target]}`}>
                      {targetIcon[a.target]} {a.target}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{a.date}</span>
                    <button
                      onClick={() => {
                        deleteMutation.mutate(a.id);
                      }}
                      disabled={deleteMutation.isPending}
                      className="p-1 rounded hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                      aria-label="Delete announcement"
                    >
                      {deleteMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
      )}
    </div>
  );
}
