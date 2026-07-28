import { motion, AnimatePresence } from "framer-motion";
import { 
  Video, Users, Clock, Play, PlusCircle, Calendar, Mic, MicOff, VideoOff,
  Zap, Bell, Mail, Settings2, Globe, ShieldCheck, Share2, Loader2, X, Youtube,
  Signal, MonitorSpeaker, MessageSquare, Monitor, LayoutGrid, Volume2, 
  MoreHorizontal, Download, RefreshCw, Eye, EyeOff, Ban, Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";

interface LiveSession {
  id: string;
  title: string;
  metadata: {
    date?: string;
    duration?: string;
    subject?: string;
    status?: string;
    youtube_url?: string;
  };
  created_at: string;
}

export default function TeacherLive() {
  const [isScheduling, setIsScheduling] = useState(false);
  const [micOn, setMicOn] = useState(true);
  const [camOn, setCamOn] = useState(true);
  const [autoReminders, setAutoReminders] = useState(true);
  const [syncCalendar, setSyncCalendar] = useState(true);
  const [isLive, setIsLive] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [streamQuality, setStreamQuality] = useState<'auto' | '720p' | '1080p' | '4k'>('auto');
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [volume, setVolume] = useState(75);
  const [layoutMode, setLayoutMode] = useState<'grid' | 'focus' | 'sidebar'>('grid');
  const queryClient = useQueryClient();
  const videoRef = useRef<HTMLVideoElement>(null);

  const [newClass, setNewClass] = useState({
    title: "",
    date: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
    duration: "60",
    subject: "Computer Science",
    youtube_url: ""
  });

  // Simulate real-time viewer count
  useEffect(() => {
    if (isLive) {
      const intervalId = setInterval(() => {
        setViewerCount(prev => Math.max(0, prev + Math.floor(Math.random() * 10) - 3));
      }, 3000);
      return () => clearInterval(intervalId);
    }
  }, [isLive]);

  // Fetch scheduled classes from announcements table (type: live_session)
  const { data: scheduledClasses = [], isLoading } = useQuery<LiveSession[]>({
    queryKey: ["admin-live-sessions"],
    queryFn: async () => {
      const data = await apiClient.get<LiveSession[]>('/api/announcements?type=live_session');
      return data || [];
    }
  });

  const createMutation = useMutation({
    mutationFn: async (payload: { title: string; date: string; duration: string; subject: string; youtube_url: string }) => {
      await apiClient.post('/api/announcements', {
        title: payload.title,
        content: `Live session for ${payload.subject}`,
        type: "live_session",
        published: true,
        metadata: {
          date: payload.date,
          duration: payload.duration,
          subject: payload.subject,
          status: "scheduled",
          youtube_url: payload.youtube_url
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-live-sessions"] });
      toast.success("Intelligence session scheduled and synchronized.");
      setIsScheduling(false);
    },
    onError: (error: Error) => {
      toast.error(`Sync failure: ${error.message}`);
    }
  });

  const handleStartInstant = () => {
    setIsLive(true);
    setViewerCount(1);
    toast.success("Instant classroom initialized. Link shared with active students.");
  };

  const handleEndStream = () => {
    setIsLive(false);
    setViewerCount(0);
    toast.success("Stream ended successfully.");
  };

  const handleScheduleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.title) return toast.error("Please provide a session title.");
    createMutation.mutate(newClass);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-brand flex items-center justify-center shadow-lg shadow-primary/20">
              <Video className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              Live <span className="text-gradient-brand">Broadcasts</span>
            </h1>
          </div>
          <p className="text-muted-foreground ml-1">Orchestrate high-fidelity synchronous learning environments.</p>
        </div>
        
        <Button variant="hero" className="rounded-2xl h-14 px-8 shadow-xl shadow-primary/20" onClick={() => setIsScheduling(true)}>
          <PlusCircle className="w-5 h-5 mr-2" /> Schedule Intelligence Session
        </Button>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Main Controls */}
        <div className="lg:col-span-2 space-y-8">
          <AnimatePresence>
            {isScheduling && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="glass-card-heavy p-8 rounded-[2.5rem] border-primary/30 overflow-hidden"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-display text-xl font-bold">Session Architect</h3>
                  <button onClick={() => setIsScheduling(false)} className="p-2 rounded-lg hover:bg-white/5">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleScheduleSubmit} className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Session Title</label>
                    <input 
                      type="text" 
                      value={newClass.title}
                      onChange={(e) => setNewClass({ ...newClass, title: e.target.value })}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm outline-none focus:border-primary/50 transition-colors"
                      placeholder="e.g. Advanced Quantum Mechanics"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Date & Time</label>
                    <input 
                      type="datetime-local" 
                      value={newClass.date}
                      onChange={(e) => setNewClass({ ...newClass, date: e.target.value })}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Duration (min)</label>
                    <input 
                      type="number" 
                      value={newClass.duration}
                      onChange={(e) => setNewClass({ ...newClass, duration: e.target.value })}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm outline-none focus:border-primary/50 transition-colors"
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Youtube className="w-3.5 h-3.5" /> YouTube Stream URL
                    </label>
                    <input 
                      type="url" 
                      value={newClass.youtube_url}
                      onChange={(e) => setNewClass({ ...newClass, youtube_url: e.target.value })}
                      className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm outline-none focus:border-primary/50 transition-colors"
                      placeholder="https://www.youtube.com/watch?v=..."
                    />
                    <p className="text-[10px] text-muted-foreground">Optional: Provide a YouTube stream URL for this session</p>
                  </div>
                  <div className="col-span-2 pt-4">
                    <Button type="submit" variant="hero" className="w-full h-12 rounded-xl" disabled={createMutation.isPending}>
                      {createMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Zap className="w-4 h-4 mr-2" />}
                      Finalize Schedule
                    </Button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Start Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="glass-card p-8 rounded-[2.5rem] border-white/10 relative overflow-hidden group shadow-2xl"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/5 opacity-50" />
            <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 blur-[100px] rounded-full group-hover:bg-primary/20 transition-colors" />
            
            {/* Live Stream Overlay */}
            {isLive && (
              <div className="absolute top-4 right-4 z-20">
                <Badge variant="destructive" className="animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-white mr-2" />
                  LIVE
                </Badge>
              </div>
            )}
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Instant Nexus</h2>
                  <p className="text-sm text-muted-foreground mt-1">Deploy an immediate learning space.</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 px-3 py-1 font-bold tracking-widest uppercase text-[10px]">
                    Global Ready
                  </Badge>
                  {isLive && (
                    <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1 font-bold tracking-widest uppercase text-[10px]">
                      <Signal className="w-3 h-3 mr-1" /> {viewerCount} Viewers
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 rounded-[2rem] bg-background/40 border border-white/10 flex items-center justify-center shadow-inner relative group/icon">
                  <div className="absolute inset-0 bg-primary/5 blur-xl group-hover/icon:bg-primary/20 transition-all" />
                  <Video className="w-12 h-12 text-primary relative z-10" />
                  {isLive && (
                    <div className="absolute bottom-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  )}
                </div>
                
                <div className="flex-1 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <Users className="w-4 h-4 text-primary" /> 1k+ Capacity
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <Globe className="w-4 h-4 text-primary" /> Low Latency
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <MonitorSpeaker className="w-4 h-4 text-primary" /> HD Quality
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                      <ShieldCheck className="w-4 h-4 text-primary" /> Encrypted
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center p-1.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
                      <button 
                        onClick={() => setMicOn(!micOn)}
                        className={cn(
                          "p-3 rounded-xl transition-all duration-300",
                          micOn ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-white/5 text-muted-foreground"
                        )}
                      >
                        {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                      </button>
                      <button 
                        onClick={() => setCamOn(!camOn)}
                        className={cn(
                          "p-3 rounded-xl transition-all duration-300 ml-1.5",
                          camOn ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-white/5 text-muted-foreground"
                        )}
                      >
                        {camOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                      </button>
                      <button 
                        onClick={() => setShowChat(!showChat)}
                        className={cn(
                          "p-3 rounded-xl transition-all duration-300 ml-1.5",
                          showChat ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-white/5 text-muted-foreground"
                        )}
                      >
                        <MessageSquare className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => setShowParticipants(!showParticipants)}
                        className={cn(
                          "p-3 rounded-xl transition-all duration-300 ml-1.5",
                          showParticipants ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20" : "bg-white/5 text-muted-foreground"
                        )}
                      >
                        <Users className="w-5 h-5" />
                      </button>
                    </div>
                    
                    {!isLive ? (
                      <Button variant="hero" className="h-14 px-10 rounded-2xl text-lg font-bold shadow-xl shadow-primary/30" onClick={handleStartInstant}>
                        <Play className="w-5 h-5 mr-2" /> Start Nexus
                      </Button>
                    ) : (
                      <Button variant="destructive" className="h-14 px-10 rounded-2xl text-lg font-bold shadow-xl shadow-destructive/30" onClick={handleEndStream}>
                        <Square className="w-5 h-5 mr-2" /> End Stream
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Stream Quality Controls */}
              {isLive && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-6 pt-6 border-t border-white/10 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Stream Quality</span>
                    <div className="flex gap-2">
                      {(['auto', '720p', '1080p', '4k'] as const).map((quality) => (
                        <button
                          key={quality}
                          onClick={() => setStreamQuality(quality)}
                          className={cn(
                            "px-3 py-1 rounded-lg text-xs font-bold transition-all",
                            streamQuality === quality 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-white/5 text-muted-foreground hover:bg-white/10"
                          )}
                        >
                          {quality.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Layout Mode</span>
                    <div className="flex gap-2">
                      {(['grid', 'focus', 'sidebar'] as const).map((mode) => (
                        <button
                          key={mode}
                          onClick={() => setLayoutMode(mode)}
                          className={cn(
                            "px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1",
                            layoutMode === mode 
                              ? "bg-primary text-primary-foreground" 
                              : "bg-white/5 text-muted-foreground hover:bg-white/10"
                          )}
                        >
                          {mode === 'grid' && <LayoutGrid className="w-3 h-3" />}
                          {mode === 'focus' && <Monitor className="w-3 h-3" />}
                          {mode === 'sidebar' && <MonitorSpeaker className="w-3 h-3" />}
                          {mode.charAt(0).toUpperCase() + mode.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <Volume2 className="w-4 h-4 text-muted-foreground" />
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={volume}
                      onChange={(e) => setVolume(Number(e.target.value))}
                      className="flex-1 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                    />
                    <span className="text-xs text-muted-foreground w-8">{volume}%</span>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Scheduled Classes */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Upcoming Operations
              </h2>
              <span className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">{scheduledClasses.length} Active</span>
            </div>

            <div className="grid gap-4">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : scheduledClasses.length === 0 ? (
                <div className="glass-card p-12 text-center border-dashed border-white/10">
                  <Video className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No sessions currently scheduled in the nexus.</p>
                </div>
              ) : (
                scheduledClasses.map((cls, i: number) => {
                  const meta = cls.metadata || {};
                  return (
                    <motion.div 
                      key={cls.id} 
                      initial={{ opacity: 0, x: -20 }} 
                      animate={{ opacity: 1, x: 0 }} 
                      transition={{ delay: i * 0.1 }}
                      className="glass-card p-6 rounded-[1.75rem] border-white/5 hover:border-primary/20 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-6"
                    >
                      <div className="flex items-center gap-5">
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner">
                          {meta.youtube_url ? <Youtube className="w-6 h-6 text-red-500" /> : <Video className="w-6 h-6 text-primary/70" />}
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-foreground group-hover:text-primary transition-colors">{cls.title}</h3>
                          <div className="flex flex-wrap items-center gap-4 text-[11px] text-muted-foreground font-medium">
                            <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-primary/40" />{meta.date ? format(new Date(meta.date), "MMM d, yyyy HH:mm") : "TBD"}</span>
                            <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-primary/40" />{meta.duration || 60} min</span>
                            <span className="flex items-center gap-1.5"><Zap className="w-3.5 h-3.5 text-primary/40" />{meta.subject || "General"}</span>
                            {meta.youtube_url && (
                              <Badge variant="secondary" className="text-[10px]">
                                <Youtube className="w-3 h-3 mr-1" /> YouTube Stream
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {meta.youtube_url && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl border-white/10 h-10 px-5 text-xs font-bold hover:bg-white/5 transition-all"
                            onClick={() => window.open(meta.youtube_url, '_blank')}
                          >
                            <Youtube className="w-3.5 h-3.5 mr-2" /> Open Stream
                          </Button>
                        )}
                        <Button variant="outline" size="sm" className="rounded-xl border-white/10 h-10 px-5 text-xs font-bold hover:bg-white/5 transition-all">
                          <Settings2 className="w-3.5 h-3.5 mr-2" /> Modify
                        </Button>
                        <Button variant="hero" size="sm" className="rounded-xl h-10 px-6 text-xs font-bold shadow-lg shadow-primary/20">
                          <Play className="w-3.5 h-3.5 mr-2" /> Initialize
                        </Button>
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-8">
          {/* Automation Intelligence */}
          <div className="glass-card-heavy p-8 rounded-[2.5rem] border-primary/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
            
            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <h3 className="font-display text-lg font-bold text-foreground tracking-tight">Automation Intelligence</h3>
              </div>

              <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Bell className="w-3.5 h-3.5 text-primary" /> Auto Reminders
                    </p>
                    <p className="text-[10px] text-muted-foreground">Notify students 15m before start</p>
                  </div>
                  <Switch checked={autoReminders} onCheckedChange={setAutoReminders} />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Globe className="w-3.5 h-3.5 text-primary" /> Calendar Sync
                    </p>
                    <p className="text-[10px] text-muted-foreground">Update student external calendars</p>
                  </div>
                  <Switch checked={syncCalendar} onCheckedChange={setSyncCalendar} />
                </div>

                <div className="pt-4 space-y-3">
                  <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-white/5 bg-white/5 hover:bg-white/10 text-[11px] font-bold uppercase tracking-wider" onClick={() => toast.success("Invitation blast queued.")}>
                    <Mail className="w-4 h-4 mr-3 text-primary" /> Broadcast Invitations
                  </Button>
                  <Button variant="outline" className="w-full justify-start h-12 rounded-xl border-white/5 bg-white/5 hover:bg-white/10 text-[11px] font-bold uppercase tracking-wider" onClick={() => toast.success("Monitoring active.")}>
                    <ShieldCheck className="w-4 h-4 mr-3 text-primary" /> Security Protocols
                  </Button>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest">Automation Heartbeat</p>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  System monitoring active. All upcoming sessions synchronized with the central intelligence core.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

