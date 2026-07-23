import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Award, TrendingUp, Save, Plus, Trash2, Sparkles, School, Calculator, FileText, Target } from "lucide-react";
import { FunfinityIcon } from "@/components/brand/FunfinityLogo";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api-client";
import { AcademicProfileSkeleton } from "@/components/skeletons/AcademicProfileSkeleton";

interface AcademicProfile {
  id?: string;
  user_id?: string;
  school_name: string;
  school_type: "Public" | "Private" | "Charter" | "Homeschool";
  grade_level: string;
  gpa: number;
  sat_score?: number;
  act_score?: number;
  intended_major: string;
  extracurriculars: string[];
  achievements: string[];
  courses: Course[];
  created_at?: string;
  updated_at?: string;
}

interface Course {
  id: string;
  name: string;
  level: "Regular" | "Honors" | "AP" | "IB" | "Dual Enrollment";
  grade: string;
  credits: number;
}

const gradeLevels = ["9th Grade", "10th Grade", "11th Grade", "12th Grade", "Post-Graduate"];
const schoolTypes = ["Public", "Private", "Charter", "Homeschool"];
const courseLevels = ["Regular", "Honors", "AP", "IB", "Dual Enrollment"];
const gradeOptions = ["A", "A-", "B+", "B", "B-", "C+", "C", "C-", "D+", "D", "F"];

export default function AcademicProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<AcademicProfile>({
    school_name: "",
    school_type: "Public",
    grade_level: "",
    gpa: 0,
    intended_major: "",
    extracurriculars: [],
    achievements: [],
    courses: []
  });
  const [newExtracurricular, setNewExtracurricular] = useState("");
  const [newAchievement, setNewAchievement] = useState("");
  const [newCourse, setNewCourse] = useState<Course>({
    id: "",
    name: "",
    level: "Regular",
    grade: "",
    credits: 1
  });

  useEffect(() => {
    loadAcademicProfile();
  }, [user]);

  const loadAcademicProfile = async () => {
    try {
      if (!user) return;
      const data = await apiClient.get<AcademicProfile | null>(`/api/users/${user.id}/academic-profile`);
      if (data) {
        setProfile(data);
      }
    } catch (error) {
      console.error('Unable to load your academic profile. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const profileData = {
        ...profile,
        user_id: user.id
      };
      
      if (profile.id) {
        await apiClient.put(`/api/users/${user.id}/academic-profile`, profileData);
      } else {
        await apiClient.post(`/api/users/${user.id}/academic-profile`, profileData);
      }
      
      toast({
        title: "Profile Saved",
        description: "Your academic profile has been successfully updated.",
        variant: "default"
      });
    } catch (error) {
      console.error('Unable to save your academic profile. Please try again.');
      toast({
        title: "Unable to Save",
        description: "We encountered an issue saving your profile. Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const addExtracurricular = () => {
    if (newExtracurricular.trim()) {
      setProfile(prev => ({
        ...prev,
        extracurriculars: [...prev.extracurriculars, newExtracurricular.trim()]
      }));
      setNewExtracurricular("");
    }
  };

  const removeExtracurricular = (index: number) => {
    setProfile(prev => ({
      ...prev,
      extracurriculars: prev.extracurriculars.filter((_, i) => i !== index)
    }));
  };

  const addAchievement = () => {
    if (newAchievement.trim()) {
      setProfile(prev => ({
        ...prev,
        achievements: [...prev.achievements, newAchievement.trim()]
      }));
      setNewAchievement("");
    }
  };

  const removeAchievement = (index: number) => {
    setProfile(prev => ({
      ...prev,
      achievements: prev.achievements.filter((_, i) => i !== index)
    }));
  };

  const addCourse = () => {
    if (newCourse.name && newCourse.grade) {
      setProfile(prev => ({
        ...prev,
        courses: [...prev.courses, { ...newCourse, id: Date.now().toString() }]
      }));
      setNewCourse({
        id: "",
        name: "",
        level: "Regular",
        grade: "",
        credits: 1
      });
    }
  };

  const removeCourse = (id: string) => {
    setProfile(prev => ({
      ...prev,
      courses: prev.courses.filter(c => c.id !== id)
    }));
  };

  const calculateGPA = () => {
    if (profile.courses.length === 0) return 0;
    
    const gradePoints: Record<string, number> = {
      "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7,
      "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "F": 0.0
    };
    
    const levelMultipliers: Record<string, number> = {
      "Regular": 1.0, "Honors": 1.05, "AP": 1.1, "IB": 1.1, "Dual Enrollment": 1.15
    };
    
    let totalPoints = 0;
    let totalCredits = 0;
    
    profile.courses.forEach(course => {
      const points = (gradePoints[course.grade] || 0) * (levelMultipliers[course.level] || 1.0);
      totalPoints += points * course.credits;
      totalCredits += course.credits;
    });
    
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  };

  if (loading) {
    return <AcademicProfileSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-bold text-foreground flex items-center gap-2">
            <FunfinityIcon size="md" />
            Academic Profile
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage your academic information for personalized college recommendations
          </p>
        </div>
        <Button 
          variant="hero" 
          size="sm" 
          onClick={saveProfile}
          disabled={saving}
          className="flex items-center gap-2"
        >
          {saving ? <Sparkles className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving..." : "Save Profile"}
        </Button>
      </div>

      {/* School Information */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <School className="w-5 h-5 text-primary" />
            School Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="school_name">School Name</Label>
              <Input
                id="school_name"
                value={profile.school_name}
                onChange={(e) => setProfile(prev => ({ ...prev, school_name: e.target.value }))}
                placeholder="Enter your school name"
                className="bg-secondary/50 border-border/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="school_type">School Type</Label>
              <Select value={profile.school_type} onValueChange={(value: any) => setProfile(prev => ({ ...prev, school_type: value }))}>
                <SelectTrigger id="school_type" className="bg-secondary/50 border-border/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {schoolTypes.map(type => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="grade_level">Grade Level</Label>
              <Select value={profile.grade_level} onValueChange={(value) => setProfile(prev => ({ ...prev, grade_level: value }))}>
                <SelectTrigger id="grade_level" className="bg-secondary/50 border-border/30">
                  <SelectValue placeholder="Select grade level" />
                </SelectTrigger>
                <SelectContent>
                  {gradeLevels.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="intended_major">Intended Major</Label>
              <Input
                id="intended_major"
                value={profile.intended_major}
                onChange={(e) => setProfile(prev => ({ ...prev, intended_major: e.target.value }))}
                placeholder="e.g., Computer Science, Biology"
                className="bg-secondary/50 border-border/30"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Academic Performance */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-primary" />
            Academic Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gpa">GPA</Label>
              <Input
                id="gpa"
                type="number"
                step="0.01"
                min="0"
                max="4.0"
                value={profile.gpa || ""}
                onChange={(e) => setProfile(prev => ({ ...prev, gpa: parseFloat(e.target.value) || 0 }))}
                placeholder="0.00 - 4.00"
                className="bg-secondary/50 border-border/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sat_score">SAT Score (Optional)</Label>
              <Input
                id="sat_score"
                type="number"
                min="400"
                max="1600"
                value={profile.sat_score || ""}
                onChange={(e) => setProfile(prev => ({ ...prev, sat_score: parseInt(e.target.value) || undefined }))}
                placeholder="400 - 1600"
                className="bg-secondary/50 border-border/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="act_score">ACT Score (Optional)</Label>
              <Input
                id="act_score"
                type="number"
                min="1"
                max="36"
                value={profile.act_score || ""}
                onChange={(e) => setProfile(prev => ({ ...prev, act_score: parseInt(e.target.value) || undefined }))}
                placeholder="1 - 36"
                className="bg-secondary/50 border-border/30"
              />
            </div>
          </div>
          
          {profile.courses.length > 0 && (
            <div className="mt-4 p-4 rounded-xl bg-primary/5 border border-primary/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Calculated GPA from courses:</span>
                <span className="text-2xl font-bold text-primary">{calculateGPA()}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Current Courses */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            Current Courses
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course_name">Course Name</Label>
              <Input
                id="course_name"
                value={newCourse.name}
                onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., AP Calculus"
                className="bg-secondary/50 border-border/30"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="course_level">Level</Label>
              <Select value={newCourse.level} onValueChange={(value: any) => setNewCourse(prev => ({ ...prev, level: value }))}>
                <SelectTrigger id="course_level" className="bg-secondary/50 border-border/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {courseLevels.map(level => (
                    <SelectItem key={level} value={level}>{level}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="course_grade">Grade</Label>
              <Select value={newCourse.grade} onValueChange={(value) => setNewCourse(prev => ({ ...prev, grade: value }))}>
                <SelectTrigger id="course_grade" className="bg-secondary/50 border-border/30">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {gradeOptions.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="course_credits">Credits</Label>
              <Input
                id="course_credits"
                type="number"
                min="0.5"
                step="0.5"
                value={newCourse.credits}
                onChange={(e) => setNewCourse(prev => ({ ...prev, credits: parseFloat(e.target.value) || 1 }))}
                className="bg-secondary/50 border-border/30"
              />
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={addCourse} className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Course
          </Button>
          
          {profile.courses.length > 0 && (
            <div className="space-y-2 mt-4">
              {profile.courses.map((course) => (
                <div key={course.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs">{course.level}</Badge>
                    <span className="font-medium text-foreground">{course.name}</span>
                    <Badge className="text-xs bg-primary/10 text-primary border-primary/20">{course.grade}</Badge>
                    <span className="text-xs text-muted-foreground">{course.credits} credits</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeCourse(course.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Extracurricular Activities */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Extracurricular Activities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newExtracurricular}
              onChange={(e) => setNewExtracurricular(e.target.value)}
              placeholder="e.g., President of Debate Club"
              className="flex-1 bg-secondary/50 border-border/30"
              onKeyPress={(e) => e.key === 'Enter' && addExtracurricular()}
            />
            <Button variant="outline" size="sm" onClick={addExtracurricular}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {profile.extracurriculars.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {profile.extracurriculars.map((activity, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-2">
                  {activity}
                  <button
                    onClick={() => removeExtracurricular(index)}
                    className="hover:text-destructive"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="glass-card border-border/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            Achievements & Awards
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              value={newAchievement}
              onChange={(e) => setNewAchievement(e.target.value)}
              placeholder="e.g., National Merit Scholar"
              className="flex-1 bg-secondary/50 border-border/30"
              onKeyPress={(e) => e.key === 'Enter' && addAchievement()}
            />
            <Button variant="outline" size="sm" onClick={addAchievement}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          
          {profile.achievements.length > 0 && (
            <div className="space-y-2">
              {profile.achievements.map((achievement, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-500" />
                    <span className="text-foreground">{achievement}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAchievement(index)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
