import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  User, Bell, Shield, Palette, Globe, Accessibility, Moon,
  Lock, Smartphone, Mail, Dna, RotateCcw, Award, BookOpen, Loader2, Settings2, Sparkles, Download, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useLearningDNA } from "@/hooks/use-learning-dna";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/use-auth";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api-client";
import { toast as sonnerToast } from "sonner";
import { BackupManager } from "@/components/BackupManager";
import { DataDeletionRequest } from "@/components/compliance/DataDeletionRequest";

const sections = [
  { id: "account", label: "Account", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "privacy", label: "Privacy & Security", icon: Shield },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "accessibility", label: "Accessibility", icon: Accessibility },
  { id: "learning-dna", label: "Learning DNA", icon: Dna },
  { id: "language", label: "Language & Region", icon: Globe },
  { id: "backup", label: "Backup & Restore", icon: Download },
];

function Toggle({ enabled, onChange, label }: { enabled: boolean; onChange: () => void; label: string }) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "w-12 h-7 rounded-full transition-all duration-500 relative shadow-inner overflow-hidden", 
        enabled ? "bg-primary" : "bg-white/10"
      )}
    >
      <div className={cn(
        "absolute inset-0 bg-gradient-to-r from-primary via-accent to-primary opacity-0 transition-opacity duration-500",
        enabled && "opacity-30"
      )} />
      <span className={cn(
        "absolute w-5 h-5 rounded-full bg-white top-1 transition-all duration-500 shadow-lg", 
        enabled ? "left-6 rotate-180" : "left-1"
      )} />
    </button>
  );
}

export default function Settings() {
  const [activeSection, setActiveSection] = useState("account");
  const { user } = useAuth();
  const { profile, saveProfile, saving } = useLearningDNA();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [showDataDeletion, setShowDataDeletion] = useState(false);

  const { data: profileData, isLoading: loadingProfile } = useQuery({
    queryKey: ["settings-profile", user?.id],
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
      qc.invalidateQueries({ queryKey: ["settings-profile"] });
      sonnerToast.success("Profile synchronized.");
    },
    onError: (e: Error) => sonnerToast.error(e.message),
  });

  const [editName, setEditName] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [liquidGlass, setLiquidGlass] = useState(true);
  const [language, setLanguage] = useState("en");
  const [timezone, setTimezone] = useState("utc");
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const handleToggleAchievementEmails = async () => {
    try {
      const newVal = !profile.achievement_emails;
      await saveProfile({ achievement_emails: newVal });
      sonnerToast.success(newVal ? "Achievement transmissions enabled" : "Achievement transmissions silenced");
    } catch (error) {
      sonnerToast.error("Failed to update notification preferences.");
    }
  };

  const handleToggleOnboarding = async () => {
    try {
      const newVal = !profile.show_onboarding;
      await saveProfile({ show_onboarding: newVal });
      sonnerToast.info(newVal ? "Platform walkthrough enabled" : "Platform walkthrough hidden");
    } catch (error) {
      sonnerToast.error("Failed to update onboarding settings.");
    }
  };

  const handleToggleAccessibility = async (key: "reduced_motion" | "high_contrast") => {
    try {
      const newVal = !profile[key];
      await saveProfile({ [key]: newVal });
      sonnerToast.success(`${key.replace('_', ' ')} updated`);
    } catch (error) {
      sonnerToast.error("Failed to update accessibility settings.");
    }
  };

  const handleToggleDarkMode = async () => {
    try {
      const newVal = !darkMode;
      setDarkMode(newVal);
      setHasUnsavedChanges(true);
      await apiClient.put(`/api/users/${user!.id}/profile`, { dark_mode: newVal });
      sonnerToast.success(newVal ? "Dark mode enabled" : "Dark mode disabled");
      setHasUnsavedChanges(false);
    } catch (error) {
      sonnerToast.error("Failed to update appearance settings.");
    }
  };

  const handleToggleLiquidGlass = async () => {
    try {
      const newVal = !liquidGlass;
      setLiquidGlass(newVal);
      setHasUnsavedChanges(true);
      await apiClient.put(`/api/users/${user!.id}/profile`, { liquid_glass: newVal });
      sonnerToast.success(newVal ? "Liquid Glass effects enabled" : "Liquid Glass effects disabled");
      setHasUnsavedChanges(false);
    } catch (error) {
      sonnerToast.error("Failed to update appearance settings.");
    }
  };

  const handleSaveLanguageSettings = async () => {
    try {
      await apiClient.put(`/api/users/${user!.id}/profile`, { language, timezone });
      sonnerToast.success("Localization settings synchronized.");
      setHasUnsavedChanges(false);
    } catch (error) {
      sonnerToast.error("Failed to update localization settings.");
    }
  };

  const handleLanguageChange = (value: string) => {
    setLanguage(value);
    setHasUnsavedChanges(true);
  };

  const handleTimezoneChange = (value: string) => {
    setTimezone(value);
    setHasUnsavedChanges(true);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-12">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
            <Settings2 className="w-5 h-5 text-primary" />
          </div>
          <h1 className="font-display text-3xl font-bold text-foreground tracking-tight">
            <span className="text-gradient-brand">Settings</span>
          </h1>
        </div>
        <p className="text-muted-foreground ml-1">Personalize your high-fidelity learning interface.</p>
      </motion.div>

      <div className="grid lg:grid-cols-4 gap-8">
        <div className="space-y-2">
          <div className="glass-card p-2 rounded-[2rem] border-white/5 space-y-1">
            {sections.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-[11px] font-bold uppercase tracking-widest transition-all duration-300 text-left relative group",
                  activeSection === s.id 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20 scale-[1.02] z-10" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                )}
              >
                <s.icon className={cn("w-4 h-4", activeSection === s.id ? "text-primary-foreground" : "text-primary/60")} />
                {s.label}
                {activeSection === s.id && (
                  <motion.div 
                    layoutId="active-settings-tab"
                    className="absolute inset-0 bg-primary rounded-2xl -z-10"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="lg:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {activeSection === "account" && (
                <div className="glass-card p-8 rounded-[2.5rem] border-white/10 space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                    <User className="w-24 h-24 text-primary" />
                  </div>
                  <h2 className="font-display text-2xl font-bold text-foreground">Identity Core</h2>
                  {loadingProfile ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-primary/50" /></div>
                  ) : (
                    <div className="space-y-6 max-w-lg">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 ml-1">Display Designation</label>
                        <Input
                          type="text"
                          value={editName || profileData?.display_name || ""}
                          onChange={(e) => setEditName(e.target.value)}
                          className="h-12 rounded-xl glass-card border-white/10 text-sm font-medium focus:border-primary/40"
                        />
                      </div>
                      <div className="space-y-2 opacity-60">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 ml-1">Communication Channel</label>
                        <Input
                          type="text"
                          value={user?.email || ""}
                          disabled
                          className="h-12 rounded-xl glass-card border-white/5 bg-white/5 text-sm font-medium"
                        />
                      </div>
                      <Button
                        variant="hero"
                        className="h-12 px-10 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20"
                        disabled={updateProfile.isPending}
                        onClick={() => updateProfile.mutate({ display_name: editName || profileData?.display_name })}
                      >
                        {updateProfile.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Sync Changes"}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {activeSection === "notifications" && (
                <div className="glass-card p-8 rounded-[2.5rem] border-white/10 space-y-8">
                  <h2 className="font-display text-2xl font-bold text-foreground">Transmission Alerts</h2>
                  <div className="grid gap-4">
                    {[
                      { label: "Neural Updates", desc: "Critical platform intelligence and core updates", enabled: true, toggle: () => sonnerToast.info("System forced neural updates active"), icon: Mail },
                      { label: "Direct Sync", desc: "Real-time browser and mobile notifications", enabled: true, toggle: () => sonnerToast.info("Nexus Direct Sync established"), icon: Smartphone },
                      { label: "Achievement Relays", desc: "Notifications for earned honors and badges", enabled: profile.achievement_emails, toggle: handleToggleAchievementEmails, icon: Award },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/5 items-center justify-center group-hover:bg-primary/10 transition-colors flex">
                            <item.icon className="w-5 h-5 text-primary/70" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{item.label}</p>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                        <Toggle enabled={item.enabled} onChange={item.toggle} label={item.label} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === "accessibility" && (
                <div className="glass-card p-8 rounded-[2.5rem] border-white/10 space-y-8">
                  <h2 className="font-display text-2xl font-bold text-foreground">Neuro-Diversity Access</h2>
                  <div className="grid gap-4">
                    {[
                      { label: "Reduced Motion", desc: "Minimize interface transitions and organic movements", enabled: profile.reduced_motion, toggle: () => handleToggleAccessibility("reduced_motion"), icon: Smartphone },
                      { label: "High Contrast", desc: "Enhanced clarity for visual synthesis", enabled: profile.high_contrast, toggle: () => handleToggleAccessibility("high_contrast"), icon: Palette },
                    ].map((item) => (
                      <div key={item.label} className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-primary/5 items-center justify-center group-hover:bg-primary/10 transition-colors flex">
                            <item.icon className="w-5 h-5 text-primary/70" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-foreground">{item.label}</p>
                            <p className="text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                        </div>
                        <Toggle enabled={item.enabled} onChange={item.toggle} label={item.label} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeSection === "learning-dna" && (
                <div className="space-y-6">
                  <div className="glass-card p-8 rounded-[2.5rem] border-primary/20 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50" />
                    <div className="relative z-10 space-y-6">
                      <div className="flex items-center justify-between">
                        <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
                          <Dna className="w-6 h-6 text-primary" /> Learning DNA Core
                        </h2>
                        {profile.completed && (
                          <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px] uppercase font-bold tracking-widest px-3 py-1">Synthesized</Badge>
                        )}
                      </div>
                      
                      {profile.completed ? (
                        <div className="space-y-6">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2 shadow-inner hover:border-primary/20 transition-all">
                              <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Cognitive Focus</p>
                              <p className="text-lg font-bold text-foreground capitalize">{profile.focus_mode}</p>
                            </div>
                            <div className="p-5 rounded-2xl bg-white/5 border border-white/5 space-y-2 shadow-inner hover:border-primary/20 transition-all">
                              <p className="text-[10px] font-bold text-primary/60 uppercase tracking-widest">Temporal Rhythm</p>
                              <p className="text-lg font-bold text-foreground capitalize">{profile.session_length}</p>
                            </div>
                          </div>
                          <Button 
                            variant="hero" 
                            className="h-12 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20" 
                            onClick={() => navigate("/app/learning-dna")}
                          >
                            <RotateCcw className="w-4 h-4 mr-2" /> Re-Initialize DNA Synthesis
                          </Button>
                        </div>
                      ) : (
                        <div className="p-8 rounded-3xl bg-primary/5 border border-primary/20 border-dashed text-center space-y-4">
                          <p className="text-sm font-bold text-foreground">DNA Signature Not Found</p>
                          <p className="text-xs text-muted-foreground max-w-xs mx-auto">Initialize your learning profile to optimize platform intelligence for your cognitive style.</p>
                          <Button 
                            variant="hero" 
                            className="h-12 px-8 rounded-xl text-xs font-bold uppercase tracking-widest"
                            onClick={() => navigate("/app/learning-dna")}
                          >
                            Begin Synthesis
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="glass-card p-8 rounded-[2.5rem] border-white/10 space-y-6">
                    <h2 className="font-display text-xl font-bold text-foreground flex items-center gap-3">
                      <BookOpen className="w-5 h-5 text-primary/70" /> User Onboarding
                    </h2>
                    <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5">
                      <div className="space-y-1">
                        <p className="text-sm font-bold text-foreground">Interactive Nexus Walkthrough</p>
                        <p className="text-xs text-muted-foreground">Replay core platform instructions</p>
                      </div>
                      <Toggle enabled={profile.show_onboarding} onChange={handleToggleOnboarding} label="Show onboarding" />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "privacy" && (
                <div className="glass-card p-8 rounded-[2.5rem] border-white/10 space-y-8">
                  <h2 className="font-display text-2xl font-bold text-foreground">Security Core</h2>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/5 items-center justify-center group-hover:bg-primary/10 transition-colors flex">
                          <Shield className="w-5 h-5 text-primary/70" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">Two-Factor Authentication</p>
                          <p className="text-xs text-muted-foreground">Add an extra layer of biometric or token security</p>
                        </div>
                      </div>
                      <Toggle enabled={false} onChange={() => sonnerToast.info("2FA configuration initiated")} label="Two-factor authentication" />
                    </div>
                    <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/5 items-center justify-center group-hover:bg-primary/10 transition-colors flex">
                          <Lock className="w-5 h-5 text-primary/70" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">Password Management</p>
                          <p className="text-xs text-muted-foreground">Update your cryptographic access key</p>
                        </div>
                      </div>
                      <Button variant="outline" className="h-9 px-4 rounded-xl text-xs font-bold bg-white/5 border-white/10 hover:bg-white/10" onClick={() => sonnerToast.info("Password reset link sent")}>
                        Modify Key
                      </Button>
                    </div>
                    <div className="flex items-center justify-between p-6 rounded-2xl bg-red-500/5 border border-red-500/20 hover:border-red-500/40 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-500/10 items-center justify-center group-hover:bg-red-500/20 transition-colors flex">
                          <Trash2 className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">Data Deletion Request</p>
                          <p className="text-xs text-muted-foreground">Exercise your GDPR right to be forgotten</p>
                        </div>
                      </div>
                      <Button variant="destructive" className="h-9 px-4 rounded-xl text-xs font-bold" onClick={() => setShowDataDeletion(true)}>
                        Delete Data
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "appearance" && (
                <div className="glass-card p-8 rounded-[2.5rem] border-white/10 space-y-8">
                  <h2 className="font-display text-2xl font-bold text-foreground">Visual Interface</h2>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/5 items-center justify-center group-hover:bg-primary/10 transition-colors flex">
                          <Moon className="w-5 h-5 text-primary/70" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">Dark Mode</p>
                          <p className="text-xs text-muted-foreground">Toggle reduced-luminosity visual environment</p>
                        </div>
                      </div>
                      <Toggle enabled={darkMode} onChange={handleToggleDarkMode} label="Dark mode" />
                    </div>
                    <div className="flex items-center justify-between p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-primary/20 transition-all group">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-primary/5 items-center justify-center group-hover:bg-primary/10 transition-colors flex">
                          <Palette className="w-5 h-5 text-primary/70" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">Liquid Glass FX</p>
                          <p className="text-xs text-muted-foreground">Enable high-fidelity transparency and blurs</p>
                        </div>
                      </div>
                      <Toggle enabled={liquidGlass} onChange={handleToggleLiquidGlass} label="Liquid Glass" />
                    </div>
                  </div>
                </div>
              )}

              {activeSection === "language" && (
                <div className="glass-card p-8 rounded-[2.5rem] border-white/10 space-y-8">
                  <h2 className="font-display text-2xl font-bold text-foreground">Localization Protocol</h2>
                  <div className="space-y-6 max-w-lg">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 ml-1">Interface Language</label>
                      <select 
                        value={language}
                        onChange={(e) => handleLanguageChange(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl glass-card border-white/10 text-sm font-medium focus:border-primary/40 bg-background/50 outline-none appearance-none cursor-pointer"
                      >
                        <option value="en">English (US)</option>
                        <option value="es">Español</option>
                        <option value="fr">Français</option>
                        <option value="de">Deutsch</option>
                        <option value="ja">日本語</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-primary/70 ml-1">Temporal Zone</label>
                      <select 
                        value={timezone}
                        onChange={(e) => handleTimezoneChange(e.target.value)}
                        className="w-full h-12 px-4 rounded-xl glass-card border-white/10 text-sm font-medium focus:border-primary/40 bg-background/50 outline-none appearance-none cursor-pointer"
                      >
                        <option value="utc">UTC (Coordinated Universal Time)</option>
                        <option value="est">EST (Eastern Standard Time)</option>
                        <option value="pst">PST (Pacific Standard Time)</option>
                        <option value="gmt">GMT (Greenwich Mean Time)</option>
                      </select>
                    </div>
                    {hasUnsavedChanges && (
                      <div className="flex items-center gap-2 p-3 rounded-xl bg-primary/10 border border-primary/20">
                        <Sparkles className="w-4 h-4 text-primary" />
                        <p className="text-xs text-primary font-medium">Unsaved changes detected</p>
                      </div>
                    )}
                    <Button
                      variant="hero"
                      className="h-12 px-10 rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg shadow-primary/20"
                      onClick={handleSaveLanguageSettings}
                      disabled={!hasUnsavedChanges}
                    >
                      Apply Settings
                    </Button>
                  </div>
                </div>
              )}

              {activeSection === "backup" && (
                <div className="glass-card p-8 rounded-[2.5rem] border-white/10 space-y-8">
                  <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-3">
                    <Download className="w-6 h-6 text-primary" /> Backup & Restore
                  </h2>
                  <BackupManager />
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <DataDeletionRequest
        isOpen={showDataDeletion}
        onClose={() => setShowDataDeletion(false)}
        userId={user?.id}
      />
    </div>
  );
}
