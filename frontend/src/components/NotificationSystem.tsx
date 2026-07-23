import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Sparkles, CheckCircle2, Info, AlertTriangle, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";

interface Notification {
  id: string;
  type: "feature" | "update" | "alert" | "achievement";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  priority: "low" | "medium" | "high";
}

const notificationIcons: Record<string, typeof Sparkles> = {
  feature: Sparkles,
  update: CheckCircle2,
  alert: AlertTriangle,
  achievement: Zap,
};

const notificationColors: Record<string, string> = {
  feature: "bg-primary/10 text-primary border-primary/20",
  update: "bg-emerald/10 text-emerald border-emerald/20",
  alert: "bg-destructive/10 text-destructive border-destructive/20",
  achievement: "bg-yellow/10 text-yellow border-yellow/20",
};

export function NotificationSystem() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  // Mock notifications - in production, this would come from the API
  const mockNotifications: Notification[] = [
    {
      id: "1",
      type: "feature",
      title: "New: College & University Search",
      message: "Explore colleges and universities with AI-powered matching based on your academic profile.",
      timestamp: new Date().toISOString(),
      read: false,
      actionUrl: "/app/career/college-university",
      priority: "high"
    },
    {
      id: "2",
      type: "feature",
      title: "Academic Profile Now Available",
      message: "Add your school information, grades, and test scores for personalized recommendations.",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      actionUrl: "/app/account/academic-profile",
      priority: "high"
    },
    {
      id: "3",
      type: "update",
      title: "AI Assistant Enhanced",
      message: "Experience our completely redesigned AI assistant with advanced hardcoded responses.",
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      read: false,
      priority: "medium"
    },
    {
      id: "4",
      type: "feature",
      title: "Custom Backgrounds",
      message: "Choose from 195 countries with realistic weather-based backgrounds for your learning environment.",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      read: true,
      actionUrl: "/app/account/background",
      priority: "medium"
    },
    {
      id: "5",
      type: "achievement",
      title: "Feedback Center Launched",
      message: "Submit bug reports, feature requests, and general feedback through our new centralized system.",
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      read: true,
      actionUrl: "/app/account/feedback",
      priority: "low"
    }
  ];

  useEffect(() => {
    setNotifications(mockNotifications);
    setUnreadCount(mockNotifications.filter(n => !n.read).length);
  }, []);

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
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

  return (
    <>
      {/* Notification Bell */}
      <div className="relative">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(!isOpen)}
          className="relative"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-gradient-to-br from-primary to-accent text-[10px] font-bold text-primary-foreground rounded-full border-2 border-background flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>

        {/* Notification Dropdown */}
        <AnimatePresence>
          {isOpen && (
            <>
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                className="absolute right-0 top-12 w-96 max-h-[500px] glass-card border-border/30 rounded-2xl shadow-2xl z-50 overflow-hidden"
              >
                {/* Header */}
                <div className="p-4 border-b border-border/30 flex items-center justify-between">
                  <h3 className="font-semibold text-foreground">Notifications</h3>
                  {unreadCount > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs"
                    >
                      Mark all as read
                    </Button>
                  )}
                </div>

                {/* Notifications List */}
                <div className="overflow-y-auto max-h-[400px]">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center">
                      <Bell className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
                      <p className="text-sm text-muted-foreground">No notifications</p>
                    </div>
                  ) : (
                    notifications.map((notification) => {
                      const Icon = notificationIcons[notification.type];
                      return (
                        <div
                          key={notification.id}
                          className={cn(
                            "p-4 border-b border-border/20 hover:bg-secondary/30 transition-colors cursor-pointer",
                            !notification.read && "bg-primary/5"
                          )}
                          onClick={() => {
                            markAsRead(notification.id);
                            if (notification.actionUrl) {
                              window.location.href = notification.actionUrl;
                            }
                          }}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                              notificationColors[notification.type]
                            )}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between gap-2 mb-1">
                                <h4 className={cn(
                                  "text-sm font-medium text-foreground leading-tight",
                                  !notification.read && "font-semibold"
                                )}>
                                  {notification.title}
                                </h4>
                                {!notification.read && (
                                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1" />
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                                {notification.message}
                              </p>
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] text-muted-foreground">
                                  {formatTime(notification.timestamp)}
                                </span>
                                {notification.actionUrl && (
                                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Footer */}
                <div className="p-3 border-t border-border/30 text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-muted-foreground"
                  >
                    View all notifications
                  </Button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}

// Landing page notification banner component
export function LandingNotificationBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const [currentNotification, setCurrentNotification] = useState(0);

  const featuredNotifications = [
    {
      title: "🎓 New: College & University Search",
      description: "AI-powered college matching based on your academic profile",
      action: "Learn More",
      url: "/app/career/college-university"
    },
    {
      title: "🤖 AI Assistant Redesigned",
      description: "Experience our completely advanced hardcoded AI system",
      action: "Try It Now",
      url: "/app/dashboard"
    },
    {
      title: "🌍 Custom Country Backgrounds",
      description: "195 countries with realistic weather-based themes",
      action: "Explore",
      url: "/app/account/background"
    }
  ];

  const nextNotification = () => {
    setCurrentNotification((prev) => (prev + 1) % featuredNotifications.length);
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary/90 via-purple/90 to-accent/90 backdrop-blur-md border-b border-white/10"
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
            <div>
              <p className="text-sm font-semibold text-white">{featuredNotifications[currentNotification].title}</p>
              <p className="text-xs text-white/80">{featuredNotifications[currentNotification].description}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              size="sm"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30"
              onClick={() => window.location.href = featuredNotifications[currentNotification].url}
            >
              {featuredNotifications[currentNotification].action}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white/80 hover:text-white hover:bg-white/10"
              onClick={() => setIsVisible(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
