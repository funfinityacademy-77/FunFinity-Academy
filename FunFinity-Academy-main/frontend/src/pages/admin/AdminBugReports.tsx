import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bug, Filter, Search, CheckCircle, XCircle, Clock, AlertTriangle, Send, Download, Trash2, Reply, ChevronDown, ChevronUp, Eye, Calendar, User, Mail, Loader2, TrendingUp, BarChart3, Zap, Shield, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { supabase } from "@/lib/supabase";

interface BugReport {
  id: string;
  title: string;
  description: string;
  steps: string;
  severity: "low" | "medium" | "high" | "critical";
  category: string;
  email: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  created_at: string;
  updated_at: string;
  replies: Array<{
    id: string;
    message: string;
    created_at: string;
    admin_name: string;
  }>;
}

const severityConfig = {
  low: { label: "Low", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", icon: CheckCircle },
  medium: { label: "Medium", color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20", icon: Clock },
  high: { label: "High", color: "bg-orange-500/10 text-orange-500 border-orange-500/20", icon: AlertTriangle },
  critical: { label: "Critical", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: XCircle },
};

const statusConfig = {
  open: { label: "Open", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  in_progress: { label: "In Progress", color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  resolved: { label: "Resolved", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  closed: { label: "Closed", color: "bg-gray-500/10 text-gray-500 border-gray-500/20" },
};

export default function AdminBugReports() {
  const { toast } = useToast();
  const { data: reports, loading, refresh } = useSupabaseRealtime<BugReport>('bug_reports');
  const [selectedReport, setSelectedReport] = useState<BugReport | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [replyText, setReplyText] = useState("");
  const [submittingReply, setSubmittingReply] = useState(false);
  const [expandedReport, setExpandedReport] = useState<string | null>(null);

  const filteredReports = (reports || []).filter(report => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSeverity = severityFilter === "all" || report.severity === severityFilter;
    const matchesStatus = statusFilter === "all" || report.status === statusFilter;
    return matchesSearch && matchesSeverity && matchesStatus;
  });

  const handleStatusChange = async (reportId: string, newStatus: BugReport["status"]) => {
    try {
      const { error } = await supabase
        .from('bug_reports')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', reportId);
      
      if (error) throw error;
      
      refresh();
      toast({
        title: "Status updated",
        description: `Bug report status changed to ${statusConfig[newStatus].label}`,
      });
    } catch (error) {
      toast({
        title: "Failed to update status",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedReport) return;

    setSubmittingReply(true);

    try {
      const newReply = {
        id: `r${Date.now()}`,
        message: replyText,
        created_at: new Date().toISOString(),
        admin_name: "Admin"
      };

      const { error } = await supabase
        .from('bug_reports')
        .update({ 
          replies: [...(selectedReport.replies || []), newReply],
          status: "in_progress",
          updated_at: new Date().toISOString()
        })
        .eq('id', selectedReport.id);

      if (error) throw error;

      setReplyText("");
      setSelectedReport(null);
      refresh();
      toast({
        title: "Reply sent",
        description: "Your response has been sent to the user",
      });
    } catch (error) {
      toast({
        title: "Failed to send reply",
        description: "Please try again",
        variant: "destructive"
      });
    } finally {
      setSubmittingReply(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getSeverityCount = (severity: string) => {
    return (reports || []).filter(r => r.severity === severity).length;
  };

  const getStatusCount = (status: string) => {
    return (reports || []).filter(r => r.status === status).length;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-700/50 rounded animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 bg-slate-700/30 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center border border-destructive/20">
            <Bug className="w-5 h-5 text-destructive" />
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
            <span className="text-gradient-destructive">Bug Reports</span>
          </h1>
        </div>
        <p className="text-muted-foreground text-sm ml-1">
          Manage and respond to user-submitted bug reports
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-5 gap-4"
      >
        <div className="platform-card p-4 border-primary/10">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bug className="w-4 h-4 text-primary" />
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-foreground">{reports?.length || 0}</div>
          <div className="text-xs text-muted-foreground">Total Reports</div>
        </div>
        <div className="platform-card p-4 border-destructive/10">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
              <XCircle className="w-4 h-4 text-destructive" />
            </div>
            <AlertTriangle className="w-4 h-4 text-destructive" />
          </div>
          <div className="text-2xl font-bold text-destructive">{getSeverityCount("critical")}</div>
          <div className="text-xs text-muted-foreground">Critical</div>
        </div>
        <div className="platform-card p-4 border-blue-500/10">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-500" />
            </div>
            <Zap className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-blue-500">{getStatusCount("open")}</div>
          <div className="text-xs text-muted-foreground">Open</div>
        </div>
        <div className="platform-card p-4 border-emerald-500/10">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-emerald-500" />
            </div>
            <Shield className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-500">{getStatusCount("resolved")}</div>
          <div className="text-xs text-muted-foreground">Resolved</div>
        </div>
        <div className="platform-card p-4 border-purple-500/10">
          <div className="flex items-center justify-between mb-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-purple-500" />
            </div>
            <BarChart3 className="w-4 h-4 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-purple-500">{reports?.reduce((sum, r) => sum + (r.replies?.length || 0), 0) || 0}</div>
          <div className="text-xs text-muted-foreground">Total Replies</div>
        </div>
      </motion.div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="platform-card p-4 border-border/30"
      >
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-10 rounded-xl border-border/50 bg-secondary/40 focus:bg-background transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="h-10 px-4 rounded-xl border border-border/50 bg-secondary/40 focus:bg-background transition-all text-sm"
            >
              <option value="all">All Severities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-10 px-4 rounded-xl border border-border/50 bg-secondary/40 focus:bg-background transition-all text-sm"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>
        </div>
      </motion.div>

      {/* Reports List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        {filteredReports.length === 0 ? (
          <div className="platform-card p-12 text-center border-dashed border-2 border-border/40">
            <Bug className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-bold mb-2">No bug reports found</h3>
            <p className="text-muted-foreground text-sm">
              {searchQuery || severityFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "No bug reports have been submitted yet"}
            </p>
          </div>
        ) : (
          filteredReports.map((report, index) => {
            const severityInfo = severityConfig[report.severity];
            const statusInfo = statusConfig[report.status];
            const SeverityIcon = severityInfo.icon;
            const isExpanded = expandedReport === report.id;

            return (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.05 }}
                className="platform-card border-border/30 overflow-hidden"
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <SeverityIcon className={cn("w-4 h-4", severityInfo.color.split(" ")[1])} />
                        <h3 className="font-semibold text-foreground truncate">{report.title}</h3>
                        <Badge variant="outline" className={cn("text-[10px]", severityInfo.color)}>
                          {severityInfo.label}
                        </Badge>
                        <Badge variant="outline" className={cn("text-[10px]", statusInfo.color)}>
                          {statusInfo.label}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{report.description}</p>
                      <div className="flex items-center gap-4 text-[11px] text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(report.created_at)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {report.email}
                        </div>
                        {report.replies.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Reply className="w-3 h-3" />
                            {report.replies.length} {report.replies.length === 1 ? "reply" : "replies"}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedReport(report)}
                        className="rounded-xl"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setExpandedReport(isExpanded ? null : report.id)}
                        className="rounded-xl"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-4 pt-4 border-t border-border/30 space-y-4"
                      >
                        {report.steps && (
                          <div>
                            <h4 className="text-xs font-semibold text-foreground mb-2">Steps to Reproduce</h4>
                            <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-secondary/30 p-3 rounded-xl">{report.steps}</p>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-foreground">Status:</span>
                          <select
                            value={report.status}
                            onChange={(e) => handleStatusChange(report.id, e.target.value as BugReport["status"])}
                            className="h-8 px-3 rounded-lg border border-border/50 bg-secondary/40 focus:bg-background transition-all text-xs"
                          >
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })
        )}
      </motion.div>

      {/* Report Detail Modal */}
      <AnimatePresence>
        {selectedReport && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedReport(null)}
          >
            <div className="absolute inset-0 bg-foreground/20 backdrop-blur-sm" />
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
              className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto platform-card border-border/30"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-background/95 backdrop-blur-md border-b border-border/30 p-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-display font-bold text-foreground">{selectedReport.title}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className={cn("text-[10px]", severityConfig[selectedReport.severity].color)}>
                      {severityConfig[selectedReport.severity].label}
                    </Badge>
                    <Badge variant="outline" className={cn("text-[10px]", statusConfig[selectedReport.status].color)}>
                      {statusConfig[selectedReport.status].label}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{formatDate(selectedReport.created_at)}</span>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedReport(null)}
                  className="rounded-full"
                >
                  <XCircle className="w-5 h-5" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Description</h3>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-secondary/30 p-4 rounded-xl">{selectedReport.description}</p>
                </div>

                {selectedReport.steps && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-2">Steps to Reproduce</h3>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-secondary/30 p-4 rounded-xl">{selectedReport.steps}</p>
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">{selectedReport.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-foreground">Status:</span>
                    <select
                      value={selectedReport.status}
                      onChange={(e) => handleStatusChange(selectedReport.id, e.target.value as BugReport["status"])}
                      className="h-8 px-3 rounded-lg border border-border/50 bg-secondary/40 focus:bg-background transition-all text-xs"
                    >
                      <option value="open">Open</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                </div>

                {/* Replies */}
                {selectedReport.replies.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-foreground mb-3">Replies</h3>
                    <div className="space-y-3">
                      {selectedReport.replies.map((reply) => (
                        <div key={reply.id} className="bg-secondary/30 p-4 rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <User className="w-4 h-4 text-primary" />
                              <span className="text-sm font-semibold text-foreground">{reply.admin_name}</span>
                            </div>
                            <span className="text-xs text-muted-foreground">{formatDate(reply.created_at)}</span>
                          </div>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">{reply.message}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reply Form */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Add Reply</h3>
                  <form onSubmit={handleReplySubmit} className="space-y-3">
                    <Textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your response..."
                      rows={4}
                      className="rounded-xl border-border/50 bg-secondary/40 focus:bg-background transition-all resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => setReplyText("")}
                        className="rounded-xl"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="hero"
                        disabled={!replyText.trim() || submittingReply}
                        className="rounded-xl"
                      >
                        {submittingReply ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Reply
                          </>
                        )}
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
