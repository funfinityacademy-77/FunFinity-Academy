import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Brain, Target, BookOpen, Sparkles, ChevronRight, 
  CheckCircle2, ArrowRight, User, GraduationCap
} from "lucide-react";
import { cn } from "@/lib/utils";

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}

interface OnboardingData {
  learningStyle?: string;
  interests?: string[];
  goals?: string[];
  timeCommitment?: string;
}

const STEPS: OnboardingStep[] = [
  {
    id: "welcome",
    title: "Welcome to FunFinity Academy",
    description: "Let's personalize your learning experience",
    icon: <Sparkles className="w-6 h-6" />,
    component: null,
  },
  {
    id: "learning-style",
    title: "Your Learning Style",
    description: "How do you learn best?",
    icon: <Brain className="w-6 h-6" />,
    component: null,
  },
  {
    id: "interests",
    title: "Your Interests",
    description: "What subjects excite you?",
    icon: <BookOpen className="w-6 h-6" />,
    component: null,
  },
  {
    id: "goals",
    title: "Your Goals",
    description: "What do you want to achieve?",
    icon: <Target className="w-6 h-6" />,
    component: null,
  },
  {
    id: "complete",
    title: "All Set!",
    description: "Your personalized learning path is ready",
    icon: <CheckCircle2 className="w-6 h-6" />,
    component: null,
  },
];

const LEARNING_STYLES = [
  { id: "visual", label: "Visual", description: "Learn through images and diagrams" },
  { id: "auditory", label: "Auditory", description: "Learn through listening and discussion" },
  { id: "kinesthetic", label: "Hands-on", description: "Learn through doing and practice" },
  { id: "reading", label: "Reading/Writing", description: "Learn through text and notes" },
];

const INTERESTS = [
  { id: "math", label: "Mathematics", icon: "📐" },
  { id: "science", label: "Science", icon: "🔬" },
  { id: "language", label: "Language Arts", icon: "📚" },
  { id: "history", label: "History", icon: "🏛️" },
  { id: "art", label: "Art & Music", icon: "🎨" },
  { id: "tech", label: "Technology", icon: "💻" },
];

const GOALS = [
  { id: "grades", label: "Improve Grades", icon: "📈" },
  { id: "college", label: "College Prep", icon: "🎓" },
  { id: "skills", label: "Learn New Skills", icon: "🛠️" },
  { id: "exam", label: "Exam Preparation", icon: "📝" },
];

const TIME_COMMITMENTS = [
  { id: "casual", label: "Casual", description: "1-2 hours per week" },
  { id: "regular", label: "Regular", description: "3-5 hours per week" },
  { id: "intensive", label: "Intensive", description: "6+ hours per week" },
];

export default function PostSignupOnboarding() {
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<OnboardingData>({});
  const [selectedLearningStyle, setSelectedLearningStyle] = useState<string>("");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [selectedTimeCommitment, setSelectedTimeCommitment] = useState<string>("");

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev =>
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(id => id !== goalId)
        : [...prev, goalId]
    );
  };

  const handleNext = () => {
    if (currentStep === 1) {
      setData({ ...data, learningStyle: selectedLearningStyle });
    } else if (currentStep === 2) {
      setData({ ...data, interests: selectedInterests });
    } else if (currentStep === 3) {
      setData({ ...data, goals: selectedGoals, timeCommitment: selectedTimeCommitment });
    }

    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    // Save onboarding data and redirect to dashboard
    console.log("Onboarding complete:", data);
    // In a real implementation, this would save to the database
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-border/50 shadow-2xl">
        <CardContent className="p-8">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Step {currentStep + 1} of {STEPS.length}
              </span>
              <span className="text-sm font-medium text-foreground">
                {Math.round(progress)}%
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Step Content */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                {STEPS[currentStep].icon}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {STEPS[currentStep].title}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {STEPS[currentStep].description}
                </p>
              </div>
            </div>

            {/* Step-specific content */}
            {currentStep === 0 && (
              <div className="bg-secondary/30 rounded-lg p-6 border border-border/30">
                <div className="flex items-center gap-4 mb-4">
                  <User className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Welcome aboard!</p>
                    <p className="text-sm text-muted-foreground">
                      We'll ask you a few questions to personalize your learning experience.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 1 && (
              <div className="grid grid-cols-2 gap-3">
                {LEARNING_STYLES.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedLearningStyle(style.id)}
                    className={cn(
                      "p-4 rounded-lg border-2 text-left transition-all",
                      selectedLearningStyle === style.id
                        ? "border-primary bg-primary/10"
                        : "border-border/30 hover:border-primary/50 bg-secondary/30"
                    )}
                  >
                    <p className="font-medium text-foreground mb-1">{style.label}</p>
                    <p className="text-xs text-muted-foreground">{style.description}</p>
                  </button>
                ))}
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {INTERESTS.map((interest) => (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={cn(
                      "p-4 rounded-lg border-2 text-center transition-all",
                      selectedInterests.includes(interest.id)
                        ? "border-primary bg-primary/10"
                        : "border-border/30 hover:border-primary/50 bg-secondary/30"
                    )}
                  >
                    <span className="text-2xl mb-2 block">{interest.icon}</span>
                    <p className="text-sm font-medium text-foreground">{interest.label}</p>
                  </button>
                ))}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-foreground mb-3">What are your goals?</p>
                  <div className="flex flex-wrap gap-2">
                    {GOALS.map((goal) => (
                      <button
                        key={goal.id}
                        onClick={() => toggleGoal(goal.id)}
                        className={cn(
                          "px-4 py-2 rounded-full border-2 text-sm transition-all",
                          selectedGoals.includes(goal.id)
                            ? "border-primary bg-primary/10"
                            : "border-border/30 hover:border-primary/50 bg-secondary/30"
                        )}
                      >
                        <span className="mr-2">{goal.icon}</span>
                        {goal.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-foreground mb-3">Time commitment?</p>
                  <div className="grid grid-cols-3 gap-3">
                    {TIME_COMMITMENTS.map((time) => (
                      <button
                        key={time.id}
                        onClick={() => setSelectedTimeCommitment(time.id)}
                        className={cn(
                          "p-3 rounded-lg border-2 text-center transition-all",
                          selectedTimeCommitment === time.id
                            ? "border-primary bg-primary/10"
                            : "border-border/30 hover:border-primary/50 bg-secondary/30"
                        )}
                      >
                        <p className="font-medium text-foreground text-sm">{time.label}</p>
                        <p className="text-xs text-muted-foreground">{time.description}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg p-6 border border-border/30">
                <div className="flex items-center gap-4 mb-4">
                  <GraduationCap className="w-8 h-8 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Your Learning DNA is Ready!</p>
                    <p className="text-sm text-muted-foreground">
                      We've personalized your learning path based on your preferences.
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <p><strong>Learning Style:</strong> {LEARNING_STYLES.find(s => s.id === data.learningStyle)?.label}</p>
                  <p><strong>Interests:</strong> {selectedInterests.length} subjects selected</p>
                  <p><strong>Goals:</strong> {selectedGoals.length} goals set</p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            {currentStep > 0 && currentStep < STEPS.length - 1 && (
              <Button variant="outline" onClick={handleBack} className="flex-1">
                Back
              </Button>
            )}
            {currentStep < STEPS.length - 1 ? (
              <Button
                onClick={handleNext}
                disabled={currentStep === 1 && !selectedLearningStyle}
                className="flex-1 gap-2"
              >
                Continue
                <ChevronRight className="w-4 h-4" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className="flex-1 gap-2">
                Start Learning
                <ArrowRight className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
