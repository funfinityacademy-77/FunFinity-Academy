import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Check, CheckCheck, X, Info, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export function NotificationDropdown({ accentColor = "bg-accent" }: { accentColor?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  
  // ALWAYS SHOW NO NOTIFICATIONS
  const notifications: any[] = [];
  const unreadCount = 0;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="p-2 rounded-lg hover:bg-secondary/50 relative transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5 text-muted-foreground" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-2xl glass-card-heavy border border-border/30 shadow-heavy z-50 overflow-hidden"
          >
            <div className="p-4 border-b border-border/30 flex items-center justify-between">
              <h3 className="font-display font-semibold text-foreground text-sm">Notifications</h3>
            </div>

            <div className="max-h-80 overflow-y-auto">
              <div className="p-8 text-center text-muted-foreground text-sm">No notifications</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
