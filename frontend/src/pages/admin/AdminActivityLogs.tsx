import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Activity, Search, Filter, Shield, User, BookOpen, Settings, Download, Clock, ChevronLeft, ChevronRight, Zap, Play, Pause, RotateCcw, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActivityLog {
  id: string;
  timestamp: number; // High-precision timestamp in milliseconds
  timestampMicro: number; // Microsecond precision
  user: string;
  role: string;
  action: string;
  category: string;
  severity: "info" | "warning" | "critical" | "success";
  details?: string;
  ipAddress?: string;
  userAgent?: string;
}

const categories = ["All", "Security", "Course", "Grade", "Settings", "Billing", "System", "Live"];

const severityStyle: Record<string, string> = {
  info: "bg-primary/10 text-primary border-primary/20",
  warning: "bg-accent/10 text-accent border-accent/20",
  critical: "bg-destructive/10 text-destructive border-destructive/20",
  success: "bg-cyan/10 text-cyan border-cyan/20",
};

const roleColor: Record<string, string> = {
  Admin: "text-destructive", Teacher: "text-primary", Parent: "text-magenta", Student: "text-cyan", System: "text-muted-foreground",
};

const severityIcon: Record<string, any> = {
  info: Info,
  warning: AlertTriangle,
  critical: AlertTriangle,
  success: CheckCircle,
};

const ITEMS_PER_PAGE = 50;

export default function AdminActivityLogs() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLive, setIsLive] = useState(true);
  const [latency, setLatency] = useState<number>(0);
  const logCounterRef = useRef(0);
  const performanceRef = useRef(performance.now());

  // High-precision timestamp generator
  const getHighPrecisionTimestamp = () => {
    const now = performance.now();
    const timestamp = Date.now();
    const micro = Math.floor((now % 1) * 1000); // Extract microseconds
    return { timestamp, timestampMicro: micro };
  };

  // Simulate real-time activity with ultra-low latency
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      const { timestamp, timestampMicro } = getHighPrecisionTimestamp();
      const latency = performance.now() - performanceRef.current;
      setLatency(latency);

      const actions = [
        { action: "User logged in", category: "Security", severity: "success" as const, role: "Student" },
        { action: "Course enrollment completed", category: "Course", severity: "info" as const, role: "Student" },
        { action: "Grade submitted", category: "Grade", severity: "info" as const, role: "Teacher" },
        { action: "Settings updated", category: "Settings", severity: "warning" as const, role: "Admin" },
        { action: "Payment processed", category: "Billing", severity: "success" as const, role: "System" },
        { action: "Failed login attempt", category: "Security", severity: "critical" as const, role: "System" },
        { action: "Live session started", category: "Live", severity: "info" as const, role: "Teacher" },
        { action: "API rate limit exceeded", category: "System", severity: "warning" as const, role: "System" },
      ];

      const randomAction = actions[Math.floor(Math.random() * actions.length)];
      const users = ["john.doe", "jane.smith", "admin.user", "teacher.jones", "student.wilson"];
      const randomUser = users[Math.floor(Math.random() * users.length)];

      const newLog: ActivityLog = {
        id: `log-${logCounterRef.current++}`,
        timestamp,
        timestampMicro,
        user: randomUser,
        role: randomAction.role,
        action: randomAction.action,
        category: randomAction.category,
        severity: randomAction.severity,
        details: `Session ID: ${Math.random().toString(36).substring(7)}`,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      };

      setLogs(prev => [newLog, ...prev].slice(0, 1000)); // Keep last 1000 logs
      performanceRef.current = performance.now();
    }, Math.random() * 2000 + 500); // Random interval between 500ms and 2500ms

    return () => clearInterval(interval);
  }, [isLive]);

  // Format timestamp with microsecond precision
  const formatHighPrecisionTimestamp = (timestamp: number, micro: number) => {
    const date = new Date(timestamp);
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit',
      fractionalSecondDigits: 3 
    });
    return `${timeStr}.${micro.toString().padStart(3, '0')}`;
  };

  const filtered = logs.filter(l =>
    (category === "All" || l.category === category) &&
    (l.action.toLowerCase().includes(search.toLowerCase()) || l.user.toLowerCase().includes(search.toLowerCase()))
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedLogs = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleClearLogs = () => {
    setLogs([]);
    logCounterRef.current = 0;
  };

  const handleToggleLive = () => {
    setIsLive(!isLive);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Activity Logs</h1>
            <p className="text-muted-foreground text-sm mt-1">Complete audit trail of all platform actions</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={isLive ? "default" : "secondary"} className="text-xs">
              <Zap className="w-3 h-3 mr-1" />
              {isLive ? "Live" : "Paused"}
            </Badge>
            <Badge variant="outline" className="text-xs">
              Latency: {latency.toFixed(3)}ms
            </Badge>
            <Button variant="ghost" size="sm" onClick={handleToggleLive}>
              {isLive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleClearLogs}>
              <RotateCcw className="w-4 h-4" />
            </Button>
            <Button variant="heroOutline" size="default">
              <Download className="w-4 h-4 mr-2" /> Export Logs
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[
            { label: "Total Events", value: logs.length.toString(), icon: Activity, color: "primary" },
            { label: "Security Alerts", value: logs.filter(l => l.category === "Security").length.toString(), icon: Shield, color: "destructive" },
            { label: "User Actions", value: logs.filter(l => l.role !== "System").length.toString(), icon: User, color: "cyan" },
            { label: "System Events", value: logs.filter(l => l.role === "System").length.toString(), icon: Settings, color: "accent" },
          ].map((s) => (
            <div key={s.label} className="platform-card p-4">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-${s.color}/10 mb-3`}>
                <s.icon className={`w-4 h-4 text-${s.color}`} />
              </div>
              <p className="font-display text-xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="platform-card p-4 flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary/50 border border-border/30 flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input value={search} onChange={e => setSearch(e.target.value)} type="text" placeholder="Search logs..."
              className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full" />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map(c => (
              <button key={c} onClick={() => setCategory(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${category === c ? "bg-primary/10 text-primary border-primary/30" : "border-border/30 text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Log entries */}
        <div className="space-y-2">
          {paginatedLogs.length === 0 ? (
            <div className="platform-card p-12 flex flex-col items-center justify-center text-center">
              <Activity className="w-12 h-12 text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground text-sm">{isLive ? "Waiting for activity..." : "No activity recorded"}</p>
            </div>
          ) : (
            paginatedLogs.map((log, i) => {
              const SeverityIcon = severityIcon[log.severity];
              return (
                <motion.div key={log.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.01 }}
                  className="platform-card p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      log.severity === "critical" ? "bg-destructive/10 text-destructive" : 
                      log.severity === "warning" ? "bg-accent/10 text-accent" : 
                      log.severity === "success" ? "bg-cyan/10 text-cyan" : "bg-primary/10 text-primary"
                    }`}>
                      <SeverityIcon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-sm font-semibold ${roleColor[log.role]}`}>{log.user}</span>
                        <Badge variant="outline" className={`text-[10px] font-semibold border ${severityStyle[log.severity]}`}>
                          {log.category}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground">{log.role}</span>
                      </div>
                      <p className="text-sm text-foreground">{log.action}</p>
                      {log.details && (
                        <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                      )}
                      {log.ipAddress && (
                        <p className="text-[10px] text-muted-foreground mt-1">IP: {log.ipAddress}</p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-xs text-muted-foreground font-mono">
                        {formatHighPrecisionTimestamp(log.timestamp, log.timestampMicro)}
                      </span>
                      <div className="text-[9px] text-muted-foreground mt-0.5">
                        μs: {log.timestampMicro}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4">
            <p className="text-xs text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(startIndex + ITEMS_PER_PAGE, filtered.length)} of {filtered.length} entries
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="gap-1"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => handlePageChange(pageNum)}
                      className={`w-8 h-8 rounded-lg text-sm font-medium transition-all ${
                        currentPage === pageNum
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary/50 text-muted-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="gap-1"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
