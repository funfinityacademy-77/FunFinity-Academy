import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Globe, Clock, Languages, CheckCircle2, Save, AlertTriangle, Power, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMaintenance } from "@/hooks/use-maintenance";
import { useAnnouncements } from "@/hooks/use-announcements";

const languages = [
  { code: "en", label: "English", region: "United States", status: "Primary", progress: 100 },
  { code: "es", label: "Spanish", region: "Latin America", status: "Active", progress: 92 },
  { code: "fr", label: "French", region: "France", status: "Active", progress: 87 },
  { code: "ar", label: "Arabic", region: "Middle East", status: "Active", progress: 74 },
  { code: "zh", label: "Chinese", region: "Simplified", status: "Draft", progress: 45 },
  { code: "hi", label: "Hindi", region: "India", status: "Draft", progress: 32 },
];

const timezones = [
  "UTC-8 (Pacific)", "UTC-5 (Eastern)", "UTC+0 (GMT)", "UTC+1 (CET)", "UTC+5:30 (IST)", "UTC+8 (CST)", "UTC+9 (JST)",
];

const dateFormats = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"];

export default function AdminLocalization() {
  const [timezone, setTimezone] = useState("UTC+0 (GMT)");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");

  const { maintenance, enableMaintenance, disableMaintenance } = useMaintenance();
  const { addAnnouncement } = useAnnouncements();
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [mainTitle, setMainTitle] = useState("");
  const [mainReason, setMainReason] = useState("");
  const [mainStart, setMainStart] = useState("");
  const [mainEnd, setMainEnd] = useState("");
  const [mainNotes, setMainNotes] = useState("");

  const handleEnableMaintenance = () => {
    if (!mainTitle || !mainStart || !mainEnd) return;
    enableMaintenance({
      title: mainTitle,
      reason: mainReason,
      startTime: mainStart,
      endTime: mainEnd,
      notes: mainNotes,
    });
    
    addAnnouncement({
      title: mainTitle,
      body: `Reason: ${mainReason || "Scheduled Maintenance"}. System will be under maintenance. Duration: ${new Date(mainStart).toLocaleString()} to ${new Date(mainEnd).toLocaleString()}.`,
      target: "All",
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      urgent: true,
      author: "System Administrator",
    });
    
    setShowMaintenanceModal(false);
    setMainTitle("");
    setMainReason("");
    setMainStart("");
    setMainEnd("");
    setMainNotes("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold text-foreground">Localization & System</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage languages, timezones, and system state</p>
          </div>
          <Button variant="hero" size="default"><Save className="w-4 h-4 mr-2" /> Save Settings</Button>
        </div>

        {/* Languages */}
        <div className="platform-card p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Languages className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h2 className="font-display text-base font-semibold text-foreground">Languages</h2>
              <p className="text-xs text-muted-foreground">Manage available platform languages and translations</p>
            </div>
          </div>
          <div className="space-y-3">
            {languages.map((lang) => (
              <div key={lang.code} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/20 border border-border/20">
                <span className="text-lg font-bold w-8 text-center">{lang.code.toUpperCase().slice(0, 2)}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-foreground">{lang.label}</p>
                    <span className="text-[10px] text-muted-foreground">({lang.region})</span>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden max-w-48">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${lang.progress}%` }} />
                    </div>
                    <span className="text-[10px] text-muted-foreground">{lang.progress}% translated</span>
                  </div>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                  lang.status === "Primary" ? "bg-cyan/10 text-cyan border-cyan/20" :
                  lang.status === "Active" ? "bg-primary/10 text-primary border-primary/20" :
                  "bg-secondary text-muted-foreground border-border"
                }`}>{lang.status}</span>
              </div>
            ))}
          </div>
          <Button variant="outline" size="sm" className="mt-3">+ Add Language</Button>
        </div>

        {/* Timezone */}
        <div className="platform-card p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-accent/10 flex items-center justify-center">
              <Clock className="w-4 h-4 text-accent" />
            </div>
            <div>
              <h2 className="font-display text-base font-semibold text-foreground">Timezone & Date</h2>
              <p className="text-xs text-muted-foreground">Set default timezone and date format for the platform</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Default Timezone</label>
              <select value={timezone} onChange={e => setTimezone(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-secondary/50 border border-border/30 text-sm text-foreground outline-none focus:border-primary/50">
                {timezones.map(tz => <option key={tz} value={tz}>{tz}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-2">Date Format</label>
              <div className="flex gap-2">
                {dateFormats.map(fmt => (
                  <button key={fmt} onClick={() => setDateFormat(fmt)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${dateFormat === fmt ? "bg-primary/10 text-primary border-primary/30" : "border-border/30 text-muted-foreground hover:bg-secondary/50"}`}>
                    {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Maintenance Mode System */}
        <div className={`platform-card p-6 ${maintenance?.active ? "border-destructive/30 bg-destructive/5" : ""}`}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${maintenance?.active ? "bg-destructive/10" : "bg-orange-500/10"}`}>
                <AlertTriangle className={`w-4 h-4 ${maintenance?.active ? "text-destructive" : "text-orange-500"}`} />
              </div>
              <div>
                <h2 className="font-display text-base font-semibold text-foreground">Maintenance Mode</h2>
                <p className="text-xs text-muted-foreground">
                  {maintenance?.active ? "System is currently under maintenance" : "Lock down the platform for system updates"}
                </p>
              </div>
            </div>
            
            {maintenance?.active ? (
              <Button variant="destructive" onClick={disableMaintenance}>
                <Power className="w-4 h-4 mr-2" /> Disable Maintenance
              </Button>
            ) : (
              <Button variant="outline" className="text-orange-500 border-orange-500/20 hover:bg-orange-500/10" onClick={() => setShowMaintenanceModal(true)}>
                <AlertTriangle className="w-4 h-4 mr-2" /> Enable Maintenance Mode
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Maintenance Form Modal */}
      <AnimatePresence>
        {showMaintenanceModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.95, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 10 }}
              className="w-full max-w-lg platform-card overflow-hidden"
            >
              <div className="p-4 border-b border-border/30 flex items-center justify-between bg-secondary/30">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-500" />
                  <h3 className="font-display font-semibold text-foreground">Enable Maintenance Mode</h3>
                </div>
                <button onClick={() => setShowMaintenanceModal(false)} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Maintenance Title *</label>
                  <input value={mainTitle} onChange={e => setMainTitle(e.target.value)} type="text" placeholder="e.g. Scheduled Database Upgrade"
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/30 text-sm text-foreground outline-none focus:border-primary/50" />
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Purpose/Reason *</label>
                  <input value={mainReason} onChange={e => setMainReason(e.target.value)} type="text" placeholder="Why is the system going offline?"
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/30 text-sm text-foreground outline-none focus:border-primary/50" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Start Time *</label>
                    <input value={mainStart} onChange={e => setMainStart(e.target.value)} type="datetime-local"
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/30 text-sm text-foreground outline-none focus:border-primary/50" />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">End Time *</label>
                    <input value={mainEnd} onChange={e => setMainEnd(e.target.value)} type="datetime-local"
                      className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/30 text-sm text-foreground outline-none focus:border-primary/50" />
                  </div>
                </div>
                
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1">Optional Notes</label>
                  <textarea value={mainNotes} onChange={e => setMainNotes(e.target.value)} rows={2} placeholder="Internal notes for other admins..."
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/30 text-sm text-foreground outline-none focus:border-primary/50 resize-none" />
                </div>
                
                <div className="pt-2">
                  <p className="text-xs text-destructive mb-4">
                    <strong>Warning:</strong> Once active, ALL non-admin users will be immediately locked out of the platform until maintenance is disabled. An URGENT announcement will be automatically broadcasted.
                  </p>
                  
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => setShowMaintenanceModal(false)}>Cancel</Button>
                    <Button variant="destructive" className="flex-1" onClick={handleEnableMaintenance} disabled={!mainTitle || !mainStart || !mainEnd}>
                      Confirm & Enable
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
