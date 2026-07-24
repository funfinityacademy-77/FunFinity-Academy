import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Check, ChevronRight, Brain, Target, BookOpen, Users, Zap, Eye, Sparkles, Dna, GraduationCap, School, Briefcase, Clock, Award, Loader2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { FunfinityIcon } from "@/components/brand/FunfinityLogo";

// Onboarding steps configuration
const ONBOARDING_STEPS = [
  { id: "welcome", title: "Welcome", subtitle: "Let's personalize your learning experience", icon: Sparkles },
  { id: "learning_style", title: "Learning Style", subtitle: "How do you learn best?", icon: Brain },
  { id: "interests", title: "Your Interests", subtitle: "What subjects excite you?", icon: Target },
  { id: "academic", title: "Academic Profile", subtitle: "Tell us about your education", icon: GraduationCap },
  { id: "goals", title: "Your Goals", subtitle: "What do you want to achieve?", icon: Award },
  { id: "preferences", title: "Study Preferences", subtitle: "Optimize your learning sessions", icon: Clock },
  { id: "complete", title: "All Set!", subtitle: "Your profile is ready", icon: Check },
];

// Learning style options
const LEARNING_STYLE_OPTIONS = [
  { key: "visual", label: "Visual Learner", desc: "I learn best from diagrams, charts, videos, and images", icon: Eye },
  { key: "reading", label: "Reading & Writing", desc: "I prefer text-heavy content, notes, and written summaries", icon: BookOpen },
  { key: "auditory", label: "Auditory Learner", desc: "Listening to explanations and discussions works best for me", icon: Users },
  { key: "kinesthetic", label: "Hands-On / Practice", desc: "I retain information by doing, building, and experimenting", icon: Zap },
];

// Subject interests
const SUBJECT_OPTIONS = [
  { key: "math", label: "Mathematics", desc: "Algebra, calculus, statistics, logic" },
  { key: "science", label: "Science", desc: "Physics, chemistry, biology, earth sciences" },
  { key: "coding", label: "Coding & Tech", desc: "Programming, web dev, AI, data science" },
  { key: "languages", label: "Languages & Literacy", desc: "Reading, writing, grammar, foreign languages" },
  { key: "arts", label: "Arts & Creativity", desc: "Visual arts, music, design, storytelling" },
  { key: "history", label: "History & Social", desc: "History, civics, economics, geography" },
  { key: "business", label: "Business & Finance", desc: "Entrepreneurship, marketing, accounting" },
];

// Academic goals
const GOAL_OPTIONS = [
  { key: "grades", label: "Improve Academic Grades", desc: "Score higher on exams and coursework" },
  { key: "career", label: "Career Preparation", desc: "Build skills for my future profession" },
  { key: "skills", label: "Learn Practical Skills", desc: "Gain hands-on abilities I can use now" },
  { key: "explore", label: "Explore New Subjects", desc: "Broaden my knowledge across domains" },
  { key: "cert", label: "Earn Certifications", desc: "Complete recognised courses and badges" },
  { key: "compete", label: "Competitive Excellence", desc: "Prepare for olympiads and competitions" },
];

// Grade level options
const GRADE_OPTIONS = [
  { value: "middle", label: "Middle School (6-8)" },
  { value: "freshman", label: "High School Freshman (9)" },
  { value: "sophomore", label: "High School Sophomore (10)" },
  { value: "junior", label: "High School Junior (11)" },
  { value: "senior", label: "High School Senior (12)" },
  { value: "college", label: "College/University" },
  { value: "other", label: "Other" },
];

// Study session preferences
const SESSION_OPTIONS = [
  { value: "short", label: "Short Sessions", desc: "10-15 minutes with frequent breaks" },
  { value: "medium", label: "Medium Sessions", desc: "25-30 minutes (Pomodoro style)" },
  { value: "long", label: "Long Sessions", desc: "45-60 minutes for deep focus" },
  { value: "flexible", label: "Flexible", desc: "Varies based on the day and topic" },
];

// Helper components
function OptionCard({ label, desc, active, onClick, icon: Icon, className }: { 
  label: string; 
  desc: string; 
  active: boolean; 
  onClick: () => void; 
  icon?: any;
  className?: string;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "w-full text-left p-5 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden",
        active
          ? "border-primary bg-primary/10 shadow-glow-cyan"
          : "border-border/50 hover:border-primary/30 hover:bg-secondary/30",
        className
      )}
    >
      <div className="flex items-start gap-4">
        {Icon && (
          <div className={cn(
            "w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-all",
            active ? "bg-primary text-primary-foreground" : "bg-secondary/50 text-muted-foreground"
          )}>
            <Icon className="w-6 h-6" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm text-foreground leading-tight mb-1">{label}</p>
          <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
        </div>
        {active && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0"
          >
            <Check className="w-4 h-4" />
          </motion.div>
        )}
      </div>
    </motion.button>
  );
}

function MultiSelectCard({ label, desc, active, onClick }: { 
  label: string; 
  desc: string; 
  active: boolean; 
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "w-full text-left p-4 rounded-xl border-2 transition-all duration-300",
        active
          ? "border-primary bg-primary/10"
          : "border-border/50 hover:border-primary/30 hover:bg-secondary/30"
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="font-bold text-sm text-foreground">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
        </div>
        <div className={cn(
          "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
          active ? "border-primary bg-primary" : "border-border/60"
        )}>
          {active && <Check className="w-3 h-3 text-primary-foreground" />}
        </div>
      </div>
    </motion.button>
  );
}

export default function OnboardingWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    learning_style: "",
    interests: [] as string[],
    goals: [] as string[],
    grade_level: "",
    school_type: "public",
    session_preference: "medium",
  });

  const currentStepData = ONBOARDING_STEPS[currentStep];
  const Icon = currentStepData.icon;
  const progress = ((currentStep + 1) / ONBOARDING_STEPS.length) * 100;

  const toggleInterest = (key: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(key)
        ? prev.interests.filter(i => i !== key)
        : [...prev.interests, key]
    }));
  };

  const toggleGoal = (key: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(key)
        ? prev.goals.filter(g => g !== key)
        : [...prev.goals, key]
    }));
  };

  const handleNext = () => {
    if (currentStep < ONBOARDING_STEPS.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      // Save Learning DNA profile
      await supabase
        .from('learning_dna_profiles')
        .upsert({
          user_id: user!.id,
          learning_style: formData.learning_style,
          interests: formData.interests,
          goals: formData.goals,
          session_length: formData.session_preference,
          completed: true
        }, { onConflict: 'user_id' });

      // Save Academic Profile
      await supabase
        .from('academic_profiles')
        .upsert({
          user_id: user!.id,
          grade_level: formData.grade_level,
          school_type: formData.school_type,
          intended_major: formData.interests.includes('coding') ? 'stem' : 
                         formData.interests.includes('business') ? 'business' :
                         formData.interests.includes('arts') ? 'arts' : 'undecided',
          extracurriculars: {},
          achievements: {},
          courses: {}
        }, { onConflict: 'user_id' });

      // Mark onboarding as complete
      await supabase
        .from('profiles')
        .update({ 
          onboarding_complete: true,
          dna_complete: true
        })
        .eq('id', user!.id);

      toast({
        title: "Profile Complete!",
        description: "Your learning profile has been set up successfully.",
      });

      // Navigate to dashboard
      setTimeout(() => {
        navigate("/app");
      }, 1500);
    } catch (error) {
      console.error('Failed to save profile:', error);
      toast({
        title: "Error",
        description: "Failed to save your profile. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 0: return true; // Welcome step
      case 1: return !!formData.learning_style;
      case 2: return formData.interests.length > 0;
      case 3: return !!formData.grade_level;
      case 4: return formData.goals.length > 0;
      case 5: return !!formData.session_preference;
      case 6: return true; // Complete step
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden relative">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.3, 0.5, 0.3]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-gradient-to-br from-primary/20 to-transparent rounded-full blur-[100px]"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
            opacity: [0.4, 0.3, 0.4]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-gradient-to-tl from-accent/20 to-transparent rounded-full blur-[120px]"
        />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-border/50 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FunfinityIcon size="lg" className="text-primary" />
              <div>
                <h1 className="font-display font-bold text-foreground">Onboarding</h1>
                <p className="text-xs text-muted-foreground">Step {currentStep + 1} of {ONBOARDING_STEPS.length}</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip for now
            </Button>
          </div>
          
          {/* Progress bar */}
          <div className="mt-4 h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4 }}
              className="glass-card rounded-3xl border border-border/50 p-6 md:p-10 shadow-2xl"
            >
              {/* Step header */}
              <div className="text-center mb-8">
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                  className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center border-2 border-primary/30 mx-auto mb-6"
                >
                  <Icon className="w-10 h-10 text-primary" />
                </motion.div>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
                  {currentStepData.title}
                </h2>
                <p className="text-muted-foreground">{currentStepData.subtitle}</p>
              </div>

              {/* Step content */}
              <div className="space-y-4">
                {/* Welcome Step */}
                {currentStep === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="text-center space-y-6"
                  >
                    <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5">
                      <p className="text-foreground leading-relaxed mb-4">
                        Welcome to FunFinity Academy! This quick setup will help us personalize your learning experience based on your unique preferences and goals.
                      </p>
                      <div className="flex items-center justify-center gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          <span>~5 minutes</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4" />
                          <span>Personalized</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Heart className="w-4 h-4" />
                          <span>Optional</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Learning Style Step */}
                {currentStep === 1 && (
                  <div className="space-y-3">
                    {LEARNING_STYLE_OPTIONS.map((option) => (
                      <OptionCard
                        key={option.key}
                        label={option.label}
                        desc={option.desc}
                        active={formData.learning_style === option.key}
                        onClick={() => setFormData(prev => ({ ...prev, learning_style: option.key }))}
                        icon={option.icon}
                      />
                    ))}
                  </div>
                )}

                {/* Interests Step */}
                {currentStep === 2 && (
                  <div className="space-y-3">
                    {SUBJECT_OPTIONS.map((option) => (
                      <MultiSelectCard
                        key={option.key}
                        label={option.label}
                        desc={option.desc}
                        active={formData.interests.includes(option.key)}
                        onClick={() => toggleInterest(option.key)}
                      />
                    ))}
                  </div>
                )}

                {/* Academic Profile Step */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-semibold text-foreground mb-3 block">Current Grade Level</label>
                      <div className="grid grid-cols-2 gap-3">
                        {GRADE_OPTIONS.map((option) => (
                          <motion.button
                            key={option.value}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => setFormData(prev => ({ ...prev, grade_level: option.value }))}
                            className={cn(
                              "p-4 rounded-xl border-2 text-left transition-all",
                              formData.grade_level === option.value
                                ? "border-primary bg-primary/10"
                                : "border-border/50 hover:border-primary/30"
                            )}
                          >
                            <span className="font-medium text-sm text-foreground">{option.label}</span>
                          </motion.button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Goals Step */}
                {currentStep === 4 && (
                  <div className="space-y-3">
                    {GOAL_OPTIONS.map((option) => (
                      <MultiSelectCard
                        key={option.key}
                        label={option.label}
                        desc={option.desc}
                        active={formData.goals.includes(option.key)}
                        onClick={() => toggleGoal(option.key)}
                      />
                    ))}
                  </div>
                )}

                {/* Study Preferences Step */}
                {currentStep === 5 && (
                  <div className="space-y-3">
                    {SESSION_OPTIONS.map((option) => (
                      <OptionCard
                        key={option.value}
                        label={option.label}
                        desc={option.desc}
                        active={formData.session_preference === option.value}
                        onClick={() => setFormData(prev => ({ ...prev, session_preference: option.value }))}
                      />
                    ))}
                  </div>
                )}

                {/* Complete Step */}
                {currentStep === 6 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center space-y-6"
                  >
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center mx-auto mb-6">
                      <Check className="w-12 h-12 text-green-500" />
                    </div>
                    <div className="glass-card p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5">
                      <p className="text-foreground leading-relaxed mb-4">
                        Your profile is ready! We've personalized your learning experience based on your preferences.
                      </p>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div className="p-3 rounded-xl bg-secondary/30">
                          <p className="font-semibold text-foreground capitalize">{formData.learning_style}</p>
                          <p className="text-muted-foreground text-xs">Learning Style</p>
                        </div>
                        <div className="p-3 rounded-xl bg-secondary/30">
                          <p className="font-semibold text-foreground">{formData.interests.length}</p>
                          <p className="text-muted-foreground text-xs">Interests Selected</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 0 || isSubmitting}
                  className="gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Previous
                </Button>

                {currentStep === ONBOARDING_STEPS.length - 1 ? (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="gap-2"
                    variant="hero"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        Start Learning
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                ) : (
                  <Button
                    onClick={handleNext}
                    disabled={!canProceed()}
                    className="gap-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
