import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, X, Info, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  priority: "low" | "medium" | "high" | "urgent";
  active: boolean;
  expires_at?: string;
}

const typeIcons: Record<string, typeof Info> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
};

const typeColors: Record<string, string> = {
  info: "bg-cyan/10 text-cyan border-cyan/20",
  success: "bg-emerald/10 text-emerald border-emerald/20",
  warning: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  error: "bg-destructive/10 text-destructive border-destructive/20",
};

const priorityColors: Record<string, string> = {
  low: "bg-slate/10 text-slate-foreground border-slate/20",
  medium: "bg-blue/10 text-blue border-blue/20",
  high: "bg-orange/10 text-orange border-orange/20",
  urgent: "bg-red/10 text-red border-red/20",
};

export function NotificationBanner() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await apiClient.get<Notification[]>("/api/notifications/public");
      if (data) {
        const activeNotifications = data.filter(n => 
          n.active && 
          (!n.expires_at || new Date(n.expires_at) > new Date())
        );
        setNotifications(activeNotifications);
      }
    } catch (error) {
      console.error('Unable to load notifications.');
    }
  };

  const handleDismiss = (id: string) => {
    setDismissed(prev => new Set(prev).add(id));
    if (currentIndex < notifications.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const visibleNotifications = notifications.filter(n => !dismissed.has(n.id));
  
  if (visibleNotifications.length === 0) {
    return null;
  }

  const currentNotification = visibleNotifications[currentIndex];
  const TypeIcon = typeIcons[currentNotification.type];

  return (
    <AnimatePresence mode="wait">
      {currentNotification && (
        <motion.div
          key={currentNotification.id}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "fixed top-20 left-1/2 -translate-x-1/2 z-40 w-full max-w-2xl px-4",
            "pointer-events-none"
          )}
        >
          <div className={cn(
            "glass-card border-border/30 rounded-xl p-4 shadow-lg pointer-events-auto",
            typeColors[currentNotification.type]
          )}>
            <div className="flex items-start gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                typeColors[currentNotification.type]
              )}>
                <TypeIcon className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-foreground text-sm">{currentNotification.title}</h4>
                  <Badge className={cn("text-[10px]", priorityColors[currentNotification.priority])}>
                    {currentNotification.priority}
                  </Badge>
                </div>
                <p className="text-sm text-foreground/80 line-clamp-2">{currentNotification.message}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDismiss(currentNotification.id)}
                className="shrink-0 h-8 w-8 p-0 hover:bg-background/50"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {visibleNotifications.length > 1 && (
              <div className="flex items-center justify-center gap-1 mt-3">
                {visibleNotifications.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentIndex(index)}
                    className={cn(
                      "h-1 rounded-full transition-all",
                      index === currentIndex ? "w-6 bg-foreground/50" : "w-2 bg-foreground/20"
                    )}
                  />
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
