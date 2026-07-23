import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, BookOpen, Users, ClipboardList, Video, BarChart3,
  MessageSquare, Menu, Search, Calendar,
  FileText, PlusCircle, ChevronRight, HelpCircle, Sun, Moon, Compass, Award
} from "lucide-react";
import { FunfinityIcon } from "@/components/brand/FunfinityLogo";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { NotificationDropdown } from "@/components/NotificationDropdown";

const navGroups = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/teacher", icon: LayoutDashboard },
      { label: "My Classes", href: "/teacher/classes", icon: Users },
      { label: "Schedule", href: "/teacher/schedule", icon: Calendar },
    ],
  },
  {
    label: "Teaching",
    items: [
      { label: "Course Builder", href: "/teacher/courses", icon: PlusCircle },
      { label: "Gradebook", href: "/teacher/gradebook", icon: Award },
      { label: "Live Classes", href: "/teacher/live", icon: Video },
    ],
  },
  {
    label: "Engagement",
    items: [
      { label: "Student Progress", href: "/teacher/progress", icon: BarChart3 },
      { label: "Messaging", href: "/teacher/messages", icon: MessageSquare },
      { label: "Reports", href: "/teacher/reports", icon: FileText },
    ],
  },
  {
    label: "Career",
    items: [
      { label: "Career Readiness", href: "/teacher/career", icon: Compass },
    ],
  },
  {
    label: "Resources",
    items: [
      { label: "Resource Library", href: "/teacher/resources", icon: BookOpen },
      { label: "Help Center", href: "/teacher/help", icon: HelpCircle },
    ],
  },
];

export function TeacherLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (href: string) => {
    if (href === "/teacher") return location.pathname === "/teacher";
    return location.pathname.startsWith(href);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="px-4 py-5 flex items-center gap-3 border-b border-border/30">
        <FunfinityIcon size="md" />
        {sidebarOpen && (
          <div>
            <span className="font-display font-bold text-foreground text-sm block">Teacher Portal</span>
            <span className="text-[10px] text-muted-foreground">Funfinity Academy</span>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6" role="navigation">
        {navGroups.map((group) => (
          <div key={group.label}>
            {sidebarOpen && (
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold px-3 mb-2 block">{group.label}</span>
            )}
            <div className="space-y-0.5">
              {group.items.map((item) => (
                <Link key={item.href} to={item.href} onClick={() => setMobileSidebarOpen(false)}
                  className={cn("flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                    isActive(item.href) ? "bg-primary/10 text-primary border border-primary/20" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )} aria-current={isActive(item.href) ? "page" : undefined}>
                  <item.icon className={cn("w-4 h-4 shrink-0", isActive(item.href) && "text-primary")} />
                  {sidebarOpen && <span>{item.label}</span>}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-border/30 space-y-2">

        <div className={cn("flex items-center gap-3 px-3 py-2 rounded-xl bg-primary/5 border border-primary/10", !sidebarOpen && "justify-center")}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan to-blue-500 flex items-center justify-center text-white text-sm font-bold shrink-0">JD</div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">Jane Doe</p>
              <p className="text-[10px] text-muted-foreground">Mathematics • Science</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background flex">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      <aside className={cn("hidden lg:flex flex-col glass-sidebar shrink-0 transition-all duration-300 fixed top-0 left-0 h-screen z-40 border-r border-primary/10", sidebarOpen ? "w-60" : "w-[72px]")}>
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
            <button onClick={() => { if (window.innerWidth < 1024) setMobileSidebarOpen(!mobileSidebarOpen); else setSidebarOpen(!sidebarOpen); }} className="p-2 rounded-lg hover:bg-secondary/50 transition-colors" aria-label="Toggle sidebar">
              <Menu className="w-5 h-5 text-muted-foreground" />
            </button>
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/50 border border-border/30 w-64">
              <Search className="w-4 h-4 text-muted-foreground" />
              <input type="text" placeholder="Search students, courses..." className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full" />
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={toggleTheme} className="p-2 rounded-lg hover:bg-secondary/50 transition-colors" aria-label="Toggle dark mode">
              {theme === "dark" ? <Sun className="w-5 h-5 text-muted-foreground" /> : <Moon className="w-5 h-5 text-muted-foreground" />}
            </button>
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">Teacher</span>
            <NotificationDropdown accentColor="bg-primary" />
          </div>
        </header>
        <main id="main-content" className="flex-1 p-4 lg:p-6" role="main" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
