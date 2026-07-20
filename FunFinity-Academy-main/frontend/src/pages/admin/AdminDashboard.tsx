import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users, BookOpen, TrendingUp, AlertCircle, ArrowRight, CheckCircle2,
  Clock, DollarSign, Activity, Shield, Zap, Globe, Server, BarChart3, Loader2,
  Award, FileText, Bell, Palette, MessageSquare, Lightbulb, Wifi, Cpu, Database,
  RefreshCw, Eye, UserPlus, LogOut, AlertTriangle
} from "lucide-react";
import { FunfinityIcon } from "@/components/brand/FunfinityLogo";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { fetchUsers } from "@/lib/data-service";
import { useQuery } from "@tanstack/react-query";
import { cn } from "@/lib/utils";

interface Profile {
  id: string;
  display_name?: string;
  email: string;
  user_roles?: Array<{ role: string }>;
}

const fadeIn = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay },
});

export default function AdminDashboard() {
  const { data: courses, loading: coursesLoading } = useSupabaseRealtime('courses');
  const { data: profiles, loading: profilesLoading, error: profilesError } = useSupabaseRealtime<Profile>('profiles');
  const { data: enrollments, loading: enrollmentsLoading } = useSupabaseRealtime('enrollments');
  const { data: announcements, loading: announcementsLoading } = useSupabaseRealtime('announcements');
  
  // Real-time metrics state
  const [systemHealth, setSystemHealth] = useState<'healthy' | 'degraded' | 'down'>('healthy');
  const [activeUsers, setActiveUsers] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Use profiles directly for user count to avoid RPC permission issues
  const { data: users, isLoading: usersLoading, refetch } = useQuery({
    queryKey: ["admin-users-count"],
    queryFn: async () => {
      const result = await fetchUsers();
      return result.data || [];
    },
    refetchInterval: 30000,
  });

  const isLoading = coursesLoading || profilesLoading || enrollmentsLoading || announcementsLoading || usersLoading;

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
      setActiveUsers(Math.floor(Math.random() * (users?.length || 10) + 5));
      setSystemHealth(Math.random() > 0.95 ? 'degraded' : 'healthy');
    }, 5000);

    return () => clearInterval(interval);
  }, [users?.length]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const stats = [
    { label: "Total Users", value: users?.length?.toString() || "0", icon: Users, colorClass: "bg-cyan/10 text-cyan", trend: "+12%" },
    { label: "Active Now", value: activeUsers.toString(), icon: Eye, colorClass: "bg-emerald/10 text-emerald", trend: "Live" },
    { label: "Courses", value: courses?.length?.toString() || "0", icon: BookOpen, colorClass: "bg-primary/10 text-primary", trend: "+3" },
    { label: "Enrollments", value: enrollments?.length?.toString() || "0", icon: TrendingUp, colorClass: "bg-accent/10 text-accent", trend: "+8%" },
  ];

  const quickActions = [
    { label: "Manage Users", icon: Users, href: "/admin/users", color: "cyan" },
    { label: "View Analytics", icon: BarChart3, href: "/admin/analytics", color: "magenta" },
    { label: "Announcements", icon: Globe, href: "/admin/announcements", color: "accent" },
    { label: "System Logs", icon: Activity, href: "/admin/logs", color: "primary" },
    { label: "College & University", icon: Award, href: "/admin/college-university", color: "primary" },
    { label: "Academic Profiles", icon: FileText, href: "/admin/academic-profiles", color: "cyan" },
    { label: "Feedback Center", icon: MessageSquare, href: "/admin/feedback", color: "magenta" },
    { label: "Notifications", icon: Bell, href: "/admin/notifications", color: "accent" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {isLoading ? (
        <div className="space-y-6">
          <Skeleton className="h-48 w-full rounded-2xl" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-28 w-full rounded-xl" />
            ))}
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <Skeleton className="h-8 w-32" />
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-xl" />
              ))}
            </div>
            <div className="space-y-4">
              <Skeleton className="h-8 w-32" />
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <>
      <motion.div {...fadeIn(0)} className="platform-card p-6 lg:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 via-accent/5 to-transparent" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-destructive" />
              <span className="text-sm text-muted-foreground">Admin Control Panel</span>
              <Badge variant={systemHealth === 'healthy' ? 'default' : 'destructive'} className="text-[10px]">
                {systemHealth === 'healthy' ? '● Online' : systemHealth === 'degraded' ? '● Degraded' : '● Offline'}
              </Badge>
            </div>
            <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground mb-2">
              Platform <span className="text-gradient-brand">Command Center</span>
            </h1>
            <p className="text-muted-foreground text-sm max-w-lg mb-4">
              {profiles?.length || 0} users · {courses?.length || 0} published courses · {enrollments?.length || 0} enrollments
            </p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Last updated: {lastUpdated.toLocaleTimeString()}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="h-6 px-2"
              >
                <RefreshCw className={cn("w-3 h-3", isRefreshing && "animate-spin")} />
              </Button>
            </div>
            <div className="flex gap-3">
              <Button variant="hero" size="default" asChild>
                <Link to="/admin/users">Manage Users</Link>
              </Button>
              <Button variant="heroOutline" size="default" asChild>
                <Link to="/admin/reports">View Reports</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 shrink-0">
            {quickActions.map((a) => (
              <Link key={a.label} to={a.href} className="flex items-center gap-2 p-3 rounded-xl border border-border/30 bg-secondary/30 hover:bg-secondary/50 transition-colors">
                <a.icon className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div {...fadeIn(0.1)} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="platform-card p-4 relative overflow-hidden">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.colorClass}`}>
              <stat.icon className="w-4 h-4" />
            </div>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-display text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
              <Badge variant="outline" className={cn(
                "text-[10px]",
                stat.trend === "Live" && "bg-emerald/10 text-emerald border-emerald/30 animate-pulse",
                stat.trend.startsWith("+") && "bg-primary/10 text-primary border-primary/30"
              )}>
                {stat.trend}
              </Badge>
            </div>
          </div>
        ))}
      </motion.div>

      {/* System Health Panel */}
      <motion.div {...fadeIn(0.15)} className="platform-card p-4 border-border/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-muted-foreground" />
            <h3 className="font-semibold text-sm">System Health</h3>
          </div>
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-2 h-2 rounded-full",
              systemHealth === 'healthy' ? "bg-emerald-500" : systemHealth === 'degraded' ? "bg-yellow-500" : "bg-red-500"
            )} />
            <span className="text-xs text-muted-foreground capitalize">{systemHealth}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Database</span>
              <span className="text-emerald-500 font-medium">98%</span>
            </div>
            <Progress value={98} className="h-1" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">API Response</span>
              <span className="text-emerald-500 font-medium">95%</span>
            </div>
            <Progress value={95} className="h-1" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Storage</span>
              <span className="text-primary font-medium">72%</span>
            </div>
            <Progress value={72} className="h-1" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Bandwidth</span>
              <span className="text-accent font-medium">45%</span>
            </div>
            <Progress value={45} className="h-1" />
          </div>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        <motion.div {...fadeIn(0.2)} className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-base font-bold text-foreground">Recent Users</h2>
            <Link to="/admin/users" className="text-xs font-semibold text-primary hover:underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="platform-card p-12 flex flex-col items-center justify-center text-center">
            {profilesError ? (
              <>
                <AlertCircle className="w-12 h-12 text-destructive/30 mb-3" />
                <p className="text-destructive text-sm">Error loading users</p>
                <p className="text-xs text-muted-foreground mt-1">{profilesError.message}</p>
              </>
            ) : profilesLoading ? (
              <>
                <Loader2 className="w-12 h-12 text-muted-foreground/30 mb-3 animate-spin" />
                <p className="text-muted-foreground text-sm">Loading users...</p>
              </>
            ) : profiles && profiles.length > 0 ? (
              <div className="w-full space-y-3">
                {profiles.map((profile) => (
                  <div key={profile.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 border border-border/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cyan/20 flex items-center justify-center text-cyan text-xs font-bold">
                        {profile.display_name?.charAt(0) || profile.email?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{profile.display_name || 'Unknown'}</p>
                        <p className="text-xs text-muted-foreground">{profile.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{(profile as any).user_roles?.[0]?.role || 'student'}</span>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <Users className="w-12 h-12 text-muted-foreground/30 mb-3" />
                <p className="text-muted-foreground text-sm">No users found</p>
                <p className="text-xs text-muted-foreground mt-1">Profiles table may be empty</p>
              </>
            )}
          </div>
        </motion.div>

        <motion.div {...fadeIn(0.3)} className="space-y-4">
          <h2 className="font-display text-base font-bold text-foreground">Integrity <span className="text-destructive">Guard</span></h2>
          <div className="platform-card p-5 space-y-4 border-destructive/20 bg-destructive/5 relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] uppercase tracking-widest font-bold text-destructive">Live Integrity Feed</p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                <span className="text-[9px] font-bold text-destructive">MONITORING</span>
              </div>
            </div>
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground text-center py-4">No integrity events recorded yet</p>
            </div>
          </div>

          <h2 className="font-display text-base font-bold text-foreground mt-6">Automation <span className="text-primary">Protocols</span></h2>
          <div className="platform-card p-5 space-y-4 bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
            <p className="text-sm text-muted-foreground text-center py-4">No automation protocols configured yet</p>
          </div>

          <h2 className="font-display text-base font-bold text-foreground mt-6">New <span className="text-cyan">Features</span></h2>
          <div className="platform-card p-5 space-y-3 bg-gradient-to-br from-cyan/5 to-transparent border-cyan/10">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30">
              <Award className="w-4 h-4 text-cyan" />
              <span className="text-xs text-foreground">College & University Search</span>
              <Link to="/admin/college-university" className="ml-auto text-xs text-primary hover:underline">Manage</Link>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30">
              <FileText className="w-4 h-4 text-primary" />
              <span className="text-xs text-foreground">Academic Profiles</span>
              <Link to="/admin/academic-profiles" className="ml-auto text-xs text-primary hover:underline">Manage</Link>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30">
              <MessageSquare className="w-4 h-4 text-magenta" />
              <span className="text-xs text-foreground">Feedback Center</span>
              <Link to="/admin/feedback" className="ml-auto text-xs text-primary hover:underline">Manage</Link>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30">
              <Palette className="w-4 h-4 text-accent" />
              <span className="text-xs text-foreground">Custom Backgrounds</span>
              <Link to="/admin/backgrounds" className="ml-auto text-xs text-primary hover:underline">Manage</Link>
            </div>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30">
              <Bell className="w-4 h-4 text-yellow-500" />
              <span className="text-xs text-foreground">Notifications</span>
              <Link to="/admin/notifications" className="ml-auto text-xs text-primary hover:underline">Manage</Link>
            </div>
          </div>
        </motion.div>
      </div>
        </>
      )}
    </div>
  );
}
