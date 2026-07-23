import { useState } from "react";
import { motion } from "framer-motion";
import {
  User, Bell, Shield, Palette, Globe, Accessibility, Moon,
  Lock, Smartphone, Mail, ShieldAlert, Database, Server,
  Users, Key, Activity, Loader2, Globe2, AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast as sonnerToast } from "sonner";

const sections = [
  { id: "account", label: "Account", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy & Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "accessibility", label: "Accessibility", icon: Accessibility },
  { id: "system", label: "System Configuration", icon: Server },
  { id: "language", label: "Maintenance Mode", icon: Globe },
];

function Toggle({ enabled, onChange, label }: { enabled: boolean; onChange: () => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={onChange}
      className={cn("w-10 h-6 rounded-full transition-colors relative", enabled ? "bg-destructive" : "bg-secondary")}
    >
      <span className={cn("absolute w-4 h-4 rounded-full bg-primary-foreground top-1 transition-transform", enabled ? "left-5" : "left-1")} />
    </button>
  );
}

export default function AdminSettings() {
  const [activeSection, setActiveSection] = useState("account");
  const [darkMode, setDarkMode] = useState(false);
  const [highContrast, setHighContrast] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [keyboardNav, setKeyboardNav] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [apiRateLimit, setApiRateLimit] = useState(true);
  const [auditLogging, setAuditLogging] = useState(true);
  const [ipWhitelist, setIpWhitelist] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(true);

  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const qc = useQueryClient();

  const { data: profileData, isLoading: loadingProfile } = useQuery({
    queryKey: ["admin-settings-profile", user?.id],
    queryFn: async () => {
      const data = await apiClient.get<any | null>(`/api/users/${user!.id}/profile`);
      return data;
    },
    enabled: !!user,
  });

  const updateProfile = useMutation({
    mutationFn: async (updates: { display_name?: string; email?: string }) => {
      await apiClient.put(`/api/users/${user!.id}/profile`, updates);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-settings-profile"] });
      sonnerToast.success("Profile updated!");
    },
    onError: (e: any) => sonnerToast.error(e.message),
  });

  const [editName, setEditName] = useState("");

  const name = editName || profileData?.display_name || "";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="font-display text-2xl lg:text-3xl font-bold text-foreground">
          <span className="text-gradient-destructive">Admin Settings</span>
        </h1>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-6">
        <div className="space-y-1">
          {sections.map((s) => (
            <button
              key={s.id}
              onClick={() => setActiveSection(s.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all text-left",
                activeSection === s.id ? "glass-card text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <s.icon className="w-4 h-4" />
              {s.label}
            </button>
          ))}
        </div>

        <div className="lg:col-span-3">
          {activeSection === "account" && (
            <div className="platform-card p-6 space-y-6">
              <h2 className="font-display text-lg font-semibold text-foreground">Account Settings</h2>
              {loadingProfile ? (
                <div className="flex justify-center py-4"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editName || profileData?.display_name || ""}
                      onChange={(e) => setEditName(e.target.value)}
                      className="flex-1 w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/30 text-sm text-foreground outline-none focus:border-destructive transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground block mb-1">Email</label>
                    <input
                      type="text"
                      value={user?.email || ""}
                      disabled
                      className="flex-1 w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/30 text-sm text-muted-foreground outline-none"
                    />
                  </div>
                  <Button
                    variant="hero"
                    size="sm"
                    disabled={updateProfile.isPending}
                    onClick={() => updateProfile.mutate({ display_name: editName || profileData?.display_name })}
                  >
                    {updateProfile.isPending ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeSection === "notifications" && (
            <div className="platform-card p-6 space-y-4">
              <h2 className="font-display text-lg font-semibold text-foreground">Notification Preferences</h2>
              {[
                { label: "Email Notifications", desc: "Receive system alerts via email", enabled: emailNotifs, toggle: () => setEmailNotifs(!emailNotifs), icon: Mail },
                { label: "Push Notifications", desc: "Browser and mobile alerts", enabled: pushNotifs, toggle: () => setPushNotifs(!pushNotifs), icon: Smartphone },
                { label: "Security Alerts", desc: "Critical security notifications", enabled: true, toggle: () => {}, icon: ShieldAlert },
                { label: "System Health", desc: "Server and database status updates", enabled: true, toggle: () => {}, icon: Activity },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-border/20 last:border-0">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <Toggle enabled={item.enabled} onChange={item.toggle} label={item.label} />
                </div>
              ))}
            </div>
          )}

          {activeSection === "privacy" && (
            <div className="platform-card p-6 space-y-4">
              <h2 className="font-display text-lg font-semibold text-foreground">Privacy & Security</h2>
              <div className="flex items-center justify-between py-3 border-b border-border/20">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Two-Factor Authentication</p>
                    <p className="text-xs text-muted-foreground">Add an extra layer of security</p>
                  </div>
                </div>
                <Toggle enabled={twoFactor} onChange={() => setTwoFactor(!twoFactor)} label="Two-factor authentication" />
              </div>
              <div className="flex items-center justify-between py-3 border-b border-border/20">
                <div className="flex items-center gap-3">
                  <Key className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Session Timeout</p>
                    <p className="text-xs text-muted-foreground">Auto-logout after inactivity</p>
                  </div>
                </div>
                <Toggle enabled={sessionTimeout} onChange={() => setSessionTimeout(!sessionTimeout)} label="Session timeout" />
              </div>
              <Button variant="outline" size="sm"><Lock className="w-3 h-3 mr-1" /> Change Password</Button>
            </div>
          )}

          {activeSection === "appearance" && (
            <div className="platform-card p-6 space-y-4">
              <h2 className="font-display text-lg font-semibold text-foreground">Appearance</h2>
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <Moon className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium text-foreground">Dark Mode</p>
                    <p className="text-xs text-muted-foreground">Switch to dark theme</p>
                  </div>
                </div>
                <Toggle enabled={darkMode} onChange={() => setDarkMode(!darkMode)} label="Dark mode" />
              </div>
            </div>
          )}

          {activeSection === "accessibility" && (
            <div className="platform-card p-6 space-y-4">
              <h2 className="font-display text-lg font-semibold text-foreground">Accessibility</h2>
              {[
                { label: "High Contrast Mode", desc: "Increase contrast", enabled: highContrast, toggle: () => setHighContrast(!highContrast) },
                { label: "Reduced Motion", desc: "Minimize animations", enabled: reducedMotion, toggle: () => setReducedMotion(!reducedMotion) },
                { label: "Large Text", desc: "Increase font size", enabled: largeText, toggle: () => setLargeText(!largeText) },
                { label: "Keyboard Navigation", desc: "Full keyboard accessibility", enabled: keyboardNav, toggle: () => setKeyboardNav(!keyboardNav) },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-border/20 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                  <Toggle enabled={item.enabled} onChange={item.toggle} label={item.label} />
                </div>
              ))}
            </div>
          )}

          {activeSection === "system" && (
            <div className="platform-card p-6 space-y-4">
              <h2 className="font-display text-lg font-semibold text-foreground">System Configuration</h2>
              {[
                { label: "Maintenance Mode", desc: "Disable platform for maintenance", enabled: maintenanceMode, toggle: () => setMaintenanceMode(!maintenanceMode), icon: AlertTriangle },
                { label: "API Rate Limiting", desc: "Limit API requests per user", enabled: apiRateLimit, toggle: () => setApiRateLimit(!apiRateLimit), icon: Server },
                { label: "Audit Logging", desc: "Log all admin actions", enabled: auditLogging, toggle: () => setAuditLogging(!auditLogging), icon: Activity },
                { label: "IP Whitelist", desc: "Restrict access by IP address", enabled: ipWhitelist, toggle: () => setIpWhitelist(!ipWhitelist), icon: ShieldAlert },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between py-3 border-b border-border/20 last:border-0">
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                  </div>
                  <Toggle enabled={item.enabled} onChange={item.toggle} label={item.label} />
                </div>
              ))}
              <div className="pt-4 space-y-3">
                <Button variant="outline" size="sm" onClick={() => navigate("/admin/users")}>
                  <Users className="w-3 h-3 mr-1" /> Manage Users
                </Button>
                <Button variant="outline" size="sm" onClick={() => navigate("/admin/localization")}>
                  <Globe2 className="w-3 h-3 mr-1" /> Localization Settings
                </Button>
              </div>
            </div>
          )}

          {activeSection === "language" && (
            <div className="platform-card p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-border/20 pb-4">
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">🚧 Maintenance Mode System</h2>
                  <p className="text-xs text-muted-foreground mt-1">Restrict platform access for updates</p>
                </div>
                <Toggle enabled={maintenanceMode} onChange={() => setMaintenanceMode(!maintenanceMode)} label="Toggle Maintenance Mode" />
              </div>
              
              {maintenanceMode && (
                <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-4">
                  <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-xl mb-4">
                    <p className="text-sm font-medium text-destructive flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4" /> Warning: Activating this blocks all non-admin users.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground block mb-1">Title</label>
                      <input type="text" placeholder="e.g. Scheduled System Upgrade" className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/30 text-sm text-foreground outline-none" />
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground block mb-1">Reason</label>
                      <textarea placeholder="Reason for maintenance..." rows={3} className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/30 text-sm text-foreground outline-none resize-none"></textarea>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm text-muted-foreground block mb-1">Start Time</label>
                        <input type="datetime-local" className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/30 text-sm text-foreground outline-none" />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground block mb-1">End Time</label>
                        <input type="datetime-local" className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/30 text-sm text-foreground outline-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground block mb-1">Notes</label>
                      <input type="text" placeholder="Internal notes..." className="w-full px-3 py-2 rounded-lg bg-secondary/50 border border-border/30 text-sm text-foreground outline-none" />
                    </div>
                    <Button variant="hero" className="w-full mt-2">
                      Activate Maintenance & Create Announcement
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
