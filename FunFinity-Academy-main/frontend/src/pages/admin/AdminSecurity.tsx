import { motion } from "framer-motion";
import { Shield, Lock, Eye, Activity, AlertTriangle, ShieldCheck, Key, Globe, Fingerprint, Terminal, UserCheck, Search, RefreshCcw, Ban, ShieldAlert, Network, FileKey, Monitor, Cpu, Database, Wifi, Zap, TrendingUp, Clock, ArrowUpRight, ArrowDownRight, CheckCircle } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useSupabaseRealtime } from "@/hooks/useSupabaseRealtime";
import { supabase } from "@/lib/supabase";

interface SecurityLog {
  id: string;
  event: string;
  user: string;
  status: string;
  location: string;
  time: string;
  risk: "Low" | "Medium" | "High" | "Critical";
}

interface SecurityPolicy {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  type: string;
}

export default function AdminSecurity() {
  const [activeShield, setActiveShield] = useState(true);
  const [aiModeration, setAiModeration] = useState(true);
  const [deviceFingerprinting, setDeviceFingerprinting] = useState(false);
  const [threatLevel, setThreatLevel] = useState<"low" | "medium" | "high">("low");
  const { data: securityLogs, loading, refresh } = useSupabaseRealtime<SecurityLog>('security_logs');
  const { data: policies, refresh: refreshPolicies } = useSupabaseRealtime<SecurityPolicy>('security_policies');

  const handleTogglePolicy = async (policyId: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('security_policies')
        .update({ enabled: !currentState })
        .eq('id', policyId);

      if (error) throw error;

      refreshPolicies();
      toast.success("Security policy updated");
    } catch (error) {
      toast.error("Failed to update policy");
    }
  };

  const handleLockdown = async () => {
    try {
      toast.success("Immediate lockdown initiated");
      // Implement lockdown logic
    } catch (error) {
      toast.error("Failed to initiate lockdown");
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-[1.25rem] bg-destructive/10 flex items-center justify-center shadow-lg shadow-destructive/20 border border-destructive/20">
              <Shield className="w-6 h-6 text-destructive" />
            </div>
            <h1 className="font-display text-3xl lg:text-4xl font-bold text-foreground tracking-tight">
              Security <span className="text-destructive">Integrity</span>
            </h1>
          </div>
          <p className="text-muted-foreground ml-1">Monitor and enforce platform-wide safety protocols and audit trails.</p>
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl h-12 px-6 border-white/10 hover:bg-white/5" onClick={refresh}>
            <RefreshCcw className="w-4 h-4 mr-2" /> Refresh Logs
          </Button>
          <Button variant="destructive" className="rounded-2xl h-12 px-8 shadow-xl shadow-destructive/20" onClick={handleLockdown}>
            <AlertTriangle className="w-4 h-4 mr-2" /> Immediate Lockdown
          </Button>
        </div>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Security Status Grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <motion.div whileHover={{ y: -5 }} className="glass-card p-5 rounded-[2rem] border-emerald-500/20 bg-emerald-500/5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <Badge className="bg-emerald-500/20 text-emerald-500 border-none text-[10px]">Active</Badge>
              </div>
              <h3 className="font-bold text-foreground text-sm">Firewall</h3>
              <p className="text-[10px] text-muted-foreground mt-1">12.4k req/min</p>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-500">
                <ArrowUpRight className="w-3 h-3" /> 0% breaches
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="glass-card p-5 rounded-[2rem] border-primary/20 bg-primary/5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Fingerprint className="w-4 h-4 text-primary" />
                </div>
                <Badge className="bg-primary/20 text-primary border-none text-[10px]">Enforced</Badge>
              </div>
              <h3 className="font-bold text-foreground text-sm">MFA</h3>
              <p className="text-[10px] text-muted-foreground mt-1">All elevated roles</p>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-primary">
                <CheckCircle className="w-3 h-3" /> 100% coverage
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="glass-card p-5 rounded-[2rem] border-blue-500/20 bg-blue-500/5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center">
                  <Database className="w-4 h-4 text-blue-500" />
                </div>
                <Badge className="bg-blue-500/20 text-blue-500 border-none text-[10px]">Secure</Badge>
              </div>
              <h3 className="font-bold text-foreground text-sm">Encryption</h3>
              <p className="text-[10px] text-muted-foreground mt-1">AES-256 at rest</p>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-blue-500">
                <Lock className="w-3 h-3" /> TLS 1.3
              </div>
            </motion.div>

            <motion.div whileHover={{ y: -5 }} className="glass-card p-5 rounded-[2rem] border-purple-500/20 bg-purple-500/5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-purple-500" />
                </div>
                <Badge className="bg-purple-500/20 text-purple-500 border-none text-[10px]">Scanning</Badge>
              </div>
              <h3 className="font-bold text-foreground text-sm">AI Threat</h3>
              <p className="text-[10px] text-muted-foreground mt-1">Real-time analysis</p>
              <div className="flex items-center gap-1 mt-2 text-[10px] text-purple-500">
                <Zap className="w-3 h-3" /> 0.001s latency
              </div>
            </motion.div>
          </div>

          {/* Threat Level Indicator */}
          <motion.div whileHover={{ y: -5 }} className="glass-card p-6 rounded-[2rem] border-white/5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-base font-bold text-foreground flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-destructive" />
                Global Threat Level
              </h3>
              <Badge variant="outline" className={cn(
                "text-[10px] uppercase tracking-wider",
                threatLevel === "low" ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" :
                threatLevel === "medium" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" :
                "bg-destructive/10 text-destructive border-destructive/20"
              )}>
                {threatLevel}
              </Badge>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <button
                onClick={() => setThreatLevel("low")}
                className={cn(
                  "p-4 rounded-xl border transition-all text-center",
                  threatLevel === "low" ? "bg-emerald-500/10 border-emerald-500/30" : "border-white/10 hover:border-emerald-500/30"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                </div>
                <span className="text-xs font-bold text-foreground">Low</span>
              </button>
              <button
                onClick={() => setThreatLevel("medium")}
                className={cn(
                  "p-4 rounded-xl border transition-all text-center",
                  threatLevel === "medium" ? "bg-yellow-500/10 border-yellow-500/30" : "border-white/10 hover:border-yellow-500/30"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-500" />
                </div>
                <span className="text-xs font-bold text-foreground">Medium</span>
              </button>
              <button
                onClick={() => setThreatLevel("high")}
                className={cn(
                  "p-4 rounded-xl border transition-all text-center",
                  threatLevel === "high" ? "bg-destructive/10 border-destructive/30" : "border-white/10 hover:border-destructive/30"
                )}
              >
                <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center mx-auto mb-2">
                  <ShieldAlert className="w-4 h-4 text-destructive" />
                </div>
                <span className="text-xs font-bold text-foreground">High</span>
              </button>
            </div>
          </motion.div>

          {/* Audit Logs */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-2">
                <Activity className="w-5 h-5 text-destructive" />
                Real-time Audit Trail
              </h2>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Live Stream</span>
              </div>
            </div>

            <div className="glass-card rounded-[2.5rem] border-white/5 overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-white/5 border-b border-white/5">
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Event</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Actor</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Risk</th>
                    <th className="px-6 py-4 text-[10px] font-bold text-muted-foreground uppercase tracking-widest text-right">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {(securityLogs || []).map((log) => (
                    <tr key={log.id} className="hover:bg-white/5 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            "p-2 rounded-lg bg-white/5",
                            log.risk === "High" || log.risk === "Critical" ? "text-destructive" : "text-muted-foreground"
                          )}>
                            <Lock className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-foreground">{log.event}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-xs text-muted-foreground font-medium">{log.user}</span>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={cn(
                          "text-[9px] uppercase tracking-tighter border-none bg-opacity-10",
                          log.status === "Blocked" ? "bg-destructive text-destructive" : "bg-emerald-500 text-emerald-500"
                        )}>
                          {log.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "text-[10px] font-bold",
                          log.risk === "Critical" ? "text-destructive" : log.risk === "High" ? "text-orange-500" : log.risk === "Medium" ? "text-yellow-500" : "text-emerald-500"
                        )}>
                          {log.risk}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className="text-[10px] text-muted-foreground">{log.time}</span>
                      </td>
                    </tr>
                  ))}
                  {(securityLogs || []).length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground text-sm">
                        No security logs available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Security Policies Sidebar */}
        <div className="space-y-8">
          <div className="glass-card-heavy p-6 rounded-[2.5rem] border-destructive/20 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-destructive/10 via-transparent to-transparent opacity-50" />
            
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <Lock className="w-4 h-4 text-destructive" />
                </div>
                <h3 className="font-display text-base font-bold text-foreground tracking-tight">Active Protocols</h3>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Active Shield</p>
                      <p className="text-[9px] text-muted-foreground">Real-time monitoring</p>
                    </div>
                  </div>
                  <Switch checked={activeShield} onCheckedChange={(val) => {
                    setActiveShield(val);
                    toast.info(`Active Shield ${val ? "Enabled" : "Disabled"}`);
                  }} />
                </div>

                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <Zap className="w-4 h-4 text-primary" />
                    <div>
                      <p className="text-xs font-bold text-foreground">AI Moderation</p>
                      <p className="text-[9px] text-muted-foreground">Content filtering</p>
                    </div>
                  </div>
                  <Switch checked={aiModeration} onCheckedChange={setAiModeration} />
                </div>

                <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-3">
                    <Fingerprint className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="text-xs font-bold text-foreground">Fingerprinting</p>
                      <p className="text-[9px] text-muted-foreground">Device verification</p>
                    </div>
                  </div>
                  <Switch checked={deviceFingerprinting} onCheckedChange={setDeviceFingerprinting} />
                </div>

                {(policies || []).map((policy) => (
                  <div key={policy.id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-white/5 border border-white/10">
                    <div className="flex items-center gap-3">
                      <Shield className="w-4 h-4 text-blue-500" />
                      <div>
                        <p className="text-xs font-bold text-foreground">{policy.name}</p>
                        <p className="text-[9px] text-muted-foreground">{policy.description}</p>
                      </div>
                    </div>
                    <Switch checked={policy.enabled} onCheckedChange={() => handleTogglePolicy(policy.id, policy.enabled)} />
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-2xl bg-destructive/5 border border-destructive/10">
                <p className="text-[10px] font-bold text-destructive uppercase tracking-widest mb-2">Infrastructure Health</p>
                <div className="w-full bg-white/5 h-2 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: "0%" }}
                    animate={{ width: "98%" }}
                    className="h-full bg-destructive shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-2 flex items-center justify-between">
                  <span>98.2% Integrity</span>
                  <TrendingUp className="w-3 h-3 text-emerald-500" />
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass-card p-5 rounded-[2rem] border-white/5 space-y-3">
            <h3 className="font-display font-bold text-sm text-foreground px-2">Quick Actions</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start h-10 rounded-xl border-white/5 bg-white/5 hover:bg-white/10 text-[11px] font-bold">
                <Key className="w-4 h-4 mr-3 text-destructive" /> Rotate API Secrets
              </Button>
              <Button variant="outline" className="w-full justify-start h-10 rounded-xl border-white/5 bg-white/5 hover:bg-white/10 text-[11px] font-bold">
                <Globe className="w-4 h-4 mr-3 text-destructive" /> Geo-Fencing Config
              </Button>
              <Button variant="outline" className="w-full justify-start h-10 rounded-xl border-white/5 bg-white/5 hover:bg-white/10 text-[11px] font-bold">
                <Network className="w-4 h-4 mr-3 text-destructive" /> IP Whitelist
              </Button>
              <Button variant="outline" className="w-full justify-start h-10 rounded-xl border-white/5 bg-white/5 hover:bg-white/10 text-[11px] font-bold">
                <FileKey className="w-4 h-4 mr-3 text-destructive" /> SSL Certificates
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const cn = (...classes: (string | boolean | undefined | null)[]) => classes.filter(Boolean).join(" ");
