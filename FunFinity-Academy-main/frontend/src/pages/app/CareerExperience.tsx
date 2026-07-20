import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Plus, Calendar as CalIcon, Mail, FileText, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCareer } from "@/hooks/use-career";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export default function CareerExperience() {
  const { profile, addExperienceLog } = useCareer();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", type: "Work-Based Learning" as any, date: "", hours: "", supervisorEmail: "", reflection: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date || !form.hours || !form.supervisorEmail) {
      toast({ title: "Missing fields", description: "Please fill in all required fields.", variant: "destructive" });
      return;
    }
    addExperienceLog({ title: form.title, type: form.type, date: form.date, hours: Number(form.hours), supervisorEmail: form.supervisorEmail, reflection: form.reflection });
    toast({ title: "Experience logged!", description: `${form.hours} hours added successfully.` });
    setForm({ title: "", type: "Work-Based Learning", date: "", hours: "", supervisorEmail: "", reflection: "" });
    setOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">Experience Log</h1>
          <p className="text-sm text-muted-foreground mt-1">Track your work-based learning and volunteer hours</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="hero" size="sm"><Plus className="w-4 h-4 mr-1" /> Log Hours</Button>
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
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                <Button type="submit" variant="hero">Save Experience</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="glass-card border-border/30">
          <CardContent className="p-5 text-center">
            <p className="text-3xl font-bold text-foreground">{profile.totalLoggedHours}</p>
            <p className="text-xs text-muted-foreground mt-1">Total Hours Logged</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/30">
          <CardContent className="p-5 text-center">
            <p className="text-3xl font-bold text-foreground">{profile.experienceLogs.length}</p>
            <p className="text-xs text-muted-foreground mt-1">Experiences</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/30">
          <CardContent className="p-5 text-center">
            <p className="text-3xl font-bold text-foreground">{[...new Set(profile.experienceLogs.map(l => l.type))].length}</p>
            <p className="text-xs text-muted-foreground mt-1">Categories</p>
          </CardContent>
        </Card>
      </div>

      {profile.experienceLogs.length === 0 ? (
        <Card className="glass-card border-border/30">
          <CardContent className="p-12 text-center">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No experiences logged yet</h3>
            <p className="text-sm text-muted-foreground mb-4">Start tracking your work-based learning and volunteer hours.</p>
            <Button variant="hero" onClick={() => setOpen(true)}><Plus className="w-4 h-4 mr-1" /> Log Your First Experience</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {profile.experienceLogs.slice().reverse().map((log, i) => (
            <motion.div key={log.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="glass-card border-border/30">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-foreground text-sm">{log.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><CalIcon className="w-3 h-3" />{new Date(log.date).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{log.hours} hrs</span>
                        <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{log.supervisor_email}</span>
                      </div>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground shrink-0">{log.type}</span>
                  </div>
                  {log.reflection && (
                    <div className="mt-3 p-3 rounded-lg bg-secondary/50 border border-border/30">
                      <p className="text-xs text-muted-foreground italic">"{log.reflection}"</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
