import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, ChevronRight, ChevronLeft, X, Play, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { useNavigate } from 'react-router-dom';
import { FirstTimeTour } from './FirstTimeTour';

type OnboardingStep = 'welcome' | 'quiz' | 'review' | 'tour' | 'simulation' | 'complete';

interface OnboardingJourneyProps {
  onComplete: () => void;
}

export function OnboardingJourney({ onComplete }: OnboardingJourneyProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [isFinishing, setIsFinishing] = useState(false);

  const steps: { id: OnboardingStep; title: string; icon: any } = [
    { id: 'welcome', title: 'Welcome', icon: Sparkles },
    { id: 'quiz', title: 'Learning DNA', icon: Sparkles },
    { id: 'review', title: 'Review Profile', icon: CheckCircle2 },
    { id: 'tour', title: 'Platform Tour', icon: Play },
    { id: 'simulation', title: 'Try It Out', icon: ArrowRight },
  ];

  const currentStepIndex = steps.findIndex(s => s.id === currentStep);

  const handleStepComplete = (nextStep: OnboardingStep) => {
    setCurrentStep(nextStep);
  };

  const handleComplete = async () => {
    if (isFinishing) return;
    setIsFinishing(true);
    
    // Mark onboarding as complete
    if (user) {
      const lsKey = `funfinity_onboarding_${user.id}`;
      const cached = JSON.parse(localStorage.getItem(lsKey) || '{}');
      cached.has_completed_onboarding = true;
      cached.onboarding_completed_at = new Date().toISOString();
      localStorage.setItem(lsKey, JSON.stringify(cached));
    }
    
    onComplete();
  };

  const handleSkip = () => {
    if (confirm('Skip onboarding? You can complete it later from settings.')) {
      handleComplete();
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)' }}>
      
      <AnimatePresence mode="wait">
        {currentStep === 'welcome' && (
          <WelcomeStep 
            key="welcome"
            onNext={() => handleStepComplete('quiz')}
            onSkip={handleSkip}
          />
        )}
        
        {currentStep === 'quiz' && (
          <QuizStep 
            key="quiz"
            onNext={() => handleStepComplete('review')}
            onSkip={handleSkip}
          />
        )}
        
        {currentStep === 'review' && (
          <ReviewStep 
            key="review"
            onNext={() => handleStepComplete('tour')}
            onSkip={handleSkip}
          />
        )}
        
        {currentStep === 'tour' && (
          <TourStep 
            key="tour"
            onNext={() => handleStepComplete('simulation')}
            onSkip={handleSkip}
          />
        )}
        
        {currentStep === 'simulation' && (
          <SimulationStep 
            key="simulation"
            onNext={handleComplete}
            onSkip={handleSkip}
          />
        )}
      </AnimatePresence>

      {/* Progress indicator */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
        {steps.map((step, i) => (
          <div
            key={step.id}
            className={`w-2 h-2 rounded-full transition-all ${
              i === currentStepIndex ? 'bg-primary w-6' : 
              i < currentStepIndex ? 'bg-primary/50' : 'bg-white/20'
            }`}
          />
        ))}
        <span className="text-xs text-white/60 ml-2">
          {currentStepIndex + 1} of {steps.length}
        </span>
      </div>
    </div>
  );
}

// ── Step 1: Welcome ─────────────────────────────────────────────────────────
function WelcomeStep({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-lg"
    >
      <div className="platform-card p-8 rounded-3xl relative overflow-hidden">
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-colors"
          aria-label="Skip onboarding"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-cyan/20 to-magenta/20 flex items-center justify-center"
          >
            <Sparkles className="w-10 h-10 text-primary" />
          </motion.div>
          
          <h1 className="font-display text-3xl font-bold text-foreground mb-4">
            Welcome to <span className="text-gradient-brand">FunFinity</span>
          </h1>
          
          <p className="text-muted-foreground leading-relaxed mb-6">
            We're excited to have you! Let's set up your personalized learning experience in just a few minutes.
          </p>

          <div className="space-y-3 text-left mb-8">
            {[
              { icon: Sparkles, text: 'Complete your Learning DNA quiz' },
              { icon: CheckCircle2, text: 'Review your personalized profile' },
              { icon: Play, text: 'Take a quick platform tour' },
              { icon: ArrowRight, text: 'Try a hands-on simulation' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30">
                <item.icon className="w-5 h-5 text-primary shrink-0" />
                <span className="text-sm text-foreground">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

        <Button
          onClick={onNext}
          size="lg"
          className="w-full font-semibold rounded-xl"
        >
          Let's Get Started
          <ChevronRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </motion.div>
  );
}

// ── Step 2: Learning DNA Quiz ────────────────────────────────────────────────
function QuizStep({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Redirect to the full Learning DNA questionnaire
    navigate('/app/learning-dna');
  }, [navigate]);

  return null;
}

// ── Step 3: Review Profile ───────────────────────────────────────────────────
function ReviewStep({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-lg"
    >
      <div className="platform-card p-8 rounded-3xl">
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-colors"
          aria-label="Skip"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-green/20 to-emerald/20 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
          </div>
          
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">
            Your Learning DNA is Ready!
          </h1>
          
          <p className="text-muted-foreground leading-relaxed mb-6">
            Based on your responses, we've created a personalized learning profile just for you.
          </p>

          <div className="grid grid-cols-2 gap-4 mb-8">
            {[
              { label: 'Learning Style', value: 'Visual' },
              { label: 'Focus Pattern', value: 'Morning' },
              { label: 'Pace', value: 'Moderate' },
              { label: 'Subjects', value: '5 Selected' },
            ].map((item, i) => (
              <div key={i} className="p-4 rounded-xl bg-secondary/30 text-left">
                <p className="text-xs text-muted-foreground mb-1">{item.label}</p>
                <p className="text-sm font-semibold text-foreground">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={onNext}
            size="lg"
            className="w-full font-semibold rounded-xl"
          >
            Continue to Tour
            <ChevronRight className="w-5 h-5 ml-2" />
          </Button>
          
          <Button
            onClick={() => {/* Navigate to edit profile */}}
            variant="outline"
            size="lg"
            className="w-full rounded-xl"
          >
            Edit Preferences
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Step 4: Platform Tour ────────────────────────────────────────────────────
function TourStep({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  return <FirstTimeTour onComplete={onNext} />;
}

// ── Step 5: Simulation ───────────────────────────────────────────────────────
function SimulationStep({ onNext, onSkip }: { onNext: () => void; onSkip: () => void }) {
  const navigate = useNavigate();

  const handleSimulation = () => {
    navigate('/app/demo-simulation');
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="w-full max-w-lg"
    >
      <div className="platform-card p-8 rounded-3xl">
        <button
          onClick={onSkip}
          className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-secondary/50 hover:bg-secondary flex items-center justify-center transition-colors"
          aria-label="Skip"
        >
          <X className="w-4 h-4 text-muted-foreground" />
        </button>

        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-orange/20 to-amber/20 flex items-center justify-center">
            <Play className="w-8 h-8 text-orange-500" />
          </div>
          
          <h1 className="font-display text-2xl font-bold text-foreground mb-4">
            Try a Quick Simulation
          </h1>
          
          <p className="text-muted-foreground leading-relaxed mb-6">
            Experience how FunFinity adapts to your learning style with a hands-on demo. No pressure, just exploration!
          </p>

          <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan/10 to-magenta/10 border border-border/50 mb-8">
            <p className="text-sm text-foreground mb-2">
              🎯 You'll get to:
            </p>
            <ul className="text-left text-sm text-muted-foreground space-y-2">
              <li>• Ask the AI Tutor a question</li>
              <li>• Try an interactive quiz</li>
              <li>• See your progress update in real-time</li>
            </ul>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            onClick={handleSimulation}
            size="lg"
            className="w-full font-semibold rounded-xl"
          >
            Start Simulation
            <Play className="w-5 h-5 ml-2" />
          </Button>
          
          <Button
            onClick={onNext}
            variant="outline"
            size="lg"
            className="w-full rounded-xl"
          >
            Skip for Now
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Hook to check if user needs onboarding ───────────────────────────────────
export function useOnboardingRequired() {
  const { user } = useAuth();
  const [isRequired, setIsRequired] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    const checkOnboarding = () => {
      const lsKey = `funfinity_onboarding_${user.id}`;
      const cached = JSON.parse(localStorage.getItem(lsKey) || '{}');
      
      // Check if onboarding is complete
      if (cached.has_completed_onboarding) {
        setIsRequired(false);
      } else {
        // Check if DNA is complete (prerequisite)
        if (cached.dna_complete) {
          setIsRequired(true);
        } else {
          // Need to complete DNA first
          setIsRequired(false);
        }
      }
      setIsLoading(false);
    };

    checkOnboarding();
  }, [user]);

  return { isRequired, isLoading };
}
