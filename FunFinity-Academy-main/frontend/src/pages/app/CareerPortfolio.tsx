import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Award, Compass, Heart, Clock, Printer, Sparkles, FileText, Download, Plus, X, User, Mail, Phone, MapPin, Briefcase, Microscope, Palette, BarChart3, HeartPulse, Hammer, Building2 } from "lucide-react";
import { FunfinityIcon } from "@/components/brand/FunfinityLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCareer, allOpportunities, CareerCluster } from "@/hooks/use-career";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { apiClient } from "@/lib/api-client";

const clusterIcons: Record<CareerCluster, typeof Microscope> = {
  STEM: Microscope, Arts: Palette, Business: BarChart3, Healthcare: HeartPulse, Trades: Hammer, "Public Service": Building2,
};

interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  objective: string;
  education: { school: string; degree: string; year: string; gpa: string }[];
  skills: string[];
  activities: { title: string; role: string; dates: string; description: string }[];
  awards: { title: string; date: string }[];
}

const defaultResume: ResumeData = {
  fullName: "", email: "", phone: "", location: "", objective: "",
  education: [{ school: "", degree: "", year: "", gpa: "" }],
  skills: [],
  activities: [],
  awards: [],
};

const resumeTemplates = [
  { id: "classic", name: "Classic", desc: "Traditional layout for formal applications" },
  { id: "modern", name: "Modern", desc: "Clean and contemporary design" },
  { id: "creative", name: "Creative", desc: "Bold layout for creative industries" },
];

export default function CareerPortfolio() {
  const { profile, getCompletionPercentage } = useCareer();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const completion = getCompletionPercentage();
  const savedOpps = allOpportunities.filter(o => profile.savedOpportunities.includes(o.id));
  const hasContent = profile.quizCompleted || savedOpps.length > 0 || profile.experienceLogs.length > 0;

  const [resume, setResume] = useState<ResumeData>(defaultResume);
  const [selectedTemplate, setSelectedTemplate] = useState("modern");
  const [skillInput, setSkillInput] = useState("");
  const [resumeBuilderOpen, setResumeBuilderOpen] = useState(false);

  // Load resume from API
  useEffect(() => {
    if (!user) return;
    apiClient.get<any | null>(`/api/users/${user.id}/resume`).then((data) => {
      if (data) {
        setResume({
          fullName: data.full_name || "",
          email: data.email || "",
          phone: data.phone || "",
          location: "",
          objective: data.summary || "",
          education: (data.education as any[]) || [{ school: "", degree: "", year: "", gpa: "" }],
          skills: (data.skills as string[]) || [],
          activities: [],
          awards: [],
        });
        setSelectedTemplate(data.template || "modern");
      }
    });
  }, [user]);

  const saveResume = useCallback((data: ResumeData) => {
    setResume(data);
    if (!user) return;
    apiClient.put(`/api/users/${user.id}/resume`, {
      full_name: data.fullName,
      email: data.email,
      phone: data.phone,
      summary: data.objective,
      education: data.education as any,
      skills: data.skills,
      template: selectedTemplate,
    });
  }, [user, selectedTemplate]);

  const addSkill = () => {
    if (skillInput.trim() && !resume.skills.includes(skillInput.trim())) {
      saveResume({ ...resume, skills: [...resume.skills, skillInput.trim()] });
      setSkillInput("");
    }
  };

  const addActivity = () => {
    saveResume({ ...resume, activities: [...resume.activities, { title: "", role: "", dates: "", description: "" }] });
  };

  const addAward = () => {
    saveResume({ ...resume, awards: [...resume.awards, { title: "", date: "" }] });
  };

  const exportPDF = () => {
    // Build a styled HTML document for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const isCreative = selectedTemplate === "creative";
    const isClassic = selectedTemplate === "classic";
    const accentColor = isCreative ? "#d946ef" : isClassic ? "#1e293b" : "#6366f1";

    const html = `<!DOCTYPE html><html><head><title>${resume.fullName || "Resume"}</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: ${isClassic ? "'Times New Roman', serif" : "'Segoe UI', system-ui, sans-serif"}; color: #1e293b; max-width: 800px; margin: 0 auto; padding: 40px; }
      .header { ${isCreative ? `background: linear-gradient(135deg, ${accentColor}, #6366f1); color: white; padding: 32px; border-radius: 12px; margin-bottom: 24px;` : `border-bottom: 3px solid ${accentColor}; padding-bottom: 16px; margin-bottom: 24px;`} }
      .header h1 { font-size: 28px; margin-bottom: 8px; }
      .header .contact { font-size: 13px; ${isCreative ? "opacity: 0.9;" : "color: #64748b;"} }
      .section { margin-bottom: 20px; }
      .section-title { font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: ${accentColor}; border-bottom: 1.5px solid ${accentColor}33; padding-bottom: 6px; margin-bottom: 12px; }
      .item { margin-bottom: 12px; }
      .item-title { font-weight: 600; font-size: 14px; }
      .item-sub { font-size: 12px; color: #64748b; }
      .item-desc { font-size: 13px; margin-top: 4px; line-height: 1.5; }
      .skills { display: flex; flex-wrap: wrap; gap: 6px; }
      .skill { background: ${accentColor}15; color: ${accentColor}; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
      .career-section { background: #f8fafc; padding: 16px; border-radius: 8px; margin-top: 8px; }
      .career-badge { display: inline-block; background: ${accentColor}15; color: ${accentColor}; padding: 3px 10px; border-radius: 12px; font-size: 11px; margin: 2px; }
      @media print { body { padding: 20px; } }
    </style></head><body>
      <div class="header">
        <h1>${resume.fullName || "Your Name"}</h1>
        <div class="contact">${[resume.email, resume.phone, resume.location].filter(Boolean).join(" • ")}</div>
      </div>
      ${resume.objective ? `<div class="section"><div class="section-title">Objective</div><p style="font-size:13px;line-height:1.6">${resume.objective}</p></div>` : ""}
      ${resume.education.some(e => e.school) ? `<div class="section"><div class="section-title">Education</div>${resume.education.filter(e => e.school).map(e => `<div class="item"><div class="item-title">${e.school}</div><div class="item-sub">${e.degree}${e.year ? ` • ${e.year}` : ""}${e.gpa ? ` • GPA: ${e.gpa}` : ""}</div></div>`).join("")}</div>` : ""}
      ${resume.skills.length > 0 ? `<div class="section"><div class="section-title">Skills</div><div class="skills">${resume.skills.map(s => `<span class="skill">${s}</span>`).join("")}</div></div>` : ""}
      ${resume.activities.length > 0 ? `<div class="section"><div class="section-title">Activities & Experience</div>${resume.activities.filter(a => a.title).map(a => `<div class="item"><div class="item-title">${a.title}${a.role ? ` — ${a.role}` : ""}</div><div class="item-sub">${a.dates}</div>${a.description ? `<div class="item-desc">${a.description}</div>` : ""}</div>`).join("")}</div>` : ""}
      ${resume.awards.length > 0 ? `<div class="section"><div class="section-title">Awards & Honors</div>${resume.awards.filter(a => a.title).map(a => `<div class="item"><div class="item-title">${a.title}</div><div class="item-sub">${a.date}</div></div>`).join("")}</div>` : ""}
      ${profile.quizCompleted ? `<div class="section"><div class="section-title">Career Readiness</div><div class="career-section"><div class="item-title">Personality Type: ${profile.personalityType}</div><div style="margin-top:8px">${profile.careerInterests.map(c => `<span class="career-badge">${c}</span>`).join("")}</div>${profile.totalLoggedHours > 0 ? `<div class="item-sub" style="margin-top:8px">${profile.totalLoggedHours} hours of work-based learning logged</div>` : ""}</div></div>` : ""}
    </body></html>`;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.onload = () => { printWindow.print(); };
    toast({ title: "PDF Export", description: "Your resume is ready to print/save as PDF." });
  };

  if (!hasContent) {
    return (
      <div className="max-w-lg mx-auto text-center py-16 space-y-4">
        <Award className="w-16 h-16 mx-auto text-muted-foreground/40" />
        <h1 className="text-2xl font-display font-bold text-foreground">My Portfolio</h1>
        <p className="text-muted-foreground">You haven't started your career journey yet! Take the Pathfinder Quiz, explore opportunities, and log experiences to build your portfolio.</p>
        <Button variant="hero" onClick={() => navigate("/app/career/pathfinder")}>
          <Sparkles className="w-4 h-4 mr-1" /> Start with the Quiz
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground">My Portfolio</h1>
          <p className="text-sm text-muted-foreground mt-1">Your career readiness summary & resume</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="w-4 h-4 mr-1" /> Print</Button>
        </div>
      </div>

      <Tabs defaultValue="portfolio" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="portfolio">Portfolio Summary</TabsTrigger>
          <TabsTrigger value="resume">Resume Builder</TabsTrigger>
        </TabsList>

        {/* === PORTFOLIO TAB === */}
        <TabsContent value="portfolio" className="space-y-6 mt-6">
          {/* Overview Cards */}
          <div className="grid gap-4 sm:grid-cols-4">
            {[
              { label: "Roadmap Complete", value: `${completion}%`, showProgress: true },
              { label: "Hours Logged", value: `${profile.totalLoggedHours}` },
              { label: "Saved Opportunities", value: `${savedOpps.length}` },
              { label: "Experiences", value: `${profile.experienceLogs.length}` },
            ].map((stat, i) => (
              <motion.div key={stat.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
                <Card className="glass-card border-border/30">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                    <p className="text-[10px] text-muted-foreground mt-1">{stat.label}</p>
                    {stat.showProgress && <Progress value={completion} className="h-1.5 mt-2" />}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {profile.quizCompleted && (
            <Card className="glass-card border-border/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Compass className="w-4 h-4 text-primary" /> Pathfinder Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Personality Type: <span className="font-semibold text-foreground">{profile.personalityType}</span></p>
                <div className="flex flex-wrap gap-2">
                  {profile.careerInterests.map(c => {
                    const ClusterIcon = clusterIcons[c];
                    return (
                      <Badge key={c} variant="outline" className="flex items-center gap-1.5 text-xs py-1 px-3">
                        <ClusterIcon className="w-3.5 h-3.5" />
                        {c}
                      </Badge>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {savedOpps.length > 0 && (
            <Card className="glass-card border-border/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Heart className="w-4 h-4 text-magenta" /> Saved Opportunities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border/30">
                  {savedOpps.map(opp => (
                    <div key={opp.id} className="py-3 flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">{opp.title}</p>
                        <p className="text-xs text-muted-foreground">{opp.category} • {opp.type}</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">{opp.location}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {profile.experienceLogs.length > 0 && (
            <Card className="glass-card border-border/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2"><Clock className="w-4 h-4 text-orange" /> Experience Log</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border/30">
                  {profile.experienceLogs.map(log => (
                    <div key={log.id} className="py-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-foreground">{log.title}</p>
                        <span className="text-xs font-mono text-muted-foreground">{log.hours} hrs</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{log.type} • {new Date(log.date).toLocaleDateString()}</p>
                      {log.reflection && <p className="text-xs text-muted-foreground italic mt-1">"{log.reflection}"</p>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* === RESUME BUILDER TAB === */}
        <TabsContent value="resume" className="space-y-6 mt-6">
          {/* Template Selector */}
          <div className="grid gap-3 sm:grid-cols-3">
            {resumeTemplates.map(t => (
              <button key={t.id} onClick={() => setSelectedTemplate(t.id)}
                className={cn("p-4 rounded-xl border-2 text-left transition-all",
                  selectedTemplate === t.id ? "border-primary bg-primary/5" : "border-border/40 hover:border-primary/30")}>
                <p className="font-semibold text-sm text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
              </button>
            ))}
          </div>

          {/* Personal Info */}
          <Card className="glass-card border-border/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><User className="w-4 h-4 text-primary" /> Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Full Name</Label>
                  <Input value={resume.fullName} onChange={e => saveResume({ ...resume, fullName: e.target.value })} placeholder="Alex Johnson" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Email</Label>
                  <Input type="email" value={resume.email} onChange={e => saveResume({ ...resume, email: e.target.value })} placeholder="alex@school.edu" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Phone</Label>
                  <Input value={resume.phone} onChange={e => saveResume({ ...resume, phone: e.target.value })} placeholder="(555) 123-4567" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Location</Label>
                  <Input value={resume.location} onChange={e => saveResume({ ...resume, location: e.target.value })} placeholder="City, State" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Objective Statement</Label>
                <Textarea value={resume.objective} onChange={e => saveResume({ ...resume, objective: e.target.value })} placeholder="Motivated student seeking..." rows={3} />
              </div>
            </CardContent>
          </Card>

          {/* Education */}
          <Card className="glass-card border-border/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Award className="w-4 h-4 text-primary" /> Education</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {resume.education.map((edu, idx) => (
                <div key={idx} className="grid gap-3 sm:grid-cols-2 p-3 rounded-lg border border-border/30 relative">
                  {resume.education.length > 1 && (
                    <button onClick={() => saveResume({ ...resume, education: resume.education.filter((_, i) => i !== idx) })}
                      className="absolute top-2 right-2 p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><X className="w-3 h-3" /></button>
                  )}
                  <div className="space-y-1.5">
                    <Label className="text-xs">School</Label>
                    <Input value={edu.school} onChange={e => { const ed = [...resume.education]; ed[idx] = { ...ed[idx], school: e.target.value }; saveResume({ ...resume, education: ed }); }} placeholder="Lincoln High School" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Degree / Program</Label>
                    <Input value={edu.degree} onChange={e => { const ed = [...resume.education]; ed[idx] = { ...ed[idx], degree: e.target.value }; saveResume({ ...resume, education: ed }); }} placeholder="High School Diploma" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Year</Label>
                    <Input value={edu.year} onChange={e => { const ed = [...resume.education]; ed[idx] = { ...ed[idx], year: e.target.value }; saveResume({ ...resume, education: ed }); }} placeholder="2025" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">GPA</Label>
                    <Input value={edu.gpa} onChange={e => { const ed = [...resume.education]; ed[idx] = { ...ed[idx], gpa: e.target.value }; saveResume({ ...resume, education: ed }); }} placeholder="3.8" />
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={() => saveResume({ ...resume, education: [...resume.education, { school: "", degree: "", year: "", gpa: "" }] })}>
                <Plus className="w-3 h-3 mr-1" /> Add Education
              </Button>
            </CardContent>
          </Card>

          {/* Skills */}
          <Card className="glass-card border-border/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Skills</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {resume.skills.map(s => (
                  <Badge key={s} variant="secondary" className="gap-1 text-xs">
                    {s} <button onClick={() => saveResume({ ...resume, skills: resume.skills.filter(sk => sk !== s) })}><X className="w-3 h-3" /></button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Add a skill..." onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())} />
                <Button variant="outline" size="sm" onClick={addSkill}><Plus className="w-3 h-3" /></Button>
              </div>
              {profile.quizCompleted && (
                <p className="text-[11px] text-muted-foreground">💡 Based on your quiz: Consider adding skills related to {profile.careerInterests.join(", ")}</p>
              )}
            </CardContent>
          </Card>

          {/* Activities */}
          <Card className="glass-card border-border/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Briefcase className="w-4 h-4 text-primary" /> Activities & Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {resume.activities.map((act, idx) => (
                <div key={idx} className="p-3 rounded-lg border border-border/30 space-y-3 relative">
                  <button onClick={() => saveResume({ ...resume, activities: resume.activities.filter((_, i) => i !== idx) })}
                    className="absolute top-2 right-2 p-1 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><X className="w-3 h-3" /></button>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Title</Label>
                      <Input value={act.title} onChange={e => { const a = [...resume.activities]; a[idx] = { ...a[idx], title: e.target.value }; saveResume({ ...resume, activities: a }); }} placeholder="Science Club President" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Role</Label>
                      <Input value={act.role} onChange={e => { const a = [...resume.activities]; a[idx] = { ...a[idx], role: e.target.value }; saveResume({ ...resume, activities: a }); }} placeholder="President" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Dates</Label>
                    <Input value={act.dates} onChange={e => { const a = [...resume.activities]; a[idx] = { ...a[idx], dates: e.target.value }; saveResume({ ...resume, activities: a }); }} placeholder="Sep 2023 – Present" />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Description</Label>
                    <Textarea value={act.description} onChange={e => { const a = [...resume.activities]; a[idx] = { ...a[idx], description: e.target.value }; saveResume({ ...resume, activities: a }); }} placeholder="Led weekly meetings..." rows={2} />
                  </div>
                </div>
              ))}

              {/* Auto-import logged experiences */}
              {profile.experienceLogs.length > 0 && resume.activities.length === 0 && (
                <Button variant="outline" size="sm" onClick={() => {
                  const imported = profile.experienceLogs.map(log => ({
                    title: log.title, role: log.type, dates: new Date(log.date).toLocaleDateString(), description: log.reflection || `${log.hours} hours of ${log.type.toLowerCase()}`
                  }));
                  saveResume({ ...resume, activities: imported });
                  toast({ title: "Imported!", description: `${imported.length} experiences added to your resume.` });
                }}>
                  <Download className="w-3 h-3 mr-1" /> Import from Experience Log ({profile.experienceLogs.length})
                </Button>
              )}

              <Button variant="ghost" size="sm" onClick={addActivity}><Plus className="w-3 h-3 mr-1" /> Add Activity</Button>
            </CardContent>
          </Card>

          {/* Awards */}
          <Card className="glass-card border-border/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2"><Award className="w-4 h-4 text-primary" /> Awards & Honors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {resume.awards.map((aw, idx) => (
                <div key={idx} className="flex gap-3 items-start">
                  <div className="flex-1 grid gap-3 sm:grid-cols-2">
                    <Input value={aw.title} onChange={e => { const a = [...resume.awards]; a[idx] = { ...a[idx], title: e.target.value }; saveResume({ ...resume, awards: a }); }} placeholder="Honor Roll" />
                    <Input value={aw.date} onChange={e => { const a = [...resume.awards]; a[idx] = { ...a[idx], date: e.target.value }; saveResume({ ...resume, awards: a }); }} placeholder="Spring 2024" />
                  </div>
                  <button onClick={() => saveResume({ ...resume, awards: resume.awards.filter((_, i) => i !== idx) })}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"><X className="w-3 h-3" /></button>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={addAward}><Plus className="w-3 h-3 mr-1" /> Add Award</Button>
            </CardContent>
          </Card>

          {/* Export */}
          <div className="flex justify-end gap-3">
            <Button variant="hero" onClick={exportPDF} className="gap-2">
              <Download className="w-4 h-4" /> Export as PDF
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
