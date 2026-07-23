import { motion, AnimatePresence } from "framer-motion";
import { Video, Calendar, Clock, Users, Play, Bell, Loader2, Sparkles, Zap, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function LiveClasses() {
  const { user } = useAuth();

  const { data: liveSessions = [], isLoading } = useQuery({
    queryKey: ["live-sessions"],
    queryFn: async () => {
      const data = await apiClient.get<any[]>('/api/announcements?type=live_session&published=true');
      return data || [];
    },
  });

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-10 pb-20">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="space-y-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan/10 border border-cyan/20 text-cyan text-[10px] font-bold uppercase tracking-widest">
            <Zap className="w-3 h-3" />
            Synchronous Learning
          </div>
          <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
          Live <span className="text-gradient-brand">Classes</span>
          </h1>
          <p className="text-muted-foreground">Join real-time intellectual exchanges with global experts.</p>
        </div>

        <div className="flex items-center gap-4 bg-secondary/30 p-2 rounded-2xl border border-white/5 backdrop-blur-sm">
          <div className="flex -space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-8 h-8 rounded-full border-2 border-background bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
            ))}
          </div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            <span className="text-emerald-500 animate-pulse mr-1.5">●</span> 124 Active Now
          </p>
        </div>
      </motion.div>

      <section aria-label="Upcoming sessions" className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Upcoming Live Events
          </h2>
          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
            {liveSessions.length} Scheduled
          </Badge>
        </div>

        {liveSessions.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-20 text-center border-dashed border-white/10"
          >
            <Video className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
            <h3 className="font-display text-lg font-bold text-foreground mb-2">No Active Broadcasts</h3>
            <p className="text-muted-foreground text-sm max-w-xs mx-auto">
              The nexus is currently quiet. Check back soon for upcoming sessions.
            </p>
          </motion.div>
        ) : (
          <div className="grid gap-4">
            {liveSessions.map((session: Record<string, unknown>, i: number) => {
              const meta = (session.metadata as Record<string, unknown>) || {};
              return (
                <motion.div
                  key={session.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="glass-card p-6 rounded-[1.75rem] border-white/5 hover:border-primary/20 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6 overflow-hidden relative"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex items-center gap-6 relative z-10">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-brand opacity-10" />
                      <Video className="w-7 h-7 text-primary/80" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-foreground text-lg group-hover:text-primary transition-colors">{session.title}</h3>
                        <Badge variant="secondary" className="bg-secondary/50 text-[9px] uppercase font-bold tracking-tighter">
                          {meta.subject || "General"}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap items-center gap-5 text-xs text-muted-foreground font-medium">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary/60" />{meta.date ? format(new Date(meta.date), "MMM d, yyyy HH:mm") : "Scheduled"}</span>
                        <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary/60" />{meta.duration || 60} min</span>
                        <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5 text-primary/60" />Global Access</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 relative z-10">
                    <Button variant="outline" className="rounded-xl border-white/10 h-12 px-6 text-xs font-bold hover:bg-white/5">
                      <Bell className="w-4 h-4 mr-2" /> Remind Me
                    </Button>
                    <Button variant="hero" className="rounded-xl h-12 px-8 text-xs font-bold shadow-xl shadow-primary/20">
                      <Play className="w-4 h-4 mr-2" /> Join Session
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      <section className="grid md:grid-cols-2 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass-card p-8 rounded-[2rem] border-white/10 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-cyan/10 via-transparent to-transparent opacity-50" />
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan/10 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-cyan" />
            </div>
            <h3 className="font-display text-xl font-bold">Session Recording</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Missed a live session? All nexus events are recorded and synthesized into high-fidelity knowledge archives within 24 hours.
            </p>
            <Button variant="link" className="text-cyan p-0 h-auto font-bold text-xs uppercase tracking-widest hover:no-underline flex items-center gap-2">
              Browse Archives <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="glass-card p-8 rounded-[2rem] border-white/10 relative overflow-hidden group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-magenta/10 via-transparent to-transparent opacity-50" />
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 rounded-xl bg-magenta/10 flex items-center justify-center">
              <Shield className="w-6 h-6 text-magenta" />
            </div>
            <h3 className="font-display text-xl font-bold">Safety & Integrity</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Every live interaction is monitored by Active Shield to ensure a respectful, deep-focus environment for all participants.
            </p>
            <Button variant="link" className="text-magenta p-0 h-auto font-bold text-xs uppercase tracking-widest hover:no-underline flex items-center gap-2">
              Learn About Shield <ArrowRight className="w-3 h-3" />
            </Button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}

const Badge = ({ children, variant, className }: { children: React.ReactNode, variant?: string, className?: string }) => (
  <span className={cn(
    "px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider",
    variant === "outline" ? "border" : "bg-secondary",
    className
  )}>
    {children}
  </span>
);

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z" fill="currentColor" fillRule="evenodd" clipRule="evenodd"></path>
  </svg>
);
