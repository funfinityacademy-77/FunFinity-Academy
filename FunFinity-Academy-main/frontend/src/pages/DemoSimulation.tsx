import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BookOpen, Brain, Users,
  Trophy, Play, Pause, ChevronRight, ChevronLeft, LogOut,
  User, UserCheck, Shield, BarChart3, Sparkles, Globe, Palette,
  FileText, MessageSquare, Bell, Target, Zap, Cpu, TrendingUp, Award,
  RefreshCw, Clock, Activity, Settings, Download, Share2, Send
} from "lucide-react";
import { FunfinityIcon } from "@/components/brand/FunfinityLogo";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { supabase } from "@/lib/supabase";

interface TourStep {
  id: string;
  role: "student";
  title: string;
  subtitle: string;
  description: string;
  icon: typeof Award;
  content: React.ReactNode;
}

const SLIDE_DURATION = 5; // Enhanced duration for better comprehension

const roleTheme = {
  student: {
    accent: "text-gradient-brand",
    soft: "bg-primary/10 text-primary",
    badge: "bg-primary text-primary-foreground",
    ring: "ring-primary/20",
    bar: "bg-gradient-to-r from-primary to-accent",
    glow: "shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]",
  },
};

// ─── Visual Enhancements ───

function NeuralBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-primary/10 via-primary/5 to-transparent blur-[150px] rounded-full animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-accent/10 via-accent/5 to-transparent blur-[150px] rounded-full animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-[0.02]" 
        style={{ backgroundImage: "radial-gradient(circle at 2px 2px, white 1px, transparent 0)", backgroundSize: "32px 32px" }} />
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-background/50 via-transparent to-background/50" />
    </div>
  );
}

// ─── Simulated Screens with Real Data Integration ───

function SimDashboard() {
  const { data: courses } = useSupabaseRealtime('courses');
  const { data: announcements } = useSupabaseRealtime('announcements');
  
  const stats = [
    { label: "XP Earned", value: "2,450", icon: Zap, color: "text-primary", bg: "bg-primary/10" },
    { label: "Courses", value: courses?.length?.toString() || "5", icon: BookOpen, color: "text-accent", bg: "bg-accent/10" },
    { label: "Streak", value: "7 days", icon: Trophy, color: "text-primary", bg: "bg-primary/10" },
    { label: "Rank", value: "#12", icon: Target, color: "text-accent", bg: "bg-accent/10" },
  ];
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: i * 0.08, type: "spring", stiffness: 300 }}
            className={`rounded-xl border border-border/30 ${s.bg} backdrop-blur-sm p-5 text-center hover:scale-105 transition-transform cursor-pointer group`}>
            <motion.div className="w-8 h-8 mx-auto mb-3 rounded-lg bg-background flex items-center justify-center group-hover:scale-110 transition-transform">
              <s.icon className={`w-4 h-4 ${s.color}`} />
            </motion.div>
            <p className={`font-display font-bold text-2xl mt-2 ${s.color}`}>{s.value}</p>
            <p className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="rounded-xl border border-border/30 bg-secondary/30 backdrop-blur-sm p-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-base font-semibold text-foreground flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary" />
              </div>
              Recent Announcements
            </h3>
            <Activity className="w-4 h-4 text-primary animate-pulse" />
          </div>
          <div className="space-y-3">
            {(announcements || []).slice(0, 3).map((a: any, i: number) => (
              <motion.div key={a.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.1 }}
                className="p-3 rounded-lg bg-background/50 border border-border/20 hover:border-primary/30 transition-colors">
                <p className="text-sm font-semibold text-foreground">{a.title}</p>
                <p className="text-[11px] text-muted-foreground line-clamp-1">{a.content || a.body}</p>
              </motion.div>
            ))}
            {(announcements || []).length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">No recent announcements</p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function SimDNA() {
  const traits = [
    { label: "Visual Learner", level: "Dominant", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
    { label: "Deep Researcher", level: "Core", color: "text-accent", bg: "bg-accent/10", border: "border-accent/20" },
    { label: "Creative Synthesizer", level: "Emerging", color: "text-primary", bg: "bg-primary/10", border: "border-primary/20" },
  ];
  return (
    <div className="flex items-center justify-center h-full gap-10">
      <div className="relative w-48 h-48">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-2 border-dashed border-primary/20" />
        <motion.div animate={{ rotate: -360 }} transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute inset-2 rounded-full border border-accent/10" />
        <div className="absolute inset-6 rounded-full border-2 border-primary/30 flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 backdrop-blur-sm">
          <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}>
            <Brain className="w-14 h-14 text-primary" />
          </motion.div>
        </div>
        {traits.map((t, i) => {
          const angle = (i * 360) / traits.length;
          return (
            <motion.div key={t.label} initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.6 + i * 0.15, type: "spring" }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ transform: `rotate(${angle}deg) translateY(-95px) rotate(-${angle}deg)` }}>
              <div className={`px-4 py-2 rounded-full ${t.bg} ${t.border} border text-[11px] font-semibold whitespace-nowrap ${t.color} shadow-sm`}>
                {t.label}
              </div>
            </motion.div>
          );
        })}
      </div>
      <div className="space-y-4 flex-1 max-w-xs">
        <h3 className="text-base font-semibold text-foreground">Cognitive Signature</h3>
        {traits.map((t, i) => (
          <motion.div key={t.label} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.9 + i * 0.15, type: "spring" }}
            className={`p-4 rounded-xl ${t.bg} ${t.border} border backdrop-blur-sm hover:scale-102 transition-transform`}>
            <p className="text-sm font-semibold text-foreground">{t.label}</p>
            <p className="text-[11px] text-muted-foreground">{t.level} Mastery Path</p>
            <div className="mt-2 h-1.5 bg-muted/50 rounded-full overflow-hidden">
              <motion.div initial={{ width: 0 }} animate={{ width: i === 0 ? "95%" : i === 1 ? "88%" : "72%" }} 
                transition={{ duration: 1, delay: 1.2 + i * 0.1 }} className={`h-full ${t.color} rounded-full`} />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function SimPathfinder() {
  const careers = [
    { title: "Neuro-Architect", match: "98%", icon: Brain, color: "from-primary to-accent" },
    { title: "Quantum Dev", match: "94%", icon: Cpu, color: "from-accent to-primary" },
    { title: "Bio-Ethicist", match: "89%", icon: TrendingUp, color: "from-primary to-accent" },
  ];
  return (
    <div className="grid grid-cols-3 gap-5">
      {careers.map((c, i) => (
        <motion.div key={c.title} initial={{ opacity: 0, y: 24, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.12, type: "spring" }}
          className="p-5 rounded-xl bg-secondary/30 border border-border/30 text-center group hover:border-primary/30 hover:shadow-lg transition-all cursor-pointer">
          <motion.div className="w-12 h-12 mx-auto mb-4 rounded-lg bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <c.icon className="w-6 h-6 text-primary" />
          </motion.div>
          <p className="text-sm font-semibold mb-2">{c.title}</p>
          <div className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-primary text-[11px] font-semibold border border-primary/20">
            {c.match} Match
          </div>
        </motion.div>
      ))}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="col-span-3 p-5 rounded-xl bg-secondary/30 border border-border/30 flex items-center justify-between hover:border-primary/30 hover:shadow-lg transition-all">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <BarChart3 className="w-6 h-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">Skills Roadmap Generated</p>
            <p className="text-[11px] text-muted-foreground">Projected Mastery: 18 months</p>
          </div>
        </div>
        <Button size="sm" className="h-9 text-[11px] rounded-lg bg-primary hover:bg-primary/90">View Details</Button>
      </motion.div>
    </div>
  );
}

function SimLive() {
  const { data: liveSessions } = useSupabaseRealtime('announcements');
  const [viewerCount, setViewerCount] = useState(142);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setViewerCount(prev => Math.max(100, prev + Math.floor(Math.random() * 10) - 4));
    }, 3000);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <div className="relative rounded-xl overflow-hidden border border-border/30 bg-slate-950 aspect-video group hover:shadow-lg transition-all">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-slate-950 opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
      
      <div className="absolute top-4 left-4 flex items-center gap-2">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1.5, repeat: Infinity }} className="w-2.5 h-2.5 rounded-full bg-primary" />
        <span className="text-[11px] font-semibold text-white tracking-wider uppercase bg-primary/20 px-3 py-1 rounded-lg backdrop-blur-sm border border-primary/30">LIVE SESSION</span>
        <span className="text-[10px] font-semibold text-white/70 bg-white/10 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/20 flex items-center gap-1">
          <Activity className="w-3 h-3" /> {viewerCount} watching
        </span>
      </div>

      <div className="absolute bottom-5 left-5 right-5">
        <h3 className="text-white font-semibold text-base mb-2">Advanced Neural Networks</h3>
        <p className="text-white/70 text-[11px] mb-4">Live with Prof. Sterling • {viewerCount} students watching</p>
        <div className="flex gap-3">
          <div className="flex-1 h-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 flex items-center px-4 text-[11px] text-white/50 hover:bg-white/15 transition-colors">
            Type a message...
          </div>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white">
            <Play className="w-4 h-4 fill-current ml-0.5" />
          </motion.button>
        </div>
      </div>

      <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} whileHover={{ scale: 1.1 }}
        className="absolute top-4 right-4 p-3 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors">
        <Users className="w-5 h-5 text-white" />
      </motion.div>
      
      {/* System Status Overlay */}
      <div className="absolute top-4 right-16 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded">System Optimal</span>
      </div>
    </div>
  );
}

function SimAI() {
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState([
    { from: "ai", text: "I've analyzed your Learning DNA. You're strongest in Visual Synthesis! Should we visualize these calculus concepts?" },
    { from: "user", text: "Yes, please! Show me integration by parts." },
    { from: "ai", text: "Calculated. Visualizing ∫u dv = uv - ∫v du. Notice how the areas shift in the transformation below..." },
  ]);
  
  const handleSendMessage = () => {
    const newMessage = { from: "user", text: "Can you explain the chain rule?" };
    setMessages(prev => [...prev, newMessage]);
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        from: "ai", 
        text: "The chain rule states that d/dx[f(g(x))] = f'(g(x)) · g'(x). Think of it as peeling layers of an onion - differentiate the outer function first, then multiply by the derivative of the inner function." 
      }]);
    }, 2000);
  };
  
  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border/30 bg-secondary/30 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Cpu className="w-5 h-5 text-primary" />
            </div>
            AI Assistant
          </h3>
          <div className="flex items-center gap-2">
            <motion.span animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 2, repeat: Infinity }}
              className="text-[11px] font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">ACTIVE</motion.span>
            <span className="text-[10px] font-semibold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded flex items-center gap-1">
              <Activity className="w-3 h-3" /> Online
            </span>
          </div>
        </div>
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {messages.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: m.from === "user" ? 24 : -24, y: 10 }} animate={{ opacity: 1, x: 0, y: 0 }} transition={{ delay: i * 0.15, type: "spring" }}
              className={`flex ${m.from === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[90%] rounded-xl px-5 py-3 text-[12px] leading-relaxed ${
                m.from === "user"
                  ? "bg-primary text-primary-foreground rounded-tr-sm"
                  : "bg-muted/60 text-foreground border border-border/30 rounded-tl-sm"
              }`}>
                {m.text}
              </div>
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }}
              className="flex justify-start">
              <div className="bg-muted/60 text-foreground border border-border/30 rounded-xl rounded-tl-sm px-5 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>
        <div className="mt-4 flex gap-2">
          <input 
            type="text" 
            placeholder="Ask me anything..."
            className="flex-1 h-10 rounded-lg bg-background border border-border/30 px-4 text-sm outline-none focus:border-primary/50 transition-colors"
          />
          <Button size="sm" onClick={handleSendMessage} className="h-10 px-4 bg-primary hover:bg-primary/90">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

function SimCollegeUniversity() {
  const colleges = [
    { name: "MIT", match: "98%", flag: "🇺🇸", color: "text-primary" },
    { name: "Stanford", match: "95%", flag: "🇺🇸", color: "text-accent" },
    { name: "Oxford", match: "92%", flag: "🇬🇧", color: "text-primary" },
  ];
  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border/30 bg-secondary/30 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
<Award className="w-5 h-5 text-primary" />
            </div>
            AI-Powered College Matching
          </h3>
          <span className="text-[11px] font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">BASED ON YOUR PROFILE</span>
        </div>
        <div className="space-y-4">
          {colleges.map((college, i) => (
            <motion.div key={college.name} initial={{ opacity: 0, x: -24, scale: 0.95 }} animate={{ opacity: 1, x: 0, scale: 1 }} transition={{ delay: i * 0.12, type: "spring" }}
              className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-border/30 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <motion.span className="text-3xl group-hover:scale-110 transition-transform">{college.flag}</motion.span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{college.name}</p>
                  <p className="text-[11px] text-muted-foreground">Top-tier Research University</p>
                </div>
              </div>
              <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-primary text-[11px] font-semibold border border-primary/20">
                {college.match} Match
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function SimAcademicProfile() {
  const stats = [
    { label: "GPA", value: "3.85", icon: BarChart3, color: "text-primary", bg: "bg-primary/10" },
    { label: "SAT Score", value: "1520", icon: Target, color: "text-accent", bg: "bg-accent/10" },
    { label: "Courses", value: "12 AP", icon: BookOpen, color: "text-primary", bg: "bg-primary/10" },
    { label: "Activities", value: "8", icon: Sparkles, color: "text-accent", bg: "bg-accent/10" },
  ];
  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border/30 bg-secondary/30 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            Academic Profile
          </h3>
          <span className="text-[11px] font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">PERSONALIZED DATA</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, scale: 0.9, y: 12 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ delay: i * 0.1, type: "spring" }}
              className={`p-4 rounded-lg ${s.bg} border border-border/30 hover:scale-105 transition-transform cursor-pointer group`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[11px] font-semibold text-muted-foreground">{s.label}</p>
                <motion.div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center group-hover:scale-110 transition-transform">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                </motion.div>
              </div>
              <p className={`text-2xl font-semibold ${s.color}`}>{s.value}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function SimFeedbackCenter() {
  const { data: bugReports } = useSupabaseRealtime('bug_reports');
  const feedbackTypes = [
    { type: "Bug Report", icon: Shield, count: bugReports?.length || 3, color: "text-primary" },
    { type: "Feature Request", icon: Sparkles, count: 5, color: "text-accent" },
    { type: "General Feedback", icon: MessageSquare, count: 2, color: "text-primary" },
  ];
  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border/30 bg-secondary/30 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            Feedback Center
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">YOUR VOICE MATTERS</span>
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
          </div>
        </div>
        <div className="space-y-4">
          {feedbackTypes.map((item, i) => (
            <motion.div key={item.type} initial={{ opacity: 0, y: 20, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ delay: i * 0.12, type: "spring" }}
              className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-r from-primary/5 to-accent/5 border border-border/30 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <motion.div className="w-10 h-10 rounded-lg bg-background flex items-center justify-center group-hover:scale-110 transition-transform">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </motion.div>
                <p className="text-sm font-semibold text-foreground">{item.type}</p>
              </div>
              <div className="px-4 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 text-primary text-[11px] font-semibold border border-primary/20">
                {item.count} Active
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function SimCustomBackgrounds() {
  const countries = [
    { name: "Japan", flag: "🇯🇵", weather: "22°C Sunny", temp: "text-orange-400" },
    { name: "France", flag: "🇫🇷", weather: "18°C Cloudy", temp: "text-blue-400" },
    { name: "Brazil", flag: "🇧🇷", weather: "28°C Sunny", temp: "text-yellow-400" },
  ];
  return (
    <div className="space-y-4">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border/30 bg-secondary/30 backdrop-blur-sm p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-foreground flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Palette className="w-5 h-5 text-primary" />
            </div>
            Custom Backgrounds
          </h3>
          <span className="text-[11px] font-semibold text-primary bg-primary/10 px-3 py-1 rounded-full">195 COUNTRIES</span>
        </div>
        <div className="space-y-4">
          {countries.map((country, i) => (
            <motion.div key={country.name} initial={{ opacity: 0, scale: 0.9, x: -16 }} animate={{ opacity: 1, scale: 1, x: 0 }} transition={{ delay: i * 0.12, type: "spring" }}
              className="flex items-center justify-between p-4 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-border/30 hover:border-primary/30 hover:shadow-md transition-all cursor-pointer group">
              <div className="flex items-center gap-4">
                <motion.span className="text-3xl group-hover:scale-110 transition-transform">{country.flag}</motion.span>
                <div>
                  <p className="text-sm font-semibold text-foreground">{country.name}</p>
                  <p className={`text-[11px] ${country.temp} font-semibold`}>{country.weather}</p>
                </div>
              </div>
              <motion.div whileHover={{ scale: 1.1 }} className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Zap className="w-5 h-5 text-primary" />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Tour Steps (9 total) ───

const tourSteps: TourStep[] = [
  {
    id: "dashboard", role: "student", title: "Neural Dashboard",
    subtitle: "Your cognitive command center",
    description: "Track your Learning DNA evolution, XP milestones, and real-time global ranking.",
    icon: Award, content: <SimDashboard />,
  },
  {
    id: "learning-dna", role: "student", title: "Learning DNA",
    subtitle: "Understand how you think",
    description: "Our AI maps your cognitive signature to personalize every lesson and visualization.",
    icon: Brain, content: <SimDNA />,
  },
  {
    id: "ai-tutor", role: "student", title: "AI Assistant",
    subtitle: "Advanced neural intelligence",
    description: "Experience our completely hardcoded elite AI with advanced cognitive architecture and personalized responses.",
    icon: Cpu, content: <SimAI />,
  },
  {
    id: "college-university", role: "student", title: "College & University",
    subtitle: "AI-powered college matching",
    description: "Search and discover colleges with algorithmic matching based on your academic profile and learning DNA.",
    icon: Award, content: <SimCollegeUniversity />,
  },
  {
    id: "academic-profile", role: "student", title: "Academic Profile",
    subtitle: "Your complete academic story",
    description: "Manage your school information, grades, test scores, and achievements for personalized recommendations.",
    icon: FileText, content: <SimAcademicProfile />,
  },
  {
    id: "pathfinder", role: "student", title: "Career Pathfinder",
    subtitle: "Architect your future",
    description: "Discover careers matched to your learning style and generate detailed skills roadmaps.",
    icon: BarChart3, content: <SimPathfinder />,
  },
  {
    id: "feedback-center", role: "student", title: "Feedback Center",
    subtitle: "Your voice matters",
    description: "Submit bug reports, feature requests, and general feedback through our centralized system.",
    icon: MessageSquare, content: <SimFeedbackCenter />,
  },
  {
    id: "custom-backgrounds", role: "student", title: "Custom Backgrounds",
    subtitle: "Personalize your environment",
    description: "Choose from 195 countries with realistic weather-based backgrounds for your learning experience.",
    icon: Palette, content: <SimCustomBackgrounds />,
  },
  {
    id: "live-sessions", role: "student", title: "Upcoming Live Events",
    subtitle: "Real-time global learning",
    description: "Join high-fidelity live classes with world-class mentors and students from around the globe.",
    icon: Play, content: <SimLive />,
  },
];

// ─── Main ───

export default function DemoSimulation() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [timeLeft, setTimeLeft] = useState(SLIDE_DURATION);
  const [isPaused, setIsPaused] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const step = tourSteps[currentStep];
  const theme = roleTheme[step.role];
  const progress = ((currentStep * SLIDE_DURATION + (SLIDE_DURATION - timeLeft)) / (tourSteps.length * SLIDE_DURATION)) * 100;


  const goToNext = useCallback(() => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(p => p + 1);
      setTimeLeft(SLIDE_DURATION);
    } else {
      setIsComplete(true);
    }
  }, [currentStep]);

  const goToPrev = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(p => p - 1);
      setTimeLeft(SLIDE_DURATION);
    }
  }, [currentStep]);

  const goToSlide = useCallback((i: number) => {
    setCurrentStep(i);
    setTimeLeft(SLIDE_DURATION);
    setIsComplete(false);
  }, []);

  useEffect(() => {
    if (isPaused || isComplete) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) { goToNext(); return SLIDE_DURATION; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [isPaused, isComplete, currentStep, goToNext]);

  // ─── Complete Screen ───
  if (isComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,hsl(var(--primary)/0.05),transparent_70%)]" />
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-md text-center relative z-10">
          <motion.div animate={{ y: [0, -8, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-20 h-20 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-8">
<Award className="w-10 h-10 text-primary" />
          </motion.div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-3">
            Tour <span className="text-gradient-brand">Complete!</span>
          </h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            You've seen how FunFinity Academy empowers students. Ready to start your journey?
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate("/auth")} size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg group">
              Get Started <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => { setCurrentStep(0); setTimeLeft(SLIDE_DURATION); setIsComplete(false); }}>
              Replay Tour
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── Tour UI ───
  return (
    <div className="min-h-screen bg-background flex flex-col relative">
      <NeuralBackground />
      {/* Top bar */}
      <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-xl border-b border-border/30">
        <div className="h-1 bg-muted">
          <motion.div className={`h-full ${theme.bar} rounded-r-full`} animate={{ width: `${progress}%` }} transition={{ duration: 0.5 }} />
        </div>
        <div className="container mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${theme.accent} flex items-center justify-center`}>
<Award className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-foreground text-sm hidden sm:inline">FunFinity</span>
            </div>
            <motion.span key={step.role} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider ${theme.badge} shadow-sm`}>
              {step.role === "student" ? <User className="w-3 h-3 inline mr-1" /> : <UserCheck className="w-3 h-3 inline mr-1" />}
              {step.role}
            </motion.span>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Step dots */}
            <div className="hidden md:flex items-center gap-1 mr-2">
              {tourSteps.map((_, i) => (
                <button key={i} onClick={() => goToSlide(i)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 cursor-pointer hover:scale-150 ${
                    i === currentStep ? `scale-125 ${theme.bar}` : i < currentStep ? "bg-primary/40" : "bg-border"
                  }`} />
              ))}
            </div>
            <span className="text-xs text-muted-foreground font-medium tabular-nums">{currentStep + 1}/{tourSteps.length}</span>

            {/* Playback controls */}
            <Button variant="ghost" size="sm" onClick={goToPrev} disabled={currentStep === 0} className="h-7 w-7 p-0">
              <ChevronLeft className="w-3.5 h-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setIsPaused(p => !p)} className="h-7 w-7 p-0">
              {isPaused ? <Play className="w-3.5 h-3.5" /> : <Pause className="w-3.5 h-3.5" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={goToNext} disabled={currentStep === tourSteps.length - 1} className="h-7 w-7 p-0">
              <ChevronRight className="w-3.5 h-3.5" />
            </Button>

            <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="text-xs text-muted-foreground h-7 px-2 ml-1">
              <LogOut className="w-3 h-3 mr-1" /> Exit
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 container mx-auto px-4 py-6 flex flex-col lg:flex-row gap-6 max-w-6xl">
        {/* Guide panel */}
        <motion.div key={step.id + "-g"} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} className="lg:w-72 shrink-0">
          <div className={`rounded-xl border border-border/30 bg-card/90 backdrop-blur-lg p-6 sticky top-20 ring-1 ${theme.ring}`}>
            <motion.div key={step.id + "-i"} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className={`w-12 h-12 rounded-lg ${theme.soft} flex items-center justify-center mb-4`}>
              <step.icon className="w-6 h-6" />
            </motion.div>
            <h2 className="text-lg font-semibold text-foreground mb-0.5">{step.title}</h2>
            <p className={`text-sm font-semibold bg-gradient-to-r ${theme.accent} bg-clip-text text-transparent mb-3`}>{step.subtitle}</p>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5">{step.description}</p>

            <div className="flex items-center gap-2">
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <motion.div className={`h-full rounded-full ${theme.bar}`}
                  animate={{ width: `${((SLIDE_DURATION - timeLeft) / SLIDE_DURATION) * 100}%` }} transition={{ duration: 0.5 }} />
              </div>
              <span className="text-xs text-muted-foreground tabular-nums w-6 text-right">{timeLeft}s</span>
            </div>

            {isPaused && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="text-xs text-primary font-medium text-center mt-3 flex items-center justify-center gap-1">
                <Pause className="w-3 h-3" /> Paused
              </motion.p>
            )}
          </div>
        </motion.div>

        {/* Preview panel */}
        <div className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div key={step.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.35 }}>
              <div className="rounded-xl border border-border/30 bg-card/80 backdrop-blur overflow-hidden shadow-lg">
                {/* Browser chrome */}
                <div className="flex items-center gap-2 px-4 py-2 border-b border-border/20 bg-muted/30">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-primary/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-accent/60" />
                    <div className="w-2.5 h-2.5 rounded-full bg-primary/60" />
                  </div>
                  <div className="flex-1 mx-3 px-3 py-1 rounded-md bg-background/60 text-[11px] text-muted-foreground text-center font-mono border border-border/20">
                    🔒 funfinity.academy/{step.role}/{step.id}
                  </div>
                </div>
                <div className="p-5 lg:p-6 min-h-[380px]">
                  {step.content}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
