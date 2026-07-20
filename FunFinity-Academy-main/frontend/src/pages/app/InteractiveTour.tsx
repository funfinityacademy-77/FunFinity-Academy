import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, Check, LayoutDashboard, BookOpen, Users, Settings, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FunfinityIcon } from '@/components/brand/FunfinityLogo';
import { useNavigate } from 'react-router-dom';

const tourSteps = [
  {
    id: 1,
    title: 'Welcome to Your Dashboard',
    description: 'This is your central hub for learning. Here you can track your progress, access courses, and stay updated with announcements.',
    icon: LayoutDashboard,
    position: 'dashboard'
  },
  {
    id: 2,
    title: 'Browse Courses',
    description: 'Access our comprehensive library of courses across all subjects. Filter by category, track your progress, and continue where you left off.',
    icon: BookOpen,
    position: 'courses'
  },
  {
    id: 3,
    title: 'Join the Community',
    description: 'Connect with fellow learners in discussion forums, compete on leaderboards, and participate in live classes.',
    icon: Users,
    position: 'community'
  },
  {
    id: 4,
    title: 'Manage Your Schedule',
    description: 'Use the calendar to organize your study time, set reminders for deadlines, and track your learning sessions.',
    icon: Calendar,
    position: 'calendar'
  },
  {
    id: 5,
    title: 'Customize Your Experience',
    description: 'Adjust your profile settings, notification preferences, and accessibility options to personalize your learning journey.',
    icon: Settings,
    position: 'settings'
  }
];

export default function InteractiveTour() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [skipped, setSkipped] = useState(false);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = () => {
    setSkipped(true);
    handleComplete();
  };

  const handleComplete = () => {
    // Mark tour as complete in localStorage
    localStorage.setItem('funfinity-tour-complete', 'true');
    navigate('/app/security-hold');
  };

  const currentTourStep = tourSteps[currentStep];
  const IconComponent = currentTourStep.icon;

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-glow-cyan opacity-20" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-glow-magenta opacity-15" />

      <div className="relative z-10 max-w-lg w-full">
        {/* Tour Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="glass-card rounded-3xl border border-border/50 p-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FunfinityIcon size="md" className="text-primary" />
              <div>
                <span className="text-xs font-medium text-accent uppercase tracking-wider">
                  Platform Tour
                </span>
                <p className="text-xs text-muted-foreground">
                  Step {currentStep + 1} of {tourSteps.length}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSkip}
              className="text-muted-foreground hover:text-foreground"
            >
              Skip Tour
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-1 bg-secondary rounded-full mb-6 overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent"
              initial={{ width: 0 }}
              animate={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>

          {/* Content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                  <IconComponent className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground mb-1">
                    {currentTourStep.title}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {currentTourStep.description}
                  </p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {tourSteps.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentStep(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentStep
                      ? 'bg-primary w-6'
                      : 'bg-border hover:bg-border/80'
                  }`}
                />
              ))}
            </div>

            <Button
              onClick={handleNext}
              className="gap-2"
              variant={currentStep === tourSteps.length - 1 ? 'hero' : 'default'}
            >
              {currentStep === tourSteps.length - 1 ? (
                <>
                  Complete Tour
                  <Check className="w-4 h-4" />
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </motion.div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          You can always revisit this tour from your settings page.
        </p>
      </div>
    </div>
  );
}
