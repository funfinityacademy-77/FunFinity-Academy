import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Users, BookOpen, BarChart3, Settings, Menu, Shield, Megaphone, FileText, Globe,
  Activity, HelpCircle, Search, ChevronRight, Sun, Moon, LogOut, Ban,
  ClipboardList, Video, PlusCircle, Library, TrendingUp, MessageSquare, Sparkles, Bug, Settings as SettingsIcon, Zap, Award
} from "lucide-react";
import { FunfinityIcon } from "@/components/brand/FunfinityLogo";

import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { NotificationDropdown } from "@/components/NotificationDropdown";
import { useAuth } from "@/hooks/use-auth";

const navGroups = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
      { label: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { label: "Activity Logs", href: "/admin/logs", icon: Activity },
    ],
  },
  {
    label: "Management",
    items: [
      { label: "Users & Roles", href: "/admin/users", icon: Users },
      { label: "Restrictions", href: "/admin/restrictions", icon: Ban },
      { label: "Courses", href: "/admin/courses", icon: BookOpen },
      { label: "Enrollments", href: "/admin/enrollments", icon: Award },
    ],
  },
  {
    label: "Teaching Tools",
    items: [
      { label: "Classes", href: "/admin/classes", icon: Users },
      { label: "Course Builder", href: "/admin/course-builder", icon: PlusCircle },
      { label: "Gradebook", href: "/admin/gradebook", icon: FileText },
      { label: "Live Classes", href: "/admin/live", icon: Video },
      { label: "Student Progress", href: "/admin/student-progress", icon: TrendingUp },
      { label: "Resources", href: "/admin/resources", icon: Library },
    ],
  },
  {
    label: "Communication",
    items: [
      { label: "Announcements", href: "/admin/announcements", icon: Megaphone },
      { label: "Messages", href: "/admin/messages", icon: MessageSquare },
      { label: "Reports", href: "/admin/reports", icon: FileText },
    ],

  },
  {
    label: "System",
    items: [
      { label: "Localization", href: "/admin/localization", icon: Globe },
      { label: "Security & Integrity", href: "/admin/security", icon: Shield },
      { label: "Bug Reports", href: "/admin/bug-reports", icon: Bug },
      { label: "Automation", href: "/admin/automation", icon: Zap },
      { label: "Settings", href: "/admin/settings", icon: SettingsIcon },
      { label: "Help Center", href: "/admin/help", icon: HelpCircle },
    ],
  },
];

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const { signOut } = useAuth();

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
    if (href === "/admin") return location.pathname === "/admin";
    return location.pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 flex items-center gap-3 border-b border-border/30">
        <FunfinityIcon 
          size="lg"
          className="transition-transform hover:scale-105 drop-shadow-lg text-destructive" 
        />
        {sidebarOpen && (
          <div>
            <span className="font-display font-bold text-foreground text-sm block">Admin Portal</span>
            <span className="text-[10px] text-muted-foreground">Funfinity Academy</span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6 no-scrollbar" role="navigation">
        {navGroups.map((group) => (
          <div key={group.label}>
            {sidebarOpen && (
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-3 mb-2 block">
                {group.label}
              </span>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setMobileSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive(item.href)
                      ? "bg-destructive/10 text-destructive border border-destructive/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                  aria-current={isActive(item.href) ? "page" : undefined}
                >
                  <item.icon className={cn("w-4 h-4 shrink-0", isActive(item.href) && "text-destructive")} />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-border/30 space-y-2">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors w-full"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          {sidebarOpen && <span>Log Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <aside className={cn("hidden lg:flex flex-col glass-sidebar shrink-0 transition-all duration-300 fixed top-0 left-0 h-screen z-40 border-r border-destructive/10", sidebarOpen ? "w-60" : "w-[72px]")}>
        <SidebarContent />
      </aside>
      <AnimatePresence>
        {mobileSidebarOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setMobileSidebarOpen(false)} className="lg:hidden fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40" />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }} transition={{ type: "spring", damping: 25 }} className="lg:hidden fixed top-0 left-0 h-screen w-60 glass-sidebar z-50">
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      <div className={cn("flex-1 flex flex-col min-h-screen transition-all duration-300", sidebarOpen ? "lg:ml-60" : "lg:ml-[72px]")}>
        <header className="sticky top-0 z-30 glass-card-heavy border-b border-border/30 px-4 lg:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-secondary/50 transition-colors" aria-label="Toggle sidebar">
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/50 border border-border/30 w-64">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search users, courses..." className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full" aria-label="Search" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-secondary/50 transition-colors" aria-label="Toggle dark mode">
              {theme === "dark" ? <Sun className="w-5 h-5 text-muted-foreground" /> : <Moon className="w-5 h-5 text-muted-foreground" />}
            </button>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-destructive/10 text-destructive border border-destructive/20">Admin</span>
            <NotificationDropdown accentColor="bg-destructive" />
          </div>
        </header>
        <main id="main-content" className="flex-1 p-4 lg:p-6" role="main" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
