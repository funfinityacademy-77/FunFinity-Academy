import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Plus, Calendar as CalIcon, Mail, FileText, ChevronDown, ChevronUp, TrendingUp, Award, Target, Briefcase, Heart, Zap, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useCareer } from "@/hooks/use-career";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";

export default function CareerExperience() {
  const { profile, addExperienceLog } = useCareer();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: "", type: "Work-Based Learning" as any, date: "", hours: "", supervisorEmail: "", reflection: "", skills: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.hours || !form.supervisorEmail) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    addExperienceLog({ 
      title: form.title, 
      type: form.type, 
      date: form.date, 
      hours: Number(form.hours), 
      supervisorEmail: form.supervisorEmail, 
      reflection: form.reflection,
      skills: form.skills ? form.skills.split(',').map(s => s.trim()) : []
    });
    toast({ title: "Experience logged!", description: `${form.hours} hours added successfully.` });
    setForm({ title: "", type: "Work-Based Learning", date: "", hours: "", supervisorEmail: "", reflection: "", skills: "" });
    setOpen(false);
  };

  const filteredLogs = filterType === "all" 
    ? profile.experienceLogs 
    : profile.experienceLogs.filter(log => log.type === filterType);

  const typeColors: Record<string, string> = {
    "Work-Based Learning": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "Volunteer Hours": "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    "Job Shadow": "bg-purple-500/10 text-purple-500 border-purple-500/20",
    "Community Service": "bg-orange-500/10 text-orange-500 border-orange-500/20",
  };

  const typeIcons: Record<string, any> = {
    "Work-Based Learning": Briefcase,
    "Volunteer Hours": Heart,
    "Job Shadow": Target,
    "Community Service": Zap,
  };

  const totalHoursByType = profile.experienceLogs.reduce((acc, log) => {
    acc[log.type] = (acc[log.type] || 0) + log.hours;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-display font-bold text-foreground">Experience Timeline</h1>
            <p className="text-sm text-muted-foreground mt-1">Track your work-based learning and career journey</p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="hero" size="sm"><Plus className="w-4 h-4 mr-1" /> Log Experience</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg">
              <DialogHeader><DialogTitle>Log New Experience</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input id="title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g., Summer Internship at Lab" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Type *</Label>
                    <Select value={form.type} onValueChange={v => setForm(f => ({ ...f, type: v }))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Work-Based Learning", "Volunteer Hours", "Job Shadow", "Community Service"].map(t => (
                          <SelectItem key={t} value={t}>{t}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hours">Hours *</Label>
                    <Input id="hours" type="number" min="0.5" step="0.5" value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} placeholder="0" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="date">Date *</Label>
                    <Input id="date" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Supervisor Email *</Label>
                    <Input id="email" type="email" value={form.supervisorEmail} onChange={e => setForm(f => ({ ...f, supervisorEmail: e.target.value }))} placeholder="supervisor@org.com" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reflection">Reflection</Label>
                  <Textarea id="reflection" value={form.reflection} onChange={e => setForm(f => ({ ...f, reflection: e.target.value }))} placeholder="What did you learn? How did this experience shape your career goals?" rows={4} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="skills">Skills Gained (comma-separated)</Label>
                  <Input 
                    id="skills" 
                    value={form.skills} 
                    onChange={e => setForm(f => ({ ...f, skills: e.target.value }))} 
                    placeholder="e.g., Leadership, Communication, Problem Solving" 
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                  <Button type="submit" variant="hero">Save Experience</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>

      {/* Stats Overview */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.1 }}
        className="grid gap-4 sm:grid-cols-4"
      >
        <Card className="glass-card border-border/30">
          <CardContent className="p-5 text-center">
            <Clock className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-3xl font-bold text-foreground">{profile.totalLoggedHours}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Hours</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/30">
          <CardContent className="p-5 text-center">
            <Award className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-3xl font-bold text-foreground">{profile.experienceLogs.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Experiences</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/30">
          <CardContent className="p-5 text-center">
            <TrendingUp className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-3xl font-bold text-foreground">{Object.keys(totalHoursByType).length}</p>
            <p className="text-xs text-muted-foreground mt-1">Categories</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/30">
          <CardContent className="p-5 text-center">
            <Zap className="w-8 h-8 mx-auto text-primary mb-2" />
            <p className="text-3xl font-bold text-foreground">{Math.round(profile.totalLoggedHours / (profile.experienceLogs.length || 1))}</p>
            <p className="text-xs text-muted-foreground mt-1">Avg Hours/Exp</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filter Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ delay: 0.15 }}
        className="flex items-center gap-3"
      >
        <Filter className="w-4 h-4 text-muted-foreground" />
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {["Work-Based Learning", "Volunteer Hours", "Job Shadow", "Community Service"].map(type => (
              <SelectItem key={type} value={type}>{type}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </motion.div>

      {/* Timeline */}
      {filteredLogs.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.2 }}
          className="glass-card border-border/30"
        >
          <CardContent className="p-12 text-center">
            <Clock className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No experiences logged yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Start tracking your work-based learning and volunteer hours.</p>
            <Button variant="hero" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-1" /> Log Your First Experience</Button>
          </CardContent>
        </motion.div>
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border/30" />
          
          <div className="space-y-6">
            {filteredLogs.slice().reverse().map((log, i) => {
              const TypeIcon = typeIcons[log.type] || Briefcase;
              const isExpanded = expandedId === log.id;
              
              return (
                <motion.div 
                  key={log.id} 
                  initial={{ opacity: 0, x: -20 }} 
                  animate={{ opacity: 1, x: 0 }} 
                  transition={{ delay: i * 0.1 }}
                  className="relative pl-20"
                >
                  {/* Timeline Node */}
                  <div className="absolute left-6 top-6 w-5 h-5 rounded-full bg-primary border-4 border-background shadow-lg shadow-primary/30" />
                  
                  <Card className={cn("glass-card border-border/30 transition-all hover:shadow-medium", isExpanded && "ring-2 ring-primary/20")}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center", typeColors[log.type])}>
                            <TypeIcon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground text-base">{log.title}</h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                              <span className="flex items-center gap-1"><CalIcon className="w-3 h-3" />{new Date(log.date).toLocaleDateString()}</span>
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{log.hours} hrs</span>
                            </div>
                          </div>
                        </div>
                        <Badge className={cn("text-xs", typeColors[log.type])}>{log.type}</Badge>
                      </div>
                      
                      {/* Expandable Details */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }} 
                            animate={{ height: "auto", opacity: 1 }} 
                            exit={{ height: 0, opacity: 0 }}
                            className="pt-4 border-t border-border/20 space-y-3"
                          >
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Mail className="w-3 h-3" />
                              <span>Supervisor: {log.supervisor_email}</span>
                            </div>
                            {log.reflection && (
                              <div className="p-3 rounded-lg bg-secondary/50 border border-border/30">
                                <p className="text-xs text-muted-foreground italic">"{log.reflection}"</p>
                              </div>
                            )}
                            {log.skills && log.skills.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-foreground mb-2">Skills Gained</p>
                                <div className="flex flex-wrap gap-2">
                                  {log.skills.map((skill, idx) => <Badge key={idx} variant="outline" className="text-xs">{skill}</Badge>)}
                                </div>
                              </div>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                      
                      {/* Expand Button */}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setExpandedId(isExpanded ? null : log.id)}
                        className="w-full mt-3"
                      >
                        {isExpanded ? (
                          <><ChevronUp className="w-4 h-4 mr-2" /> Show Less</>
                        ) : (
                          <><ChevronDown className="w-4 h-4 mr-2" /> Show Details</>
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
