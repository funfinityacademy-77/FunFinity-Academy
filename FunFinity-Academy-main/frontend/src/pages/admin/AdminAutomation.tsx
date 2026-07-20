import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Database, Clock, Settings, Play, Pause, RefreshCcw, Download, Trash2, Bell, CheckCircle, XCircle, AlertCircle, Calendar, Filter, ChevronDown, ChevronUp, Zap, Workflow, Bot, Sparkles, TrendingUp, BarChart3, Activity, Cpu, Globe, ShieldCheck, ArrowUpRight, ArrowDownRight, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { supabase } from "@/lib/supabase";

interface Automation {
  id: string;
  name: string;
  type: "email" | "backup" | "workflow" | "ai";
  description: string;
  enabled: boolean;
  schedule: string;
  lastRun: string;
  nextRun: string;
  status: "idle" | "running" | "completed" | "failed";
  stats: {
    totalRuns: number;
    successRate: number;
    lastDuration: string;
  };
}

export default function AdminAutomation() {
  const { toast } = useToast();
  const { data: automations, loading, refresh } = useSupabaseRealtime<Automation>('automations');
  const [activeTab, setActiveTab] = useState<"email" | "backup" | "workflow" | "ai">("email");
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const handleToggleAutomation = async (automationId: string) => {
    try {
      const automation = automations?.find(a => a.id === automationId);
      if (!automation) return;

      const { error } = await supabase
        .from('automations')
        .update({ enabled: !automation.enabled })
        .eq('id', automationId);

      if (error) throw error;

      refresh();
      toast({
        title: "Automation updated",
        description: `${automation.name} ${automation.enabled ? 'disabled' : 'enabled'}`,
      });
    } catch (error) {
      toast({
        title: "Failed to update automation",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleRunAutomation = async (automationId: string) => {
    try {
      const { error } = await supabase
        .from('automations')
        .update({ status: 'running', lastRun: new Date().toISOString() })
        .eq('id', automationId);

      if (error) throw error;

      refresh();
      toast({
        title: "Automation started",
        description: "Manual run has been initiated",
      });
    } catch (error) {
      toast({
        title: "Failed to start automation",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center border border-primary/20">
            <Settings className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
            <span className="text-gradient-brand">Automation</span> Center
          </h1>
        </div>
        <p className="text-muted-foreground text-sm ml-1">
          Manage email automation, backups, workflows, and AI systems
        </p>
      </motion.div>

      {/* Tabs */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex gap-2 p-1 bg-secondary/50 rounded-2xl border border-border/20 w-fit">
          <button
            onClick={() => setActiveTab("email")}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-medium transition-all",
              activeTab === "email" ? "bg-background shadow-soft" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Mail className="w-4 h-4 inline mr-2" />
            Email Automation
          </button>
          <button
            onClick={() => setActiveTab("backup")}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-medium transition-all",
              activeTab === "backup" ? "bg-background shadow-soft" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Database className="w-4 h-4 inline mr-2" />
            Backup System
          </button>
          <button
            onClick={() => setActiveTab("workflow")}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-medium transition-all",
              activeTab === "workflow" ? "bg-background shadow-soft" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Workflow className="w-4 h-4 inline mr-2" />
            Workflows
          </button>
          <button
            onClick={() => setActiveTab("ai")}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-medium transition-all",
              activeTab === "ai" ? "bg-background shadow-soft" : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Bot className="w-4 h-4 inline mr-2" />
            AI Systems
          </button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === "email" && (
          <motion.div
            key="email"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            {/* Email Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="platform-card p-4 border-primary/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-bold text-foreground">{automations?.filter(a => a.type === 'email').length || 0}</div>
                <div className="text-xs text-muted-foreground">Email Triggers</div>
              </div>
              <div className="platform-card p-4 border-green-500/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-green-500/10 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  </div>
                  <Activity className="w-4 h-4 text-green-500" />
                </div>
                <div className="text-2xl font-bold text-green-500">{automations?.filter(a => a.type === 'email' && a.enabled).length || 0}</div>
                <div className="text-xs text-muted-foreground">Active Triggers</div>
              </div>
              <div className="platform-card p-4 border-blue-500/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                    <Send className="w-4 h-4 text-blue-500" />
                  </div>
                  <ArrowUpRight className="w-4 h-4 text-blue-500" />
                </div>
                <div className="text-2xl font-bold text-blue-500">{automations?.filter(a => a.type === 'email' && a.status === 'completed').length || 0}</div>
                <div className="text-xs text-muted-foreground">Emails Sent</div>
              </div>
              <div className="platform-card p-4 border-red-500/10">
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                    <XCircle className="w-4 h-4 text-red-500" />
                  </div>
                  <AlertCircle className="w-4 h-4 text-red-500" />
                </div>
                <div className="text-2xl font-bold text-red-500">{automations?.filter(a => a.type === 'email' && a.status === 'failed').length || 0}</div>
                <div className="text-xs text-muted-foreground">Failed Emails</div>
              </div>
            </motion.div>

            {/* Email Triggers */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="platform-card border-border/30">
              <div className="p-4 border-b border-border/20 flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Email Triggers</h2>
                <Button variant="outline" size="sm" onClick={refresh}>
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
              <div className="divide-y divide-border/20">
                {(automations?.filter(a => a.type === 'email') || []).map((automation) => (
                  <div key={automation.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{automation.name}</h3>
                          <Badge variant={automation.enabled ? "default" : "secondary"} className="text-[10px]">
                            {automation.enabled ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {automation.schedule}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{automation.description}</p>
                        <div className="flex gap-4 text-xs text-muted-foreground">
                          <span>Success Rate: {automation.stats.successRate}%</span>
                          <span>Last Run: {new Date(automation.lastRun).toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRunAutomation(automation.id)}
                          disabled={!automation.enabled}
                          className="hover:bg-primary/10"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleAutomation(automation.id)}
                          className={automation.enabled ? "hover:bg-destructive/10 text-destructive" : "hover:bg-green-500/10 text-green-500"}
                        >
                          {automation.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {(automations?.filter(a => a.type === 'email').length || 0) === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No email automations configured
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === "backup" && (
          <motion.div
            key="backup"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Backup Stats */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="platform-card p-4 border-primary/10">
                <div className="text-2xl font-bold text-foreground">{automations?.filter(a => a.type === 'backup').length || 0}</div>
                <div className="text-xs text-muted-foreground">Total Backups</div>
              </div>
              <div className="platform-card p-4 border-green-500/10">
                <div className="text-2xl font-bold text-green-500">{automations?.filter(a => a.type === 'backup' && a.status === 'completed').length || 0}</div>
                <div className="text-xs text-muted-foreground">Successful</div>
              </div>
              <div className="platform-card p-4 border-blue-500/10">
                <div className="text-2xl font-bold text-blue-500">{automations?.filter(a => a.type === 'backup').reduce((sum, a) => sum + a.stats.totalRuns, 0) || 0}</div>
                <div className="text-xs text-muted-foreground">Total Runs</div>
              </div>
              <div className="platform-card p-4 border-purple-500/10">
                <div className="text-2xl font-bold text-purple-500">{automations?.filter(a => a.type === 'backup').reduce((sum, a) => sum + a.stats.successRate, 0) / (automations?.filter(a => a.type === 'backup').length || 1) || 0}%</div>
                <div className="text-xs text-muted-foreground">Success Rate</div>
              </div>
            </motion.div>

            {/* Backup Configs */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="platform-card border-border/30">
              <div className="p-4 border-b border-border/20 flex items-center justify-between">
                <h2 className="font-semibold text-foreground">Backup Configurations</h2>
                <Button variant="outline" size="sm" onClick={refresh}>
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
              <div className="divide-y divide-border/20">
                {(automations?.filter(a => a.type === 'backup') || []).map((automation) => (
                  <div key={automation.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{automation.name}</h3>
                          <Badge variant={automation.enabled ? "default" : "secondary"} className="text-[10px]">
                            {automation.enabled ? "Active" : "Inactive"}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {automation.schedule}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                          <div>Last Run: {new Date(automation.lastRun).toLocaleString()}</div>
                          <div>Next Run: {new Date(automation.nextRun).toLocaleString()}</div>
                          <div>Total Runs: {automation.stats.totalRuns}</div>
                          <div>Last Duration: {automation.stats.lastDuration}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRunAutomation(automation.id)}
                          disabled={!automation.enabled}
                          className="hover:bg-primary/10"
                        >
                          <Play className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleAutomation(automation.id)}
                          className={automation.enabled ? "hover:bg-destructive/10 text-destructive" : "hover:bg-green-500/10 text-green-500"}
                        >
                          {automation.enabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                {(automations?.filter(a => a.type === 'backup').length || 0) === 0 && (
                  <div className="p-8 text-center text-muted-foreground text-sm">
                    No backup configurations found
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}

        {activeTab === "workflow" && (
          <motion.div
            key="workflow"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="platform-card p-12 text-center border-dashed border-2 border-border/40">
              <Workflow className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">Workflow Automation</h3>
              <p className="text-muted-foreground text-sm">Create and manage custom workflow automations</p>
              <Button variant="hero" className="mt-4">
                <Zap className="w-4 h-4 mr-2" /> Create Workflow
              </Button>
            </motion.div>
          </motion.div>
        )}

        {activeTab === "ai" && (
          <motion.div
            key="ai"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="platform-card p-12 text-center border-dashed border-2 border-border/40">
              <Sparkles className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-bold mb-2">AI Systems</h3>
              <p className="text-muted-foreground text-sm">Configure AI-powered automation and intelligence systems</p>
              <Button variant="hero" className="mt-4">
                <Bot className="w-4 h-4 mr-2" /> Configure AI
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
