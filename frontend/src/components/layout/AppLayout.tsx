import { useState, useRef, useEffect } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Award,
  BarChart3,
  BookOpen,
  Bookmark,
  Bot,
  Briefcase,
  Bug,
  Calendar,
  Clock,
  Compass,
  HelpCircle,
  LayoutDashboard,
  LogOut,
  Menu,
  Megaphone,
  MessageSquare,
  Moon,
  Play,
  Search,
  Settings,
  Sparkles,
  StickyNote,
  Sun,
  Trophy,
  User,
  Users,
  Video,
  Building2,
  FileText,
  Flame,
  Zap,
} from "lucide-react";
import { FunfinityIcon } from "@/components/brand/FunfinityLogo";
import { useTheme } from "@/hooks/use-theme";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { AccessibilityPanel } from "@/components/AccessibilityPanel";
import { useAuth } from "@/hooks/use-auth";
import { ReactionSystem } from "@/components/ReactionSystem";
import { cn } from "@/lib/utils";
import { ReviewPopup } from "@/components/ReviewPopup";
import { GamificationProvider } from "@/hooks/use-gamification";
import WebsiteTour from "@/components/tour/WebsiteTour";
import { SupportChatWidget } from "@/components/chat/SupportChatWidget";
import { useGamificationBackend } from "@/hooks/use-gamification-backend";
import { useEnrollments } from "@/hooks/use-courses";

const navGroups = [
  {
    label: "Learning",
    items: [
      { label: "Dashboard", href: "/app", icon: LayoutDashboard },
      { label: "Courses", href: "/app/courses", icon: BookOpen },
      { label: "My Learning", href: "/app/my-learning", icon: Play },
      { label: "Live Classes", href: "/app/live-classes", icon: Video },
      { label: "Quizzes & Tests", href: "/app/quizzes", icon: Trophy },
      { label: "Learning DNA", href: "/app/learning-dna", icon: Sparkles },
    ],
  },
  {
    label: "Updates",
    items: [
      { label: "Announcements", href: "/app/announcements", icon: Megaphone },
    ],
  },
  {
    label: "Community",
    items: [
      { label: "Discussion Forums", href: "/app/forums", icon: Users },
      { label: "Leaderboard", href: "/app/leaderboard", icon: Trophy },
    ],
  },
  {
    label: "Progress",
    items: [
      { label: "Calendar", href: "/app/calendar", icon: Calendar },
      { label: "Performance", href: "/app/analytics", icon: BarChart3 },
      { label: "Bookmarks", href: "/app/bookmarks", icon: Bookmark },
      { label: "Notes", href: "/app/notes", icon: StickyNote },
    ],
  },
  {
    label: "AI & Tools",
    items: [
      { label: "Chat", href: "/app/chat", icon: MessageSquare },
      { label: "AI Assistant", href: "/app/ai", icon: Bot },
    ],
  },
  {
    label: "Career",
    items: [
      { label: "College & University", href: "/app/college-university", icon: Building2 },
      { label: "Academic Profile", href: "/app/academic-profile", icon: FileText },
      { label: "Pathfinder Quiz", href: "/app/career/pathfinder", icon: Compass },
      { label: "Opportunities", href: "/app/career/opportunities", icon: Briefcase },
      { label: "Experience Log", href: "/app/career/experience", icon: Clock },
      { label: "Success Roadmap", href: "/app/career/roadmap", icon: Calendar },
      { label: "My Portfolio", href: "/app/career/portfolio", icon: Award },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Profile", href: "/app/profile", icon: User },
      { label: "Settings", href: "/app/settings", icon: Settings },
      { label: "Badges", href: "/app/badges", icon: Trophy },
      { label: "Feedback Center", href: "/app/feedback-center", icon: MessageSquare },
      { label: "Help Center", href: "/app/help", icon: HelpCircle },
    ],
  },
];

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { signOut, user } = useAuth();
  const sidebarNavRef = useRef<HTMLElement>(null);
  const { stats: gamificationStats, isLoading: gamificationLoading } = useGamificationBackend();
  const { data: enrollments } = useEnrollments();

  // Calculate KPI metrics
  const currentStreak = gamificationStats?.current_streak || 0;
  const totalXP = gamificationStats?.total_points_earned || 0;
  const coursesCount = enrollments?.length || 0;
  const studyTimeMinutes = gamificationStats?.total_study_time_minutes || 0;
  const studyTimeHours = Math.floor(studyTimeMinutes / 60);
  const studyTimeMins = studyTimeMinutes % 60;

  // Preserve sidebar scroll position
  useEffect(() => {
    const savedScrollPosition = localStorage.getItem('sidebar-scroll-position');
    if (savedScrollPosition && sidebarNavRef.current) {
      sidebarNavRef.current.scrollTop = parseInt(savedScrollPosition, 10);
    }
  }, []);

  useEffect(() => {
    if (sidebarNavRef.current) {
      const handleScroll = () => {
        localStorage.setItem('sidebar-scroll-position', sidebarNavRef.current?.scrollTop.toString() || '0');
      };
      sidebarNavRef.current.addEventListener('scroll', handleScroll);
      return () => {
        sidebarNavRef.current?.removeEventListener('scroll', handleScroll);
      };
    }
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      window.location.href = '/auth';
    } catch (error) {
      console.error('Logout failed:', error);
      // Force redirect even if logout fails
      window.location.href = '/auth';
    }
  };

  const isActive = (href: string) => {
    if (href === "/app") {
      return location.pathname === "/app";
    }
    return location.pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border/30 px-4 py-5">
        <FunfinityIcon 
          size="lg"
          className="transition-transform hover:scale-105 drop-shadow-lg" 
        />
        {sidebarOpen ? <span className="text-sm font-bold text-foreground">Funfinity</span> : null}
      </div>

      <nav ref={sidebarNavRef} className="flex-1 space-y-6 overflow-y-auto px-3 py-4 no-scrollbar" role="navigation" aria-label="Main navigation" data-tour-sidebar="true">
        {navGroups.map((group) => (
          <div key={group.label}>
            {sidebarOpen ? (
              <span className="mb-2 block px-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                {group.label}
              </span>
            ) : null}

            <div className="space-y-0.5">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  data-tour-courses={item.label === "Courses" ? "true" : undefined}
                  data-tour-dashboard={item.label === "Dashboard" ? "true" : undefined}
                  data-tour-discussions={item.label === "Discussion Forums" ? "true" : undefined}
                  data-tour-notes={item.label === "Notes Making Application" ? "true" : undefined}
                  data-tour-settings={item.label === "Settings" ? "true" : undefined}
                  data-tour-chat-support={item.label === "Chat" ? "true" : undefined}
                  data-tour-profile={item.label === "Profile" ? "true" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "glass-card text-foreground shadow-soft"
                      : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground",
                  )}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  <item.icon className={cn("h-5 w-5 shrink-0", isActive(item.href) && "scale-110")} />
                  {sidebarOpen ? <span>{item.label}</span> : null}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-border/30 p-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {sidebarOpen ? <span>Log Out</span> : null}
        </button>
      </div>
    </div>
  );

  return (
    <GamificationProvider>
      <div className="flex min-h-screen bg-background">
        <a href="#main-content" className="skip-link">
          Skip to main content
        </a>

      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-screen shrink-0 flex-col glass-sidebar transition-all duration-300 lg:flex",
          sidebarOpen ? "w-60" : "w-[72px]",
        )}
        data-tour-sidebar="true"
        role="complementary"
        aria-label="Sidebar navigation"
      >
        <SidebarContent />
      </aside>

      <AnimatePresence>
        {mobileSidebarOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-foreground/20 backdrop-blur-sm lg:hidden"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed left-0 top-0 z-50 h-screen w-60 glass-sidebar lg:hidden"
            >
              <SidebarContent />
            </motion.aside>
          </>
        ) : null}
      </AnimatePresence>

      <div className={cn("flex min-h-screen flex-1 flex-col transition-all duration-300", sidebarOpen ? "lg:ml-60" : "lg:ml-[72px]")}>
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/30 glass-card-heavy px-4 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setSidebarOpen((current) => !current);
              }}
              className="rounded-lg p-2 transition-colors hover:bg-secondary/50"
              aria-label="Toggle sidebar"
            >
              <Menu className="h-5 w-5 text-muted-foreground" />
            </button>

            <div className="hidden w-64 items-center gap-2 rounded-xl border border-border/30 bg-secondary/50 px-3 py-1.5 sm:flex">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search courses, topics..."
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
                aria-label="Search"
              />
              <kbd className="rounded border border-border/50 bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">Ctrl K</kbd>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* KPI Metrics - Compact */}
            <div className="hidden md:flex items-center gap-4 bg-gradient-to-r from-blue/10 via-orange/10 to-pink/10 rounded-xl px-4 py-2 border border-border/30">
              <div className="flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-orange" />
                <span className="text-xs font-bold text-foreground">{currentStreak}</span>
              </div>
              <div className="w-px h-4 bg-border/30" />
              <div className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-blue" />
                <span className="text-xs font-bold text-foreground">{totalXP}</span>
              </div>
              <div className="w-px h-4 bg-border/30" />
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-pink" />
                <span className="text-xs font-bold text-foreground">{coursesCount}</span>
              </div>
              <div className="w-px h-4 bg-border/30" />
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-bold text-foreground">{studyTimeHours}h</span>
              </div>
            </div>

            <div className="w-px h-6 bg-border/30 hidden md:block" />

            {/* User Avatar */}
            <Link to="/app/profile" className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-secondary/50" aria-label="Go to profile">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-sm font-bold text-white">
                {user?.display_name?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            </Link>

            <button onClick={toggleTheme} className="rounded-lg p-2 transition-colors hover:bg-secondary/50" aria-label="Toggle dark mode">
              {theme === "dark" ? <Sun className="h-4 w-4 text-muted-foreground" /> : <Moon className="h-4 w-4 text-muted-foreground" />}
            </button>
            <NotificationDropdown />
            <AccessibilityPanel />
          </div>
        </header>

        <main id="main-content" className="flex-1 p-3 sm:p-4 lg:p-6" role="main" tabIndex={-1}>
          <Outlet />
        </main>

        <ReactionSystem />
        <WebsiteTour />
        <ReviewPopup triggerAfterMinutes={30} triggerAfterSessions={5} triggerAfterXP={100} />
        <SupportChatWidget />
      </div>
      </div>
    </GamificationProvider>
  );
}
