import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FileText, Plus, Trash2, Search, Edit, BookOpen, Award, Calendar, Filter } from "lucide-react";
import { FunfinityIcon } from "@/components/brand/FunfinityLogo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface AcademicProfile {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  gpa: number;
  sat_score: number;
  act_score: number;
  major: string;
  graduation_year: number;
  achievements: string[];
  extracurriculars: string[];
  notes: string;
  created_at: string;
}

export default function AdminAcademicProfiles() {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<AcademicProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "high_gpa" | "high_sat">("all");
  const [formData, setFormData] = useState({
    user_name: "",
    user_email: "",
    gpa: "",
    sat_score: "",
    act_score: "",
    major: "",
    graduation_year: "",
    achievements: "",
    extracurriculars: "",
    notes: "",
  });

  // Mock data for now - in production, this would come from the database
  useState(() => {
    setProfiles([
      {
        id: "1",
        user_id: "user1",
        user_name: "John Smith",
        user_email: "john@example.com",
        gpa: 3.8,
        sat_score: 1450,
        act_score: 32,
        major: "Computer Science",
        graduation_year: 2025,
        achievements: ["National Merit Scholar", "AP Scholar with Distinction"],
        extracurriculars: ["Robotics Club President", "Varsity Tennis"],
        notes: "Strong candidate for top-tier universities",
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        user_id: "user2",
        user_name: "Jane Doe",
        user_email: "jane@example.com",
        gpa: 4.0,
        sat_score: 1550,
        act_score: 35,
        major: "Biology",
        graduation_year: 2025,
        achievements: ["Valedictorian", "Science Fair Winner"],
        extracurriculars: ["Debate Team Captain", "Volunteer Coordinator"],
        notes: "Excellent academic record",
        created_at: new Date().toISOString(),
      },
    ]);
    setLoading(false);
  });

  const handleCreateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.user_name.trim() || !formData.user_email.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a name and email for the student.",
        variant: "destructive"
      });
      return;
    }

    const newProfile: AcademicProfile = {
      id: Date.now().toString(),
      user_id: "user" + Date.now(),
      ...formData,
      gpa: parseFloat(formData.gpa) || 0,
      sat_score: parseInt(formData.sat_score) || 0,
      act_score: parseInt(formData.act_score) || 0,
      graduation_year: parseInt(formData.graduation_year) || 0,
      achievements: formData.achievements.split(",").map(a => a.trim()).filter(a => a),
      extracurriculars: formData.extracurriculars.split(",").map(e => e.trim()).filter(e => e),
      created_at: new Date().toISOString(),
    };

    setProfiles([newProfile, ...profiles]);
    
    toast({
      title: "Academic Profile Created",
      description: `Profile for ${formData.user_name} has been successfully created.`,
    });
    
    setIsCreateModalOpen(false);
    setFormData({
      user_name: "",
      user_email: "",
      gpa: "",
      sat_score: "",
      act_score: "",
      major: "",
      graduation_year: "",
      achievements: "",
      extracurriculars: "",
      notes: "",
    });
  };

  const handleDeleteProfile = (id: string) => {
    setProfiles(profiles.filter(p => p.id !== id));
    toast({
      title: "Profile Deleted",
      description: "The academic profile has been removed.",
    });
  };

  const filteredProfiles = profiles.filter(profile => {
    const matchesFilter = filter === "all" || 
                          (filter === "high_gpa" && profile.gpa >= 3.5) ||
                          (filter === "high_sat" && profile.sat_score >= 1400);
    const matchesSearch = profile.user_name.toLowerCase().includes(search.toLowerCase()) || 
                         profile.user_email.toLowerCase().includes(search.toLowerCase()) ||
                         profile.major.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-slate-700/50 rounded animate-pulse" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-slate-700/30 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            Academic Profiles
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage student academic profiles and achievements
          </p>
        </div>
        <Button 
          variant="hero" 
          size="sm" 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Profile
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="glass-card border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{profiles.length}</p>
                <p className="text-xs text-muted-foreground">Total Profiles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald/10 flex items-center justify-center">
                <Award className="w-5 h-5 text-emerald" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{profiles.filter(p => p.gpa >= 3.5).length}</p>
                <p className="text-xs text-muted-foreground">High GPA (3.5+)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-cyan/10 flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-cyan" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{profiles.filter(p => p.sat_score >= 1400).length}</p>
                <p className="text-xs text-muted-foreground">High SAT (1400+)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/30">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-purple" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{profiles.filter(p => p.graduation_year === 2025).length}</p>
                <p className="text-xs text-muted-foreground">Class of 2025</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="glass-card border-border/30">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/50 border border-border/30 flex-1">
              <Search className="w-5 h-5 text-muted-foreground shrink-0" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search profiles..."
                className="bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <Select value={filter} onValueChange={(value: any) => setFilter(value)}>
                <SelectTrigger className="w-[140px] bg-secondary/50 border-border/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="high_gpa">High GPA</SelectItem>
                  <SelectItem value="high_sat">High SAT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profiles List */}
      <div className="space-y-4">
        {filteredProfiles.length === 0 ? (
          <Card className="glass-card border-border/30">
            <CardContent className="p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-foreground mb-2">No Profiles Found</h3>
              <p className="text-sm text-muted-foreground">
                {search || filter !== "all" 
                  ? "Try adjusting your search or filter criteria." 
                  : "Add your first academic profile to start tracking student achievements."}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredProfiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="glass-card border-border/30">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center text-white font-bold text-lg shrink-0">
                        {profile.user_name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-foreground">{profile.user_name}</h3>
                          <Badge variant="outline" className="text-[10px]">
                            Class of {profile.graduation_year}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{profile.user_email}</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <p className="text-[10px] text-muted-foreground">GPA</p>
                            <p className="text-sm font-semibold text-foreground">{profile.gpa.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">SAT</p>
                            <p className="text-sm font-semibold text-foreground">{profile.sat_score}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">ACT</p>
                            <p className="text-sm font-semibold text-foreground">{profile.act_score}</p>
                          </div>
                          <div>
                            <p className="text-[10px] text-muted-foreground">Major</p>
                            <p className="text-sm font-semibold text-foreground">{profile.major}</p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {profile.achievements.slice(0, 2).map((achievement) => (
                            <Badge key={achievement} className="bg-emerald/10 text-emerald border-emerald/20 text-[10px]">
                              <Award className="w-3 h-3 mr-1" />
                              {achievement}
                            </Badge>
                          ))}
                          {profile.achievements.length > 2 && (
                            <Badge variant="outline" className="text-[10px]">
                              +{profile.achievements.length - 2} more
                            </Badge>
                          )}
                        </div>
                        {profile.notes && (
                          <p className="text-xs text-muted-foreground italic">"{profile.notes}"</p>
                        )}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteProfile(profile.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </div>

      {/* Create Profile Modal */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setIsCreateModalOpen(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative w-full max-w-lg glass-card border-border/30 rounded-2xl p-6 max-h-[90vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <Trash2 className="w-5 h-5 text-muted-foreground" />
              </button>

              <div className="mb-6">
                <h2 className="text-xl font-bold text-foreground mb-2">Add Academic Profile</h2>
                <p className="text-sm text-muted-foreground">Create a new academic profile for a student</p>
              </div>

              <form onSubmit={handleCreateProfile} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="user_name">Student Name *</Label>
                    <Input
                      id="user_name"
                      value={formData.user_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, user_name: e.target.value }))}
                      placeholder="John Smith"
                      className="bg-secondary/50 border-border/30"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="user_email">Email *</Label>
                    <Input
                      id="user_email"
                      type="email"
                      value={formData.user_email}
                      onChange={(e) => setFormData(prev => ({ ...prev, user_email: e.target.value }))}
                      placeholder="john@example.com"
                      className="bg-secondary/50 border-border/30"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gpa">GPA</Label>
                    <Input
                      id="gpa"
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      value={formData.gpa}
                      onChange={(e) => setFormData(prev => ({ ...prev, gpa: e.target.value }))}
                      placeholder="3.8"
                      className="bg-secondary/50 border-border/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sat_score">SAT</Label>
                    <Input
                      id="sat_score"
                      type="number"
                      min="400"
                      max="1600"
                      value={formData.sat_score}
                      onChange={(e) => setFormData(prev => ({ ...prev, sat_score: e.target.value }))}
                      placeholder="1450"
                      className="bg-secondary/50 border-border/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="act_score">ACT</Label>
                    <Input
                      id="act_score"
                      type="number"
                      min="1"
                      max="36"
                      value={formData.act_score}
                      onChange={(e) => setFormData(prev => ({ ...prev, act_score: e.target.value }))}
                      placeholder="32"
                      className="bg-secondary/50 border-border/30"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="major">Intended Major</Label>
                    <Input
                      id="major"
                      value={formData.major}
                      onChange={(e) => setFormData(prev => ({ ...prev, major: e.target.value }))}
                      placeholder="Computer Science"
                      className="bg-secondary/50 border-border/30"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="graduation_year">Graduation Year</Label>
                    <Input
                      id="graduation_year"
                      type="number"
                      min="2024"
                      max="2030"
                      value={formData.graduation_year}
                      onChange={(e) => setFormData(prev => ({ ...prev, graduation_year: e.target.value }))}
                      placeholder="2025"
                      className="bg-secondary/50 border-border/30"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="achievements">Achievements (comma-separated)</Label>
                  <Input
                    id="achievements"
                    value={formData.achievements}
                    onChange={(e) => setFormData(prev => ({ ...prev, achievements: e.target.value }))}
                    placeholder="National Merit Scholar, AP Scholar"
                    className="bg-secondary/50 border-border/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="extracurriculars">Extracurriculars (comma-separated)</Label>
                  <Input
                    id="extracurriculars"
                    value={formData.extracurriculars}
                    onChange={(e) => setFormData(prev => ({ ...prev, extracurriculars: e.target.value }))}
                    placeholder="Robotics Club, Varsity Tennis"
                    className="bg-secondary/50 border-border/30"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Additional notes about the student..."
                    rows={3}
                    className="bg-secondary/50 border-border/30 resize-none"
                  />
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Profile
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
